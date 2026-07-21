<script lang="ts">
	import { onMount, tick } from 'svelte';
	import {
		onLabPreferencesChange,
		type ResolvedMotionPreference,
		type ResolvedPerformancePreference,
	} from '../../scripts/lab/preferences';
	import type { Live2DAdapter, MotionGroup } from '../../scripts/lab/live2d-adapter';

	type PetState = 'collapsed' | 'loading' | 'ready' | 'paused' | 'error';
	type PetMotion = { group: MotionGroup; index: number; label: string };

	const travelMotions: PetMotion[] = [
		{ group: 'FlickLeft', index: 0, label: '向左 04' },
		{ group: 'FlickRight', index: 0, label: '向右 09' },
		{ group: 'FlickUp', index: 0, label: '向上 07' },
		{ group: 'FlickDown', index: 0, label: '向下 08' },
	];
	const idleMotions: PetMotion[] = [
		{ group: 'Idle', index: 0, label: '待機 06' },
		{ group: 'Idle', index: 1, label: '待機 A' },
		{ group: 'Idle', index: 2, label: '待機 B' },
	];

	let canvas: HTMLCanvasElement;
	let pet: HTMLElement;
	let adapter: Live2DAdapter | undefined;
	let state = $state<PetState>('collapsed');
	let dialogue = $state('');
	let status = $state('模型尚未載入。');
	let menuOpen = $state(false);
	let dragging = $state(false);
	let activePetMotion = $state('尚未載入');
	let x = $state(0);
	let y = $state(0);
	let travelDuration = $state(0);
	let motion = $state<ResolvedMotionPreference>('full');
	let performanceMode = $state<ResolvedPerformancePreference>('standard');
	let reactionIndex = 0;
	let dialogueTimer = 0;
	let wanderTimer = 0;
	let arrivalTimer = 0;
	let dragPointer = -1;
	let dragStartX = 0;
	let dragStartY = 0;
	let dragOriginX = 0;
	let dragOriginY = 0;
	let dragDistance = 0;

	const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));
	const canWander = () => state === 'ready' && motion === 'full' && performanceMode === 'standard' && !dragging;
	const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

	const bounds = () => {
		const width = pet?.offsetWidth || 168;
		const height = pet?.offsetHeight || 205;
		return {
			maxX: document.documentElement.clientWidth - width - 8,
			maxY: document.documentElement.clientHeight - height - 8,
		};
	};

	const clearWander = () => {
		window.clearTimeout(wanderTimer);
		window.clearTimeout(arrivalTimer);
	};
	const enterIdle = (message?: string) => {
		const chosen = randomItem(idleMotions);
		adapter?.playMotion(chosen.group, chosen.index);
		activePetMotion = chosen.label;
		if (message) status = message;
	};
	const hideDialogueLater = (delay = 2600) => {
		window.clearTimeout(dialogueTimer);
		dialogueTimer = window.setTimeout(() => (dialogue = ''), delay);
	};

	const beginWander = () => {
		if (!canWander()) return;
		const { maxX, maxY } = bounds();
		const nextX = 8 + Math.random() * Math.max(0, maxX - 8);
		const nextY = 18 + Math.random() * Math.max(0, maxY - 38);
		const distance = Math.hypot(nextX - x, nextY - y);
		const chosen = randomItem(travelMotions);
		travelDuration = clamp(distance * 8, 1800, 4300);
		adapter?.playMotion(chosen.group, chosen.index);
		activePetMotion = chosen.label;
		status = `移動中 · 循環播放「${chosen.label}」。`;
		x = nextX;
		y = nextY;
		arrivalTimer = window.setTimeout(() => {
			if (!canWander()) return;
			travelDuration = 0;
			enterIdle(`已抵達 · 進入「${activePetMotion.startsWith('待機') ? activePetMotion : '待機'}」。`);
			wanderTimer = window.setTimeout(beginWander, 900 + Math.random() * 1600);
		}, travelDuration);
	};

	const scheduleWander = (delay = 1800 + Math.random() * 2200) => {
		clearWander();
		if (!canWander()) return;
		wanderTimer = window.setTimeout(beginWander, delay);
	};

	const disposeAdapter = () => {
		window.clearTimeout(dialogueTimer);
		clearWander();
		adapter?.dispose();
		adapter = undefined;
	};

	const placeAtStart = () => {
		const { maxX, maxY } = bounds();
		travelDuration = 0;
		x = maxX - 12;
		y = maxY - 12;
	};

	const openPet = async () => {
		if (state === 'loading' || state === 'ready' || state === 'paused') return;
		state = 'loading';
		status = '正在載入 Cubism Core 與 Koharu。';
		menuOpen = false;
		await tick();
		placeAtStart();
		try {
			const { Live2DAdapter } = await import('../../scripts/lab/live2d-adapter');
			adapter = new Live2DAdapter();
			await adapter.initialize(canvas);
			state = 'ready';
			dialogue = '嗨！可以拖著我走喔。';
			enterIdle('桌寵已啟動 · 目前待機。');
			hideDialogueLater(3200);
			if (motion === 'reduce' || performanceMode === 'economy') pausePet('依目前偏好暫停持續動畫。');
			else scheduleWander();
		} catch (error) {
			disposeAdapter();
			state = 'error';
			dialogue = '這次沒有成功抵達。';
			status = error instanceof Error ? error.message : '桌寵載入失敗。';
		}
	};

	const closePet = () => {
		disposeAdapter();
		state = 'collapsed';
		dialogue = '';
		menuOpen = false;
		activePetMotion = '尚未載入';
		status = '模型尚未載入。';
	};

	const pausePet = (message = '桌寵已暫停。') => {
		const visiblePosition = pet?.getBoundingClientRect();
		clearWander();
		adapter?.pause();
		travelDuration = 0;
		if (visiblePosition) {
			x = visiblePosition.left;
			y = visiblePosition.top;
		}
		if (adapter) state = 'paused';
		activePetMotion = '已暫停';
		status = message;
		menuOpen = false;
	};

	const resumePet = () => {
		adapter?.resume();
		if (adapter) state = 'ready';
		enterIdle('桌寵動畫已恢復 · 目前待機。');
		menuOpen = false;
		scheduleWander(500);
	};

	const react = () => {
		if (!adapter || !['ready', 'paused'].includes(state)) return;
		const lines = ['抓到你在看我了！', '今天也一起慢慢前進吧。', '再點一下也可以喔。', '星光有好好收到。'];
		clearWander();
		adapter.resume();
		adapter.playMotion('Tap');
		activePetMotion = '點擊反應';
		dialogue = lines[reactionIndex % lines.length];
		reactionIndex += 1;
		status = '已觸發點擊反應。';
		hideDialogueLater();
		if (state === 'paused' || motion === 'reduce' || performanceMode === 'economy') {
			window.setTimeout(() => pausePet('短反應完成；桌寵維持暫停。'), 2400);
		} else scheduleWander(2600);
	};

	const startDrag = (event: PointerEvent) => {
		if (!['ready', 'paused'].includes(state) || event.button !== 0) return;
		const visiblePosition = pet.getBoundingClientRect();
		travelDuration = 0;
		x = visiblePosition.left;
		y = visiblePosition.top;
		dragPointer = event.pointerId;
		dragStartX = event.clientX;
		dragStartY = event.clientY;
		dragOriginX = visiblePosition.left;
		dragOriginY = visiblePosition.top;
		dragDistance = 0;
		dragging = true;
		clearWander();
		if (state === 'ready') enterIdle('拖曳中 · 暫時進入待機。');
		try {
			(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		} catch {
			// Pointer capture can be unavailable in synthetic QA events; window bounds still constrain dragging.
		}
	};

	const drag = (event: PointerEvent) => {
		if (!dragging || event.pointerId !== dragPointer) return;
		const dx = event.clientX - dragStartX;
		const dy = event.clientY - dragStartY;
		dragDistance = Math.max(dragDistance, Math.hypot(dx, dy));
		const { maxX, maxY } = bounds();
		x = clamp(dragOriginX + dx, 8, maxX);
		y = clamp(dragOriginY + dy, 8, maxY);
	};

	const endDrag = (event: PointerEvent) => {
		if (!dragging || event.pointerId !== dragPointer) return;
		dragging = false;
		dragPointer = -1;
		if (dragDistance < 7) react();
		else {
			status = '桌寵已拖曳到新位置。';
			scheduleWander(1200);
		}
	};

	const keyboardReact = (event: KeyboardEvent) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		react();
	};

	onMount(() => {
		const unsubscribe = onLabPreferencesChange((detail) => {
			motion = detail.resolvedMotion;
			performanceMode = detail.resolvedPerformance;
			if (adapter && (motion === 'reduce' || performanceMode === 'economy')) {
				pausePet('共用偏好要求停止持續動畫與遊走。');
			}
		});
		const onResize = () => {
			if (!pet || state === 'collapsed') return;
			clearWander();
			const { maxX, maxY } = bounds();
			travelDuration = 0;
			x = clamp(x, 8, maxX);
			y = clamp(y, 8, maxY);
			if (state === 'ready') {
				enterIdle('視窗已調整 · 目前待機。');
				scheduleWander();
			}
		};
		const onVisibilityChange = () => {
			if (document.hidden && adapter) pausePet('頁籤已隱藏，桌寵動畫與遊走暫停。');
		};
		let disposed = false;
		const cleanup = () => {
			if (disposed) return;
			disposed = true;
			disposeAdapter();
			unsubscribe();
			document.removeEventListener('visibilitychange', onVisibilityChange);
			window.removeEventListener('resize', onResize);
			window.removeEventListener('pagehide', cleanup);
		};
		document.addEventListener('visibilitychange', onVisibilityChange);
		window.addEventListener('resize', onResize);
		window.addEventListener('pagehide', cleanup, { once: true });
		return cleanup;
	});
