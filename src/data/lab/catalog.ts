export type LabStepState = 'complete' | 'active' | 'pending' | 'protected';

export interface LabPhaseStep {
	step: string;
	title: string;
	description: string;
	status: string;
	state: LabStepState;
	href?: string;
	linkLabel?: string;
}

export interface LabNavigationItem {
	label: string;
	href: string;
}

export interface LabBreadcrumbItem {
	label: string;
	href?: string;
}

export const labNavigation: LabNavigationItem[] = [
	{ label: '實驗索引', href: '/lab/' },
	{ label: '活動資料', href: '/lab/events/' },
	{ label: '偏好契約', href: '/lab/preferences/' },
	{ label: '語系決策', href: '/lab/i18n/' },
	{ label: '轉場決策', href: '/lab/transitions/' },
	{ label: '滾動動畫', href: '/lab/scroll/' },
	{ label: 'Gallery', href: '/lab/gallery/' },
	{ label: 'Carousel', href: '/lab/carousel/' },
	{ label: 'Lightbox', href: '/lab/lightbox/' },
	{ label: 'Video', href: '/lab/video/' },
	{ label: 'YouTube', href: '/lab/youtube/' },
	{ label: '外部內容', href: '/lab/social-embeds/' },
	{ label: '動畫滑鼠', href: '/lab/cursor/' },
	{ label: 'Audio', href: '/lab/audio/' },
	{ label: '按鍵音效', href: '/lab/sound-effects/' },
	{ label: '分享與 QR', href: '/lab/share/' },
	{ label: '搜尋與篩選', href: '/lab/search/' },
	{ label: '紀錄模板', href: '/lab/record-template/' },
];

export const phaseZeroSteps: LabPhaseStep[] = [
	{
		step: '01',
		title: '實驗室骨架',
		description: '建立實驗索引、首頁入口、專用 Layout 與響應式樣式。',
		status: '完成',
		state: 'complete',
	},
	{
		step: '02',
		title: '共用控制器',
		description: '集中顯示 viewport、動態偏好、音效與效能模式。',
		status: '完成',
		state: 'complete',
	},
	{
		step: '03',
		title: '實驗紀錄',
		description: '統一記錄工時、RWD、無障礙、效能與採用決策。',
		status: '完成',
		state: 'complete',
		href: '/lab/record-template/',
		linkLabel: '查看模板',
	},
	{
		step: '04',
		title: '共用 Lab 結構',
		description: '集中管理導覽、Phase 狀態、子頁 Hero 與下一項實驗資料。',
		status: '完成',
		state: 'complete',
	},
	{
		step: '05',
		title: '公開保護',
		description: '維持 noindex，並在正式部署前確認 Sitemap 與入口策略。',
		status: '完成',
		state: 'complete',
	},
	{
		step: '06',
		title: '完整 QA',
		description: '統一驗證 viewport、鍵盤、偏好、降級、首頁回歸與建置結果。',
		status: '完成',
		state: 'complete',
	},
];

export const nextExperiment = {
	id: 'P2-04',
	title: 'Phase 2 整合 QA',
	description:
		'回歸 X、Threads、YouTube 與動畫游標共存，完成跨尺寸、偏好降級、正式輸出隔離及 Phase 2 結案。',
};

export const normalizeLabPath = (path: string) => {
	if (path === '/lab' || path === '/lab/') return '/lab/';
	return path.endsWith('/') ? path : `${path}/`;
};

export const isLabNavigationItemCurrent = (path: string, href: string) => {
	const currentPath = normalizeLabPath(path);
	const itemPath = normalizeLabPath(href);
	if (itemPath === '/lab/') return currentPath === itemPath;
	return currentPath === itemPath || currentPath.startsWith(itemPath);
};

export const getLabBreadcrumbs = (
	path: string,
	currentLabel?: string,
): LabBreadcrumbItem[] => {
	const currentPath = normalizeLabPath(path);
	if (currentPath === '/lab/') return [];

	const breadcrumbs: LabBreadcrumbItem[] = [{ label: '實驗索引', href: '/lab/' }];
	const section = labNavigation.find(
		(item) => item.href !== '/lab/' && isLabNavigationItemCurrent(currentPath, item.href),
	);
	if (!section) {
		breadcrumbs.push({ label: currentLabel ?? '目前頁面' });
		return breadcrumbs;
	}

	const sectionPath = normalizeLabPath(section.href);
	if (currentPath === sectionPath) {
		breadcrumbs.push({ label: currentLabel ?? section.label });
	} else {
		breadcrumbs.push({ label: section.label, href: section.href });
		breadcrumbs.push({ label: currentLabel ?? '活動詳情' });
	}
	return breadcrumbs;
};
