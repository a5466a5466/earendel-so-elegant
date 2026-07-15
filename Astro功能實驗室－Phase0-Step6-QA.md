# Astro 功能實驗室 Phase 0・Step 6 QA 紀錄

更新日期：2026-07-15  
狀態：完成

## 1. 本輪範圍

- 首頁、`/lab/`、`/lab/record-template/` 回歸檢查。
- 360、768、1440 px 響應式檢查準備。
- 鍵盤、焦點、reduced-motion、音效預設、偏好保存與重設。
- JavaScript 關閉時的內容可讀性。
- 正式／Lab 雙模式 build、noindex、Sitemap 與 dependency 檢查。

## 2. 已通過的自動與靜態檢查

| 項目 | 結果 | 證據 |
|---|---|---|
| 本機路由 | 通過 | 首頁、Lab、模板頁皆回應 HTTP 200 |
| HTML 基礎結構 | 通過 | 三頁皆有 `lang="zh-Hant"` 與 viewport meta |
| HTML 可及性基線 | 通過 | 無重複 ID、空按鈕或缺少 alt 的 `<img>` |
| Lab 鍵盤基線 | 通過 | Skip Link、main landmark、原生 details／select／button 與焦點樣式存在 |
| 無 JavaScript 可讀性 | 通過（靜態） | 主要內容由 Astro 產生在 HTML；控制器提供 `<noscript>` 說明 |
| 音效預設 | 通過 | HTML 預設 `data-sound="off"`，偏好預設值也是 `off` |
| 儲存降級 | 通過（程式路徑） | localStorage 讀、寫、清除皆有例外處理 |
| reduced-motion | 通過（程式與 CSS） | 系統設定與 Lab 站內 `data-motion="reduce"` 都會停用動畫與轉場 |
| Lab build | 通過 | `pnpm build:lab` 保留首頁入口、Lab 索引與模板頁 |
| 正式 build | 通過 | `pnpm build` 隱藏首頁入口並移除 `dist/lab/` |
| 搜尋保護 | 通過 | 兩個 Lab 頁皆含 noindex；目前 Sitemap 數量為 0 |
| 首頁回歸 | 通過（建置） | 首頁、404 與四個主要 section 皆存在 |
| Dependency | 通過 | `package.json`、`pnpm-lock.yaml` 無變更，仍只有 Astro |
| 格式檢查 | 通過 | `git diff --check` 無錯誤；僅有 Windows 換行提示 |

## 3. Step 6 發現並修正的問題

### 3.1 Lab 站內減少動態未完整套用

控制器會設定 `data-motion="reduce"`，但原樣式只處理系統 `prefers-reduced-motion`。目前已補上站內設定對應 CSS，手動選擇「減少動態」時也會縮短動畫與轉場。

### 3.2 手機首頁關閉選單仍可能被鍵盤聚焦

選單原本只用位移與透明度隱藏，關閉時連結仍可能進入 Tab 順序。目前已加入 `visibility` 狀態、Escape 關閉與焦點回到選單按鈕；無 JavaScript 時則顯示手機導覽作為 fallback。

### 3.3 首頁 reduced-motion CSS 基線

首頁原本會略過捲動揭露動畫，但 hover 與選單轉場仍未統一縮短。目前已補上系統 reduced-motion CSS。

## 4. 人工瀏覽器驗收

瀏覽器自動控制在本機環境再次遇到既有的初始化衝突，因此下列項目不能誤標為自動通過：

1. 以 360、768、1440 px 實際查看首頁、Lab 與模板頁，確認無水平捲動、遮擋或文字溢出。
2. 只用 Tab／Shift+Tab／Enter／Space 操作 Skip Link、導覽、Lab 控制器、三個 select、重設按鈕與模板 details。
3. 手機首頁開啟選單後按 Escape，確認選單關閉且焦點回到選單按鈕。
4. 修改三個 Lab 偏好後重新整理，確認設定保留；按重設後恢復系統／關閉／自動。
5. 開啟系統 reduced-motion，確認首頁內容直接可見且 Lab 顯示目前減少動態。
6. 停用 JavaScript，確認首頁與 Lab 主要內容仍能閱讀，手機首頁導覽仍可見。
7. 視需要補 Chrome、Edge、Firefox；Safari 與實體手機另行測試。
8. 若要留下效能基準，再執行 Lighthouse；目前未為此新增 dependency。

使用者於 2026-07-15 在本機瀏覽器查看後確認 Step 6 完成，接受本輪自動檢查、修正與人工頁面驗收結果。跨瀏覽器、Safari、實體手機與 Lighthouse 保留為未來需要正式發布時的延伸 QA，不阻擋目前本機實驗室的 Phase 0 完成。

## 5. 結論

Phase 0・Step 1～Step 6 全部完成。下一個功能實驗尚未開始，開始前仍需由使用者確認實驗範圍。
