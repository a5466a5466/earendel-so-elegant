import {
	getLabPreferencesSnapshot,
	onLabPreferencesChange,
	type LabPreferencesSnapshot,
} from './preferences';

interface ActiveVideoLab {
	root: HTMLElement;
	dispose: () => void;
}

let activeVideoLab: ActiveVideoLab | undefined;

const attachSources = (video: HTMLVideoElement, selector: string) => {
	let changed = false;
	video.querySelectorAll<HTMLSourceElement>(selector).forEach((source) => {
		if (!source.src && source.dataset.src) {
			source.src = source.dataset.src;
			changed = true;
		}
	});
	if (changed) video.load();
	return changed;
};

const detachSources = (video: HTMLVideoElement, selector: string) => {
	video.pause();
	video.querySelectorAll<HTMLSourceElement>(selector).forEach((source) => source.removeAttribute('src'));
	video.load();
};

export const initializeVideoLab = () => {
	const root = document.querySelector<HTMLElement>('[data-video-lab]');
	if (!root) return;
	if (activeVideoLab?.root === root && root.dataset.ready === 'true') return;
	activeVideoLab?.dispose();

	const contentVideo = root.querySelector<HTMLVideoElement>('[data-content-video]');
	const contentLoad = root.querySelector<HTMLButtonElement>('[data-content-load]');
	const contentStatus = root.querySelector<HTMLElement>('[data-content-status]');
	const contentFallback = root.querySelector<HTMLElement>('[data-content-fallback]');
	const backgroundVideo = root.querySelector<HTMLVideoElement>('[data-background-video]');
	const backgroundToggle = root.querySelector<HTMLButtonElement>('[data-background-toggle]');
	const backgroundStatus = root.querySelector<HTMLElement>('[data-background-status]');
	const failureVideo = root.querySelector<HTMLVideoElement>('[data-failure-video]');
	const failureLoad = root.querySelector<HTMLButtonElement>('[data-failure-load]');
	const failureMessage = root.querySelector<HTMLElement>('[data-failure-message]');
	if (!contentVideo || !contentLoad || !backgroundVideo || !backgroundToggle || !failureVideo || !failureLoad) return;

	const mobileQuery = matchMedia('(max-width: 700px)');
	let snapshot: LabPreferencesSnapshot = getLabPreferencesSnapshot();
	let contentSourcesAttached = false;
	let contentExplicitlyLoaded = false;
	let backgroundSourcesAttached = false;
	let backgroundManuallyPaused = false;

	const setContentLoaded = (explicit: boolean) => {
		contentExplicitlyLoaded ||= explicit;
		contentSourcesAttached = attachSources(contentVideo, '[data-video-source]') || contentSourcesAttached;
		contentVideo.preload = explicit ? 'auto' : 'metadata';
		contentLoad.hidden = true;
		if (contentStatus) contentStatus.textContent = explicit ? '影片來源已由使用者載入；請使用原生控制播放。' : '桌機標準模式已預載 metadata；播放仍需使用者操作。';
	};

	const renderContentPolicy = () => {
		if (contentExplicitlyLoaded) return;
		const defer = mobileQuery.matches || snapshot.resolvedPerformance === 'economy';
		if (defer) {
			if (contentSourcesAttached) {
				detachSources(contentVideo, '[data-video-source]');
				contentSourcesAttached = false;
			}
			contentVideo.preload = 'none';
			contentLoad.hidden = false;
			if (contentStatus) contentStatus.textContent = '手機或節能模式：尚未下載影片，點擊載入後才啟用來源。';
		} else {
			setContentLoaded(false);
		}
	};

	const backgroundAllowed = () =>
		!mobileQuery.matches &&
		snapshot.resolvedMotion === 'full' &&
		snapshot.resolvedPerformance === 'standard';

	const renderBackgroundPolicy = async () => {
		if (!backgroundAllowed()) {
			backgroundManuallyPaused = false;
			if (backgroundSourcesAttached) {
				detachSources(backgroundVideo, '[data-background-source]');
				backgroundSourcesAttached = false;
			}
			backgroundToggle.disabled = true;
			backgroundToggle.textContent = '播放背景影片';
			if (backgroundStatus) {
				backgroundStatus.textContent = mobileQuery.matches
					? '手機模式：只顯示 poster，不下載背景影片。'
					: snapshot.resolvedMotion === 'reduce'
						? '減少動態：只顯示 poster。'
						: '節能模式：只顯示 poster，不下載背景影片。';
			}
			return;
		}

		backgroundSourcesAttached = attachSources(backgroundVideo, '[data-background-source]') || backgroundSourcesAttached;
		backgroundToggle.disabled = false;
		if (backgroundManuallyPaused) {
			backgroundToggle.textContent = '播放背景影片';
			if (backgroundStatus) backgroundStatus.textContent = '背景影片已由使用者暫停。';
			return;
		}
		try {
			await backgroundVideo.play();
			backgroundToggle.textContent = '暫停背景影片';
			if (backgroundStatus) backgroundStatus.textContent = '桌機標準模式：背景影片靜音播放中。';
		} catch {
			backgroundToggle.textContent = '播放背景影片';
			if (backgroundStatus) backgroundStatus.textContent = '瀏覽器阻止自動播放；可手動啟動靜音背景影片。';
		}
	};

	const handleContentLoad = () => setContentLoaded(true);
	const handleContentError = () => {
		contentFallback?.removeAttribute('hidden');
		if (contentStatus) contentStatus.textContent = '內容影片載入失敗，請使用 MP4 替代連結。';
	};
	const handleBackgroundToggle = async () => {
		if (backgroundVideo.paused) {
			backgroundManuallyPaused = false;
			await renderBackgroundPolicy();
		} else {
			backgroundManuallyPaused = true;
			backgroundVideo.pause();
			backgroundToggle.textContent = '播放背景影片';
			if (backgroundStatus) backgroundStatus.textContent = '背景影片已由使用者暫停。';
		}
	};
	const handleFailureLoad = () => {
		attachSources(failureVideo, 'source');
		failureLoad.disabled = true;
		if (failureMessage) failureMessage.innerHTML = '<strong>正在載入失效來源</strong><p>瀏覽器確認沒有可播放格式後，這裡會顯示降級結果。</p>';
	};
	const handleFailureError = () => {
		if (failureMessage) failureMessage.innerHTML = '<strong>影片無法載入，降級成功</strong><p>Poster、固定比例、文字說明與控制區仍然存在。</p>';
		failureLoad.textContent = '失敗狀態已確認';
	};
	const handlePolicyChange = () => {
		renderContentPolicy();
		void renderBackgroundPolicy();
	};

	contentLoad.addEventListener('click', handleContentLoad);
	contentVideo.addEventListener('error', handleContentError);
	backgroundToggle.addEventListener('click', handleBackgroundToggle);
	failureLoad.addEventListener('click', handleFailureLoad);
	failureVideo.addEventListener('error', handleFailureError);
	mobileQuery.addEventListener('change', handlePolicyChange);
	const stopPreferences = onLabPreferencesChange((detail) => {
		snapshot = detail;
		handlePolicyChange();
	}, false);

	root.dataset.ready = 'true';
	renderContentPolicy();
	void renderBackgroundPolicy();

	const controller: ActiveVideoLab = {
		root,
		dispose: () => {
			contentVideo.pause();
			backgroundVideo.pause();
			failureVideo.pause();
			contentLoad.removeEventListener('click', handleContentLoad);
			contentVideo.removeEventListener('error', handleContentError);
			backgroundToggle.removeEventListener('click', handleBackgroundToggle);
			failureLoad.removeEventListener('click', handleFailureLoad);
			failureVideo.removeEventListener('error', handleFailureError);
			mobileQuery.removeEventListener('change', handlePolicyChange);
			stopPreferences();
			window.removeEventListener('pagehide', handlePageHide);
			delete root.dataset.ready;
			if (activeVideoLab === controller) activeVideoLab = undefined;
		},
	};
	const handlePageHide = () => controller.dispose();
	window.addEventListener('pagehide', handlePageHide, { once: true });
	activeVideoLab = controller;
};
