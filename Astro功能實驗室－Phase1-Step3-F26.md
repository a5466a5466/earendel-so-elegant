# Astro 功能實驗室 Phase 1・Step 3 F26 紀錄

- 開始日期：2026-07-15
- 狀態：完成（使用者已人工驗收）
- 完成日期：2026-07-15
- 對應功能：F26 共用偏好介面與整合驗證
- 開始前 commit：`3e9f785 phase1 step2 done`
- 新增 dependency：無

## 1. 範圍

- 沿用 Phase 0 控制器，不重做設定 UI。
- 將偏好讀寫、解析、套用、事件與生命週期整理為單一公開 API。
- 建立 `/lab/preferences/`，驗證動態、音效與效能三個最小消費者。
- 記錄 CSS、Astro 與 TypeScript 的唯一使用方式及安全 fallback。

## 2. 初始盤點

Phase 0 已有單一儲存鍵、例外處理、HTML data attributes、系統 reduced-motion 保護與 `lab:preferences-change`。但所有邏輯都位於控制器初始化函式內，公開型別與事件契約不足，也沒有處理跨分頁同步及未來頁面替換時的 listener 清理。

## 3. 本輪實作

- `preferences.ts` 公開 read／write／reset／snapshot／apply／subscribe API。
- 保留 `earendel-lab-preferences-v1`，沒有建立第二份儲存。
- 事件 detail 增加來源、原始設定與解析結果。
- 控制器採可清理、可重複初始化的生命週期，並同步其他分頁的 storage change。
- 新增偏好契約文件與可見整合測試頁。
- 正式 build 檢查發現刪除 Lab 路由後仍殘留 Lab CSS 與 F26 JavaScript 孤兒檔；已擴充輸出守門器，同步移除 `LabLayout`、`LabControls` 與 `preferences` 專用資產。

## 4. 待驗證與人工驗收

- [x] Astro 編譯與 Lab build 通過；專案未直接安裝 `tsc`，沒有為此新增 dependency。
- [x] 正式 build 不輸出 Lab 路由、Lab CSS、F26 程式或 Step 2 活動圖片。
- [x] 靜態 HTML 含安全 data attributes、3 個消費者、12 個粒子、noindex 與 noscript fallback。
- [x] 原始碼只有 `preferences.ts` 直接存取 localStorage 與 reduced-motion media query。
- [x] 本機 `/lab/preferences/` 回應 HTTP 200。
- [x] 控制器三項設定能立即更新 Snapshot 與三個消費者。
- [x] 重新整理及切換 Lab 頁面後設定保留。
- [x] 重設恢復 system／off／auto，且動態仍尊重系統 reduced-motion。
- [x] 使用者完成頁面人工驗收；JavaScript／localStorage fallback 保留靜態與程式路徑證據。

## 4.1 技術驗證結果

| 項目 | 結果 | 證據 |
|---|---|---|
| `pnpm build:lab` | 通過 | 9 頁，包含 `/lab/preferences/` |
| `pnpm build` | 通過 | 首頁保留，`/lab` 與 `/lab-assets` 不存在 |
| 正式資產隔離 | 通過 | Lab Layout、控制器、preferences 與活動圖片殘留數 0 |
| 安全預設 | 通過 | HTML 為 full／off／standard；程式預設為 system／off／auto |
| 共用事件 | 通過 | 打包結果包含唯一 `lab:preferences-change` 契約 |
| CSS 消費者 | 通過 | motion／sound／performance 三種 data attribute 規則皆存在 |
| 儲存降級 | 通過（程式路徑） | read／write／reset 全部由 try/catch 保護 |
| `git diff --check` | 通過 | 無 whitespace error；僅 Windows 換行提示 |

### 人工驗收修正紀錄

- 節能模式原先雖已隱藏第 5～12 顆粒子，但保留的四點沿用 30 度間隔，集中在圓環四分之一處，變化不易辨識。
- 已讓節能模式四點改為 90 度均勻分布，並在中央直接顯示 `12 particles`／`4 particles`，使狀態可被明確驗收。

## 5. 完成閘門

Step 3 技術工作與人工驗收皆已完成。使用者於 2026-07-15 確認三種偏好、重新整理／跨頁保留、重設與消費者顯示可以接受，可依主控計畫開始 Step 4。
