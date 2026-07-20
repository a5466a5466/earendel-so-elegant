import {
	getLabPreferencesSnapshot,
	onLabPreferencesChange,
	type LabPreferencesSnapshot,
} from './preferences';

type CursorMode = 'native' | 'static' | 'halo';

interface ActiveCursorLab {
	root: HTMLElement;
	dispose: () => void;
}

let activeCursorLab: ActiveCursorLab | undefined;

const isCursorMode = (value: string): value is CursorMode =>
	value === 'native' || value === 'static' || value === 'halo';

export const initializeCursorLab = () => {
	const root = document.querySelector<HTMLElement>('[data-cursor-lab]');
	if (!root) return;
	if (activeCursorLab?.root === root && root.dataset.ready === 'true') return;
	activeCursorLab?.dispose();

	const stage = root.querySelector<HTMLElement>('[data-cursor-stage]');
	const halo = root.querySelector<HTMLElement>('[data-cursor-halo]');
	const form = root.querySelector<HTMLFormElement>('[data-cursor-mode-form]');
	const status = root.querySelector<HTMLElement>('[data-cursor-status]');
	const modeOutput = root.querySelector<HTMLElement>('[data-cursor-mode-output]');
	const guardOutput = root.querySelector<HTMLElement>('[data-cursor-guard-output]');
	if (!stage || !halo || !form) return;

	const precisePointerQuery = matchMedia('(pointer: fine) and (hover: hover)');
	let snapshot: LabPreferencesSnapshot = getLabPreferencesSnapshot();
	let selectedMode: CursorMode = 'halo';
	let animationFrame = 0;
	let targetX = 0;
	let targetY = 0;
	let currentX = 0;
	let currentY = 0;
	let hasPosition = false;

	const guardReason = () => {
		if (!precisePointerQuery.matches) return '目前裝置不是精準 Hover 指標';
		if (snapshot.resolvedMotion === 'reduce') return '目前要求減少動態';
		if (snapshot.resolvedPerformance === 'economy') return '目前為節能模式';
		return '';
	};

	const effectiveMode = (): CursorMode => {
		if (selectedMode === 'native' || guardReason()) return 'native';
		return selectedMode;
	};

	const renderPosition = () => {
		const distanceX = targetX - currentX;
		const distanceY = targetY - currentY;
		currentX += distanceX * 0.24;
		currentY += distanceY * 0.24;
		halo.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
		if (Math.abs(distanceX) > 0.1 || Math.abs(distanceY) > 0.1) {
			animationFrame = requestAnimationFrame(renderPosition);
		} else {
			animationFrame = 0;
		}
	};

	const schedulePosition = () => {
		if (!animationFrame) animationFrame = requestAnimationFrame(renderPosition);
	};

	const renderMode = (announce = false) => {
		const mode = effectiveMode();
		root.dataset.cursorMode = mode;
		const reason = guardReason();
		const modeLabel = mode === 'halo' ? '動態星環' : mode === 'static' ? '靜態星芒' : '原生游標';
		if (modeOutput) modeOutput.textContent = modeLabel;
		if (guardOutput) guardOutput.textContent = reason || '裝置與偏好允許完整效果';
		if (status && announce) {
			status.textContent = reason
				? `${reason}，已安全回到原生游標。`
				: `已切換為${modeLabel}。`;
		}
		if (mode !== 'halo') {
			halo.dataset.visible = 'false';
			cancelAnimationFrame(animationFrame);
			animationFrame = 0;
		}
	};

	const handleModeChange = () => {
		const input = form.querySelector<HTMLInputElement>('input[name="cursor-mode"]:checked');
		if (input && isCursorMode(input.value)) selectedMode = input.value;
		renderMode(true);
	};

	const handlePointerMove = (event: PointerEvent) => {
		if (effectiveMode() !== 'halo' || event.pointerType === 'touch') return;
		targetX = event.clientX;
		targetY = event.clientY;
		if (!hasPosition) {
			currentX = targetX;
			currentY = targetY;
			hasPosition = true;
		}
		halo.dataset.visible = 'true';
		schedulePosition();
	};

	const handlePointerLeave = () => {
		halo.dataset.visible = 'false';
	};

	const handlePointerOver = (event: PointerEvent) => {
		const target = event.target as Element | null;
		halo.dataset.interactive = target?.closest('a, button, input, textarea, select, summary') ? 'true' : 'false';
	};

	const handlePointerDown = () => { halo.dataset.pressed = 'true'; };
	const handlePointerUp = () => { halo.dataset.pressed = 'false'; };
	const handlePointerCapabilityChange = () => renderMode(true);

	const stopPreferences = onLabPreferencesChange((detail) => {
		snapshot = detail;
		renderMode(detail.source !== 'initialize');
	});

	form.addEventListener('change', handleModeChange);
	stage.addEventListener('pointermove', handlePointerMove, { passive: true });
	stage.addEventListener('pointerleave', handlePointerLeave);
	stage.addEventListener('pointerover', handlePointerOver, { passive: true });
	stage.addEventListener('pointerdown', handlePointerDown, { passive: true });
	stage.addEventListener('pointerup', handlePointerUp, { passive: true });
	stage.addEventListener('pointercancel', handlePointerUp, { passive: true });
	precisePointerQuery.addEventListener('change', handlePointerCapabilityChange);
	root.dataset.ready = 'true';
	renderMode();

	const controller: ActiveCursorLab = {
		root,
		dispose: () => {
			cancelAnimationFrame(animationFrame);
			stopPreferences();
			form.removeEventListener('change', handleModeChange);
			stage.removeEventListener('pointermove', handlePointerMove);
			stage.removeEventListener('pointerleave', handlePointerLeave);
			stage.removeEventListener('pointerover', handlePointerOver);
			stage.removeEventListener('pointerdown', handlePointerDown);
			stage.removeEventListener('pointerup', handlePointerUp);
			stage.removeEventListener('pointercancel', handlePointerUp);
			precisePointerQuery.removeEventListener('change', handlePointerCapabilityChange);
			window.removeEventListener('pagehide', handlePageHide);
			delete root.dataset.ready;
			if (activeCursorLab === controller) activeCursorLab = undefined;
		},
	};
	const handlePageHide = () => controller.dispose();
	window.addEventListener('pagehide', handlePageHide, { once: true });
	activeCursorLab = controller;
};
