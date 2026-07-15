# 厄倫蒂兒好氣質網站－Astro 功能實驗室 Phase 0 交接

更新日期：2026-07-15
專案路徑：`C:\Users\Alan_Wu\Documents\earendel-so-elegant`  
目前分支：`master`  
Step 1 程式 commit：`9d83101 Phase 0・Step 1：建立 Lab 與首頁入口`

## 1. 目前進度結論

目前正式停在：

> **Phase 0・Step 1～Step 6 已全部完成。下一個功能實驗尚未開始。**

本專案採用使用者核准後的合併版 Step 1：實驗室骨架、首頁入口、專用 Lab Layout 與響應式 CSS 都屬於同一個 Step 1。不能再把 Lab Layout 重複計算成另一個已完成步驟。

Step 1 已經完成實作、修正版面、通過 Astro build，並由使用者在本機瀏覽器實際查看 `/lab/` 後確認版面修正完成。

Step 2 已實作 viewport、reduced-motion、音效與效能模式控制器，通過 Astro build、靜態輸出檢查，並於 2026-07-15 由使用者確認操作正常。

Step 3 已建立 Markdown／YAML 共用實驗紀錄模板，並於 2026-07-15 由使用者確認模板與預覽頁可以接受。

為方便在網站內驗收，Step 3 另建立 `/lab/record-template/` 預覽頁。此頁直接從實際 Markdown 模板渲染內容，並提供完整 YAML frontmatter 展開檢視；Lab 索引已有「查看模板」入口。

Step 4 已將 Phase 狀態、Lab 導覽與下一個候選實驗移至集中資料檔，建立可供未來子頁共用的 Hero 元件，並讓 Layout 依目前網址正確標示導覽狀態。索引、模板頁與導覽已於 2026-07-15 由使用者確認正常。

Step 5 已實作「開發模式保留、正式 build 預設排除」策略。一般 `pnpm build` 會隱藏首頁入口並移除 `dist/lab/`；`pnpm build:lab` 會保留入口與 Lab 頁面供驗收。兩種建置皆已通過技術驗證。使用者於 2026-07-15 說明目前只在本機測試，未來即使公開也不介意被看見，並同意保留現有實作，因此 Step 5 已完成。

Step 6 的自動與靜態 QA、正式／Lab 雙模式建置已通過，並修正站內 reduced-motion、手機首頁隱藏選單焦點、Escape 關閉與無 JavaScript 手機導覽降級。使用者於 2026-07-15 在本機瀏覽器查看後確認 Step 6 完成。完整結果記錄於 `Astro功能實驗室－Phase0-Step6-QA.md`。

## 2. Step 1～6 狀態表

| Step | 工作 | 狀態 | 說明 |
|---:|---|---|---|
| 1 | 建立實驗室骨架、首頁入口與 Lab Layout | **完成** | `/lab/`、Navbar、專用 Layout、CSS、導覽與 noindex 基礎皆已完成 |
| 2 | 建立最小共用控制器 | **完成** | 開發、技術驗證與使用者操作驗收皆通過 |
| 3 | 建立實驗紀錄模板 | **完成** | 模板、預覽頁、技術驗證與使用者驗收皆通過 |
| 4 | 完善共用 Lab 結構 | **完成** | 開發、技術驗證與使用者頁面驗收皆通過 |
| 5 | 搜尋引擎與部署隔離 | **完成** | 雙模式 build、Sitemap 防呆與公開策略確認皆已完成 |
| 6 | Phase 0 完整 QA | **完成** | 自動檢查、修正、雙模式建置與使用者人工頁面驗收皆完成 |

Step 5 的 `noindex` 是在 Step 1 建立 `LabLayout` 時先完成的基礎保護；其餘部署隔離與驗證已在 Step 5 補齊並完成確認。

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

這些項目已在 Step 6 統一檢查、修正或記錄為未來正式發布時的延伸 QA。

## 6. 已完成：Step 2 最小共用控制器

Step 2 已於 2026-07-15 通過使用者操作驗收。Step 3 也已完成；仍不得直接跳到 Navigation、Page Transition 或其他 F01～F26 實驗。

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

## 7. Step 3～Step 6 已完成成果

### Step 3：建立實驗紀錄模板

已建立：

```text
src/data/lab/experiment-record-template.md
src/pages/lab/record-template.astro
```

模板使用 YAML frontmatter 保存可被程式讀取的狀態與數值，並使用 Markdown 保存測試證據與判斷理由。內容涵蓋功能範圍、工時、素材、RWD、原生與套件比較、效能、無障礙、相容性、fallback、隱私授權、驗收、交付物與最終採用決策。

本階段沒有啟用 Content Collections，也沒有新增 dependency。每個實驗開始時應複製模板並命名為 `FXX-feature-slug.md`，不能直接覆寫共用模板。

Step 3 已於 2026-07-15 通過使用者內容與頁面驗收。

