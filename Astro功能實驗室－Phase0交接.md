# 厄倫蒂兒好氣質網站－Astro 功能實驗室 Phase 0 交接

更新日期：2026-07-15
專案路徑：`C:\Users\Alan_Wu\Documents\earendel-so-elegant`  
目前分支：`master`  
Step 1 程式 commit：`9d83101 Phase 0・Step 1：建立 Lab 與首頁入口`

## 1. 目前進度結論

目前正式停在：

> **Phase 0・Step 1、Step 2 已完成，目前停在 Step 3「實驗紀錄模板」開始前。**

本專案採用使用者核准後的合併版 Step 1：實驗室骨架、首頁入口、專用 Lab Layout 與響應式 CSS 都屬於同一個 Step 1。不能再把 Lab Layout 重複計算成另一個已完成步驟。

Step 1 已經完成實作、修正版面、通過 Astro build，並由使用者在本機瀏覽器實際查看 `/lab/` 後確認版面修正完成。

Step 2 已實作 viewport、reduced-motion、音效與效能模式控制器，通過 Astro build、靜態輸出檢查，並於 2026-07-15 由使用者確認操作正常。

## 2. Step 1～6 狀態表

| Step | 工作 | 狀態 | 說明 |
|---:|---|---|---|
| 1 | 建立實驗室骨架、首頁入口與 Lab Layout | **完成** | `/lab/`、Navbar、專用 Layout、CSS、導覽與 noindex 基礎皆已完成 |
| 2 | 建立最小共用控制器 | **完成** | 開發、技術驗證與使用者操作驗收皆通過 |
| 3 | 建立實驗紀錄模板 | **尚未開始** | 下一個要執行的步驟 |
| 4 | 完善共用 Lab 結構 | **尚未開始** | 讓後續實驗共用控制器、狀態、導覽與索引資料 |
| 5 | 搜尋引擎與部署隔離 | **部分完成** | `noindex` 已完成；正式部署排除與未來 Sitemap 規則尚未做 |
| 6 | Phase 0 完整 QA | **尚未正式開始** | 已做 Step 1 基礎驗證，但尚未執行完整 360／768／1440 與跨瀏覽器 QA |

Step 5 的 `noindex` 是在 Step 1 建立 `LabLayout` 時先完成的基礎保護，不代表整個 Step 5 已驗收。

## 3. Step 1 已完成內容

### 3.1 首頁入口

首頁 Navbar 已加入：

```text
功能實驗室 → /lab/
```

- 桌機 Navbar 與手機選單使用同一組 `<nav>`，因此兩者都會顯示入口。
- 原本的「關於她／應援企劃／星光片刻／追隨星光」錨點保留。
- Navbar 間距改用響應式 `clamp()`，容納第五個項目。

### 3.2 `/lab/` 實驗索引

已建立獨立 Lab 索引頁，包含：

- Astro Function Laboratory Hero。
- 「實驗功能」提醒。
- Phase 0 基礎項目狀態卡。
- 下一個候選實驗 Navigation ＋ Page Transition。
- 返回首頁入口。

目前頁面上的 Phase 0 卡片是進度展示，不是所有功能都已完成。

### 3.3 獨立 Layout 與樣式

Lab 使用獨立的 `LabLayout.astro` 與 `lab.css`：

- 不把 Lab 實驗程式塞進正式首頁。
- 視覺延續首頁的深藍、金色與星光風格。
- 使用獨立響應式規則。
- 有 Skip Link、Lab 導覽與 Footer。
- Lab 頁面包含：

```html
<meta name="robots" content="noindex, nofollow, noarchive" />
```

### 3.4 已修正的版面問題

第一次實作時，`.lab-header` 使用 `left: 50%`，卻沒有將自身往左移回半個寬度，造成：

- 「返回首頁／實驗索引」向右溢出。
- Hero 看起來像背景沒有鋪滿。

目前已改成：

```css
left: 0;
right: 0;
width: var(--lab-container);
margin-inline: auto;
```

並替英文 eyebrow 加入 `overflow-wrap: anywhere`，避免窄畫面文字溢出。使用者已重新查看並確認修正完成。

## 4. Step 1 相關檔案

已修改：

```text
src/pages/index.astro
```

已建立：

```text
src/pages/lab/index.astro
src/layouts/LabLayout.astro
src/styles/lab/lab.css
```

沒有新增 dependency，`package.json` 仍只有 Astro：

```json
"dependencies": {
  "astro": "^7.0.9"
}
```

## 5. 已完成驗證

以下檢查已通過：

- `pnpm build`
- 靜態輸出包含 `/index.html`
- 靜態輸出包含 `/lab/index.html`
- 本機首頁 HTTP 回應 `200`
- 本機 `/lab/` HTTP 回應 `200`
- 首頁生成 HTML 包含 `/lab/` 入口
- Lab 生成 HTML 包含 `noindex, nofollow, noarchive`
- Lab 包含返回首頁連結
- Lab CSS 包含手機 breakpoint
- `package.json` 與 `pnpm-lock.yaml` 沒有因 Step 1 改變
- 使用者已在瀏覽器實際查看 `/lab/` 並確認 Header 修正版面

尚未完成：

- 360、768、1440 px 畫面紀錄
- Chrome、Edge、Firefox 的完整比較
- Safari 與實體手機測試
- 鍵盤焦點完整巡覽紀錄
- JavaScript 關閉測試
- Lighthouse 紀錄

這些項目留到 Step 6 統一處理。

## 6. 已完成：Step 2 最小共用控制器

Step 2 已於 2026-07-15 通過使用者操作驗收。下一個工作是 Step 3 實驗紀錄模板；仍不得直接跳到 Navigation、Page Transition 或其他 F01～F26 實驗。

