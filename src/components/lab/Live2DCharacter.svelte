<script lang="ts">
	import { onMount } from 'svelte';
	import {
		onLabPreferencesChange,
		type MotionPreference,
		type ResolvedMotionPreference,
		type ResolvedPerformancePreference,
	} from '../../scripts/lab/preferences';
	import type { Live2DAdapter, MotionGroup } from '../../scripts/lab/live2d-adapter';

	type LoadState = 'idle' | 'loading' | 'ready' | 'paused' | 'error';
	type MotionItem = { index: number; label: string; file: string };
	type MotionSection = { group: MotionGroup; label: string; description: string; items: MotionItem[] };

	const motionSections: MotionSection[] = [
		{
			group: 'Idle', label: '待機', description: '待機循環與細微姿態',
			items: [
				{ index: 0, label: '待機 06', file: '06.motion3.json' },
				{ index: 1, label: '待機 A', file: 'idle.motion3.json' },
				{ index: 2, label: '待機 B', file: 'idle_02.motion3.json' },
			],
		},
		{
			group: 'Tap', label: '點擊反應', description: '點擊角色後的短動作',
			items: [
				{ index: 0, label: '點擊 01', file: '01.motion3.json' },
				{ index: 1, label: '點擊 02', file: '02.motion3.json' },
				{ index: 2, label: '點擊 03', file: '03.motion3.json' },
				{ index: 3, label: '點擊 05', file: '05.motion3.json' },
			],
		},
		{ group: 'FlickLeft', label: '向左甩動', description: '左向 Flick', items: [{ index: 0, label: '向左 04', file: '04.motion3.json' }] },
		{ group: 'FlickRight', label: '向右甩動', description: '右向 Flick', items: [{ index: 0, label: '向右 09', file: '09.motion3.json' }] },
		{ group: 'FlickUp', label: '向上甩動', description: '上向 Flick', items: [{ index: 0, label: '向上 07', file: '07.motion3.json' }] },
		{ group: 'FlickDown', label: '向下甩動', description: '下向 Flick', items: [{ index: 0, label: '向下 08', file: '08.motion3.json' }] },
	];

	let canvas: HTMLCanvasElement;
	let adapter: Live2DAdapter | undefined;
	let loadState = $state<LoadState>('idle');
	let status = $state('尚未載入；目前不會下載模型或啟動 WebGL。');
	let motion = $state<ResolvedMotionPreference>('full');
	let motionSetting = $state<MotionPreference>('system');
	let performanceMode = $state<ResolvedPerformancePreference>('standard');
	let activeMotion = $state('Idle-0');
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
			status = 'Koharu 已載入。6 個群組、11 段動作皆可個別預覽。';
			if (motion === 'reduce' || performanceMode === 'economy') pause();
		} catch (error) {
			adapter?.dispose();
			adapter = undefined;
			loadState = 'error';
			status = error instanceof Error ? error.message : 'Live2D 載入失敗。';
		}
	};

	const play = (group: MotionGroup, item: MotionItem) => {
		if (!adapter || !['ready', 'paused'].includes(loadState)) return;
		clearTimeout(reducedPauseTimer);
		adapter.resume();
		adapter.playMotion(group, item.index);
		activeMotion = `${group}-${item.index}`;
		loadState = 'ready';
		status = `正在播放「${item.label}」· ${item.file}`;
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
			<div class="live2d-motion-groups" aria-label="Koharu 完整動作列表">
				{#each motionSections as section}
					<section class="live2d-motion-group" aria-labelledby={`motion-${section.group}`}>
						<header>
							<div><strong id={`motion-${section.group}`}>{section.label}</strong><small>{section.description}</small></div>
							<span>{section.items.length} 段</span>
						</header>
						<div class="live2d-motion-controls">
							{#each section.items as item}
								<button
									type="button"
									class:is-active={activeMotion === `${section.group}-${item.index}`}
									aria-pressed={activeMotion === `${section.group}-${item.index}`}
									onclick={() => play(section.group, item)}
								>
									<span>{item.label}</span><small>{item.file}</small>
								</button>
							{/each}
						</div>
					</section>
				{/each}
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