### Step 4：完善共用 Lab 結構

已建立或完成：

```text
src/data/lab/catalog.ts
src/components/lab/LabPageHero.astro
```

- 六個 Phase 0 步驟、Lab 導覽與下一個候選實驗共用同一資料來源。
- 未來 `/lab/...` 子頁可共用 Layout、控制器、導覽與 `LabPageHero`。
- Lab Layout 依目前路徑設定正確的 `aria-current="page"`。
- Lab 索引已從四張寫死卡片改為六個真實 Phase 0 步驟。
- 模板頁已改用共用 Hero，不再自行複製相同結構。
- 此時仍未開始 Navigation、Page Transition 或其他功能實驗。

Step 4 已於 2026-07-15 通過使用者頁面與導覽驗收。

### Step 5：完成搜尋引擎與部署隔離

已建立：

```text
src/data/lab/deployment-policy.md
```

已完成：

- 所有 Lab Layout 保留 `noindex, nofollow, noarchive`。
- 開發模式保留首頁入口與 `/lab/`。
- `pnpm build` 隱藏首頁入口並在 build 完成後移除 `dist/lab/`。
- `pnpm build:lab` 使用 Lab mode，保留入口、索引與模板頁供驗收。
- 正式 build 會掃描 Sitemap；若任何 `sitemap*.xml` 包含 `/lab/`，build 直接失敗。
- 目前未安裝 Sitemap integration，因此正式輸出沒有 Sitemap 檔案。
- 不使用 `robots.txt Disallow` 取代 noindex。

正式 build 驗證結果：首頁與 404 存在、入口隱藏、`dist/lab/` 不存在、Sitemap 數量為 0。

Lab build 驗證結果：首頁入口、Lab 索引與模板頁存在，兩個 Lab HTML 都保留 noindex。

使用者於 2026-07-15 確認目前為本機測試版，且不介意未來公開後被看見，因此接受保留上述現有策略，不再要求額外的公開／隱藏調整。Step 5 至此完成。

### Step 6：Phase 0 完整 QA

詳細紀錄：`Astro功能實驗室－Phase0-Step6-QA.md`

已完成：HTTP／HTML 基線、無 JavaScript 靜態可讀性、音效預設、reduced-motion 程式路徑、noindex、正式／Lab build、首頁回歸、Sitemap 與 dependency 檢查。

已修正：Lab 站內減少動態 CSS、手機首頁關閉選單焦點、Escape 關閉與焦點返回、首頁系統 reduced-motion CSS、無 JavaScript 手機導覽 fallback。

使用者已於 2026-07-15 確認 Step 6 完成。下列項目若未來準備正式公開，可再作延伸 QA，不阻擋目前本機實驗室的 Phase 0 完成：

- 360、768、1440 px。
- 鍵盤與焦點順序。
- reduced-motion 的實際瀏覽器呈現。
- 偏好保存與重設的重新整理操作。
- JavaScript 關閉時的實際頁面呈現。
- Chrome、Edge、Firefox；Safari 與實體手機視環境補測。
- Lighthouse（若要留下本機效能基準）。

Phase 0 已完成。下一步可以討論第一個功能實驗；企劃中的候選是 Navigation ＋ Page Transition，但開始前仍要由使用者確認。

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
HEAD：d4a7aa8 phase 0 step 4 done
遠端：origin/master 與本機 HEAD 同步
工作樹：有 Step 5 設定、政策與本交接檔的未提交變更
```

因此 Step 1～Step 4 與上一版交接檔都已在遠端；Step 5 尚未 commit。

本次 Step 5 新增或修改的 Astro 設定、build 指令、首頁條件入口、部署政策、Phase 狀態與交接紀錄，在 commit 並 push 前仍只存在目前電腦。

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
8. Step 3 已通過使用者內容與頁面驗收。
9. Step 4 已通過使用者頁面與導覽驗收。
10. Step 5 已完成開發、雙模式 build 驗證與使用者策略確認。
11. Step 6 已完成自動檢查、修正、建置與使用者人工頁面驗收，Phase 0 全部完成。
12. 下一步先與使用者確認第一個功能實驗的範圍，不要直接開始實作。
13. 每完成一步都要讓使用者實際查看並驗收。

可給新任務的第一句：

```text
請先完整閱讀 Astro功能實驗室－Phase0交接.md 與
Astro功能實驗室－企劃書.md，核對 Git 和目前專案狀態。
不要先安裝新套件或修改程式，先告訴我 Phase 0 目前停在哪裡，
並先和我確認第一個功能實驗的範圍與執行順序。
```

## 11. 已知的非專案問題

- Codex 內建瀏覽器的自動控制曾發生初始化衝突，無法自動做截圖式 QA。
- 使用者手動開啟 `http://127.0.0.1:4321/lab/` 正常。
- 這是瀏覽器控制環境問題，不是 Astro 頁面或網站路由問題。