### 6.1 預計功能

建立所有 Lab 實驗可共用的基礎控制器：

1. 顯示 viewport 寬度與高度。
2. 顯示 `devicePixelRatio`。
3. 顯示 fine/coarse pointer 與 hover 能力。
4. 讀取系統 `prefers-reduced-motion`。
5. 提供站內減少動態設定。
6. 提供音效開關，預設必須關閉。
7. 提供效能模式：自動／標準／節能。
8. 使用 `localStorage` 記住選擇。
9. 將共用狀態寫到 `<html>` 的 `data-*` attributes，讓未來實驗讀取。

預期狀態形式：

```html
<html
  data-motion="reduce"
  data-sound="off"
  data-performance="economy"
>
```

### 6.2 建議檔案

目前使用的檔案：

```text
src/components/lab/LabControls.astro
src/scripts/lab/preferences.ts
```

已同步更新：

```text
src/layouts/LabLayout.astro
src/pages/lab/index.astro
src/styles/lab/lab.css
```

### 6.3 Step 2 驗收條件

- 調整瀏覽器尺寸後 viewport 資訊會更新。
- 重新整理後使用者設定仍保留。
- 系統要求 reduced-motion 時，站內設定不能強迫打開完整動畫。
- 音效初始狀態固定為關閉。
- 控制器可使用鍵盤操作。
- JavaScript 失效時，頁面主要內容仍可閱讀。
- 不新增 dependency。
- `pnpm build` 通過。

以上條件已完成程式檢查與使用者操作驗收。

## 7. Step 3～6 未來工作

### Step 3：建立實驗紀錄模板

建立例如：

```text
src/data/lab/experiment-record-template.md
```

模板需涵蓋：功能範圍、工時、素材、RWD、原生與套件比較、效能、無障礙、相容性、fallback、隱私授權、驗收與最終採用決策。

### Step 4：完善共用 Lab 結構

- 讓未來 `/lab/...` 實驗頁共用 Layout、控制器與導覽。
- 整理實驗索引資料，避免每個頁面重複維護狀態。
- 此時仍不開始大量功能實驗。

### Step 5：完成搜尋引擎與部署隔離

目前只有 Layout `noindex` 已完成。未來要：

- 正式加入 Sitemap 時明確排除 `/lab/`。
- 正式部署前決定 Lab 公開或隱藏。
- 若不公開，正式建置需同時隱藏首頁入口並排除 `/lab/`。
- 視部署平台評估 `X-Robots-Tag`。

### Step 6：Phase 0 完整 QA

- 360、768、1440 px。
- 鍵盤與焦點順序。
- reduced-motion。
- 音效預設關閉。
- 偏好保存與重設。
- JavaScript 關閉時的可讀性。
- Lab noindex 與未來 Sitemap 排除。
- 正式首頁回歸測試。
- `pnpm build`。
- 確認沒有未經同意的新 dependency。

Phase 0 完成後，才討論第一個功能實驗。企劃中的候選是 Navigation ＋ Page Transition，但開始前仍要由使用者確認。

## 8. 換電腦後的啟動方式

新電腦需要：

- Node.js `>=22.12.0`
- Corepack／pnpm `11.13.0`
- Git

取得專案後執行：

```powershell
pnpm install
pnpm dev --host 127.0.0.1
```

開啟：

```text
首頁：http://127.0.0.1:4321/
Lab：http://127.0.0.1:4321/lab/
```

驗證建置：

```powershell
pnpm build
```

`localhost`／`127.0.0.1` 只代表當下那台電腦；換電腦後必須在新電腦重新啟動 `pnpm dev`。

## 9. Git 與換機注意事項

建立本交接檔之前的狀態：

```text
分支：master
HEAD：ae1ae42 Astro功能實驗室－Phase0交接
遠端：origin/master 與本機 HEAD 同步
工作樹：有 Step 2 程式與本交接檔的未提交變更
```

因此 Step 1 程式與上一版交接檔已在遠端，但 Step 2 尚未 commit、push。

本次 Step 2 新增或修改的控制器、腳本、Layout、索引、CSS 與交接紀錄，在 commit 並 push 前仍只存在目前電腦。

除非使用者明確要求，不要由 Codex 自行 stage、commit 或 push。

## 10. 給下一個 Codex 任務的指示

新任務開始後：

1. 完整閱讀本交接檔。
2. 閱讀 `Astro功能實驗室－企劃書.md`。
3. 執行 `git status` 與 `git log -3 --oneline` 核對狀態。
4. 執行 `pnpm install`，再確認 `pnpm build`。
5. 不要修改正式首頁視覺，除非工作確實需要。
6. 不要新增套件。
7. Step 2 已通過使用者操作驗收。
8. 下一步先規畫 Step 3 實驗紀錄模板，不要直接開始功能實驗。
9. 每完成一步都要讓使用者實際查看並驗收。

可給新任務的第一句：

```text
請先完整閱讀 Astro功能實驗室－Phase0交接.md 與
Astro功能實驗室－企劃書.md，核對 Git 和目前專案狀態。
不要先安裝新套件或修改程式，先告訴我 Phase 0 目前停在哪裡，
並告訴我 Step 3 實驗紀錄模板準備怎麼執行。
```

## 11. 已知的非專案問題

- Codex 內建瀏覽器的自動控制曾發生初始化衝突，無法自動做截圖式 QA。
- 使用者手動開啟 `http://127.0.0.1:4321/lab/` 正常。
- 這是瀏覽器控制環境問題，不是 Astro 頁面或網站路由問題。
