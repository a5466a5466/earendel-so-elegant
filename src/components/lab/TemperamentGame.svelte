<script lang="ts">
	import { onMount } from 'svelte';
	import { labAudioManager } from '../../scripts/lab/audio-manager';
	import {
		onLabPreferencesChange,
		type ResolvedMotionPreference,
		type ResolvedPerformancePreference,
	} from '../../scripts/lab/preferences';

	type GamePhase = 'ready' | 'playing' | 'paused' | 'finished';
	type Star = { id: number; x: number; y: number; radius: number; rare: boolean; bornAt: number; lifetime: number };
	type Pop = { id: number; x: number; y: number; text: string; bornAt: number };

	const ROUND_SECONDS = 30;
	const BEST_SCORE_KEY = 'earendel-temperament-game-best-v1';
	const praise = ['好氣質！', '這就是氣質', '蒂兒收到啦', '大家都看見了！'];

	let canvas: HTMLCanvasElement;
	let stage: HTMLElement;
	let audio: HTMLAudioElement;
	let phase = $state<GamePhase>('ready');
	let score = $state(0);
	let combo = $state(0);
	let bestCombo = $state(0);
	let bestScore = $state(0);
	let timeLeft = $state(ROUND_SECONDS);
	let selectedIndex = $state(0);
	let statusMessage = $state('準備好後，按下「開始收集氣質」。');
	let resolvedMotion = $state<ResolvedMotionPreference>('full');
	let resolvedPerformance = $state<ResolvedPerformancePreference>('standard');
	let bonusUntil = $state(0);
	let bonusTriggered = $state(false);

	let stars: Star[] = [];
	let pops: Pop[] = [];
	let sequence = 0;
	let frame = 0;
	let roundEndsAt = 0;
	let pausedRemaining = 0;
	let nextSpawnAt = 0;
	let lastFrameAt = 0;
	let disposePreferences = () => undefined;
	let unregisterAudio = () => undefined;

	const comboLabel = $derived(combo >= 15 ? '氣質爆發！' : combo >= 10 ? '氣質滿滿' : combo >= 5 ? '很有氣質' : combo >= 3 ? '有點氣質' : '持續收集');
	const resultTitle = $derived(score >= 30 ? '氣質本人' : score >= 20 ? '優雅氣質' : score >= 10 ? '氣質新星' : '氣質萌芽');
	const isBonus = $derived(phase === 'playing' && bonusUntil > performance.now());

	const resizeCanvas = () => {
		if (!canvas || !stage) return;
		const rect = stage.getBoundingClientRect();
		const dpr = Math.min(window.devicePixelRatio || 1, resolvedPerformance === 'economy' ? 1.25 : 2);
		canvas.width = Math.max(1, Math.round(rect.width * dpr));
		canvas.height = Math.max(1, Math.round(rect.height * dpr));
		canvas.style.width = `${rect.width}px`;
		canvas.style.height = `${rect.height}px`;
		const context = canvas.getContext('2d');
		context?.setTransform(dpr, 0, 0, dpr, 0, 0);
		stars = stars.map((star) => ({ ...star, x: Math.min(star.x, rect.width - star.radius), y: Math.min(star.y, rect.height - star.radius) }));
		draw(performance.now());
	};

	const starLimit = () => resolvedPerformance === 'economy' ? 3 : 5;
	const spawnDelay = () => resolvedPerformance === 'economy' ? 900 : 650;

	const spawnStar = (now: number) => {
		if (!stage || stars.length >= starLimit()) return;
		const rect = stage.getBoundingClientRect();
		const radius = rect.width < 480 ? 40 : 46;
		const margin = radius + 12;
		const width = Math.max(1, rect.width - margin * 2);
		const height = Math.max(1, rect.height - margin * 2);
		stars.push({
			id: ++sequence,
			x: margin + Math.random() * width,
			y: margin + Math.random() * height,
			radius,
			rare: now < bonusUntil || Math.random() < 0.16,
			bornAt: now,
			lifetime: resolvedPerformance === 'economy' ? 2600 : 2300,
		});
		selectedIndex = Math.min(selectedIndex, Math.max(0, stars.length - 1));
	};

	const drawStar = (context: CanvasRenderingContext2D, star: Star, now: number, selected: boolean) => {
		const age = Math.max(0, now - star.bornAt);
		const fade = Math.min(1, age / 180, (star.lifetime - age) / 260);
		const pulse = resolvedMotion === 'reduce' ? 1 : 1 + Math.sin(age / 190) * 0.045;
		const radius = star.radius * pulse;
		context.save();
		context.globalAlpha = Math.max(0, fade);
		context.translate(star.x, star.y);
		context.shadowBlur = star.rare ? 30 : 20;
		context.shadowColor = star.rare ? '#ffe7a2' : '#b8dcff';
		context.fillStyle = star.rare ? 'rgba(255,225,145,.96)' : 'rgba(205,230,255,.94)';
		context.beginPath();
		for (let point = 0; point < 16; point += 1) {
			const angle = -Math.PI / 2 + point * Math.PI / 8;
			const distance = point % 2 === 0 ? radius : radius * 0.56;
			const x = Math.cos(angle) * distance;
			const y = Math.sin(angle) * distance;
			point === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
		}
		context.closePath();
		context.fill();
		context.shadowBlur = 0;
		context.fillStyle = 'rgba(11,27,48,.88)';
		context.beginPath();
		context.roundRect(-radius * .72, -17, radius * 1.44, 34, 13);
		context.fill();
		context.fillStyle = '#fffdf4';
		context.font = `700 ${radius < 44 ? 15 : 17}px system-ui, sans-serif`;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText('氣質', 0, 1);
		if (star.rare) {
			context.fillStyle = '#26354b';
			context.font = '800 11px system-ui, sans-serif';
			context.fillText('+3', 0, 27);
		}
		if (selected) {
			context.strokeStyle = '#ffffff';
			context.lineWidth = 3;
			context.setLineDash([7, 5]);
			context.beginPath();
			context.arc(0, 0, radius + 9, 0, Math.PI * 2);
			context.stroke();
		}
		context.restore();
	};

	const draw = (now: number) => {
		if (!canvas || !stage) return;
		const context = canvas.getContext('2d');
		if (!context) return;
		const rect = stage.getBoundingClientRect();
		context.clearRect(0, 0, rect.width, rect.height);
		stars.forEach((star, index) => drawStar(context, star, now, index === selectedIndex));
		pops.forEach((pop) => {
			const age = now - pop.bornAt;
			context.save();
			context.globalAlpha = Math.max(0, 1 - age / 700);
			context.fillStyle = '#fff8d8';
			context.font = '700 18px system-ui, sans-serif';
			context.textAlign = 'center';
			context.fillText(pop.text, pop.x, pop.y - (resolvedMotion === 'reduce' ? 0 : age * .035));
			context.restore();
		});
	};

	const finishRound = () => {
		phase = 'finished';
		stars = [];
		pops = [];
		cancelAnimationFrame(frame);
		bestScore = Math.max(bestScore, score);
		try { localStorage.setItem(BEST_SCORE_KEY, String(bestScore)); } catch { /* Local play remains available. */ }
		statusMessage = `本局完成，共收集 ${score} 點氣質。`;
		labAudioManager.playEffect('success');
		draw(performance.now());
	};

	const tick = (now: number) => {
		if (phase !== 'playing') return;
		lastFrameAt = now;
		timeLeft = Math.max(0, Math.ceil((roundEndsAt - now) / 1000));
		if (timeLeft <= 0) {
			finishRound();
			return;
		}
		const before = stars.length;
		stars = stars.filter((star) => now - star.bornAt < star.lifetime);
		if (stars.length < before) {
			combo = 0;
			selectedIndex = Math.min(selectedIndex, Math.max(0, stars.length - 1));
		}
		pops = pops.filter((pop) => now - pop.bornAt < 700);
		if (now >= nextSpawnAt) {
			spawnStar(now);
			nextSpawnAt = now + spawnDelay();
		}
		draw(now);
		frame = requestAnimationFrame(tick);
	};

	const startRound = () => {
		labAudioManager.noteUserInteraction();
		cancelAnimationFrame(frame);
		phase = 'playing';
		score = 0;
		combo = 0;
		bestCombo = 0;
		timeLeft = ROUND_SECONDS;
		selectedIndex = 0;
		stars = [];
		pops = [];
		bonusUntil = 0;
		bonusTriggered = false;
		const now = performance.now();
		roundEndsAt = now + ROUND_SECONDS * 1000;
		nextSpawnAt = now;
		statusMessage = '遊戲開始，收集畫面中的氣質星！';
		stage?.focus();
		frame = requestAnimationFrame(tick);
	};

	const pause = (automatic = false) => {
		if (phase !== 'playing') return;
		pausedRemaining = Math.max(0, roundEndsAt - performance.now());
		phase = 'paused';
		cancelAnimationFrame(frame);
		labAudioManager.pauseEffects();
		statusMessage = automatic ? '頁籤離開，遊戲已自動暫停。' : '遊戲已暫停。';
		draw(performance.now());
	};

	const resume = () => {
		if (phase !== 'paused') return;
		labAudioManager.noteUserInteraction();
		phase = 'playing';
		const now = performance.now();
		roundEndsAt = now + pausedRemaining;
		nextSpawnAt = now + 250;
		stars = stars.map((star) => ({ ...star, bornAt: now }));
		statusMessage = '繼續收集氣質！';
		stage?.focus();
		frame = requestAnimationFrame(tick);
	};

	const collect = (index: number) => {
		if (phase !== 'playing' || !stars[index]) return;
		const star = stars[index];
		const points = star.rare || performance.now() < bonusUntil ? 3 : 1;
		score += points;
		combo += 1;
		bestCombo = Math.max(bestCombo, combo);
		pops.push({ id: ++sequence, x: star.x, y: star.y, text: points === 3 ? '氣質 +3' : praise[sequence % praise.length], bornAt: performance.now() });
		stars.splice(index, 1);
		stars = [...stars];
		selectedIndex = Math.min(selectedIndex, Math.max(0, stars.length - 1));
		if (combo >= 10 && !bonusTriggered) {
			bonusTriggered = true;
			bonusUntil = performance.now() + 3000;
			stars = stars.map((candidate) => ({ ...candidate, rare: true }));
			statusMessage = '全體氣質時刻！3 秒內所有星星都是高分星。';
		} else {
			statusMessage = `${points === 3 ? '閃耀氣質' : '氣質'} +${points}，目前 ${score} 點。`;
		}
		labAudioManager.playEffect('success');
	};

	const handlePointer = (event: PointerEvent) => {
		if (phase !== 'playing') return;
		labAudioManager.noteUserInteraction();
		const rect = canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const index = stars.findIndex((star) => Math.hypot(star.x - x, star.y - y) <= star.radius + 8);
		if (index >= 0) collect(index);
		else {
			combo = 0;
			statusMessage = '差一點，Combo 重新開始。';
		}
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (phase !== 'playing' || stars.length === 0) return;
		if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(event.key)) {
			event.preventDefault();
			selectedIndex = (selectedIndex + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + stars.length) % stars.length;
			draw(performance.now());
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			labAudioManager.noteUserInteraction();
			collect(selectedIndex);
		}
	};

	onMount(() => {
		try { bestScore = Math.max(0, Number(localStorage.getItem(BEST_SCORE_KEY)) || 0); } catch { bestScore = 0; }
		unregisterAudio = labAudioManager.registerEffectChannel(audio, {
			success: '/lab-assets/audio/effect-success.wav',
			cancel: '/lab-assets/audio/effect-cancel.wav',
		});
		disposePreferences = onLabPreferencesChange((detail) => {
			resolvedMotion = detail.resolvedMotion;
			resolvedPerformance = detail.resolvedPerformance;
			labAudioManager.setSoundEnabled(detail.preferences.sound === 'on');
			labAudioManager.setEconomyMode(detail.resolvedPerformance === 'economy');
			resizeCanvas();
		});
		const observer = new ResizeObserver(resizeCanvas);
		observer.observe(stage);
		const handleVisibility = () => { if (document.hidden) pause(true); };
		document.addEventListener('visibilitychange', handleVisibility);
		resizeCanvas();
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			document.removeEventListener('visibilitychange', handleVisibility);
			disposePreferences();
			unregisterAudio();
			stars = [];
			pops = [];
		};
	});
