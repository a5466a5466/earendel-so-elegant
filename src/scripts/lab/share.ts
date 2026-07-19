type ShareTestMode = 'auto' | 'unsupported' | 'cancelled' | 'failed';

interface ActiveShareLab {
	root: HTMLElement;
	dispose: () => void;
}

let activeShareLab: ActiveShareLab | undefined;

const isShareTestMode = (value: string): value is ShareTestMode =>
	value === 'auto' || value === 'unsupported' || value === 'cancelled' || value === 'failed';

export const initializeShareLab = () => {
	const root = document.querySelector<HTMLElement>('[data-share-lab]');
	if (!root) return;
	if (activeShareLab?.root === root && root.dataset.ready === 'true') return;
	activeShareLab?.dispose();

	const shareButton = root.querySelector<HTMLButtonElement>('[data-share-system]');
	const copyButton = root.querySelector<HTMLButtonElement>('[data-share-copy]');
	const modeSelect = root.querySelector<HTMLSelectElement>('[data-share-test-mode]');
	const status = root.querySelector<HTMLElement>('[data-share-status]');
	const support = root.querySelector<HTMLElement>('[data-share-support]');
	const urlInput = root.querySelector<HTMLInputElement>('[data-share-url]');
	const specialUrlInput = root.querySelector<HTMLInputElement>('[data-share-special-url]');
	const directLink = root.querySelector<HTMLAnchorElement>('[data-share-direct-link]');
	if (!shareButton || !copyButton || !modeSelect || !status || !support || !urlInput || !specialUrlInput || !directLink) return;

	const sharePath = root.dataset.sharePath;
	const shareTitle = root.dataset.shareTitle;
	const shareText = root.dataset.shareText;
	if (!sharePath || !shareTitle || !shareText) return;

	const shareUrl = new URL(sharePath, window.location.origin);
	const specialUrl = new URL(shareUrl);
	specialUrl.searchParams.set('from', '星光分享');
	specialUrl.searchParams.set('note', 'A&B / 月光? #應援');
	urlInput.value = shareUrl.href;
	specialUrlInput.value = specialUrl.href;
	directLink.href = specialUrl.href;

	const announce = (message: string, tone: 'success' | 'warning' | 'error' | 'neutral' = 'neutral') => {
		status.textContent = message;
		status.dataset.tone = tone;
	};
	const revealManualFallback = (input = urlInput) => {
		input.focus();
		input.select();
		announce('無法自動複製；網址已選取，請按 Ctrl+C 或使用系統複製指令。', 'warning');
	};
	const copyUrl = async (value = shareUrl.href, fallbackInput = urlInput) => {
		try {
			if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
			await navigator.clipboard.writeText(value);
			announce('活動連結已複製，可以貼到訊息或社群貼文。', 'success');
			return true;
		} catch {
			revealManualFallback(fallbackInput);
			return false;
		}
	};
	const currentMode = (): ShareTestMode => isShareTestMode(modeSelect.value) ? modeSelect.value : 'auto';
	const handleShare = async () => {
		const mode = currentMode();
		if (mode === 'cancelled') {
			announce('使用者已取消系統分享；沒有送出任何內容，也不會自動改成複製。', 'warning');
			return;
		}
		if (mode === 'failed') {
			announce('系統分享發生錯誤；你仍可使用下方複製或手動選取網址。', 'error');
			return;
		}
		if (mode === 'unsupported' || typeof navigator.share !== 'function') {
			announce('此環境不支援系統分享，正在改用複製連結。', 'neutral');
			await copyUrl();
			return;
		}

		const data = { title: shareTitle, text: shareText, url: shareUrl.href };
		if (typeof navigator.canShare === 'function' && !navigator.canShare(data)) {
			announce('此環境無法分享這組內容，正在改用複製連結。', 'warning');
			await copyUrl();
			return;
		}
		try {
			await navigator.share(data);
			announce('系統分享已完成。', 'success');
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') {
				announce('使用者已取消系統分享；沒有送出任何內容。', 'warning');
			} else {
				announce('系統分享失敗；請改用複製連結或手動選取網址。', 'error');
			}
		}
	};
	const handleCopy = () => void copyUrl();
	const handleSpecialCopy = () => void copyUrl(specialUrl.href, specialUrlInput);
	const handleInputFocus = (event: FocusEvent) => (event.currentTarget as HTMLInputElement).select();
	const handleModeChange = () => {
		const labels: Record<ShareTestMode, string> = {
			auto: '目前使用真實瀏覽器能力。',
			unsupported: '下一次系統分享會模擬不支援並轉為複製。',
			cancelled: '下一次系統分享會模擬使用者取消。',
			failed: '下一次系統分享會模擬未知錯誤。',
		};
		announce(labels[currentMode()]);
	};

	const specialCopyButton = root.querySelector<HTMLButtonElement>('[data-share-special-copy]');
	shareButton.addEventListener('click', handleShare);
	copyButton.addEventListener('click', handleCopy);
	specialCopyButton?.addEventListener('click', handleSpecialCopy);
	modeSelect.addEventListener('change', handleModeChange);
	urlInput.addEventListener('focus', handleInputFocus);
	specialUrlInput.addEventListener('focus', handleInputFocus);
	support.textContent = typeof navigator.share === 'function'
		? '此瀏覽器提供 Web Share API；實際可分享目標由作業系統決定。'
		: '此瀏覽器沒有 Web Share API；主要按鈕會直接降級為複製連結。';

	root.dataset.ready = 'true';
	const controller: ActiveShareLab = {
		root,
		dispose: () => {
			shareButton.removeEventListener('click', handleShare);
			copyButton.removeEventListener('click', handleCopy);
			specialCopyButton?.removeEventListener('click', handleSpecialCopy);
			modeSelect.removeEventListener('change', handleModeChange);
			urlInput.removeEventListener('focus', handleInputFocus);
			specialUrlInput.removeEventListener('focus', handleInputFocus);
			window.removeEventListener('pagehide', handlePageHide);
			delete root.dataset.ready;
			if (activeShareLab === controller) activeShareLab = undefined;
		},
	};
	const handlePageHide = () => controller.dispose();
	window.addEventListener('pagehide', handlePageHide, { once: true });
	activeShareLab = controller;
};
