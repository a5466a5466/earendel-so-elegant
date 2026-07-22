export type MotionPreference = 'full' | 'reduce';
export type SoundPreference = 'off' | 'on';
export type PerformancePreference = 'standard' | 'economy';
export type ResolvedMotionPreference = 'full' | 'reduce';
export type ResolvedPerformancePreference = 'standard' | 'economy';
export type LabPreferencesChangeSource = 'initialize' | 'control' | 'reset' | 'storage' | 'api';

export interface LabPreferences {
	motion: MotionPreference;
	sound: SoundPreference;
	performance: PerformancePreference;
}

export interface LabPreferencesSnapshot {
	preferences: LabPreferences;
	resolvedMotion: ResolvedMotionPreference;
	resolvedPerformance: ResolvedPerformancePreference;
}

export interface LabPreferencesChangeDetail extends LabPreferencesSnapshot {
	source: LabPreferencesChangeSource;
}

interface ActiveController {
	controls: HTMLElement;
	dispose: () => void;
}

export const LAB_PREFERENCES_STORAGE_KEY = 'earendel-lab-preferences-v2';
export const LAB_PREFERENCES_CHANGE_EVENT = 'lab:preferences-change';

export const DEFAULT_LAB_PREFERENCES: Readonly<LabPreferences> = Object.freeze({
	motion: 'full',
	sound: 'on',
	performance: 'standard',
});

let activeController: ActiveController | undefined;

const isMotionPreference = (value: unknown): value is MotionPreference =>
	value === 'full' || value === 'reduce';

const isSoundPreference = (value: unknown): value is SoundPreference =>
	value === 'off' || value === 'on';

const isPerformancePreference = (value: unknown): value is PerformancePreference =>
	value === 'standard' || value === 'economy';

const sanitizePreferences = (value: unknown): LabPreferences => {
	const candidate = value && typeof value === 'object' ? value as Partial<LabPreferences> : {};
	return {
		motion: isMotionPreference(candidate.motion) ? candidate.motion : DEFAULT_LAB_PREFERENCES.motion,
		sound: isSoundPreference(candidate.sound) ? candidate.sound : DEFAULT_LAB_PREFERENCES.sound,
		performance: isPerformancePreference(candidate.performance)
			? candidate.performance
			: DEFAULT_LAB_PREFERENCES.performance,
	};
};

export const readLabPreferences = (): LabPreferences => {
	if (typeof window === 'undefined') return { ...DEFAULT_LAB_PREFERENCES };
	try {
		const stored = window.localStorage.getItem(LAB_PREFERENCES_STORAGE_KEY);
		return stored ? sanitizePreferences(JSON.parse(stored)) : { ...DEFAULT_LAB_PREFERENCES };
	} catch {
		return { ...DEFAULT_LAB_PREFERENCES };
	}
};

export const writeLabPreferences = (preferences: LabPreferences): LabPreferences => {
	const safePreferences = sanitizePreferences(preferences);
	try {
		window.localStorage.setItem(LAB_PREFERENCES_STORAGE_KEY, JSON.stringify(safePreferences));
	} catch {
		// Current-page behavior remains available when storage is blocked or full.
	}
	return safePreferences;
};

export const resetLabPreferences = (): LabPreferences => {
	try {
		window.localStorage.removeItem(LAB_PREFERENCES_STORAGE_KEY);
	} catch {
		// The safe defaults can still be applied to the current page.
	}
	return { ...DEFAULT_LAB_PREFERENCES };
};

export const getLabPreferencesSnapshot = (
	preferences: LabPreferences = readLabPreferences(),
): LabPreferencesSnapshot => {
	const safePreferences = sanitizePreferences(preferences);
	return {
		preferences: safePreferences,
		resolvedMotion: safePreferences.motion,
		resolvedPerformance: safePreferences.performance,
	};
};