</script>

<article class="temperament-game" data-phase={phase} class:is-bonus={isBonus}>
	<audio bind:this={audio} preload="none" aria-hidden="true"></audio>
	<header class="temperament-game__hud">
		<div><span>剩餘時間</span><strong>{timeLeft}<small>秒</small></strong></div>
		<div><span>氣質值</span><strong>{score}</strong></div>
		<div><span>Combo</span><strong>{combo}<small>{comboLabel}</small></strong></div>
		<div><span>最佳紀錄</span><strong>{bestScore}</strong></div>
	</header>

	<div
		class="temperament-game__stage"
		bind:this={stage}
		tabindex={phase === 'playing' ? 0 : -1}
		role="application"
		aria-label="氣質收集遊戲區；方向鍵選擇星星，Enter 或空白鍵收集"
		onkeydown={handleKeydown}
	>
		<canvas bind:this={canvas} onpointerdown={handlePointer} aria-hidden="true"></canvas>
		<div class="temperament-game__sky" aria-hidden="true"></div>
		{#if phase === 'ready'}
			<section class="temperament-game__overlay">
				<p class="lab-eyebrow">30 Second Challenge</p>
				<h2>幫蒂兒收集氣質</h2>
				<p>收集寫著「氣質」的星星，一般星 +1、閃耀星 +3。連續命中 10 次會進入全體氣質時刻！</p>
				<button type="button" onclick={startRound}>開始收集氣質</button>
			</section>
		{:else if phase === 'paused'}
			<section class="temperament-game__overlay">
				<p class="lab-eyebrow">Paused</p><h2>氣質先等等</h2>
				<p>倒數、星星與音效都已暫停，準備好再繼續。</p>
				<button type="button" onclick={resume}>繼續收集</button>
				<button type="button" class="is-secondary" onclick={startRound}>重新開始</button>
			</section>
		{:else if phase === 'finished'}
			<section class="temperament-game__overlay">
				<p class="lab-eyebrow">Collection Complete</p><h2>{resultTitle}</h2>
				<p>大家為蒂兒收集了 <strong>{score}</strong> 點氣質，最高達到 <strong>{bestCombo} Combo</strong>！</p>
				<button type="button" onclick={startRound}>再收集一次</button>
			</section>
		{:else if isBonus}
			<div class="temperament-game__bonus" aria-hidden="true">全體氣質時刻！</div>
		{/if}
	</div>

	<footer class="temperament-game__controls">
		<p aria-live="polite" aria-atomic="true">{statusMessage}</p>
		<div>
			{#if phase === 'playing'}<button type="button" onclick={() => pause(false)}>暫停</button>{/if}
			{#if phase !== 'ready'}<button type="button" class="is-secondary" onclick={startRound}>重新開始</button>{/if}
		</div>
	</footer>
</article>
