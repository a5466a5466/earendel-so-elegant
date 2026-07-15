# Lab Navigation 契約（F03）

更新日期：2026-07-15

## URL 與連結

- Lab 內部頁面使用 Astro file-based routing 與尾斜線 URL，例如 `/lab/events/`、`/lab/events/{slug}/`。
- 多頁與活動詳情一律使用普通 `<a href>`，不攔截 click、不自行呼叫 `pushState`，讓重新整理、前進與返回遵守瀏覽器預設。
- 單頁區段使用穩定 ID 與 `#section`；固定 Header 由 `scroll-margin-top` 保留閱讀空間。
- 內部連結使用 root-relative URL。多語系前綴是否加入由 Step 5 決定，不在元件內自行猜測語系。

## 目前位置與階層

- 頂層導覽資料只來自 `src/data/lab/catalog.ts`。
- `/lab/` 只在索引本身標記 `aria-current="page"`；其他項目以完整路徑或子路徑前綴判定，因此活動詳情仍將「活動資料」標為目前區域。
- 子頁顯示麵包屑。活動詳情固定為「實驗索引 → 活動資料 → 活動名稱」，最後一項使用 `aria-current="page"`。
- 頁面內仍可提供「返回活動列表」等明確上一層連結；不得用 `history.back()` 取代可靠 URL，避免直接開深層連結時返回未知位置。

## 桌機、手機與鍵盤

- 桌機使用固定橫向導覽；手機使用原生 `<dialog>`，由按鈕的 `aria-expanded` 與 `aria-controls` 表達狀態。
- Dialog 開啟後焦點移到關閉按鈕；Escape、關閉按鈕或 backdrop 可關閉並把焦點送回選單按鈕。
- Dialog 關閉後不留可聚焦連結；原生 modal 負責焦點限制。
- JavaScript 關閉時顯示獨立的普通連結列，並隱藏無法操作的選單按鈕。

## 生命週期與後續整合

`initializeLabNavigation()` 可重複呼叫；新頁面初始化前會移除舊 listener 並關閉舊 Dialog。Step 6 若採用 View Transition 或 ClientRouter，仍沿用此元件與 URL 契約，只調整初始化時機，不另建第二套 Navigation 或 History 狀態。
