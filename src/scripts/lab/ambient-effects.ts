import {
	getLabPreferencesSnapshot,
	onLabPreferencesChange,
	type LabPreferencesSnapshot,
} from './preferences';

type AmbientMode = 'css' | 'canvas' | 'combined';

interface Particle {
	x: number;
	y: number;
	radius: number;
	alpha: number;
	speed: number;
	drift: number;
	phase: number;
}

interface Burst {
	x: number;
	y: number;
	age: number;
}

interface ActiveAmbientLab {
	root: HTMLElement;
	dispose: () => void;
}

let activeAmbientLab: ActiveAmbientLab | undefined;

const createParticle = (width: number, height: number): Particle => ({
	x: Math.random() * width,
	y: Math.random() * height,
	radius: 0.6 + Math.random() * 1.8,
	alpha: 0.28 + Math.random() * 0.62,
	speed: 3 + Math.random() * 8,
	drift: -2 + Math.random() * 4,
	phase: Math.random() * Math.PI * 2,
});

export const initializeAmbientEffects = () => {
	const root = document.querySelector<HTMLElement>('[data-ambient-lab]');
	if (!root) return;
	if (activeAmbientLab?.root === root && root.dataset.ready === 'true') return;
	activeAmbientLab?.dispose();

	const scene = root.querySelector<HTMLElement>('[data-ambient-scene]');
	const canvas = root.querySelector<HTMLCanvasElement>('[data-ambient-canvas]');
	const status = root.querySelector<HTMLElement>('[data-ambient-status]');
	const particleOutput = root.querySelector<HTMLElement>('[data-ambient-particle-count]');
	const pauseButton = root.querySelector<HTMLButtonElement>('[data-ambient-pause]');
	const resetButton = root.querySelector<HTMLButtonElement>('[data-ambient-reset]');
	const modeButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-ambient-mode]'));
	const farLayer = root.querySelector<HTMLElement>('.ambient-layer--far');
	const midLayer = root.querySelector<HTMLElement>('.ambient-layer--mid');
	const nearLayer = root.querySelector<HTMLElement>('.ambient-layer--near');
	if (!scene || !canvas) return;

	const context = canvas.getContext('2d', { alpha: true });
	if (!context) {
		if (status) status.textContent = 'Canvas 不可用；保留 CSS 靜態背景';
		return;
	}

	let snapshot: LabPreferencesSnapshot = getLabPreferencesSnapshot();
	let mode: AmbientMode = 'combined';
	let manuallyPaused = false;
	let hasParallax = false;
	let documentHidden = document.hidden;
	let frame = 0;
	let width = 1;
	let height = 1;
	let lastTime = performance.now();
	let particles: Particle[] = [];
	let bursts: Burst[] = [];

	const isReduced = () => snapshot.resolvedMotion === 'reduce';
	const isEconomy = () => snapshot.resolvedPerformance === 'economy';
	const canvasEnabled = () => mode !== 'css';
	const shouldAnimate = () => !manuallyPaused && !documentHidden && !isReduced() && canvasEnabled();

	const desiredParticleCount = () => {
		if (isEconomy()) return 18;
		return width < 720 ? 32 : 56;
	};

	const syncParticles = () => {
		const count = desiredParticleCount();
		if (particles.length > count) particles.length = count;
		while (particles.length < count) particles.push(createParticle(width, height));
		if (particleOutput) particleOutput.textContent = `${particles.length} 顆`;
	};

	const resize = () => {
		const bounds = scene.getBoundingClientRect();
		width = Math.max(1, Math.round(bounds.width));
		height = Math.max(1, Math.round(bounds.height));
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.round(width * dpr);
		canvas.height = Math.round(height * dpr);
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		context.setTransform(dpr, 0, 0, dpr, 0, 0);
		syncParticles();
		draw(performance.now(), false);
	};

	const drawStar = (x: number, y: number, radius: number, alpha: number) => {
		context.fillStyle = `rgba(240, 246, 255, ${alpha})`;
		context.beginPath();
		context.arc(x, y, radius, 0, Math.PI * 2);
		context.fill();
	};

	const draw = (time: number, advance: boolean) => {
		const delta = Math.min(40, Math.max(0, time - lastTime)) / 1000;
		lastTime = time;
		context.clearRect(0, 0, width, height);
		if (!canvasEnabled()) return;

		particles.forEach((particle, index) => {
			if (advance) {
				particle.y -= particle.speed * delta;
				particle.x += particle.drift * delta;
				particle.phase += delta * 0.9;
				if (particle.y < -4) { particle.y = height + 4; particle.x = Math.random() * width; }
				if (particle.x < -4) particle.x = width + 4;
				if (particle.x > width + 4) particle.x = -4;
			}
			const pulse = isReduced() ? 1 : 0.78 + Math.sin(particle.phase) * 0.22;
			drawStar(particle.x, particle.y, particle.radius, particle.alpha * pulse);
			if (!isEconomy() && index % 7 === 0) {
				const other = particles[(index + 3) % particles.length];
				const distance = Math.hypot(other.x - particle.x, other.y - particle.y);
				if (distance < 120) {
					context.strokeStyle = `rgba(166, 198, 232, ${0.12 * (1 - distance / 120)})`;
					context.lineWidth = 0.7;
					context.beginPath();
					context.moveTo(particle.x, particle.y);
					context.lineTo(other.x, other.y);
					context.stroke();
				}
			}
		});

		bursts = bursts.filter((burst) => burst.age < 1);
		bursts.forEach((burst) => {
			if (advance) burst.age += delta * 1.8;
			const radius = 8 + burst.age * 34;
			const alpha = Math.max(0, 1 - burst.age);
			context.strokeStyle = `rgba(235, 225, 174, ${alpha * 0.8})`;
			context.lineWidth = 1.2;
			context.beginPath();
			context.moveTo(burst.x - radius, burst.y);
			context.lineTo(burst.x + radius, burst.y);
			context.moveTo(burst.x, burst.y - radius);
			context.lineTo(burst.x, burst.y + radius);
			context.stroke();
		});
	};

	const updateStatus = () => {
		if (!status) return;
		const preference = isReduced() ? '靜態（減少動態）' : isEconomy() ? '節能' : '標準';
		const state = manuallyPaused ? '手動暫停' : documentHidden ? '背景暫停' : '執行中';
		status.textContent = `${preference}・${state}`;
		if (pauseButton) pauseButton.textContent = manuallyPaused ? '繼續效果' : '暫停效果';
	};

	const tick = (time: number) => {
		frame = 0;
		draw(time, true);
		if (shouldAnimate()) frame = requestAnimationFrame(tick);
	};

	const restartLoop = () => {
		cancelAnimationFrame(frame);
		frame = 0;
		lastTime = performance.now();
		draw(lastTime, false);
		if (shouldAnimate()) frame = requestAnimationFrame(tick);
		updateStatus();
	};

	const syncResetButton = () => {
		if (!resetButton) return;
		const canReset = hasParallax && !isReduced() && !isEconomy();
		resetButton.disabled = !canReset;
		resetButton.textContent = canReset ? '回復中央視角' : '視角已置中';
	};

	const resetParallax = () => {
		scene.style.setProperty('--pointer-x', '0');
		scene.style.setProperty('--pointer-y', '0');
		farLayer?.style.setProperty('transform', 'translate3d(0, 0, 0)');
		midLayer?.style.setProperty('transform', 'translate3d(0, 0, 0)');
		nearLayer?.style.setProperty('transform', 'translate3d(0, 0, 0) scale(1.04)');
		canvas.style.setProperty('transform', 'translate3d(0, 0, 0) scale(1.025)');
		hasParallax = false;
		syncResetButton();
	};

	const handlePointerMove = (event: PointerEvent) => {
		if (isReduced() || isEconomy() || event.pointerType === 'touch') return;
		const bounds = scene.getBoundingClientRect();
		const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
		const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
		scene.style.setProperty('--pointer-x', x.toFixed(3));
		scene.style.setProperty('--pointer-y', y.toFixed(3));
		farLayer?.style.setProperty('transform', `translate3d(${-x * 12}px, ${-y * 12}px, 0)`);
		midLayer?.style.setProperty('transform', `translate3d(${x * 28}px, ${y * 28}px, 0)`);
		nearLayer?.style.setProperty('transform', `translate3d(${x * 44}px, ${y * 44}px, 0) scale(1.04)`);
		canvas.style.setProperty('transform', `translate3d(${-x * 18}px, ${-y * 18}px, 0) scale(1.025)`);
		hasParallax = Math.abs(x) > 0.03 || Math.abs(y) > 0.03;
		syncResetButton();
	};

	const handleSceneClick = (event: MouseEvent) => {
		if (!canvasEnabled() || isReduced() || isEconomy() || (event.target as HTMLElement).closest('a, button')) return;
		const bounds = scene.getBoundingClientRect();
		bursts.length = 0;
		bursts.push({ x: event.clientX - bounds.left, y: event.clientY - bounds.top, age: 0 });
		restartLoop();
	};

	const handleMode = (event: Event) => {
		const button = event.currentTarget as HTMLButtonElement;
		mode = (button.dataset.ambientMode ?? 'combined') as AmbientMode;
		scene.dataset.mode = mode;
		modeButtons.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
		restartLoop();
	};

	const handlePause = () => { manuallyPaused = !manuallyPaused; restartLoop(); };
	const handleVisibility = () => { documentHidden = document.hidden; restartLoop(); };
	const handleReset = () => { resetParallax(); bursts.length = 0; draw(performance.now(), false); };
	const resizeObserver = new ResizeObserver(resize);
	const stopPreferences = onLabPreferencesChange((detail) => {
		snapshot = detail;
		if (isReduced() || isEconomy()) resetParallax();
		syncParticles();
		restartLoop();
	});

	modeButtons.forEach((button) => button.addEventListener('click', handleMode));
	pauseButton?.addEventListener('click', handlePause);
	resetButton?.addEventListener('click', handleReset);
	scene.addEventListener('pointermove', handlePointerMove);
	scene.addEventListener('click', handleSceneClick);
	document.addEventListener('visibilitychange', handleVisibility);
	resizeObserver.observe(scene);
	root.dataset.ready = 'true';
	resize();
	restartLoop();

	const controller: ActiveAmbientLab = {
		root,
		dispose: () => {
			cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			stopPreferences();
			modeButtons.forEach((button) => button.removeEventListener('click', handleMode));
			pauseButton?.removeEventListener('click', handlePause);
			resetButton?.removeEventListener('click', handleReset);
			scene.removeEventListener('pointermove', handlePointerMove);
			scene.removeEventListener('click', handleSceneClick);
			document.removeEventListener('visibilitychange', handleVisibility);
			window.removeEventListener('pagehide', handlePageHide);
			bursts = [];
			particles = [];
			delete root.dataset.ready;
			if (activeAmbientLab === controller) activeAmbientLab = undefined;
		},
	};
	const handlePageHide = () => controller.dispose();
	window.addEventListener('pagehide', handlePageHide, { once: true });
	activeAmbientLab = controller;
};
