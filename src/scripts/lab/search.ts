interface ActiveSearchLab {
	root: HTMLElement;
	dispose: () => void;
}

interface SearchState {
	q: string;
	year: string;
	tag: string;
	media: string;
}

let activeSearchLab: ActiveSearchLab | undefined;

const normalizeSearchText = (value: string) =>
	value.normalize('NFKC').toLocaleLowerCase('zh-Hant-TW').trim();

const parseList = (value: string | undefined) => {
	if (!value) return [];
	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
	} catch {
		return [];
	}
};

export const initializeSearchLab = () => {
	const root = document.querySelector<HTMLElement>('[data-search-lab]');
	if (!root) return;
	if (activeSearchLab?.root === root && root.dataset.ready === 'true') return;
	activeSearchLab?.dispose();

	const form = root.querySelector<HTMLFormElement>('[data-search-form]');
	const searchInput = root.querySelector<HTMLInputElement>('[data-search-query]');
	const yearSelect = root.querySelector<HTMLSelectElement>('[data-search-year]');
	const tagSelect = root.querySelector<HTMLSelectElement>('[data-search-tag]');
	const mediaSelect = root.querySelector<HTMLSelectElement>('[data-search-media]');
	const resultCount = root.querySelector<HTMLElement>('[data-search-count]');
	const activeSummary = root.querySelector<HTMLElement>('[data-search-summary]');
	const emptyState = root.querySelector<HTMLElement>('[data-search-empty]');
	const resetButton = root.querySelector<HTMLButtonElement>('[data-search-reset]');
	const items = Array.from(root.querySelectorAll<HTMLElement>('[data-search-item]'));
	if (!form || !searchInput || !yearSelect || !tagSelect || !mediaSelect || !resultCount || !activeSummary || !emptyState || !resetButton) return;

	const validOption = (select: HTMLSelectElement, value: string) =>
		Array.from(select.options).some((option) => option.value === value) ? value : '';
	const readUrlState = (): SearchState => {
		const params = new URLSearchParams(window.location.search);
		return {
			q: params.get('q') ?? '',
			year: validOption(yearSelect, params.get('year') ?? ''),
			tag: validOption(tagSelect, params.get('tag') ?? ''),
			media: validOption(mediaSelect, params.get('media') ?? ''),
		};
	};
	const readFormState = (): SearchState => ({
		q: searchInput.value.trim(),
		year: yearSelect.value,
		tag: tagSelect.value,
		media: mediaSelect.value,
	});
	const writeFormState = (state: SearchState) => {
		searchInput.value = state.q;
		yearSelect.value = state.year;
		tagSelect.value = state.tag;
		mediaSelect.value = state.media;
	};
	const applyState = (state: SearchState) => {
		const query = normalizeSearchText(state.q);
		let visibleCount = 0;
		for (const item of items) {
			const tags = parseList(item.dataset.tags);
			const media = parseList(item.dataset.media);
			const matches = (
				(!query || normalizeSearchText(item.dataset.searchText ?? '').includes(query)) &&
				(!state.year || item.dataset.year === state.year) &&
				(!state.tag || tags.includes(state.tag)) &&
				(!state.media || media.includes(state.media))
			);
			item.hidden = !matches;
			if (matches) visibleCount += 1;
		}

		resultCount.textContent = `共 ${visibleCount} 筆結果`;
		emptyState.hidden = visibleCount !== 0;
		const conditions = [
			state.q && `關鍵字「${state.q}」`,
			state.year && `${state.year} 年`,
			state.tag && `標籤「${state.tag}」`,
			state.media && `媒體「${mediaSelect.selectedOptions[0]?.textContent ?? state.media}」`,
		].filter(Boolean);
		activeSummary.textContent = conditions.length > 0
			? `目前條件：${conditions.join('、')}`
			: '目前顯示全部活動。';
	};
	const stateUrl = (state: SearchState) => {
		const url = new URL(window.location.href);
		url.search = '';
		for (const [key, value] of Object.entries(state)) {
			if (value) url.searchParams.set(key, value);
		}
		return url;
	};
	const commitState = (mode: 'push' | 'replace') => {
		const state = readFormState();
		const url = stateUrl(state);
		if (url.href !== window.location.href) {
			window.history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', url);
		}
		applyState(state);
	};

	let searchTimer = 0;
	const handleSearchInput = () => {
		window.clearTimeout(searchTimer);
		searchTimer = window.setTimeout(() => commitState('replace'), 120);
	};
	const handleFilterChange = () => commitState('push');
	const handleSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		commitState('push');
	};
	const handleReset = () => {
		window.clearTimeout(searchTimer);
		window.requestAnimationFrame(() => commitState('push'));
	};
	const handlePopState = () => {
		const state = readUrlState();
		writeFormState(state);
		applyState(state);
	};

	searchInput.addEventListener('input', handleSearchInput);
	yearSelect.addEventListener('change', handleFilterChange);
	tagSelect.addEventListener('change', handleFilterChange);
	mediaSelect.addEventListener('change', handleFilterChange);
	form.addEventListener('submit', handleSubmit);
	resetButton.addEventListener('click', handleReset);
	window.addEventListener('popstate', handlePopState);

	const initialState = readUrlState();
	writeFormState(initialState);
	applyState(initialState);
	root.dataset.ready = 'true';

	const controller: ActiveSearchLab = {
		root,
		dispose: () => {
			window.clearTimeout(searchTimer);
			searchInput.removeEventListener('input', handleSearchInput);
			yearSelect.removeEventListener('change', handleFilterChange);
			tagSelect.removeEventListener('change', handleFilterChange);
			mediaSelect.removeEventListener('change', handleFilterChange);
			form.removeEventListener('submit', handleSubmit);
			resetButton.removeEventListener('click', handleReset);
			window.removeEventListener('popstate', handlePopState);
			window.removeEventListener('pagehide', handlePageHide);
			delete root.dataset.ready;
			if (activeSearchLab === controller) activeSearchLab = undefined;
		},
	};
	const handlePageHide = () => controller.dispose();
	window.addEventListener('pagehide', handlePageHide, { once: true });
	activeSearchLab = controller;
};
