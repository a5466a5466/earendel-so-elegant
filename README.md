# 厄倫蒂兒好氣質

以粉絲應援活動成果展示為主的 Astro 網站。目前主要成果是隔離於 `/lab/` 的功能實驗室，用來驗證正式站可能採用的內容、圖片、導覽、動畫、Gallery、影音、分享與搜尋能力。

## 專案狀態

- Phase 0：完成。
- Phase 1 Step 1～18：全部完成。
- Phase 1 已於 2026-07-20 通過使用者最終人工驗收並結案。
- Phase 2：執行計畫已建立，Step 1～5 尚未開始。
- 正式網站視覺、正式素材、網域與 Cloudflare 部署尚未開始。

最新進度與接手方式請先讀 `handoff.md`。目前執行範圍與 Step 位於 `Astro功能實驗室－Phase2執行計畫與紀錄.md`；Phase 1 最終結果位於 `Astro功能實驗室－Phase1-Step18-QA與結案.md`。

## 環境

- Node.js `>=22.12.0`；目前驗證版本 `v24.18.0`
- pnpm `11.13.0`
- Astro `7.0.9`
- Sharp `0.35.3`（已核准的 build-time 圖片處理 dependency）

首次安裝：

```powershell
corepack enable
pnpm install --frozen-lockfile
```

## 常用指令

```powershell
# 本機開發；保留功能實驗室
pnpm dev --host 127.0.0.1

# Lab 驗收建置；保留 /lab/ 與測試資產
pnpm build:lab

# 正式建置；輸出守門會移除 /lab/ 與 Lab 專用資產
pnpm build
```

常用本機網址：

- 首頁：`http://127.0.0.1:4321/`
- 功能實驗室：`http://127.0.0.1:4321/lab/`
- 活動資料：`http://127.0.0.1:4321/lab/events/`
- 搜尋與篩選：`http://127.0.0.1:4321/lab/search/`

正式 build 會覆寫 `dist/`。若要繼續查看 Lab 靜態輸出，最後再執行一次 `pnpm build:lab`。

## 架構原則

- Astro 元件、HTML、原生 CSS 與原生 TypeScript 優先。
- 未經核准不得新增 dependency。
- Lab 使用普通 Astro MPA、原生 History 與漸進增強。
- Lab 頁面保持 noindex；正式輸出不得包含 `/lab/`、`/lab-assets/` 或 Lab 專用 bundle。
- 正式首頁視覺、正式素材與部署策略不得因 Lab 實驗被默認決定。

共用契約位於 `src/data/lab/`；各 Step 的範圍、驗證與決策記錄於專案根目錄的 `Astro功能實驗室－Phase*.md` 文件。
