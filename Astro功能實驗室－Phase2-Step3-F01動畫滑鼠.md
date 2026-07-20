# Astro 功能實驗室 Phase 2・Step 3・F01 動畫滑鼠

- 日期：2026-07-20
- 狀態：實作、技術 QA 與使用者人工驗收完成
- 路由：`/lab/cursor/`
- Dependency：0

## 1. Prototype 範圍

- 原生基線：完全保留瀏覽器游標。
- 靜態星芒：32 × 32 SVG 幾何 placeholder，hotspot 為中心 `(16, 16)`。
- 動態星環：保留原生游標，只增加一個 `pointer-events: none` 的跟隨 DOM 元素；四顆白色星點各自在不同半徑與週期繞行，兩顆順時針、兩顆逆時針，其中兩顆為四向星芒；各星點另有不同週期的亮度起伏，外圈以陰影明暗產生呼吸效果。
- 不加入星屑、光點拖尾、粒子陣列或動畫套件。
- 正式採用前仍需取得核准的品牌游標素材並重新確認 hotspot。

## 2. 安全與降級契約

- 只有 `(pointer: fine) and (hover: hover)` 才允許裝飾游標。
- 共用偏好解析為 reduced motion 或 economy 時，立即回到原生游標並停止 animation frame。
- `pointer: coarse`、`hover: none` 與觸控 Pointer Event 不啟用跟隨效果。
- 裝飾層固定使用 `pointer-events: none`，不得攔截點擊、拖曳或 scrollbar。
- 連結與按鈕保留 `pointer`，輸入與可選文字保留 `text` 游標語意。
- JavaScript 關閉或初始化失敗時，HTML 內容與原生游標仍正常。
- 功能只透過 `getLabPreferencesSnapshot()` 與 `onLabPreferencesChange()` 讀取共用偏好，不建立第二份儲存狀態。

## 3. 實作檔案

- `src/pages/lab/cursor.astro`
- `src/scripts/lab/cursor.ts`
- `public/lab-assets/cursor/earendel-star.svg`
- `src/styles/lab/lab.css`
- `src/data/lab/catalog.ts`
- `astro.config.mjs`

## 4. 技術 QA

| 項目 | 結果 | 證據 |
|---|---|---|
| `pnpm build:lab` | 通過 | 34 個頁面，包含 `/lab/cursor/` |
| `pnpm build` | 通過 | 首頁存在；`dist/lab`、`dist/lab-assets` 與 cursor bundle 均不存在 |
| 三模式切換 | 通過 | 原生、靜態星芒與動態星環的狀態及輸出同步 |
| 靜態游標 | 通過 | 計算樣式載入 `/lab-assets/cursor/earendel-star.svg`，hotspot `(16, 16)` |
| 動態星環 | 通過 | Pointer move 後顯示並更新 transform；`pointer-events` 為 `none` |
| 旋轉與呼吸 | 通過 | 技術確認各星點獨立繞行且不與跟隨 transform 衝突；使用者已完成人工視覺驗收 |
| 輸入與按鈕 | 通過 | Textbox 可輸入、游標語意為 `text`，按鈕可聚焦與點擊 |
| reduced motion | 通過 | 共用控制器切為 reduce 後，模式立即成為 native、星環隱藏 |
| economy | 通過 | 共用控制器切為 economy 後，模式立即成為 native、星環隱藏 |
| 360／768／1280 px | 通過 | 無水平溢位；模式選擇與展示區在窄螢幕改為單欄 |
| Console | 通過 | 無 error 或 warning |

`pointer: coarse` 與 `hover: none` 已由相同 JS media query 守門及 CSS media query 雙重保護；實體觸控裝置留待 Phase 2 整合 QA 延伸確認。

## 5. 人工驗收項目

- 比較原生、靜態星芒與動態星環，判斷哪一種符合網站氣質。
- 確認動態星環的尺寸、延遲感與亮度是否舒服。
- 在展示區測試連結、按鈕、文字選取和輸入框。
- 用右下角實驗控制器切換「減少動態」與「節能」，確認會回到原生游標。
- 決定正式方向：採用／條件採用／保留研究／不採用。

### 使用者驗收結果

- 2026-07-20 使用者完成桌機視覺與操作驗收。
- 最終選擇動態星環方向：四顆白色星點使用不同半徑與週期獨立繞行，兩顆順時針、兩顆逆時針，其中兩顆為四向星芒。
- 接受各星點不同週期的亮度起伏與外圈柔和呼吸效果。
- 不採用整組等速旋轉，也不採用整組忽快忽慢的齒輪式變速。
- 使用者確認目前版本可以，Step 3 正式完成。

## 6. 目前結論

原生 CSS、Pointer Events 與單一 `requestAnimationFrame` 已足以完成本 Prototype，不需要動畫套件。最終結論為「條件採用動態星環」：只有桌機精準滑鼠、允許完整動態且為標準效能時啟用；觸控、無 Hover、reduced motion 與 economy 保留原生游標。正式站整合前仍須以核准品牌素材替換 placeholder 並確認 hotspot。
