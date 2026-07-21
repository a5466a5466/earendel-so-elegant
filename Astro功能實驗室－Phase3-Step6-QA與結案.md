# Astro 功能實驗室 Phase 3・Step 6 整合 QA 與結案

- 開始日期：2026-07-22
- 目前狀態：完成；整合技術 QA、使用者確認與 Phase 3 結案均通過
- 開始前 commit：`5efe0a8 phase 3 step 5 done: 完成氣質收集小遊戲`
- Dependency：不新增套件；維持 Astro、Svelte 與官方 Cubism SDK for Web 基線

## 1. 結案目標

回歸 Phase 3 Step 1～5，確認 Svelte Island、Live2D 人物、網站內桌寵、CSS／Canvas 環境效果與氣質小遊戲能共用既有偏好、音效、導覽與生命週期契約。Step 6 不再新增玩法或視覺功能；完成結果必須留下正式採用邊界、效能上限、已知阻擋與延後 QA。

## 2. 整合測試矩陣

| 區域 | 主要檢查 | 2026-07-22 結果 |
|---|---|---|
| F11 Svelte Island | SSR、hydration、原生／Svelte 並存 | 通過；原生狀態台存在，Svelte 由 `false` 轉為 `true`，5 個控制按鈕可用 |
| F16 Live2D | Koharu 載入、單一 Canvas、無溢位 | 通過；桌機載入 1 個 Canvas，Console 無錯誤 |
| F02 桌寵 | 初始延遲、使用者啟動、單一 Canvas | 通過；初始 0 Canvas，按「叫出桌寵」後為 1 |
| F21 粒子／視差 | Canvas、粒子上限、Standard 狀態 | 通過；1 個 Canvas、56 顆、標準執行中 |
| F15 小遊戲 | Svelte 狀態、Canvas、開始入口 | 通過；ready、1 個 Canvas、開始控制存在 |
| 共用偏好 | 跨頁 motion／sound／performance | 通過；Reduced motion＋Economy＋靜音跨頁保留，F21 降為 18 顆靜態；測後還原完整動態＋音效開啟＋自動效能 |
| 360×800 RWD | 五頁水平溢位 | 通過；五頁 `scrollWidth === clientWidth`，主內容寬 345px |
| Console | 整輪 warning／error | 通過；0 筆 |
| 靜態輸出 | noindex、重複 ID、Lab 資產 | 通過；37 個 Lab HTML 全部 noindex、0 個重複 ID 頁，Koharu 與小遊戲輸出存在 |
| Lab build | `pnpm build:lab` | 通過；39 個總輸出頁面 |
| Production build | `pnpm build` 與 Lab 排除 | 阻擋；Astro content sync 在頁面編譯前載入 `picomatch@4.0.5` 時出現 `require is not defined` |

## 3. Production 工具鏈阻擋

錯誤可由獨立 `pnpm astro sync` 重現，堆疊位於 Vite 8 module runner 載入 CommonJS `picomatch/index.js`，不是 Phase 3 頁面執行期間的錯誤。`pnpm build:lab` 使用同一份 content collection 可以完整 sync、編譯與輸出。

Step 6 曾依序測試將 `picomatch` 設為 Vite SSR `external` 與 `noExternal`；兩者都無法改變 content sync 的 module runner 路徑，因此已移除，沒有留下 workaround。另一次 `pnpm why picomatch` 因本機 pnpm store index SQLite 無法開啟而不能輸出依賴樹；lockfile 顯示 Astro internal helpers、Vite、tinyglobby 與 Rollup pluginutils 都使用 4.0.5。

目前處置：不修改 lockfile、不強制覆寫 transitive dependency，也不把 Lab mode 冒充 production 驗證。正式部署前必須在乾淨依賴環境重新安裝並重測；若仍重現，再依 Astro／Vite 官方相容版本或已確認的上游修正處理。production build 與正式輸出排除在此之前維持未通過。

## 4. 正式採用候選

### F11 Svelte

建議採用，但只用於多狀態、複雜互動的低頻 UI。普通 Astro 頁面與簡單控制保留原生 TypeScript；Canvas、WebGL、Live2D 及遊戲 render loop 不經由 Svelte 逐幀更新 DOM。

### F16 Live2D

建議條件採用為正式角色候選。官方 Koharu 只作技術與動作驗證，不能代表正式角色素材；正式整合前仍需厄倫蒂兒模型、發布用途授權核對、容量預算與靜態 fallback。

### F02 網站內桌寵

建議條件採用於活動頁或可選模式，不建議全站預設啟動。必須由使用者叫出、可拖曳／暫停／收合，手機與 reduced motion 主動降級；不得跨出網站或新增第二套角色 runtime。

### F21 粒子、視差與 WebGL

建議條件採用於 Hero、活動主視覺或少量重點區域。沿用 CSS＋Canvas 2D，不加入 Three.js；文字層固定、economy 降量、reduced motion 靜態，不能鋪滿所有內容頁。

### F15 氣質小遊戲

建議採用為活動限定內容或彩蛋，不作主要導覽門檻。第一版「幫蒂兒收集氣質」已能無素材運作；Live2D、語音、害羞星與正式美術必須在確認活動需求後另案估時與授權。

## 5. 整合效能上限

- 同一頁只允許一個主要高頻互動 runtime；Live2D 人物、桌寵與小遊戲不應同時作為主體運行。
- 若桌寵與環境 Canvas 同頁，環境效果必須降為 Economy，桌寵仍需使用者主動開啟。
- 進入小遊戲時應暫停桌寵自主遊走與非必要背景 animation frame；離開後依偏好恢復，不建立重複 renderer。
- 所有功能共用 `earendel-lab-preferences-v1`，不另建 motion、sound 或 performance 狀態。
- 手機、Reduced motion、Economy、hidden tab 與 pagehide 清理仍是正式整合必要條件，不能因 Prototype 驗收通過而移除。

## 6. 使用者結案確認

使用者已逐項驗收 Step 1～5，並於 2026-07-22 以建立結案 commit 的指示核准以下 Step 6 結論：

- 核准第 4 節五項正式採用候選：Svelte 採用；Live2D、桌寵與粒子條件採用；氣質小遊戲作為活動限定功能。
- 核准第 5 節效能上限：同頁只執行一個主要高頻 runtime，小遊戲執行時暫停桌寵自主遊走與非必要背景動畫。
- 接受 production build 的 `picomatch` 問題移至乾淨依賴環境處理，不阻擋 Phase 3 概念驗證結案。
- Step 1～5 已各自完成使用者人工驗收；Step 6 不要求重複主觀驗收已核准的相同畫面。

## 7. 結案閘門

Phase 3 結案條件均已滿足：

- [x] Step 1～5 個別技術 QA 與使用者人工驗收完成。
- [x] Step 6 整合技術 QA 完成。
- [x] 使用者核准正式採用候選與效能上限。
- [x] 使用者接受將 production 工具鏈阻擋帶入乾淨依賴環境處理。
- [x] Phase 3 主控文件與 `handoff.md` 已更新。

最終結論：Phase 3 正式結案；下一階段為 Phase 4・F24 投稿表單／後端評估，再依計畫進行 F25 PWA／離線功能。