</script>

{#if state === 'collapsed'}
	<button class="desktop-pet-launcher" type="button" onclick={openPet} aria-label="叫出 Koharu 網站桌寵">
		<span aria-hidden="true">✦</span><strong>叫出桌寵</strong>
	</button>
{:else}
	<aside
		bind:this={pet}
		class:desktop-pet-dragging={dragging}
		class="desktop-pet"
		data-pet-state={state}
		data-pet-motion={activePetMotion}
		style={`left:${x}px;top:${y}px;--pet-travel:${travelDuration}ms`}
		aria-label="Koharu 網站桌寵"
	>
		{#if dialogue}<div class="desktop-pet-dialogue" aria-live="polite">{dialogue}</div>{/if}
		<div
			class="desktop-pet-character"
			role="button"
			tabindex="0"
			aria-label="拖曳 Koharu，或點擊觸發反應"
			onpointerdown={startDrag}
			onpointermove={drag}
			onpointerup={endDrag}
			onpointercancel={endDrag}
			onkeydown={keyboardReact}
		>
			<canvas bind:this={canvas} aria-label="Live2D 官方範例角色 Koharu"></canvas>
			{#if state === 'loading'}<div class="desktop-pet-loading" role="status">✦</div>{/if}
			{#if state === 'error'}<div class="desktop-pet-fallback" aria-hidden="true">✦</div>{/if}
		</div>
		<div class="desktop-pet-menu-wrap">
			<button class="desktop-pet-menu-toggle" type="button" aria-label="桌寵選單" aria-expanded={menuOpen} onclick={() => (menuOpen = !menuOpen)}>•••</button>
			{#if menuOpen}
				<div class="desktop-pet-menu" aria-label="桌寵控制">
					{#if state === 'error'}
						<button type="button" onclick={openPet}>重試</button>
					{:else}
						<button type="button" onclick={state === 'paused' ? resumePet : () => pausePet()}>{state === 'paused' ? '繼續遊走' : '暫停'}</button>
					{/if}
					<button type="button" onclick={closePet}>收起來</button>
				</div>
			{/if}
		</div>
		<span class="desktop-pet-status">{status} 目前動作：{activePetMotion}。</span>
	</aside>
{/if}
