# Astro 功能實驗室 Phase 2・Step 1 X 與 Threads 官方嵌入

- 狀態：技術與使用者人工驗收完成
- 日期：2026-07-20
- 開始前 commit：`c5e03ff phase 1 done and phase 2 planning`
- 完成 commit：尚未建立
- Lab 路由：`/lab/social-embeds/`

## 1. 使用者決策

使用者確認本功能的目標是一般網站常見的直接嵌入，不需要在貼文顯示前增加自製同意視窗或複雜 fixture。原先建立的 facade、session consent 與六種失效模擬已移除。

最後採用方案：

- X 官方個人時間軸因一般瀏覽器驗收仍為空白而撤下，改用 5 則公開貼文。
- Threads 使用 5 則近期公開貼文，混合文字、媒體與外部連結內容。
- X 與 Threads 各載入一份官方 embed script。
- 不使用 `sessionStorage`、自製同意對話框或 click-to-load。
- 不安裝 npm wrapper 或其他 dependency。
- 永久保留平台原文連結，官方 script 失效時仍有出口。
- 正式站的 Cookie／隱私告知在正式部署階段統一處理，不在貼文前增加個別詢問流程。

## 2. 目前測試貼文

### X

- 貼文：
  - `https://x.com/EarendelXDFP/status/1566668038862094336`
  - `https://x.com/EarendelXDFP/status/1775318083823141301`
  - `https://x.com/EarendelXDFP/status/1712139900055937053`
  - `https://x.com/EarendelXDFP/status/1641875349612146688`
  - `https://x.com/EarendelXDFP/status/1646215020957806594`
- 作者：厄倫蒂兒 Earendel（`@EarendelXDFP`）
- 類型：X 官方單篇貼文嵌入。
- Loader：`https://platform.x.com/widgets.js`。

### Threads

- 貼文：
  - `https://www.threads.com/@earendel_xdfp/post/Da8eNJJk8ki`
  - `https://www.threads.com/@earendel_xdfp/post/Da9V0UBE3H3`
  - `https://www.threads.com/@earendel_xdfp/post/Da77DjtE0Mo`
  - `https://www.threads.com/@earendel_xdfp/post/Da5OVQLk1TZ`
  - `https://www.threads.com/@earendel_xdfp/post/Da2GjvBExXo`
- 作者：厄倫蒂兒 Earendel（`@earendel_xdfp`）
- 類型：Threads 官方單篇貼文嵌入。
- Loader：`https://www.threads.com/embed.js`。

## 3. 實作

- `src/pages/lab/social-embeds.astro`：X／Threads 各 5 則貼文、原文連結與 masonry 排列。
- `src/data/lab/catalog.ts`：新增「外部內容」導覽並更新下一項實驗說明。
- `astro.config.mjs`：正式建置排除新 Lab bundle。

已刪除過度設計且尚未提交的檔案：

- `src/components/lab/SocialEmbedFacade.astro`
- `src/scripts/lab/social-embeds.ts`
- `src/data/lab/social-embed.ts`
- `src/data/lab/social-embed-contract.md`

## 4. QA

- `pnpm build:lab`：通過，輸出 33 個頁面。
- X 時間軸方案曾在使用者一般瀏覽器只顯示空白 block，已撤下。
- 修正後瀏覽器確認 10 張卡、X／Threads 官方 iframe 各 5 個、原文連結 10 個。
- 每個平台 loader 各一份，沒有因貼文數增加而重複載入 script。
- 一般 Grid 會被高貼文撐開整列，已改為桌機雙欄 masonry，讓短卡下方能接續排列。
- 800 px 以下切換單欄；1280 px 沒有水平溢位。
- 使用者已於 2026-07-20 完成多貼文內容與版面人工驗收，結果通過。
- 視覺檢查：發現淺色內容區二級標題與說明文字對比不足，已改為深色並複驗 computed color。
- `pnpm build`：通過；正式首頁保留，`/lab/social-embeds/` 與相關 bundle 均被正式輸出守門移除。
- `git diff --check`：通過；只有 Windows LF／CRLF 提示，沒有 whitespace error。

360／768 px 主要由已建立的單欄 media query 與 `max-width: 100%` 嵌入限制涵蓋；正式內容替換後再與完整 Phase 2 RWD 一起回歸。

## 5. 後續安排

X 與 Threads 目前各顯示 5 則厄倫蒂兒公開貼文，不再顯示空白時間軸或無關測試內容。

Step 1 已完成。下一步開始 F01 動畫滑鼠；最新 10 筆自動同步仍需要正式 API 授權與後端機制。
