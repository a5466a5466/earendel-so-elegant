# Astro 功能實驗室 Phase 1A・Step 7・整合 QA 與架構凍結

- 開始日期：2026-07-16
- 目前狀態：技術回歸完成，等待使用者人工驗收
- 開始前 commit：`255acd6 phase1 step 6 done`
- 新增 dependency：無
- 架構基線：`src/data/lab/phase1a-architecture-baseline.md`

## 1. 結論摘要

Step 1～6 均已有明確結論，沒有未決功能。Lab 與正式雙模式建置通過，資料、圖片、偏好、路由、i18n Prototype 與原生 MPA View Transition 可共同存在。Phase 1A 技術面已可作為 Step 8～17 的前置基線；Step 7 仍需使用者完成本文件的人工驗收，才可標記完成。

## 2. Step 1～6 決策回歸

| Step | 功能 | 狀態 | Step 7 回歸結論 |
|---:|---|---|---|
| 1 | F18 Content Collections | 完成 | 3 筆合法活動；日期排序、動態 slug、空／完整媒體組合與共同標籤仍成立 |
| 2 | F20 Image Pipeline | 完成 | AVIF／WebP、responsive widths、priority／lazy、透明來源與 failure fallback 仍存在 |
| 3 | F26 User Preferences | 完成 | 單一 storage key、自訂事件、system／Lab reduced motion、economy 與 cleanup 契約仍成立 |
| 4 | F03 Navigation | 完成 | 普通連結、共用 Navigation、目前位置、麵包屑與 dispose 契約仍成立 |
| 5 | F23 i18n | 延後採用 | 3 個語系 Prototype 仍有正確 `lang` 與各 4 個 alternate links；正式站前延後決策不變 |
| 6 | F04 Page Transition | 完成 | 9 個比較路由、8 種動畫模式、普通 MPA、reduced-motion 與不採 ClientRouter 決策仍成立 |

## 3. 自動與靜態驗證

### Lab build

| 檢查 | 結果 | 證據 |
|---|---|---|
| `pnpm build:lab` | 通過 | Astro build 共 22 pages；最終 `dist/lab` 有 20 個 HTML |
| Lab HTTP | 通過 | 首頁與 20 個 Lab URL 均回應 200 |
| 搜尋引擎保護 | 通過 | 20／20 Lab HTML 具有 `noindex` |
| HTML 基線 | 通過 | 重複 ID 0、缺少 `<main>` 0、缺少 viewport 0、缺少 `lang` 0 |
| 共用 UI | 通過 | 缺少 Navigation 0、缺少 Lab Controls 0 |
| 基本無障礙靜態檢查 | 通過 | 無 alt 的 `<img>` 0、空 `<button>` 0 |
| 活動資料 | 通過 | 3 張卡依日期為星光生日、盛夏來信、月光留言；schema 含 Gallery／Videos／Audio／Social Posts |
| 圖片輸出 | 通過 | 活動頁含 6 組 AVIF、6 組 WebP、6 張 lazy 與 1 張 eager 圖片；failure demo 存在 |
| i18n | 通過 | zh-Hant／ja／en 語系頁各有正確 `lang` 與 4 個 `hreflang` 選項 |
| 轉場 | 通過 | 列表加 8 個模式詳情共 9 路由；fade／slide／scale／wipe／shared／stagger／push／circle 均存在 |
| ClientRouter／History 攔截 | 通過 | 無 ClientRouter import，無 `pushState`／`replaceState` |

### Production build

| 檢查 | 結果 | 證據 |
|---|---|---|
| `pnpm build` | 通過 | Astro 先產生 19 pages，output guard 後最終 HTML 為首頁與 404 共 2 頁 |
| Lab 路由隔離 | 通過 | `dist/lab` 不存在 |
| Lab 公開資產隔離 | 通過 | `dist/lab-assets` 不存在 |
| Lab bundle 隔離 | 通過 | 命名 Lab layout、controls、navigation、preferences、transition 與活動圖片資產洩漏 0 |
| 正式首頁 | 通過 | 存在 title、viewport、`lang="zh-Hant"`、`main`；沒有 `/lab/` 入口 |
| 404 | 通過 | 存在 title、`main` 與返回首頁連結 |
| HTML 靜態檢查 | 通過 | 重複 ID 0、無 alt 圖片 0、空按鈕 0 |
| Sitemap | 不適用／已知限制 | 專案目前沒有 Sitemap 產生器；output guard 已預留「若存在則不得含 `/lab/`」檢查 |

## 4. 架構凍結

以下項目已寫入 `src/data/lab/phase1a-architecture-baseline.md`，作為 Step 8～17 共同前置：

- 活動 schema 與唯一內容來源。
- 穩定 slug、Lab URL、普通連結與 Astro file routing。
- Astro Picture／Sharp、本機來源、載入優先序與失敗策略。
- 單一偏好 storage、自訂事件、reduced-motion、economy 與 cleanup。
- i18n 延後決策與未來 prefix／缺譯規則。
- 原生 MPA View Transition、不採 ClientRouter 與 script 生命週期。
- Lab／production 的建置與公開隔離邊界。

## 5. 未執行、已知限制與延後項目

| 類別 | 狀態 | 說明 |
|---|---|---|
| Codex 瀏覽器自動視覺 QA | 未執行 | 工具出現 `Cannot redefine property: process`；不是 Astro 錯誤 |
| 使用者人工回歸 | 待執行 | 依第 6 節檢查主要頁面與偏好／轉場 |
| 實體手機與跨瀏覽器 | 延後 | Safari、Firefox、實體觸控與系統返回矩陣留待正式環境 |
| 螢幕閱讀器 | 延後 | 目前只有 HTML 與鍵盤契約的靜態／既有人工基線 |
| Lighthouse／節流 | 延後 | 等正式素材、部署 URL 與容量預算具備後執行 |
| 正式多語內容 | 延後 | 依 Step 5 決策，正式站內容準備完成前不啟用 |
| 遠端圖片與第三方服務 | 延後 | 尚無核准 allowlist、真實影音或社群服務 |

## 6. 使用者人工驗收清單

請以目前 dev server 完成下列精簡回歸：

- [ ] `/lab/` 顯示「Phase 1A 整合 QA」，且不再把已完成的 Step 6 當下一項實驗。
- [ ] `/lab/events/` 三張活動卡、圖片輸出示範與 failure fallback 版面正常。
- [ ] 開啟三個活動詳情；空媒體區塊不留空白，完整媒體欄位仍顯示。
- [ ] `/lab/preferences/` 動態、音效、效能設定仍能操作；節能負載粒子為 4 個。
- [ ] `/lab/i18n/` 可進入繁中、日文、英文 Prototype，缺譯說明符合 Step 5 決策。
- [ ] `/lab/transitions/` 九種比較與返回動畫仍正常；reduced-motion 時不依賴動畫。
- [ ] `/` 正式首頁與 `/404` 外觀、內容、連結沒有受到 Lab 修改影響。

## 7. 完成閘門

- [x] Step 1～6 均為完成、延後或不採用，沒有未決狀態。
- [x] Phase 1A QA 紀錄與架構基線已建立，可供 Step 8～17 使用。
- [ ] 使用者完成 Phase 1A 人工驗收並明確確認 Step 7 完成。

使用者確認以前，Step 7 狀態維持「待驗收」，不得開始 Step 8。