export const applyLabPreferences = (
	preferences: LabPreferences = readLabPreferences(),
	source: LabPreferencesChangeSource = 'api',
): LabPreferencesSnapshot => {
	const snapshot = getLabPreferencesSnapshot(preferences);
	if (typeof document !== 'undefined') {
		document.documentElement.dataset.motion = snapshot.resolvedMotion;
		document.documentElement.dataset.motionSetting = snapshot.preferences.motion;
		document.documentElement.dataset.sound = snapshot.preferences.sound;
		document.documentElement.dataset.performance = snapshot.resolvedPerformance;
		document.documentElement.dataset.performanceSetting = snapshot.preferences.performance;
	}
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new CustomEvent<LabPreferencesChangeDetail>(LAB_PREFERENCES_CHANGE_EVENT, {
			detail: { ...snapshot, source },
		}));
	}
	return snapshot;
};

export const onLabPreferencesChange = (
	callback: (detail: LabPreferencesChangeDetail) => void,
	emitCurrent = true,
) => {
	if (typeof window === 'undefined') return () => undefined;
	const listener: EventListener = (event) => {
		callback((event as CustomEvent<LabPreferencesChangeDetail>).detail);
	};
	window.addEventListener(LAB_PREFERENCES_CHANGE_EVENT, listener);
	if (emitCurrent) callback({ ...getLabPreferencesSnapshot(), source: 'initialize' });
	return () => window.removeEventListener(LAB_PREFERENCES_CHANGE_EVENT, listener);
};

const labelForPointer = (coarse: boolean, hover: boolean) => {
	if (coarse) return hover ? '觸控為主，可 Hover' : '觸控為主，無 Hover';
	return hover ? '精細指標，可 Hover' : '精細指標，無 Hover';
};

