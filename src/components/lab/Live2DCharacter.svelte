<script lang="ts">
	import { onMount } from 'svelte';
	import {
		onLabPreferencesChange,
		type MotionPreference,
		type ResolvedMotionPreference,
		type ResolvedPerformancePreference,
	} from '../../scripts/lab/preferences';
	import type { Live2DAdapter } from '../../scripts/lab/live2d-adapter';

	type LoadState = 'idle' | 'loading' | 'ready' | 'paused' | 'error';
	type MotionGroup = 'Idle' | 'Tap' | 'FlickLeft';

	let canvas: HTMLCanvasElement;
	let adapter: Live2DAdapter | undefined;
	let loadState = $state<LoadState>('idle');
	let status = $state('尚未載入；目前不會下載模型或啟動 WebGL。');
	let motion = $state<ResolvedMotionPreference>('full');
	let motionSetting = $state<MotionPreference>('system');
	let performanceMode = $state<ResolvedPerformancePreference>('standard');
	let activeMotion = $state<MotionGroup>('Idle');
	let reducedPauseTimer = 0;

	const loadModel = async (fixture?: 'missing-model') => {
		if (loadState === 'loading' || loadState === 'ready') return;
		loadState = 'loading';
		status = fixture
			? '正在驗證不存在的模型路徑與錯誤清理…'
			: '正在載入 Cubism Core、Koharu 模型與 2048px 貼圖…';
		try {
			const { Live2DAdapter } = await import('../../scripts/lab/live2d-adapter');
			adapter = new Live2DAdapter();
			await adapter.initialize(canvas, { fixture });
			loadState = 'ready';
			status = 'Koharu 已載入。待機、點擊與向左甩動動作可用。';
			if (motion === 'reduce' || performanceMode === 'economy') pause();
		} catch (error) {
			adapter?.dispose();
			adapter = undefined;
			loadState = 'error';
			status = error instanceof Error ? error.message : 'Live2D 載入失敗。';
		}
	};

	const play = (group: MotionGroup) => {
		if (!adapter || !['ready', 'paused'].includes(loadState)) return;
		clearTimeout(reducedPauseTimer);
		adapter.resume();
		adapter.playMotion(group);
		activeMotion = group;
		loadState = 'ready';
		status = `正在播放 ${group} 動作。`;
		if (motion === 'reduce' || performanceMode === 'economy') {
			reducedPauseTimer = window.setTimeout(() => pause(), 4500);
		}
	};

	const pause = () => {
		clearTimeout(reducedPauseTimer);
		adapter?.pause();
		if (adapter) loadState = 'paused';
		status = '渲染已暫停；Canvas 保留最後一幀。';
	};

	const resume = () => {
		adapter?.resume();
		if (adapter) loadState = 'ready';
		status = '渲染已恢復。';
	};

	onMount(() => {
		const unsubscribe = onLabPreferencesChange((detail) => {
			motionSetting = detail.preferences.motion;
			motion = detail.resolvedMotion;
			performanceMode = detail.resolvedPerformance;
			if (adapter && (motion === 'reduce' || performanceMode === 'economy')) pause();
		});
		const onVisibilityChange = () => document.hidden ? adapter?.pause() : undefined;
		let disposed = false;
		const cleanup = () => {
			if (disposed) return;
			disposed = true;
			clearTimeout(reducedPauseTimer);
			unsubscribe();
			document.removeEventListener('visibilitychange', onVisibilityChange);
			window.removeEventListener('pagehide', cleanup);
			adapter?.dispose();
			adapter = undefined;
		};
		document.addEventListener('visibilitychange', onVisibilityChange);
		window.addEventListener('pagehide', cleanup, { once: true });
		return cleanup;
	});
</script>

<article class="live2d-console" data-state={loadState}>
	<div class="live2d-stage">
		<canvas bind:this={canvas} aria-label="Live2D 官方範例角色 Koharu"></canvas>
		{#if loadState === 'idle' || loadState === 'error'}
			<div class="live2d-fallback" aria-hidden="true"><span>✦</span><strong>Koharu</strong><small>Live2D sample model</small></div>
		{/if}
		{#if loadState === 'loading'}<div class="live2d-loading" role="status">模型載入中</div>{/if}
	</div>

	<div class="live2d-panel">
		<div class="live2d-status" aria-live="polite">
			<span>{loadState}</span>
			<p>{status}</p>
		</div>
		{#if loadState === 'idle' || loadState === 'error'}
			<div class="live2d-load-controls">
				<button class="live2d-primary" type="button" onclick={() => loadModel()}>{loadState === 'error' ? '重新載入 Live2D' : '載入 Live2D'}</button>
				{#if loadState === 'idle'}<button type="button" onclick={() => loadModel('missing-model')}>測試模型載入失敗</button>{/if}
			</div>
		{:else}
			<div class="live2d-motion-controls" aria-label="選擇 Koharu 動作">
				<button type="button" class:is-active={activeMotion === 'Idle'} onclick={() => play('Idle')}>待機</button>
				<button type="button" class:is-active={activeMotion === 'Tap'} onclick={() => play('Tap')}>點擊反應</button>
				<button type="button" class:is-active={activeMotion === 'FlickLeft'} onclick={() => play('FlickLeft')}>向左甩動</button>
			</div>
			<button type="button" onclick={loadState === 'paused' ? resume : pause}>{loadState === 'paused' ? '繼續渲染' : '暫停渲染'}</button>
		{/if}
		<dl>
			<div><dt>動態設定</dt><dd>{motionSetting === 'system' ? '跟隨系統' : motionSetting === 'full' ? '完整動態' : '減少動態'}</dd></div>
			<div><dt>目前結果</dt><dd>{motion === 'reduce' ? '減少' : '完整'}</dd></div>
			<div><dt>效能模式</dt><dd>{performanceMode === 'economy' ? '節能' : '標準'}</dd></div>
			<div><dt>模型貼圖</dt><dd>2048px · 1.43 MB</dd></div>
		</dl>
	</div>
</article>
