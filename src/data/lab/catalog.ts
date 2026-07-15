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
	id: 'F26',
	title: '共用偏好介面與整合驗證',
	description:
		'Phase 1・Step 3 將 Phase 0 控制器整理為單一 Snapshot、HTML data attributes 與變更事件，供後續動畫、音效及媒體功能共同使用。',
	href: '/lab/preferences/',
	linkLabel: '開啟 Step 3 偏好契約',
};

export const normalizeLabPath = (path: string) => {
	if (path === '/lab' || path === '/lab/') return '/lab/';
	return path.endsWith('/') ? path : `${path}/`;
};
