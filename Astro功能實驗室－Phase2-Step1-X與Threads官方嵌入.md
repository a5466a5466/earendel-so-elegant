# Astro 功能實驗室 Phase 2・Step 1 X 與 Threads 官方嵌入

- 狀態：技術完成
- 日期：2026-07-20
- 開始前 commit：`c5e03ff phase 1 done and phase 2 planning`
- 完成 commit：尚未建立
- Lab 路由：`/lab/social-embeds/`

## 1. 使用者決策

使用者確認本功能的目標是一般網站常見的直接嵌入，不需要在貼文顯示前增加自製同意視窗或複雜 fixture。原先建立的 facade、session consent 與六種失效模擬已移除。

固定方案：

- 直接貼入平台官方 embed markup。
- X 與 Threads 各載入一份官方 script。
- 不使用 `sessionStorage`、自製同意對話框或 click-to-load。
- 不安裝 npm wrapper 或其他 dependency。
- 永久保留「在平台查看原文」連結，官方 script 失效時仍有出口。
- 正式站的 Cookie／隱私告知在正式部署階段統一處理，不在貼文前增加個別詢問流程。

## 2. 官方測試內容

### X

- 貼文：`https://x.com/Interior/status/463440424141459456`
- 作者：US Department of the Interior（`@Interior`）
- 選用理由：X 官方 Embedded Posts 文件直接使用此 URL 作為 oEmbed 範例。
- 嵌入碼來源：`https://publish.x.com/oembed`
- Loader：`https://platform.x.com/widgets.js`

### Threads

- 貼文：`https://www.threads.com/@threads/post/Da5YxXtkeU4`
- 作者：Threads 已驗證官方帳號（`@threads`）
- 選用理由：公開且可直接瀏覽的官方帳號貼文，不需要使用者先提供內容網址。
- Loader：`https://www.threads.com/embed.js`
- 2026-07-20 以 HTTP 檢查確認 `threads.com/embed.js` 回傳 200，並包含 `text-post-media` 與 `data-text-post-permalink` 標記支援。

## 3. 實作

- `src/pages/lab/social-embeds.astro`：兩張官方貼文與原文連結。
- `src/data/lab/catalog.ts`：新增「外部內容」導覽並更新下一項實驗說明。
- `astro.config.mjs`：正式建置排除新 Lab bundle。

已刪除過度設計且尚未提交的檔案：

- `src/components/lab/SocialEmbedFacade.astro`
- `src/scripts/lab/social-embeds.ts`
- `src/data/lab/social-embed.ts`
- `src/data/lab/social-embed-contract.md`

## 4. QA

- `pnpm build:lab`：通過，輸出 33 個頁面。
- Lab HTML：`noindex` 正確，X／Threads loader 各 1 份，兩個原文 URL 都存在。
- 瀏覽器：X 與 Threads 都成功產生官方 iframe，各 1 個。
- 兩個嵌入卡片都保留平台原文連結。
- 1280 px：頁面沒有水平溢位；兩張卡片的 `scrollWidth` 等於 `clientWidth`。
- 視覺檢查：發現淺色內容區二級標題與說明文字對比不足，已改為深色並複驗 computed color。
- `pnpm build`：通過；正式首頁保留，`/lab/social-embeds/` 與相關 bundle 均被正式輸出守門移除。
- `git diff --check`：通過；只有 Windows LF／CRLF 提示，沒有 whitespace error。

360／768 px 主要由已建立的單欄 media query 與 `max-width: 100%` 嵌入限制涵蓋；正式內容替換後再與完整 Phase 2 RWD 一起回歸。

## 5. 後續替換內容

目前不需要使用者提供貼文網址。正式改成厄倫蒂兒相關內容時，只需提供：

- X 公開貼文網址。
- Threads 公開貼文網址。

替換網址後重新確認貼文為公開、官方嵌入可顯示以及內容已取得展示核准即可。
