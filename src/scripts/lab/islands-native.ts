import {
	onLabPreferencesChange,
	type LabPreferencesChangeDetail,
} from './preferences';

type CharacterState = 'idle' | 'spark' | 'cheer' | 'sleep';

const stateDefinitions: Record<CharacterState, {
	label: string;
	title: string;
	description: string;
}> = {
	idle: { label: '待機', title: '靜候星訊', description: '保持安靜，等待下一次互動。' },
	spark: { label: '星光', title: '接住星光', description: '以短暫星芒回應使用者。' },
	cheer: { label: '應援', title: '一起應援', description: '切換成明亮、積極的應援狀態。' },
	sleep: { label: '休眠', title: '進入休眠', description: '降低裝飾動態，保留主要資訊。' },
};

let disposeActiveStation: (() => void) | undefined;

const isCharacterState = (value: string | undefined): value is CharacterState =>
	value === 'idle' || value === 'spark' || value === 'cheer' || value === 'sleep';

export const initializeNativeStateStation = () => {
	disposeActiveStation?.();
	const root = document.querySelector<HTMLElement>('[data-native-state-station]');
	if (!root) return;

	const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-state-option]'));
	const title = root.querySelector<HTMLElement>('[data-state-title]');
	const description = root.querySelector<HTMLElement>('[data-state-description]');
	const currentLabel = root.querySelector<HTMLElement>('[data-state-current]');
	const log = root.querySelector<HTMLOListElement>('[data-state-log]');
	const empty = root.querySelector<HTMLElement>('[data-state-empty]');
	const resetButton = root.querySelector<HTMLButtonElement>('[data-state-reset]');
	const motionOutput = root.querySelector<HTMLElement>('[data-state-motion]');
	const performanceOutput = root.querySelector<HTMLElement>('[data-state-performance]');
	let currentState: CharacterState = 'idle';
	let interactionCount = 0;

	const renderState = () => {
		const definition = stateDefinitions[currentState];
		root.dataset.state = currentState;
		if (title) title.textContent = definition.title;
		if (description) description.textContent = definition.description;
		if (currentLabel) currentLabel.textContent = `目前狀態 · ${definition.label}`;
		buttons.forEach((button) => {
			const active = button.dataset.stateOption === currentState;
			button.classList.toggle('is-active', active);
			button.setAttribute('aria-pressed', String(active));
		});
	};

	const addLogEntry = () => {
		if (!log) return;
		interactionCount += 1;
		empty?.setAttribute('hidden', '');
		const item = document.createElement('li');
		item.textContent = `切換為「${stateDefinitions[currentState].label}」狀態`;
		log.prepend(item);
		while (log.children.length > 5) log.lastElementChild?.remove();
		if (resetButton) resetButton.disabled = false;
	};

	const selectState = (state: CharacterState) => {
		currentState = state;
		renderState();
		addLogEntry();
	};

	const handleClick = (event: Event) => {
		const state = (event.currentTarget as HTMLButtonElement).dataset.stateOption;
		if (isCharacterState(state)) selectState(state);
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
		event.preventDefault();
		const index = buttons.indexOf(event.currentTarget as HTMLButtonElement);
		const nextIndex = event.key === 'Home'
			? 0
			: event.key === 'End'
				? buttons.length - 1
				: (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
		const nextButton = buttons[nextIndex];
		nextButton?.focus();
		const state = nextButton?.dataset.stateOption;
		if (isCharacterState(state)) selectState(state);
	};

	const handleReset = () => {
		currentState = 'idle';
		interactionCount = 0;
		log?.replaceChildren();
		empty?.removeAttribute('hidden');
		if (resetButton) resetButton.disabled = true;
		renderState();
	};

	const renderPreferences = (detail: LabPreferencesChangeDetail) => {
		root.classList.toggle('is-motion-reduced', detail.resolvedMotion === 'reduce');
		root.classList.toggle('is-economy', detail.resolvedPerformance === 'economy');
		if (motionOutput) motionOutput.textContent = `動態：${detail.resolvedMotion === 'reduce' ? '減少' : '完整'}`;
		if (performanceOutput) performanceOutput.textContent = `效能：${detail.resolvedPerformance === 'economy' ? '節能' : '標準'}`;
	};

	buttons.forEach((button) => {
		button.addEventListener('click', handleClick);
		button.addEventListener('keydown', handleKeydown);
	});
	resetButton?.addEventListener('click', handleReset);
	const stopPreferences = onLabPreferencesChange(renderPreferences);

	const dispose = () => {
		buttons.forEach((button) => {
			button.removeEventListener('click', handleClick);
			button.removeEventListener('keydown', handleKeydown);
		});
		resetButton?.removeEventListener('click', handleReset);
		stopPreferences();
		window.removeEventListener('pagehide', dispose);
		document.removeEventListener('astro:before-swap', dispose);
		if (disposeActiveStation === dispose) disposeActiveStation = undefined;
	};

	disposeActiveStation = dispose;
	window.addEventListener('pagehide', dispose, { once: true });
	document.addEventListener('astro:before-swap', dispose, { once: true });
	renderState();
};
