# Astro 功能實驗室 Phase 3・Step 4・F21 粒子、視差與 WebGL

- 建立日期：2026-07-21
- 目前狀態：Prototype、主要技術 QA 與使用者人工驗收完成
- 開始前 commit：`fa790fb phase 3 step 3 done: 完成網站內桌寵與完整 Live2D 動作`
- Prototype：`/lab/ambient-effects/`
- Dependency：不新增套件；以原生 CSS 與 Canvas 2D 建立基線

## 1. 目標與範圍

驗證粒子、分層視差與沉浸背景能否在不影響閱讀、操作與低效能裝置的前提下，作為網站重點區域的視覺增強。本 Step 不建立全站大型 3D 場景，也不預設採用 Three.js。

第一版同頁比較三種模式：純 CSS 分層、Canvas 星塵，以及兩者合併。桌機指標讓 Canvas 星塵與遠、中、近光暈形成反向景深，最大位移 44px；點擊場景可產生單一短星芒。Canvas 使用固定粒子池，不在互動或長時間執行時持續增加物件。

## 2. 效能與降級契約

- Standard：桌機最多 56 顆、手機 32 顆；device pixel ratio 上限 2。
- Economy：固定 18 顆、不畫粒子連線、不啟用指標視差。
- Reduced motion：Canvas 只繪製一幀，CSS 圖層回到中央，不執行持續 animation frame。
- Hidden tab：停止 animation frame；返回前景時尊重使用者手動暫停狀態。
- Resize：沿用同一 Canvas，重新配置尺寸與固定粒子池，不新增 renderer。
- Cleanup：離頁移除 pointer、click、ResizeObserver、visibility、偏好與 pagehide listener，取消 animation frame 並清空粒子參照。

## 3. Three.js 停止點

目前需求只有 2D 星塵、短連線、光暈與分層位移，不需要 3D 相機、模型、材質、shader 或空間光照。原生 CSS／Canvas 足以驗證視覺與效能，因此本輪不開 Three.js dependency 閘門。只有後續明確需要真正 3D 場景或自訂 shader，且能說明正式網站價值時才另案評估。

## 4. QA 與完成條件

- `pnpm build:lab` 與 `pnpm build` 通過；正式輸出不含本頁、腳本或 CSS。
- 360／768／1440px 無水平溢位，文字與控制可操作。
- CSS／Canvas／合併三種模式、暫停／繼續、回復視角與點擊星芒正常。
- Standard／Economy／Reduced motion／頁籤隱藏切換正確。
- Resize 與反覆切換不增加 Canvas、listener、particle pool 或 animation loop。
- Console error／warning 為 0；長時間執行無可觀察的持續記憶體增長。
- 使用者人工確認效果密度、視差幅度、文字對比與是否值得正式採用。

## 5. 2026-07-21 技術 QA 紀錄

- `pnpm build:lab` 通過，共輸出 38 個頁面，包含 `/lab/ambient-effects/`。
- 桌機初始狀態為 Standard、56 顆、合併效果；CSS／Canvas／合併三種模式的 `aria-pressed` 與場景 mode 均正確。
- 暫停後顯示「標準・手動暫停」，可繼續執行。
- 將實驗控制器切成 Economy 時固定為 18 顆；切成 Reduced motion 時顯示「靜態（減少動態）」，測試後已還原原本的完整動態／自動效能設定。
- 360×800 viewport 為 32 顆，場景與 Canvas 同步縮放，`scrollWidth === clientWidth`，無水平溢位；測試後已還原預設 viewport。
- 完成上述模式、偏好與 RWD 操作後，瀏覽器 console warning／error 為 0。
- `git diff --check` 通過。
- 預設 production `pnpm build` 兩次都在 Astro content sync 階段遇到既有工具鏈錯誤：Vite 載入 `picomatch@4.0.5` 時為 `require is not defined`。錯誤發生在頁面編譯前，Lab mode 同一份 content collection 可正常 sync 與完整建置；正式輸出排除驗證待工具鏈問題排除後補測。
- 2026-07-22 使用者已完成視覺密度、視差手感、文字對比、點擊星芒與控制操作的人工驗收，Step 4 標記完成。
- 2026-07-22 修正「回復中央視角」無可見反應：原本指標離開場景時已自動歸零，導致移到場景外的按鈕前效果便消失。現在視差會保留到使用者主動重設；已置中時按鈕顯示「視角已置中」並停用，移動場景指標後才啟用「回復中央視角」。瀏覽器實測可由 `0.865 / -0.667` 歸零為 `0 / 0`。
- 2026-07-22 使用者回報仍無可辨識的視覺位移。複查確認舊版主要星塵 Canvas 只有約 6px 位移，CSS 光暈又過淡；數值生效不等於視覺驗收通過。調整為星塵 18px、遠景 12px、中景 28px、近景 44px 的反向景深，文字層保持固定。此 Prototype 使用抽象星塵與光暈，沒有照片或人物影像素材。
- 2026-07-22 增強版由使用者重新驗證通過；「回復中央視角」可辨識地將各景深層歸零，已置中狀態亦有明確的停用文案。正式採用若需要照片、角色或場景影像，須另行提供或製作素材，不屬於本次抽象粒子 Prototype 範圍。
