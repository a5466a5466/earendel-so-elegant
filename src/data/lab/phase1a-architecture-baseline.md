# Phase 1A 架構基線

- 基線日期：2026-07-16
- 適用範圍：Phase 1・Step 8～17
- 狀態：Step 7 技術凍結完成，等待使用者人工驗收

本文件把 Step 1～6 已核准的共同架構固定為 Phase 1B 前置。後續 Step 可以在此基線上增加功能，但不得靜默建立第二套資料、路由、圖片、偏好或生命週期規則。若需求確實需要改動，必須在該 Step 紀錄遷移方式、相容性與使用者核准。

## 1. 活動 schema 與內容來源

- `events` Content Collection 是活動、Gallery、影音、社群連結與搜尋標籤的唯一共同資料來源。
- 必填核心欄位為 `title`、`slug`、`date`、`summary`、`cover`、`fallbackCover`、`coverAlt`、`coverPosition`、`theme`、`tags`、`credits`。
- 媒體欄位固定為 `gallery`、`videos`、`audio`、`socialPosts`；允許空陣列，版型不得因此留下空白區塊。
- `slug` 使用小寫 ASCII kebab-case，建立後視為穩定識別；修改既有 slug 必須提供 redirect／遷移方案。
- 目前三筆合法測試資料涵蓋完整媒體、部分媒體與空媒體組合，並依 `date` 由新到舊排序。

## 2. URL 與 Navigation

- Lab 活動列表：`/lab/events/`；詳情：`/lab/events/:slug/`。
- 正式站採 Astro file routing 與普通 `<a>`；不攔截 History，不以 query 或前端狀態取代內容 URL。
- 共用導覽資料集中於 `src/data/lab/catalog.ts`；目前位置與麵包屑由 pathname 推導。
- Phase 1B 新功能必須支援直接進入、重新整理與返回；轉場不得承擔導覽正確性。

## 3. 圖片管線

- 可最佳化的本機內容圖片以 Astro image import 與 `<Picture>`／Sharp 處理。
- 主要輸出候選為 AVIF、WebP 與來源格式 fallback；依卡片／詳情提供固定 widths 與 `sizes`。
- 首屏必要圖片才可設為 eager／high priority；其餘維持 lazy／async。
- 圖片一律提供尺寸、alt、固定比例與失敗背景，載入錯誤不得令版面塌陷。
- 遠端來源在加入正式資料前必須先定義 allowlist、可靠尺寸、權利與失敗策略。

## 4. 使用者偏好

- 唯一持久化 key 為 `earendel-lab-preferences-v1`；不得另建第二份 motion、sound 或 performance 儲存狀態。
- 所有功能透過共用 API 讀取、寫入、套用及訂閱偏好，並監聽同一個自訂事件。
- 動態同時尊重使用者設定與系統 `prefers-reduced-motion`；節能模式降低裝飾負載，不刪除主要內容。
- 每個 listener／observer 必須有對應 cleanup；初始化須可重入。

## 5. i18n 決策

- F23 在正式站內容準備完成前延後，不在 Phase 1B 偷渡完整多語架構。
- 未來候選 URL 固定為繁中無 prefix，日文 `/ja/`、英文 `/en/`。
- 缺譯必須明示並提供繁中來源，不自動依瀏覽器語言跳轉。
- 每份實際語系頁必須提供正確 `lang`、canonical／`hreflang` 與 locale-aware 格式。

## 6. 轉場與 script 生命週期

- 保留普通 Astro MPA 與原生 History；採 native cross-document View Transition，不採 ClientRouter。
- 長淡入為預設候選；Slide、Scale、Wipe、Shared、Stagger、Push、Circle 只依內容語意個別採用。
- Reduced motion、不支援環境或 JavaScript 關閉時維持普通換頁。
- Script 以每份文件初始化一次為基本模型，但仍須防止重複綁定並提供 `dispose()`。
- 動畫是漸進增強；HTML 內容、連結、焦點與狀態不能依賴動畫才能成立。

## 7. 建置與公開邊界

- `pnpm build:lab` 保留 Lab 路由、首頁入口與實驗資產，所有 Lab HTML 必須 `noindex`。
- `pnpm build` 最終只保留正式站輸出；不得留下 `/lab/`、`/lab-assets/` 或命名 Lab bundle。
- 正式首頁與 404 是每個 Step 的固定回歸項目。
- 專案目前未產生 Sitemap；啟用 Sitemap 時，正式輸出不得包含 `/lab/`。

## 8. 已知限制與變更控制

- Codex 內建瀏覽器自動控制目前有初始化錯誤，視覺與互動結果需由使用者人工確認。
- 尚未在實體手機、Safari／Firefox 與螢幕閱讀器上完成跨環境矩陣。
- Lighthouse、網路節流與正式素材容量預算留待正式內容與部署環境具備後執行。
- 正式多語內容、遠端圖片、第三方影音與真實社群服務尚未接入。
- Phase 1B 若需修改本基線，該 Step 必須列出「舊契約、修改理由、遷移方式、回歸範圍、使用者核准」，不得直接覆寫本文件結論。
