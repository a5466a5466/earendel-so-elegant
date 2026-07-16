import { labAudioManager } from './audio-manager';
import { onLabPreferencesChange } from './preferences';

interface ActiveAudioLab {
	root: HTMLElement;
	dispose: () => void;
}

interface PlayerController {
	audio: HTMLAudioElement;
	status: HTMLElement;
	dispose: () => void;
}

let activeAudioLab: ActiveAudioLab | undefined;

const formatTime = (seconds: number) => {
	if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
	const wholeSeconds = Math.floor(seconds);
	return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, '0')}`;
};

const initializePlayer = (element: HTMLElement): PlayerController | undefined => {
	const audio = element.querySelector<HTMLAudioElement>('[data-primary-audio]');
	const toggle = element.querySelector<HTMLButtonElement>('[data-audio-toggle]');
	const progress = element.querySelector<HTMLInputElement>('[data-audio-progress]');
	const volume = element.querySelector<HTMLInputElement>('[data-audio-volume]');
	const elapsed = element.querySelector<HTMLElement>('[data-audio-elapsed]');
	const duration = element.querySelector<HTMLElement>('[data-audio-duration]');
	const status = element.querySelector<HTMLElement>('[data-audio-status]');
	if (!audio || !toggle || !progress || !volume || !elapsed || !duration || !status) return;

	audio.volume = Number(volume.value);
	const unregister = labAudioManager.registerPrimary(audio);

	const renderTime = () => {
		const safeDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
		progress.max = String(safeDuration || 1);
		progress.value = String(Math.min(audio.currentTime, safeDuration || 1));
		elapsed.textContent = formatTime(audio.currentTime);
		duration.textContent = formatTime(safeDuration);
	};
	const renderPlayback = () => {
		const playing = !audio.paused && !audio.ended;
		toggle.textContent = playing ? '暫停' : audio.ended ? '重新播放' : '播放';
		toggle.setAttribute('aria-pressed', String(playing));
		element.dataset.playing = String(playing);
	};
	const handleToggle = async () => {
		if (!audio.paused && !audio.ended) {
			labAudioManager.pause(audio);
			status.textContent = '已由使用者暫停；再次播放會從目前位置繼續。';
			return;
		}
		if (audio.ended) audio.currentTime = 0;
		const result = await labAudioManager.play(audio);
		if (result === 'sound-disabled') {
			status.textContent = '全站音效目前關閉；請先在頁首偏好控制將音效改為開啟。';
		} else if (result === 'failed') {
			status.textContent = '瀏覽器未能開始播放；可使用下方 WAV 原始檔連結。';
		} else {
			status.textContent = '播放中；若另一首開始播放，本曲會自動暫停。';
		}
	};
	const handleSeek = () => {
		audio.currentTime = Number(progress.value);
		renderTime();
		status.textContent = `播放位置已移至 ${formatTime(audio.currentTime)}。`;
	};
	const handleVolume = () => {
		audio.volume = Number(volume.value);
		status.textContent = `本曲音量調整為 ${Math.round(audio.volume * 100)}%。`;
	};
	const handlePlay = () => renderPlayback();
	const handlePause = () => renderPlayback();
	const handleEnded = () => {
		labAudioManager.pause(audio);
		renderPlayback();
		status.textContent = '曲目播放完畢。';
	};
	const handleError = () => {
		labAudioManager.pause(audio);
		renderPlayback();
		status.textContent = '音訊載入失敗；曲目資訊與原始檔連結仍然保留。';
	};

	toggle.addEventListener('click', handleToggle);
	progress.addEventListener('input', handleSeek);
	volume.addEventListener('input', handleVolume);
	audio.addEventListener('loadedmetadata', renderTime);
	audio.addEventListener('durationchange', renderTime);
	audio.addEventListener('timeupdate', renderTime);
	audio.addEventListener('play', handlePlay);
	audio.addEventListener('pause', handlePause);
	audio.addEventListener('ended', handleEnded);
	audio.addEventListener('error', handleError);
	renderTime();
	renderPlayback();

	return {
		audio,
		status,
		dispose: () => {
			toggle.removeEventListener('click', handleToggle);
			progress.removeEventListener('input', handleSeek);
			volume.removeEventListener('input', handleVolume);
			audio.removeEventListener('loadedmetadata', renderTime);
			audio.removeEventListener('durationchange', renderTime);
			audio.removeEventListener('timeupdate', renderTime);
			audio.removeEventListener('play', handlePlay);
			audio.removeEventListener('pause', handlePause);
			audio.removeEventListener('ended', handleEnded);
			audio.removeEventListener('error', handleError);
			unregister();
		},
	};
};

export const initializeAudioLab = () => {
	const root = document.querySelector<HTMLElement>('[data-audio-lab]');
	if (!root) return;
	if (activeAudioLab?.root === root && root.dataset.ready === 'true') return;
	activeAudioLab?.dispose();

	const playerSection = root.querySelector<HTMLElement>('[data-audio-player-section]');
	const pageStatus = root.querySelector<HTMLElement>('[data-audio-page-status]');
	const failureAudio = root.querySelector<HTMLAudioElement>('[data-failure-audio]');
	const failureButton = root.querySelector<HTMLButtonElement>('[data-failure-audio-load]');
	const failureStatus = root.querySelector<HTMLElement>('[data-failure-audio-status]');
	const players = Array.from(root.querySelectorAll<HTMLElement>('[data-audio-player]'))
		.map(initializePlayer)
		.filter((player): player is PlayerController => Boolean(player));
	if (!playerSection || !pageStatus || !failureAudio || !failureButton || !failureStatus || players.length === 0) return;

	const handleFailureLoad = () => {
		const source = failureAudio.querySelector<HTMLSourceElement>('source[data-src]');
		if (source?.dataset.src) source.src = source.dataset.src;
		failureButton.disabled = true;
		failureStatus.textContent = '正在要求不存在的音訊來源。';
		failureAudio.load();
	};
	const handleFailureError = () => {
		failureStatus.innerHTML = '<strong>音訊載入失敗，降級成功。</strong><span>控制卡、曲目說明與替代文字仍完整保留。</span>';
		failureButton.textContent = '失敗狀態已確認';
	};
	const handleVisibility = () => {
		if (document.hidden) {
			labAudioManager.pauseAll();
			pageStatus.textContent = '頁面進入背景，所有主要音訊已暫停；返回後不會自動續播。';
		}
	};

	failureButton.addEventListener('click', handleFailureLoad);
	failureAudio.addEventListener('error', handleFailureError);
	document.addEventListener('visibilitychange', handleVisibility);
	const stopPreferences = onLabPreferencesChange((detail) => {
		const enabled = detail.preferences.sound === 'on';
		labAudioManager.setSoundEnabled(enabled);
		pageStatus.textContent = enabled
			? '全站音效已開啟；仍需按下播放才會出聲。'
			: '全站音效已關閉；主要音訊已靜音並暫停。';
		if (!enabled) players.forEach(({ status }) => {
			status.textContent = '全站音效關閉中；播放不會自動啟動。';
		});
	});

	const observer = new IntersectionObserver((entries) => {
		if (entries.some((entry) => !entry.isIntersecting) && labAudioManager.getActiveAudio()) {
			labAudioManager.pauseAll();
			pageStatus.textContent = '播放器區離開可視範圍，主要音訊已暫停。';
		}
	}, { threshold: 0.05 });
	observer.observe(playerSection);

	root.dataset.ready = 'true';
	const controller: ActiveAudioLab = {
		root,
		dispose: () => {
			labAudioManager.pauseAll();
			players.forEach((player) => player.dispose());
			failureButton.removeEventListener('click', handleFailureLoad);
			failureAudio.removeEventListener('error', handleFailureError);
			document.removeEventListener('visibilitychange', handleVisibility);
			window.removeEventListener('pagehide', handlePageHide);
			observer.disconnect();
			stopPreferences();
			delete root.dataset.ready;
			if (activeAudioLab === controller) activeAudioLab = undefined;
		},
	};
	const handlePageHide = () => controller.dispose();
	window.addEventListener('pagehide', handlePageHide, { once: true });
	activeAudioLab = controller;
};
