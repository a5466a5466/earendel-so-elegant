# Astro 功能實驗室 Phase 2・執行計畫與紀錄

- 建立日期：2026-07-20
- 最後更新：2026-07-20
- 目前狀態：Step 1 X／Threads 官方直接嵌入已技術完成
- 前置狀態：Phase 0、Phase 1 Step 1～18 已完成並由使用者驗收
- 規劃基線 commit：`c5e03ff phase 1 done and phase 2 planning`

## 1. Phase 2 目標

Phase 2 驗證：

- F12：X 公開貼文嵌入。
- F13：Threads 公開貼文嵌入。
- F01：動畫滑鼠。

本階段維持 Prototype 範圍，不建立社群 API、登入、CMS、資料庫或後端同步。

## 2. 使用者決策：直接官方嵌入

2026-07-20 使用者確認 X／Threads 採一般網站常見的直接嵌入方式。先前規劃的個別同意視窗、session consent、click-to-load facade 與大量 failure fixture 不符合需求，已取消且未提交。

固定原則：

- 直接貼入平台官方 embed markup。
- 每個平台只載入一份官方 script。
- 不顯示自製同意詢問。
- 不使用 `sessionStorage` 或 `localStorage` 保存第三方同意。
- 不安裝 npm wrapper、聚合器或代理服務。
- 每張內容保留平台原文連結，官方嵌入失效時仍可前往查看。
- 正式站的 Cookie／隱私告知由正式部署的共用政策處理，不在每張貼文前重複詢問。

## 3. 官方能力與來源

### X

- X 官方 Embedded Posts 由頁面內的 `blockquote.twitter-tweet` 與 `https://platform.x.com/widgets.js` 組成。
- 官方文件提供 `https://x.com/Interior/status/463440424141459456` 作為 oEmbed 範例，本 Prototype 直接採用。
- 來源：`https://docs.x.com/x-for-websites/embedded-posts/overview`
- 來源：`https://help.x.com/en/using-x/how-to-embed-a-post`

### Threads

- Threads 網頁已由 `threads.net` 遷移至 `threads.com`。
- 本 Prototype 使用 Threads 已驗證官方帳號的公開貼文：`https://www.threads.com/@threads/post/Da5YxXtkeU4`。
- 2026-07-20 確認 `https://www.threads.com/embed.js` 回傳 200，且仍支援 `text-post-media` 與 `data-text-post-permalink`。
- 來源：`https://about.fb.com/news/2025/04/new-features-threads-web-experience/`

## 4. Step 總表

| Step | 功能 | 狀態 |
|---:|---|---|
| 1 | X／Threads 官方直接嵌入 Prototype | 技術完成 |
| 2 | 替換成經核准的厄倫蒂兒相關公開貼文 | 等待正式貼文網址時執行 |
| 3 | F01 動畫滑鼠 | 未開始 |
| 4 | Phase 2 整合 QA 與結案 | 未開始 |

原規劃把 X 與 Threads 拆成兩個技術 Step；簡化後兩者已在同一頁完成基本整合，因此後續只需替換內容，不再重複建立兩套架構。

## 5. Step 1：X／Threads 官方直接嵌入

### 實作

- 路由：`/lab/social-embeds/`
- X：官方 `@Interior` 範例貼文。
- Threads：官方已驗證 `@threads` 公開貼文。
- X loader：`https://platform.x.com/widgets.js`，一份。
- Threads loader：`https://www.threads.com/embed.js`，一份。
- 無額外 dependency。
- 無自製互動 script、同意狀態或 loader 管理器。
- 兩張卡片永久保留原文連結。

### QA

- `pnpm build:lab` 通過，輸出 33 個頁面。
- 瀏覽器確認 X 與 Threads 都成功產生官方 iframe。
- DOM 確認兩個平台各一個 iframe、各一份官方 loader。
- 1280 px 無水平溢位；兩張卡片的 `scrollWidth` 等於 `clientWidth`。
- 修正淺色內容區二級標題與說明文字的對比。
- `noindex` 與正式輸出隔離由現有 Lab 架構維持。

詳細紀錄：`Astro功能實驗室－Phase2-Step1-X與Threads官方嵌入.md`。

## 6. Step 2：替換正式貼文

目前不需要使用者提供網址，官方範例已足以驗證技術。

正式內容準備好後，只需提供：

- 需要展示的 X 公開貼文網址。
- 需要展示的 Threads 公開貼文網址。
- 確認內容與作者已核准在網站展示。

替換後檢查貼文仍為公開、官方 embed 能顯示、手機寬度不溢出即可。

## 7. Step 3：F01 動畫滑鼠

- 先比較原生游標與小尺寸品牌靜態游標。
- 只有使用者另外要求時才增加星屑／光點拖尾。
- `pointer: coarse`、`hover: none`、reduced motion 或 economy 模式停用裝飾效果。
- 不遮擋點擊、選字、輸入、拖曳或 scrollbar。
- 不安裝動畫套件。

開始前若沒有正式素材，可使用簡單幾何 placeholder；正式採用前仍需提供核准的游標圖與 hotspot。

## 8. Step 4：整合 QA 與結案

- Lab／production build。
- 正式輸出不包含 `/lab/` 與 Lab-only bundle。
- 360／768／1440 px 排版。
- 鍵盤、reduced motion、economy、coarse pointer。
- X／Threads／YouTube 與動畫游標共存檢查。
- 記錄正式站採用內容與尚待替換的公開貼文網址。

## 9. 不在 Phase 2

- 不建立即時 X／Threads feed。
- 不建立登入、發文、按讚、回覆或 API 同步。
- 不建立 CMS、資料庫、Worker、Token 或 server secret。
- 不使用第三方 embed 聚合器。
- 不開始正式部署。

## 10. 下一步

X／Threads 直接嵌入已完成，不需要再做同意流程驗收，也不需要立即提供貼文網址。

下一個新功能是 F01 動畫滑鼠。若要先把官方範例換成厄倫蒂兒相關內容，再向使用者索取一筆 X 與一筆 Threads 公開貼文網址即可。
