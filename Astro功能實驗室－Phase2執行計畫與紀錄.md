# Astro 功能實驗室 Phase 2・執行計畫與紀錄

- 建立日期：2026-07-20
- 最後更新：2026-07-20
- 目前狀態：Step 1 X／Threads 多貼文嵌入已完成技術與使用者人工驗收
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

- X 官方 Embedded Timelines 可用個人檔案 URL 與 `https://platform.x.com/widgets.js` 產生時間軸，不需要認證。
- 曾以 `https://x.com/EarendelXDFP` 測試最多 10 筆並要求包含回覆；iframe 在使用者的一般瀏覽器仍為空白，已撤下。
- 來源：`https://docs.x.com/x-for-websites/oembed-api`

### Threads

- Threads 網頁已由 `threads.net` 遷移至 `threads.com`。
- 曾以 Threads 已驗證官方帳號的公開貼文測試單篇嵌入；依最新決策已撤下，改連到厄倫蒂兒 Threads 主頁。
- 2026-07-20 確認 `https://www.threads.com/embed.js` 回傳 200，且仍支援 `text-post-media` 與 `data-text-post-permalink`。
- 來源：`https://about.fb.com/news/2025/04/new-features-threads-web-experience/`

## 4. Step 總表

| Step | 功能 | 狀態 |
|---:|---|---|
| 1 | X／Threads 各 5 則公開貼文嵌入 | 完成並由使用者驗收 |
| 2 | 最新列表 | 暫緩；仍需 API 授權與後端機制 |
| 3 | F01 動畫滑鼠 | 未開始 |
| 4 | Phase 2 整合 QA 與結案 | 未開始 |

X 官方個人時間軸在使用者的一般瀏覽器驗收仍為空白，因此不採用。最終改為兩個平台各 5 筆公開貼文，確保頁面內有實際可見內容並驗證不同高度的多卡片版面。

## 5. Step 1：X／Threads 官方直接嵌入

### 實作

- 路由：`/lab/social-embeds/`
- X：`https://x.com/EarendelXDFP/status/1566668038862094336`。
- Threads：`https://www.threads.com/@earendel_xdfp/post/Da8eNJJk8ki`。
- X／Threads embed loader 各一份。
- 無額外 dependency。
- 無自製互動 script、同意狀態或 loader 管理器。
- 兩張卡片永久保留原文連結。

### QA

- `pnpm build:lab` 通過，輸出 33 個頁面。
- X 時間軸方案曾因空白 block 判定不可採用。
- 修正後瀏覽器確認 10 張卡、X／Threads iframe 各 5 個、loader 各一份且沒有水平溢位。
- 一般 Grid 會被高貼文撐開整列，已改為桌機雙欄 masonry；800 px 以下回到單欄。
- 1280 px 無水平溢位；兩張卡片的 `scrollWidth` 等於 `clientWidth`。
- 修正淺色內容區二級標題與說明文字的對比。
- `noindex` 與正式輸出隔離由現有 Lab 架構維持。

詳細紀錄：`Astro功能實驗室－Phase2-Step1-X與Threads官方嵌入.md`。

## 6. Step 2：最新列表

單篇貼文嵌入已完成。若未來要改成最新 10 筆，需要：

- 可管理的 Threads 帳號或 Meta Developer App 授權。
- API Token 的安全保存與更新策略。
- 正式站後端或排程同步機制。

在上述條件尚未成立前，維持目前官方測試貼文，不建立未授權的抓取或爬蟲。

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

- 不自行爬取 X／Threads 頁面。
- 不建立登入、發文、按讚、回覆或 API 同步。
- 不建立 CMS、資料庫、Worker、Token 或 server secret。
- 不使用第三方 embed 聚合器。
- 不開始正式部署。

## 10. 下一步

X／Threads 各 5 則公開貼文已完成，不再保留空白時間軸或無關測試貼文。

Step 1 已完成。下一步開始 F01 動畫滑鼠；最新 10 筆自動同步等取得必要授權再另行規劃。
