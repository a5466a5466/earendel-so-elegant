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
	id: 'F03',
	title: 'Navigation',
	description:
		'Phase 1・Step 4 使用原生連結、路由前綴、麵包屑與手機 Dialog，驗證列表／詳情往返、深層連結與瀏覽器返回行為。',
	href: '/lab/events/',
	linkLabel: '開啟 Step 4 導覽情境',
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
