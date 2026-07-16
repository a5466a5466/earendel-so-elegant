# Astro 功能實驗室 Phase 1・Step 5・F23 多語系路由決策

- 開始日期：2026-07-16
- 完成日期：2026-07-16
- 目前狀態：完成，技術驗證與使用者人工驗收均通過
- 最終核准結論：**正式站前延後**
- 套件：不新增；優先採 Astro 內建 i18n

## 本 Step 要回答的問題

在正式內容只有繁體中文、尚無固定翻譯與母語校對流程的現況下，是否應立即讓 Astro i18n 介入全站路由。

## 已建立的 Prototype

- `/lab/i18n/`：URL、fallback 與維護成本比較。
- `/lab/i18n/zh-hant/`：繁中 placeholder。
- `/lab/i18n/ja/`：日文 placeholder。
- `/lab/i18n/en/`：英文 placeholder。
- 每個語系頁輸出相符的 HTML `lang`、`hreflang`、日期格式與一般連結式語言切換。
- Prototype 全部位於 Lab，不啟用正式站 Astro i18n，避免決策前改寫現有路由。

## 候選與建議

### 候選 A：預設繁中不帶 prefix（保留）

- 繁中：`/events/...`
- 日文：`/ja/events/...`
- 英文：`/en/events/...`
- 優點：既有繁中分享連結不需搬家；未來可用 Astro `prefixDefaultLocale: false` 對應。

### 候選 B：全部語系帶 prefix（不建議）

- 繁中：`/zh-hant/events/...`
- 日文：`/ja/events/...`
- 英文：`/en/events/...`
- 代價：導入時必須搬移既有繁中 URL，並長期維護永久重新導向。

## Fallback 契約

- 不使用瀏覽器語言自動跳轉；使用者主動切換語言。
- 缺少翻譯時清楚標示「此語系尚未提供」，並提供繁中原文連結。
- 不在 `/ja/` 或 `/en/` URL 下以 rewrite 靜默顯示繁中內容，避免 URL 語系、HTML `lang` 與實際內容互相矛盾。
- `x-default` 指向預設繁中版本。

## 維護成本閘門

只有同時具備下列條件，才在正式站啟用 Astro i18n：

1. 至少一個第二語系有實際發布範圍。
2. 有固定翻譯與母語校對負責人。
3. 新增或修改繁中內容時，有同步更新與缺譯標記流程。
4. 能接受每篇內容的 SEO metadata、日期、alt、導覽與分享文字都需同步維護。

## 延後不會封死未來的理由

- 現有活動以語意 slug 與 root-relative URL 組成，未把語系寫死在 schema。
- 共用 Layout 現已能由頁面傳入 `lang` 與 `hreflang`。
- Navigation 契約把路由集中於資料層，未在元件內猜測語系。
- 未來採用候選 A 時，繁中 URL 保持原位，只新增 `/ja/`、`/en/` 目錄及翻譯內容來源。

## 驗收狀態

- [x] Lab build 通過（13 個輸出頁面，含 4 個 Step 5 頁面）
- [x] 正式 build 不含 Lab、`/ja/`、`/en/` 與語系 Prototype
- [x] 三個語系頁的 `lang`、4 組 `hreflang`、日期格式與結構通過靜態檢查
- [x] 使用者查看 `/lab/i18n/` 與三語頁面
- [x] 使用者核准唯一結論「正式站前延後」及候選 A 契約

## 使用者驗收

- 驗收日期：2026-07-16
- 結果：使用者確認頁面看起來沒有問題，Step 5 完成。
- 核准決策：正式站前延後啟用多語系；未來採用時使用候選 A，繁中無 prefix，日文與英文分別使用 `/ja/`、`/en/`。
