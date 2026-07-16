interface LightboxItem {
	src: string;
	width: number;
	height: number;
	alt: string;
	caption: string;
	creditName: string;
	creditUrl: string | null;
	license: string;
}

interface ActiveLightbox {
	root: HTMLElement;
	dispose: () => void;
}

let activeLightbox: ActiveLightbox | undefined;

export const initializeLightbox = () => {
	const root = document.querySelector<HTMLElement>('[data-lightbox-root]');
	if (!root) return;
	if (activeLightbox?.root === root && root.dataset.ready === 'true') return;
	activeLightbox?.dispose();

	const dialog = root.querySelector<HTMLDialogElement>('[data-lightbox-dialog]');
	const dataNode = root.querySelector<HTMLScriptElement>('[data-lightbox-data]');
	if (!dialog || !dataNode || typeof dialog.showModal !== 'function') return;

	let items: LightboxItem[] = [];
	try {
		items = JSON.parse(dataNode.textContent ?? '[]') as LightboxItem[];
	} catch {
		return;
	}
	if (!items.length) return;

	const triggers = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-lightbox-trigger]'));
	const failureTrigger = root.querySelector<HTMLAnchorElement>('[data-lightbox-failure-trigger]');
	const panel = dialog.querySelector<HTMLElement>('[data-lightbox-panel]');
	const stage = dialog.querySelector<HTMLElement>('[data-lightbox-stage]');
	const image = dialog.querySelector<HTMLImageElement>('[data-lightbox-image]');
	const fallback = dialog.querySelector<HTMLElement>('[data-lightbox-fallback]');
	const title = dialog.querySelector<HTMLElement>('[data-lightbox-title]');
	const caption = dialog.querySelector<HTMLElement>('[data-lightbox-caption]');
	const credit = dialog.querySelector<HTMLAnchorElement>('[data-lightbox-credit]');
	const license = dialog.querySelector<HTMLElement>('[data-lightbox-license]');
	const original = dialog.querySelector<HTMLAnchorElement>('[data-lightbox-original]');
	const announcement = dialog.querySelector<HTMLElement>('[data-lightbox-announcement]');
	const closeButton = dialog.querySelector<HTMLButtonElement>('[data-lightbox-close]');
	const previousButton = dialog.querySelector<HTMLButtonElement>('[data-lightbox-previous]');
	const nextButton = dialog.querySelector<HTMLButtonElement>('[data-lightbox-next]');
	if (!panel || !stage || !image || !fallback || !closeButton || !previousButton || !nextButton) return;

	let currentIndex = 0;
	let returnTarget: HTMLElement | null = null;
	let touchStartX: number | null = null;
	let touchStartY: number | null = null;

	const render = (index: number, announce = true) => {
		currentIndex = Math.max(0, Math.min(index, items.length - 1));
		const item = items[currentIndex];
		image.hidden = false;
		fallback.hidden = true;
		image.src = item.src;
		image.alt = item.alt;
		image.width = item.width;
		image.height = item.height;
		if (title) title.textContent = `圖片 ${currentIndex + 1} / ${items.length}`;
		if (caption) caption.textContent = item.caption;
		if (credit) {
			credit.textContent = item.creditName;
			if (item.creditUrl) {
				credit.href = item.creditUrl;
				credit.rel = 'noreferrer';
			} else {
				credit.removeAttribute('href');
				credit.removeAttribute('rel');
			}
		}
		if (license) license.textContent = item.license;
		if (original) original.href = item.src;
		previousButton.disabled = currentIndex === 0;
		nextButton.disabled = currentIndex === items.length - 1;
		if (announce && announcement) announcement.textContent = `目前是第 ${currentIndex + 1} 張，共 ${items.length} 張。${item.alt}`;
	};
	const renderFailure = () => {
		currentIndex = items.length - 1;
		const missingSrc = failureTrigger?.href ?? '/lab-assets/events/__missing-lightbox-image.webp';
		image.hidden = false;
		fallback.hidden = true;
		image.src = missingSrc;
		image.alt = '刻意載入失敗的 Lightbox 大圖測試';
		image.width = 1600;
		image.height = 1000;
		if (title) title.textContent = '大圖失敗降級測試';
		if (caption) caption.textContent = '大圖不存在，但燈箱結構、圖片說明、替代文字與關閉控制仍保留。';
		if (credit) {
			credit.textContent = 'Runtime failure fixture';
			credit.removeAttribute('href');
			credit.removeAttribute('rel');
		}
		if (license) license.textContent = '僅供 Lab 測試';
		if (original) original.href = missingSrc;
		previousButton.disabled = true;
		nextButton.disabled = true;
		if (announcement) announcement.textContent = '大圖載入失敗測試已開啟。';
	};

	const close = () => {
		if (dialog.open) dialog.close();
	};
	const goPrevious = () => render(currentIndex - 1);
	const goNext = () => render(currentIndex + 1);
	const handleImageError = () => {
		image.hidden = true;
		fallback.hidden = false;
	};
	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			goPrevious();
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			goNext();
		} else if (event.key === 'Home') {
			event.preventDefault();
			render(0);
		} else if (event.key === 'End') {
			event.preventDefault();
			render(items.length - 1);
		}
	};
	const handleBackdropClick = (event: MouseEvent) => {
		if (event.target === dialog) close();
	};
	const handleClose = () => {
		delete document.body.dataset.lightboxOpen;
		const target = returnTarget;
		returnTarget = null;
		if (target?.isConnected) target.focus();
	};
	const handleTouchStart = (event: TouchEvent) => {
		const touch = event.changedTouches[0];
		touchStartX = touch?.clientX ?? null;
		touchStartY = touch?.clientY ?? null;
	};
	const handleTouchEnd = (event: TouchEvent) => {
		if (touchStartX === null || touchStartY === null) return;
		const touch = event.changedTouches[0];
		if (!touch) return;
		const deltaX = touch.clientX - touchStartX;
		const deltaY = touch.clientY - touchStartY;
		touchStartX = null;
		touchStartY = null;
		if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
		if (deltaX > 0) goPrevious();
		else goNext();
	};

	const triggerHandlers = triggers.map((trigger, index) => {
		const handler = (event: MouseEvent) => {
			event.preventDefault();
			returnTarget = trigger;
			render(index, false);
			dialog.showModal();
			document.body.dataset.lightboxOpen = 'true';
			closeButton.focus();
		};
		trigger.addEventListener('click', handler);
		return { trigger, handler };
	});
	const handleFailureTrigger = (event: MouseEvent) => {
		event.preventDefault();
		if (!failureTrigger) return;
		returnTarget = failureTrigger;
		renderFailure();
		dialog.showModal();
		document.body.dataset.lightboxOpen = 'true';
		closeButton.focus();
	};

	failureTrigger?.addEventListener('click', handleFailureTrigger);
	closeButton.addEventListener('click', close);
	previousButton.addEventListener('click', goPrevious);
	nextButton.addEventListener('click', goNext);
	dialog.addEventListener('click', handleBackdropClick);
	dialog.addEventListener('close', handleClose);
	dialog.addEventListener('keydown', handleKeydown);
	image.addEventListener('error', handleImageError);
	stage.addEventListener('touchstart', handleTouchStart, { passive: true });
	stage.addEventListener('touchend', handleTouchEnd, { passive: true });
	root.dataset.ready = 'true';

	const controller: ActiveLightbox = {
		root,
		dispose: () => {
			triggerHandlers.forEach(({ trigger, handler }) => trigger.removeEventListener('click', handler));
			failureTrigger?.removeEventListener('click', handleFailureTrigger);
			closeButton.removeEventListener('click', close);
			previousButton.removeEventListener('click', goPrevious);
			nextButton.removeEventListener('click', goNext);
			dialog.removeEventListener('click', handleBackdropClick);
			dialog.removeEventListener('close', handleClose);
			dialog.removeEventListener('keydown', handleKeydown);
			image.removeEventListener('error', handleImageError);
			stage.removeEventListener('touchstart', handleTouchStart);
			stage.removeEventListener('touchend', handleTouchEnd);
			window.removeEventListener('pagehide', handlePageHide);
			if (dialog.open) dialog.close();
			delete root.dataset.ready;
			delete document.body.dataset.lightboxOpen;
			if (activeLightbox === controller) activeLightbox = undefined;
		},
	};
	const handlePageHide = () => controller.dispose();
	window.addEventListener('pagehide', handlePageHide, { once: true });
	activeLightbox = controller;
};
