import {
	getLabPreferencesSnapshot,
	onLabPreferencesChange,
	type LabPreferencesSnapshot,
} from './preferences';

interface ActiveCarousel {
	root: HTMLElement;
	dispose: () => void;
}

let activeCarousel: ActiveCarousel | undefined;

export const initializeCarousel = () => {
	const root = document.querySelector<HTMLElement>('[data-carousel]');
	if (!root) return;
	if (activeCarousel?.root === root && root.dataset.ready === 'true') return;
	activeCarousel?.dispose();

	const viewport = root.querySelector<HTMLElement>('[data-carousel-viewport]');
	const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-carousel-slide]'));
	const dots = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-carousel-dot]'));
	const previousButton = root.querySelector<HTMLButtonElement>('[data-carousel-previous]');
	const nextButton = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
	const positionOutput = root.querySelector<HTMLElement>('[data-carousel-position]');
	const announcement = root.querySelector<HTMLElement>('[data-carousel-announcement]');
	if (!viewport || !slides.length || !previousButton || !nextButton) return;

	let currentIndex = 0;
	let scrollFrame = 0;
	let resizeFrame = 0;
	let snapshot: LabPreferencesSnapshot = getLabPreferencesSnapshot();

	const render = (index: number, announce = false) => {
		currentIndex = Math.max(0, Math.min(index, slides.length - 1));
		slides.forEach((slide, slideIndex) => {
			if (slideIndex === currentIndex) slide.setAttribute('aria-current', 'true');
			else slide.removeAttribute('aria-current');
		});
		dots.forEach((dot, dotIndex) => {
			if (dotIndex === currentIndex) dot.setAttribute('aria-current', 'true');
			else dot.removeAttribute('aria-current');
		});
		previousButton.disabled = currentIndex === 0;
		nextButton.disabled = currentIndex === slides.length - 1;
		if (positionOutput) positionOutput.textContent = `${currentIndex + 1} / ${slides.length}`;
		if (announce && announcement) announcement.textContent = `目前是第 ${currentIndex + 1} 張，共 ${slides.length} 張。`;
	};

	const closestSlideIndex = () => {
		const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
		let closestIndex = 0;
		let closestDistance = Number.POSITIVE_INFINITY;
		slides.forEach((slide, index) => {
			const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
			const distance = Math.abs(slideCenter - viewportCenter);
			if (distance < closestDistance) {
				closestDistance = distance;
				closestIndex = index;
			}
		});
		return closestIndex;
	};

	const goTo = (index: number, announce = true) => {
		const targetIndex = Math.max(0, Math.min(index, slides.length - 1));
		const target = slides[targetIndex];
		viewport.scrollTo({
			left: target.offsetLeft,
			behavior: snapshot.resolvedMotion === 'reduce' ? 'auto' : 'smooth',
		});
		render(targetIndex, announce);
	};

	const handleScroll = () => {
		cancelAnimationFrame(scrollFrame);
		scrollFrame = requestAnimationFrame(() => {
			const nextIndex = closestSlideIndex();
			if (nextIndex !== currentIndex) render(nextIndex, true);
		});
	};
	const handlePrevious = () => goTo(currentIndex - 1);
	const handleNext = () => goTo(currentIndex + 1);
	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			goTo(currentIndex - 1);
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			goTo(currentIndex + 1);
		} else if (event.key === 'Home') {
			event.preventDefault();
			goTo(0);
		} else if (event.key === 'End') {
			event.preventDefault();
			goTo(slides.length - 1);
		}
	};
	const handleResize = () => {
		cancelAnimationFrame(resizeFrame);
		resizeFrame = requestAnimationFrame(() => goTo(currentIndex, false));
	};
	const dotHandlers = dots.map((dot, index) => {
		const handler = () => goTo(index);
		dot.addEventListener('click', handler);
		return { dot, handler };
	});

	previousButton.addEventListener('click', handlePrevious);
	nextButton.addEventListener('click', handleNext);
	viewport.addEventListener('scroll', handleScroll, { passive: true });
	viewport.addEventListener('keydown', handleKeydown);
	window.addEventListener('resize', handleResize, { passive: true });
	const stopPreferences = onLabPreferencesChange((detail) => {
		snapshot = detail;
	});

	root.dataset.ready = 'true';
	render(0);

	const controller: ActiveCarousel = {
		root,
		dispose: () => {
			cancelAnimationFrame(scrollFrame);
			cancelAnimationFrame(resizeFrame);
			previousButton.removeEventListener('click', handlePrevious);
			nextButton.removeEventListener('click', handleNext);
			viewport.removeEventListener('scroll', handleScroll);
			viewport.removeEventListener('keydown', handleKeydown);
			window.removeEventListener('resize', handleResize);
			dotHandlers.forEach(({ dot, handler }) => dot.removeEventListener('click', handler));
			stopPreferences();
			window.removeEventListener('pagehide', handlePageHide);
			delete root.dataset.ready;
			if (activeCarousel === controller) activeCarousel = undefined;
		},
	};
	const handlePageHide = () => controller.dispose();
	window.addEventListener('pagehide', handlePageHide, { once: true });
	activeCarousel = controller;
};
