import {
	getLabPreferencesSnapshot,
	onLabPreferencesChange,
	type LabPreferencesSnapshot,
} from './preferences';

interface ActiveScrollLab {
	root: HTMLElement;
	dispose: () => void;
}

let activeScrollLab: ActiveScrollLab | undefined;

export const initializeScrollReveal = () => {
	const root = document.querySelector<HTMLElement>('[data-scroll-lab]');
	if (!root) return;
	if (activeScrollLab?.root === root && root.dataset.ready === 'true') return;
	activeScrollLab?.dispose();

	const revealItems = Array.from(root.querySelectorAll<HTMLElement>('[data-scroll-reveal]'));
	const storySteps = Array.from(root.querySelectorAll<HTMLElement>('[data-story-step]'));
	const replayButton = root.querySelector<HTMLButtonElement>('[data-scroll-replay]');
	const status = root.querySelector<HTMLElement>('[data-scroll-status]');
	const timelineStatus = root.querySelector<HTMLElement>('[data-scroll-timeline-status]');
	let snapshot = getLabPreferencesSnapshot();
	let revealObserver: IntersectionObserver | undefined;
	let storyObserver: IntersectionObserver | undefined;
	let replayFrame = 0;

	const updateStatus = () => {
		if (!status) return;
		const revealed = revealItems.filter((item) => item.classList.contains('is-revealed')).length;
		const motion = snapshot.resolvedMotion === 'reduce' ? '減少動態' : '完整動態';
		const performance = snapshot.resolvedPerformance === 'economy' ? '節能' : '標準';
		status.textContent = `${motion}・${performance}・已顯示 ${revealed}/${revealItems.length}`;
	};

	const reveal = (item: HTMLElement) => {
		item.classList.add('is-revealed');
		updateStatus();
	};

	const revealAll = () => {
		revealItems.forEach(reveal);
	};

	const setupRevealObserver = () => {
		revealObserver?.disconnect();
		revealObserver = undefined;

		if (snapshot.resolvedMotion === 'reduce' || !('IntersectionObserver' in window)) {
			revealAll();
			return;
		}

		const initialBoundary = window.innerHeight * 0.92;
		revealItems.forEach((item) => {
			if (item.getBoundingClientRect().top <= initialBoundary) reveal(item);
		});

		revealObserver = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				reveal(entry.target as HTMLElement);
				observer.unobserve(entry.target);
			});
		}, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

		revealItems.forEach((item) => {
			if (!item.classList.contains('is-revealed')) revealObserver?.observe(item);
		});
		updateStatus();
	};

	const setupStoryObserver = () => {
		if (!storySteps.length || !('IntersectionObserver' in window)) return;
		storyObserver = new IntersectionObserver((entries) => {
			const visible = entries
				.filter((entry) => entry.isIntersecting)
				.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
			if (visible) root.dataset.storyStep = (visible.target as HTMLElement).dataset.storyStep ?? '1';
		}, { rootMargin: '-28% 0px -42% 0px', threshold: [0, 0.25, 0.6] });
		storySteps.forEach((step) => storyObserver?.observe(step));
	};

	const handleReplay = () => {
		cancelAnimationFrame(replayFrame);
		revealObserver?.disconnect();
		revealItems.forEach((item) => item.classList.remove('is-revealed'));
		updateStatus();
		replayFrame = requestAnimationFrame(() => {
			replayFrame = requestAnimationFrame(setupRevealObserver);
		});
	};

	const stopPreferences = onLabPreferencesChange((detail) => {
		snapshot = detail;
		setupRevealObserver();
	});

	if (timelineStatus) {
		const supportsTimeline = CSS.supports('animation-timeline: scroll()');
		timelineStatus.textContent = supportsTimeline ? '瀏覽器支援原生 scroll timeline' : '不支援時維持靜態裝飾';
	}

	replayButton?.addEventListener('click', handleReplay);
	root.dataset.storyStep = '1';
	root.dataset.ready = 'true';
	setupStoryObserver();
	setupRevealObserver();

	const controller: ActiveScrollLab = {
		root,
		dispose: () => {
			cancelAnimationFrame(replayFrame);
			revealObserver?.disconnect();
			storyObserver?.disconnect();
			stopPreferences();
			replayButton?.removeEventListener('click', handleReplay);
			window.removeEventListener('pagehide', handlePageHide);
			delete root.dataset.ready;
			if (activeScrollLab === controller) activeScrollLab = undefined;
		},
	};
	const handlePageHide = () => controller.dispose();
	window.addEventListener('pagehide', handlePageHide, { once: true });
	activeScrollLab = controller;
};
