export type MotionPreference = 'system' | 'reduce';
export type SoundPreference = 'off' | 'on';
export type PerformancePreference = 'auto' | 'standard' | 'economy';

export interface LabPreferences {
	motion: MotionPreference;
	sound: SoundPreference;
	performance: PerformancePreference;
}

interface NavigatorWithDeviceHints extends Navigator {
	connection?: { saveData?: boolean };
	deviceMemory?: number;
}

const STORAGE_KEY = 'earendel-lab-preferences-v1';

const DEFAULT_PREFERENCES: LabPreferences = {
	motion: 'system',
	sound: 'off',
	performance: 'auto',
};

const isMotionPreference = (value: unknown): value is MotionPreference =>
	value === 'system' || value === 'reduce';

const isSoundPreference = (value: unknown): value is SoundPreference =>
	value === 'off' || value === 'on';

const isPerformancePreference = (value: unknown): value is PerformancePreference =>
	value === 'auto' || value === 'standard' || value === 'economy';

const loadPreferences = (): LabPreferences => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return { ...DEFAULT_PREFERENCES };

		const parsed = JSON.parse(stored) as Partial<LabPreferences>;
		return {
			motion: isMotionPreference(parsed.motion) ? parsed.motion : DEFAULT_PREFERENCES.motion,
			sound: isSoundPreference(parsed.sound) ? parsed.sound : DEFAULT_PREFERENCES.sound,
			performance: isPerformancePreference(parsed.performance)
				? parsed.performance
				: DEFAULT_PREFERENCES.performance,
		};
	} catch {
		return { ...DEFAULT_PREFERENCES };
	}
};

const savePreferences = (preferences: LabPreferences) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
	} catch {
		// The controls still work for the current page when storage is unavailable.
	}
};

const clearPreferences = () => {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// Reset the current page even when storage is unavailable.
	}
};

const resolvePerformance = (preference: PerformancePreference): 'standard' | 'economy' => {
	if (preference !== 'auto') return preference;

	const deviceNavigator = navigator as NavigatorWithDeviceHints;
	const prefersDataSaving = deviceNavigator.connection?.saveData === true;
	const hasLimitedMemory =
		typeof deviceNavigator.deviceMemory === 'number' && deviceNavigator.deviceMemory <= 4;

	return prefersDataSaving || hasLimitedMemory ? 'economy' : 'standard';
};

const labelForPointer = (coarse: boolean, hover: boolean) => {
	if (coarse) return hover ? '觸控為主，可 Hover' : '觸控為主，無 Hover';
	return hover ? '精細指標，可 Hover' : '精細指標，無 Hover';
};

export const initializeLabPreferences = () => {
	const controls = document.querySelector<HTMLElement>('[data-lab-controls]');
	if (!controls || controls.dataset.ready === 'true') return;

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

	const reducedMotionQuery = matchMedia('(prefers-reduced-motion: reduce)');
	const coarsePointerQuery = matchMedia('(pointer: coarse)');
	const hoverQuery = matchMedia('(hover: hover)');
	let preferences = loadPreferences();
	let resizeFrame = 0;

	const updateDeviceInformation = () => {
		const width = Math.round(window.visualViewport?.width ?? window.innerWidth);
		const height = Math.round(window.visualViewport?.height ?? window.innerHeight);

		if (viewportOutput) viewportOutput.textContent = `${width} × ${height} px`;
		if (dprOutput) dprOutput.textContent = window.devicePixelRatio.toFixed(2);
		if (pointerOutput) {
			pointerOutput.textContent = labelForPointer(coarsePointerQuery.matches, hoverQuery.matches);
		}
	};

	const applyPreferences = (announce = false) => {
		const resolvedMotion =
			preferences.motion === 'reduce' || reducedMotionQuery.matches ? 'reduce' : 'full';
		const resolvedPerformance = resolvePerformance(preferences.performance);

		document.documentElement.dataset.motion = resolvedMotion;
		document.documentElement.dataset.motionSetting = preferences.motion;
		document.documentElement.dataset.sound = preferences.sound;
		document.documentElement.dataset.performance = resolvedPerformance;
		document.documentElement.dataset.performanceSetting = preferences.performance;

		motionSelect.value = preferences.motion;
		soundSelect.value = preferences.sound;
		performanceSelect.value = preferences.performance;

		if (motionOutput) {
			const systemStatus = reducedMotionQuery.matches ? '系統要求減少' : '系統允許完整動態';
			motionOutput.textContent = `${systemStatus}；目前${resolvedMotion === 'reduce' ? '減少' : '完整'}`;
		}
		if (performanceOutput) {
			performanceOutput.textContent = resolvedPerformance === 'economy' ? '節能' : '標準';
		}
		if (summaryOutput) {
			const motionLabel = preferences.motion === 'reduce' ? '減少動態' : '跟隨系統';
			const soundLabel = preferences.sound === 'on' ? '音效開啟' : '靜音';
			const performanceLabel =
				preferences.performance === 'auto'
					? `自動→${resolvedPerformance === 'economy' ? '節能' : '標準'}`
					: resolvedPerformance === 'economy'
						? '節能'
						: '標準';
			summaryOutput.textContent = `${motionLabel} · ${soundLabel} · ${performanceLabel}`;
		}
		if (announce && statusOutput) statusOutput.textContent = '實驗室偏好已更新。';

		window.dispatchEvent(
			new CustomEvent('lab:preferences-change', {
				detail: {
					preferences: { ...preferences },
					resolvedMotion,
					resolvedPerformance,
				},
			}),
		);
	};

	const scheduleDeviceUpdate = () => {
		cancelAnimationFrame(resizeFrame);
		resizeFrame = requestAnimationFrame(updateDeviceInformation);
	};

	form.addEventListener('change', () => {
		preferences = {
			motion: isMotionPreference(motionSelect.value)
				? motionSelect.value
				: DEFAULT_PREFERENCES.motion,
			sound: isSoundPreference(soundSelect.value)
				? soundSelect.value
				: DEFAULT_PREFERENCES.sound,
			performance: isPerformancePreference(performanceSelect.value)
				? performanceSelect.value
				: DEFAULT_PREFERENCES.performance,
		};
		savePreferences(preferences);
		applyPreferences(true);
	});

	resetButton?.addEventListener('click', () => {
		preferences = { ...DEFAULT_PREFERENCES };
		clearPreferences();
		applyPreferences();
		if (statusOutput) statusOutput.textContent = '實驗室偏好已重設。';
	});

	reducedMotionQuery.addEventListener('change', () => applyPreferences());
	coarsePointerQuery.addEventListener('change', updateDeviceInformation);
	hoverQuery.addEventListener('change', updateDeviceInformation);
	window.addEventListener('resize', scheduleDeviceUpdate, { passive: true });
	window.visualViewport?.addEventListener('resize', scheduleDeviceUpdate, { passive: true });

	controls.dataset.ready = 'true';
	updateDeviceInformation();
	applyPreferences();
};
