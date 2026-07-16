# Astro 功能實驗室 Phase 1・Step 8・F05 Scroll Animation

- 開始日期：2026-07-16
- 完成日期：2026-07-16
- 目前狀態：完成，技術驗證與使用者人工驗收均通過
- 開始前 commit：`48666db phase1 step 7 done doc`
- 新增 dependency：無
- Prototype：`/lab/scroll/`

## 實作範圍

- Intersection Observer 的垂直淡入、側移、縮放與同組接續。
- CSS Scroll Timeline 閱讀進度；不支援時維持靜態裝飾。
- 桌機 sticky story 與手機普通文件流降級。
- 原生 `<details>` 改變頁面高度後的觸發測試。
- 共用動態／效能偏好、reduced-motion、重播與 pagehide cleanup。
- 無 JavaScript 時內容直接可讀，不以隱藏樣式作初始狀態。

## 技術驗證結果

- [x] `pnpm build:lab` 通過：23 個輸出頁，含 21 個 Lab HTML 與 `/lab/scroll/`。
- [x] 新頁具有 `noindex`、共用 Navigation 目前位置、11 個 reveal 節點、3 個 story step、`details` 高度測試與重播按鈕。
- [x] HTML 重複 ID 0、無 alt 圖片 0；無 JavaScript fallback 文字與完整內容皆在靜態 HTML。
- [x] 程式含可重入初始化、Observer `disconnect()`、偏好 listener cleanup、`pagehide` cleanup 與重播 listener cleanup。
- [x] Reduced motion 直接顯示全部內容；節能模式縮短動畫、取消 stagger 並減少位移。
- [x] 700 px 以下取消 sticky、改成單欄普通文件流；沒有橫向手勢攔截。
- [x] `pnpm build` 通過：最終只保留首頁與 404；Lab 路由、Scroll bundle 與命名 Lab 資產洩漏均為 0。
- [x] `git diff --check` 無 whitespace error，只有 Windows LF／CRLF 提示。
- [x] 360 px、節能模式、reduced-motion、展開高度與返回行為由使用者人工確認。
- [x] 使用者人工比較並核准原生方案，不另開 GSAP 評估。

Codex 內建瀏覽器自動控制仍出現 `Cannot redefine property: process`，因此沒有把視覺與實際捲動互動誤標為自動通過。這是既有工具初始化問題，Astro Lab／production build 均未出現該錯誤。

## 暫定套件決策

目前案例只需要一次性 reveal、簡單章節狀態與 responsive sticky，原生 CSS／Intersection Observer 已涵蓋需求，因此不安裝 GSAP／ScrollTrigger。使用者人工驗收通過，正式採用原生方案作為後續 Scroll Animation 基線。

## 人工驗收重點

1. 開啟 `/lab/scroll/`，向下滾動確認四張卡片有淡入、側移、縮放與接續感。
2. Sticky Story 桌機左側圓點依 01／02／03 移動，滾輪仍是普通垂直捲動。
3. 展開 `<details>` 後繼續往下，最後一張 Native Baseline 卡仍在正確位置揭露。
4. 按「重播目前頁面的 Reveal」，可重新觀看目前頁面的進場。
5. Lab 控制器切換「減少動態」後，所有內容立即顯示且不再等待動畫。
6. 切換「節能」後，動畫變短、位移較小、四張卡不再接續等待。
7. 以約 360 px 寬度確認單欄、sticky 已取消、沒有水平捲動或手勢阻斷。
8. 前往活動頁再使用瀏覽器返回，頁面與 Reveal 仍可正常使用。

## 使用者驗收與結論

- 驗收日期：2026-07-16
- 結果：使用者確認 Step 8 完成。
- 套件決策：原生 CSS、Intersection Observer 與 Scroll Timeline 足夠；不安裝 GSAP／ScrollTrigger。
- 固定規則：內容先存在於 HTML、reduced-motion 直接顯示、節能模式降低位移與接續、手機取消 sticky、所有 observer 與 listener 可清理。
- 下一步：Step 9・F06 Gallery。
