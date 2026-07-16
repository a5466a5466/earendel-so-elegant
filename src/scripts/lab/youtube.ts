interface ActiveYouTubeLab {
	root: HTMLElement;
	dispose: () => void;
}

interface YouTubeCardController {
	card: HTMLElement;
	button: HTMLButtonElement;
	reset: HTMLButtonElement | null;
	slot: HTMLElement;
	status: HTMLElement | null;
	originalMarkup: string;
	load: () => void;
	close: (announce?: boolean) => void;
	dispose: () => void;
}

let activeYouTubeLab: ActiveYouTubeLab | undefined;

export const initializeYouTubeFacades = () => {
	const root = document.querySelector<HTMLElement>('[data-youtube-lab]');
	if (!root) return;
	if (activeYouTubeLab?.root === root && root.dataset.ready === 'true') return;
	activeYouTubeLab?.dispose();

	let activeCard: YouTubeCardController | undefined;
	const cards: YouTubeCardController[] = [];

	root.querySelectorAll<HTMLElement>('[data-youtube-card]').forEach((card) => {
		const button = card.querySelector<HTMLButtonElement>('[data-youtube-load]');
		const reset = card.querySelector<HTMLButtonElement>('[data-youtube-reset]');
		const slot = card.querySelector<HTMLElement>('[data-youtube-slot]');
		const status = card.querySelector<HTMLElement>('[data-youtube-status]');
		const videoId = card.dataset.videoId;
		if (!button || !slot || !videoId) return;

		const originalMarkup = slot.innerHTML;
		let loadTimeout = 0;
		let controller: YouTubeCardController;

		const close = (announce = true) => {
			window.clearTimeout(loadTimeout);
			slot.innerHTML = originalMarkup;
			const restoredButton = slot.querySelector<HTMLButtonElement>('[data-youtube-load]');
			if (restoredButton) {
				restoredButton.addEventListener('click', load);
				restoredButton.setAttribute('aria-expanded', 'false');
				controller.button = restoredButton;
			}
			reset?.setAttribute('hidden', '');
			card.removeAttribute('data-player-active');
			if (announce && status) status.textContent = '播放器已關閉，第三方 iframe 已從頁面移除。';
			if (activeCard === controller) activeCard = undefined;
		};

		const load = () => {
			if (activeCard && activeCard !== controller) activeCard.close(true);
			const mode = card.dataset.videoMode;
			if (mode === 'blocked') {
				slot.innerHTML = '<div class="youtube-blocked-state" role="status"><strong>此影片無法在站內播放</strong><p>可能原因包含禁止嵌入、年齡限制、私人影片或內容已刪除。請使用下方 YouTube 外部連結。</p></div>';
				reset?.removeAttribute('hidden');
				card.dataset.playerActive = 'true';
				if (status) status.textContent = '失效降級已顯示；沒有建立第三方 iframe。';
				activeCard = controller;
				return;
			}

			const start = Number.parseInt(card.dataset.videoStart ?? '0', 10) || 0;
			const params = new URLSearchParams({
				autoplay: '1',
				playsinline: '1',
				rel: '0',
				cc_load_policy: '1',
				origin: window.location.origin,
			});
			if (start > 0) params.set('start', String(start));
			const iframe = document.createElement('iframe');
			iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params}`;
			iframe.title = `YouTube 播放器：${card.querySelector('h3')?.textContent ?? '影片'}`;
			iframe.width = '960';
			iframe.height = '540';
			iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
			iframe.referrerPolicy = 'strict-origin-when-cross-origin';
			iframe.allowFullscreen = true;
			iframe.addEventListener('load', () => {
				window.clearTimeout(loadTimeout);
				if (status) status.textContent = 'YouTube 播放器文件已載入；若影片不可用，請改用外部觀看連結。';
			}, { once: true });
			slot.replaceChildren(iframe);
			reset?.removeAttribute('hidden');
			card.dataset.playerActive = 'true';
			if (status) status.textContent = '正在連線 YouTube 隱私增強播放器。';
			loadTimeout = window.setTimeout(() => {
				if (status) status.textContent = '播放器回應時間較長；可關閉後重試，或使用外部觀看連結。';
			}, 10000);
			activeCard = controller;
		};

		const handleReset = () => {
			close(true);
			controller.button.focus();
		};
		button.addEventListener('click', load);
		reset?.addEventListener('click', handleReset);
		controller = {
			card,
			button,
			reset,
			slot,
			status,
			originalMarkup,
			load,
			close,
			dispose: () => {
				window.clearTimeout(loadTimeout);
				controller.button.removeEventListener('click', load);
				reset?.removeEventListener('click', handleReset);
				slot.innerHTML = originalMarkup;
				reset?.setAttribute('hidden', '');
				card.removeAttribute('data-player-active');
			},
		};
		cards.push(controller);
	});

	root.dataset.ready = 'true';
	const controller: ActiveYouTubeLab = {
		root,
		dispose: () => {
			cards.forEach((card) => card.dispose());
			window.removeEventListener('pagehide', handlePageHide);
			delete root.dataset.ready;
			activeCard = undefined;
			if (activeYouTubeLab === controller) activeYouTubeLab = undefined;
		},
	};
	const handlePageHide = () => controller.dispose();
	window.addEventListener('pagehide', handlePageHide, { once: true });
	activeYouTubeLab = controller;
};