export const initializeLabPreferences = () => {
	const controls = document.querySelector<HTMLElement>('[data-lab-controls]');
	if (!controls) return;
	if (activeController?.controls === controls && controls.dataset.ready === 'true') return;
	activeController?.dispose();

	const form = controls.querySelector<HTMLFormElement>('[data-lab-preferences-form]');
	const motionSelect = controls.querySelector<HTMLSelectElement>('[data-motion-control]');
	const soundSelect = controls.querySelector<HTMLSelectElement>('[data-sound-control]');
	const performanceSelect = controls.querySelector<HTMLSelectElement>('[data-performance-control]');
	const resetButton = controls.querySelector<HTMLButtonElement>('[data-reset-preferences]');
	const viewportOutput = controls.querySelector<HTMLElement>('[data-viewport-output]');
	const dprOutput = controls.querySelector<HTMLElement>('[data-dpr-output]');
	const pointerOutput = controls.querySelector<HTMLElement>('[data-pointer-output]');
	const motionOutput = controls.querySelector<HTMLElement>('[data-motion-output]');
	const performanceOutput = controls.querySelector<HTMLElement>('[data-performance-output]');
	const summaryOutput = controls.querySelector<HTMLElement>('[data-preferences-summary]');
	const statusOutput = controls.querySelector<HTMLElement>('[data-preferences-status]');
	if (!form || !motionSelect || !soundSelect || !performanceSelect) return;

	const coarsePointerQuery = matchMedia('(pointer: coarse)');
	const hoverQuery = matchMedia('(hover: hover)');
	let preferences = readLabPreferences();
	let resizeFrame = 0;

	const updateDeviceInformation = () => {
		const width = Math.round(window.visualViewport?.width ?? window.innerWidth);
		const height = Math.round(window.visualViewport?.height ?? window.innerHeight);
		if (viewportOutput) viewportOutput.textContent = `${width} × ${height} px`;
		if (dprOutput) dprOutput.textContent = window.devicePixelRatio.toFixed(2);
		if (pointerOutput) pointerOutput.textContent = labelForPointer(coarsePointerQuery.matches, hoverQuery.matches);
	};

	const renderSnapshot = (snapshot: LabPreferencesSnapshot, announcement?: string) => {
		motionSelect.value = snapshot.preferences.motion;
		soundSelect.value = snapshot.preferences.sound;
		performanceSelect.value = snapshot.preferences.performance;
		if (motionOutput) {
			motionOutput.textContent = snapshot.resolvedMotion === 'reduce' ? '減少動態' : '完整動態';
		}
		if (performanceOutput) performanceOutput.textContent = snapshot.resolvedPerformance === 'economy' ? '節能' : '標準';
		if (summaryOutput) {
			const motionLabel = snapshot.preferences.motion === 'reduce' ? '減少動態' : '完整動態';
			const soundLabel = snapshot.preferences.sound === 'on' ? '音效開啟' : '靜音';
			const performanceLabel = snapshot.resolvedPerformance === 'economy' ? '節能' : '標準';
			summaryOutput.textContent = `${motionLabel} · ${soundLabel} · ${performanceLabel}`;
		}
		if (announcement && statusOutput) statusOutput.textContent = announcement;
	};
	const renderPreferences = (source: LabPreferencesChangeSource, announcement?: string) => {
		const snapshot = applyLabPreferences(preferences, source);
		renderSnapshot(snapshot, announcement);
	};

	const handleFormChange = () => {
		preferences = writeLabPreferences({
			motion: isMotionPreference(motionSelect.value) ? motionSelect.value : DEFAULT_LAB_PREFERENCES.motion,
			sound: isSoundPreference(soundSelect.value) ? soundSelect.value : DEFAULT_LAB_PREFERENCES.sound,
			performance: isPerformancePreference(performanceSelect.value)
				? performanceSelect.value
				: DEFAULT_LAB_PREFERENCES.performance,
		});
		renderPreferences('control', '實驗室偏好已更新。');
	};
	const handleReset = () => {
		preferences = resetLabPreferences();
		renderPreferences('reset', '實驗室偏好已重設。');
	};
	const handleStorageChange = (event: StorageEvent) => {
		if (event.key !== null && event.key !== LAB_PREFERENCES_STORAGE_KEY) return;
		preferences = readLabPreferences();
		renderPreferences('storage', '偏好已由另一個頁面同步。');
	};
	const handleSamePagePreferenceChange: EventListener = (event) => {
		const detail = (event as CustomEvent<LabPreferencesChangeDetail>).detail;
		if (!detail) return;
		preferences = { ...detail.preferences };
		renderSnapshot(detail, detail.source === 'api' || detail.source === 'control'
			? '實驗室偏好已由同頁控制同步。'
			: undefined);
	};
	const scheduleDeviceUpdate = () => {
		cancelAnimationFrame(resizeFrame);
		resizeFrame = requestAnimationFrame(updateDeviceInformation);
	};

	form.addEventListener('change', handleFormChange);
	resetButton?.addEventListener('click', handleReset);
	coarsePointerQuery.addEventListener('change', updateDeviceInformation);
	hoverQuery.addEventListener('change', updateDeviceInformation);
	window.addEventListener('storage', handleStorageChange);
	window.addEventListener(LAB_PREFERENCES_CHANGE_EVENT, handleSamePagePreferenceChange);
	window.addEventListener('resize', scheduleDeviceUpdate, { passive: true });
	window.visualViewport?.addEventListener('resize', scheduleDeviceUpdate, { passive: true });

	controls.dataset.ready = 'true';
	updateDeviceInformation();
	renderPreferences('initialize');

	activeController = {
		controls,
		dispose: () => {
			cancelAnimationFrame(resizeFrame);
			form.removeEventListener('change', handleFormChange);
			resetButton?.removeEventListener('click', handleReset);
			coarsePointerQuery.removeEventListener('change', updateDeviceInformation);
			hoverQuery.removeEventListener('change', updateDeviceInformation);
			window.removeEventListener('storage', handleStorageChange);
			window.removeEventListener(LAB_PREFERENCES_CHANGE_EVENT, handleSamePagePreferenceChange);
			window.removeEventListener('resize', scheduleDeviceUpdate);
			window.visualViewport?.removeEventListener('resize', scheduleDeviceUpdate);
			delete controls.dataset.ready;
		},
	};
};
