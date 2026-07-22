# Phase 1 Step 6・Page Transition 與 Script 生命週期契約

## 架構決策

- 保留 Astro 靜態 MPA 與普通 `<a>` 導覽。
- 採用瀏覽器原生 cross-document View Transition；不加入 Astro `ClientRouter`。
- 預設候選使用 260ms 淡出與 650ms 長淡入；若內容閱讀節奏改變，再以人工驗收微調。
- `view-transition-name` 只用於少數有明確空間連續性的共享元素，同一文件不得出現重複名稱。
- 動畫是漸進增強，不得成為導覽、內容顯示或狀態傳遞的必要條件。
- Slide、Scale、Wipe、Stagger、Push 與 Circle 保留為情境選項，不作全站預設；必須依內容語意個別採用。
- Circle 允許以 pointer 座標設定 CSS custom properties；鍵盤或座標不可用時固定從中央揭露，不得因此阻止連結導覽。
- 詳情頁的頁面返回連結可攜帶 effect 與 back direction，讓目的列表頁在揭露前選用對應動畫；瀏覽器原生返回仍由瀏覽器與文件歷史狀態處理。

## 降級契約

- 不支援 cross-document View Transition：普通 MPA 換頁。
- JavaScript 關閉：普通 MPA 換頁；原生 CSS 轉場若瀏覽器支援仍可運作。
- Lab 實驗控制器的動態偏好為 reduce：停用 root 與共享元素動畫；完整動態時不再由系統 media query 私下覆蓋。
- 直接開啟、重新整理、前進與返回皆不得依賴 transition 狀態。

## Script 生命週期

目前採 MPA，因此每次導覽會建立新文件：

1. 共用模組在每份文件載入時初始化一次。
2. 初始化函式仍須可重入；若相同 DOM 已 ready，直接返回。
3. 若初始化遇到不同 DOM，先呼叫上一個 instance 的 `dispose()`。
4. 所有 `window`、`document`、MediaQuery、ResizeObserver、timer 與自訂事件 listener 都必須能清理。
5. `pagehide` 僅處理離頁 UI 收尾，不使用 `pushState`、`replaceState` 或攔截返回鍵。
6. 第三方 script、影音與後續互動功能不得假設轉場一定存在。

若未來因持續播放器等明確需求重新評估 `ClientRouter`，所有初始化入口必須集中到 `astro:page-load`，並重新驗證焦點公告、捲動恢復、連續切頁、listener 數量及返回行為；不得只加入 Router 元件便視為完成。
