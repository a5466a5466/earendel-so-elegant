import { labAudioManager, type LabSoundEffect, type SoundEffectPlayResult } from './audio-manager';
import {
	applyLabPreferences,
	onLabPreferencesChange,
	readLabPreferences,
	resetLabPreferences,
	writeLabPreferences,
} from './preferences';

interface ActiveSoundEffectsLab {
	root: HTMLElement;
	dispose: () => void;
}

let activeSoundEffectsLab: ActiveSoundEffectsLab | undefined;

const messageForResult = (result: SoundEffectPlayResult, label: string) => {
	if (result === 'playing') return `${label}音效已由共用 channel 播放。`;
	if (result === 'sound-disabled') return '全站音效目前關閉；視覺與文字回饋仍然完成。';
	if (result === 'interaction-required') return '請先點擊或用鍵盤操作本頁，再測試 hover 音效。';
	if (result === 'throttled') return '這次聲音已由節流或節能規則略過，避免重疊與干擾。';
	return '音效播放失敗；按鈕的視覺與文字結果不受影響。';
};

export const initializeSoundEffectsLab = () => {
	const root = document.querySelector<HTMLElement>('[data-sound-effects-lab]');
	if (!root) return;
	if (activeSoundEffectsLab?.root === root && root.dataset.ready === 'true') return;
	activeSoundEffectsLab?.dispose();

	const channel = root.querySelector<HTMLAudioElement>('[data-sound-effect-channel]');
	const status = root.querySelector<HTMLElement>('[data-sound-effects-status]');
	const result = root.querySelector<HTMLElement>('[data-sound-effects-result]');
	const count = root.querySelector<HTMLElement>('[data-sound-effects-count]');
	const disableButton = root.querySelector<HTMLButtonElement>('[data-sound-disable]');
	const resetButton = root.querySelector<HTMLButtonElement>('[data-sound-reset]');
	const rapidButton = root.querySelector<HTMLButtonElement>('[data-sound-rapid]');
	const effectButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-sound-effect]'));
	if (!channel || !status || !result || !count || !disableButton || !resetButton || !rapidButton) return;

	const successSource = channel.dataset.successSrc;
	const cancelSource = channel.dataset.cancelSrc;
	const hoverSource = channel.dataset.hoverSrc;
	if (!successSource || !cancelSource || !hoverSource) return;

	let actionCount = 0;
	let rapidTimers: number[] = [];
	let disposed = false;
	const unregisterChannel = labAudioManager.registerEffectChannel(channel, {
		success: successSource,
		cancel: cancelSource,
		hover: hoverSource,
	});

	const setResult = (message: string, tone: 'success' | 'cancel' | 'neutral' = 'neutral') => {
		result.textContent = message;
		result.dataset.tone = tone;
	};
	const registerInteraction = () => labAudioManager.noteUserInteraction();
	const play = async (
		effect: LabSoundEffect,
		label: string,
		trigger: 'action' | 'hover' = 'action',
	) => {
		const playResult = await labAudioManager.playEffect(effect, trigger);
		status.textContent = messageForResult(playResult, label);
		return playResult;
	};
	const handleEffectClick = (event: MouseEvent) => {
		const button = event.currentTarget as HTMLButtonElement;
		const effect = button.dataset.soundEffect as LabSoundEffect | undefined;
		if (effect !== 'success' && effect !== 'cancel') return;
		registerInteraction();
		actionCount += 1;
		count.textContent = String(actionCount);
		const succeeded = effect === 'success';
		setResult(
			succeeded ? '操作完成：內容已保存。' : '操作取消：沒有變更任何內容。',
			succeeded ? 'success' : 'cancel',
		);
		void play(effect, succeeded ? '成功' : '取消');
	};
	const handleHover = (event: PointerEvent) => {
		if (event.pointerType === 'touch') return;
		void play('hover', 'Hover', 'hover');
	};
	const handleRapid = (event: MouseEvent) => {
		registerInteraction();
		rapidTimers.forEach(window.clearTimeout);
		rapidTimers = [];
		setResult('正在模擬五次快速觸發；聲音只會重啟，不會疊成五層。');
		for (let index = 0; index < 5; index += 1) {
			rapidTimers.push(window.setTimeout(() => {
				if (!disposed) void play('success', '快速觸發');
			}, index * 35));
		}
	};
	const handleSoundToggle = () => {
		registerInteraction();
		const preferences = readLabPreferences();
		const enabling = preferences.sound === 'off';
		const stored = writeLabPreferences({ ...preferences, sound: enabling ? 'on' : 'off' });
		applyLabPreferences(stored, 'control');
		setResult(enabling
			? '已重新開啟共用音效偏好；請按成功或取消按鈕測試。'
			: '已將共用音效偏好設為關閉；重新整理後仍保持靜音，也可由同一按鈕重新開啟。');
	};
	const handleReset = () => {
		const defaults = resetLabPreferences();
		applyLabPreferences(defaults, 'reset');
		labAudioManager.lockEffects();
		actionCount = 0;
		count.textContent = '0';
		setResult('所有 Lab 偏好與本頁計數已重設；安全預設仍是靜音。');
	};
	const handleVisibility = () => {
		if (document.hidden) labAudioManager.pauseEffects();
	};

	effectButtons.forEach((button) => {
		button.addEventListener('click', handleEffectClick);
		button.addEventListener('pointerenter', handleHover);
	});
	rapidButton.addEventListener('click', handleRapid);
	disableButton.addEventListener('click', handleSoundToggle);
	resetButton.addEventListener('click', handleReset);
	document.addEventListener('visibilitychange', handleVisibility);
	const stopPreferences = onLabPreferencesChange((detail) => {
		const enabled = detail.preferences.sound === 'on';
		const economy = detail.resolvedPerformance === 'economy';
		labAudioManager.setSoundEnabled(enabled);
		labAudioManager.setEconomyMode(economy);
		disableButton.textContent = enabled ? '關閉並記住音效設定' : '重新開啟音效';
		disableButton.dataset.soundState = enabled ? 'on' : 'off';
		status.textContent = enabled
			? economy
				? '音效已開啟；節能模式會略過 hover，只保留明確操作音效。'
				: '音效已開啟；點擊操作後即可播放，hover 會套用節流。'
			: '全站音效已關閉；所有按鈕仍保留完整視覺與文字回饋。';
	});

	root.dataset.ready = 'true';
	const controller: ActiveSoundEffectsLab = {
		root,
		dispose: () => {
			disposed = true;
			rapidTimers.forEach(window.clearTimeout);
			effectButtons.forEach((button) => {
				button.removeEventListener('click', handleEffectClick);
				button.removeEventListener('pointerenter', handleHover);
			});
			rapidButton.removeEventListener('click', handleRapid);
			disableButton.removeEventListener('click', handleSoundToggle);
			resetButton.removeEventListener('click', handleReset);
			document.removeEventListener('visibilitychange', handleVisibility);
			window.removeEventListener('pagehide', handlePageHide);
			stopPreferences();
			unregisterChannel();
			delete root.dataset.ready;
			if (activeSoundEffectsLab === controller) activeSoundEffectsLab = undefined;
		},
	};
	const handlePageHide = () => controller.dispose();
	window.addEventListener('pagehide', handlePageHide, { once: true });
	activeSoundEffectsLab = controller;
};
