export const i18nPrototypeLocales = [
	{
		slug: 'zh-hant',
		code: 'zh-Hant',
		dateLocale: 'zh-Hant-TW',
		label: '繁體中文',
		eyebrow: '三語內容原型',
		title: '星光生日應援企劃',
		summary: '把每一份祝福整理成可以長久保存的星光紀錄。',
		dateLabel: '活動日期',
		body: '此頁用來確認繁體中文字型、標點、日期與自然換行。這不是正式翻譯內容。',
	},
	{
		slug: 'ja',
		code: 'ja',
		dateLocale: 'ja-JP',
		label: '日本語',
		eyebrow: '3言語コンテンツ試作',
		title: '星明かりの誕生日応援プロジェクト',
		summary: '一つひとつの祝福を、これからも大切に残せる星明かりの記録にまとめます。',
		dateLabel: '開催日',
		body: 'このページでは、日本語のフォント、句読点、日付表記、長い文章の折り返しを確認します。正式な翻訳ではありません。',
	},
	{
		slug: 'en',
		code: 'en',
		dateLocale: 'en-US',
		label: 'English',
		eyebrow: 'Trilingual content prototype',
		title: 'The Starlight Birthday Celebration Project',
		summary: 'A lasting constellation of birthday wishes, stories, and memories gathered from everyone in the community.',
		dateLabel: 'Event date',
		body: 'This page checks Latin fonts, punctuation, localized dates, and how substantially longer interface copy wraps. It is not a final translation.',
	},
] as const;

export type I18nPrototypeLocale = (typeof i18nPrototypeLocales)[number];

export const i18nPrototypePath = (slug: string) => `/lab/i18n/${slug}/`;

export const i18nPrototypeAlternates = [
	...i18nPrototypeLocales.map((locale) => ({
		lang: locale.code,
		href: i18nPrototypePath(locale.slug),
	})),
	{ lang: 'x-default', href: i18nPrototypePath('zh-hant') },
];

export const i18nPrototypeDate = new Date('2026-08-15T00:00:00+08:00');
