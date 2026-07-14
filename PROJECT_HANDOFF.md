# 厄倫蒂兒好氣質網站－Codex 任務交接

更新日期：2026-07-14

## 1. 新任務開始方式

專案目前位於：

```text
C:\Users\Alan_Wu\Documents\earendel-so-elegant
```

新 Codex 任務開始後，請先完整閱讀：

1. `PROJECT_HANDOFF.md`（本文件）
2. `第一階段工具與開發流程.md`
3. `厄倫蒂兒粉絲應援網站－開發計畫書.md`

建議給新任務的第一句：

```text
請先完整閱讀 PROJECT_HANDOFF.md 與兩份計畫書，核對目前專案狀態，
不要先修改或安裝任何東西，然後告訴我下一步建議做什麼。
```

## 2. 專案定位

- 對外中文名稱：`厄倫蒂兒好氣質`
- Vtuber 英文名稱：`Earendel`
- 內部專案／套件名稱：`earendel-so-elegant`
- 專案類型：以粉絲應援活動成果展示為主的網站
- 主要內容：相片、影片、音訊、活動成果、YouTube 與社群貼文
- 第一版重點：大約 90% 前端，先在本地完成 prototype
- Cloudflare Pages、Cloudflare R2 與正式部署：延後討論

`package.json` 的英文名稱只是開發工具使用的內部識別名稱；網站畫面可以並預計使用中文名稱。

## 3. 已確認的技術決策

- 主框架：Astro
- UI：Astro 元件＋HTML＋原生 CSS
- 互動：原生 TypeScript
- TypeScript：strict mode
- 套件管理器：pnpm
- 第一版內容來源：Markdown／JSON，之後使用 Astro Content Collections
- React：目前不安裝；未來確有局部複雜互動需求時才評估加入
- 動畫：先使用 CSS 與 Astro 能力；複雜時間軸才評估 GSAP
- Carousel：先做原生 prototype；確認需求後才評估 Embla Carousel
- 大型媒體與部署：目前不設定 Cloudflare Pages／R2

## 4. 目前開發環境

已驗證的版本：

- Windows
- Node.js：`24.18.0`
- npm：`11.16.0`
- Corepack：`0.35.0`
- pnpm：`11.13.0`
- Astro：`7.0.9`
- Chocolatey：`2.7.3`
- Python：`3.14.6`
- Visual Studio Build Tools 2026 與 C++ x86/x64 workload：已安裝
- VS Code、GitHub Copilot、Codex：作為主要開發工具

PowerShell CurrentUser execution policy 已設為 `RemoteSigned`。

## 5. Astro 初始化狀態

Astro 已在專案根目錄初始化完成。

目前主要檔案：

```text
astro.config.mjs
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
tsconfig.json
public/
src/pages/index.astro
```

重要設定：

- `package.json` 名稱是 `earendel-so-elegant`
- `packageManager` 固定為 `pnpm@11.13.0`
- `engines.node` 是 `>=22.12.0`
- Astro 目前使用 `^7.0.9`
- `tsconfig.json` 繼承 `astro/tsconfigs/strict`
- `astro.config.mjs` 仍是空白的標準設定，沒有加入 integration

目前 `src/pages/index.astro` 還是 Astro minimal 範本：

- `<html lang="en">`
- 瀏覽器標題是 `Astro`
- 頁面只有 `<h1>Astro</h1>`

這些都是待下一階段修改的預設內容，不代表最終網站名稱或語言。

## 6. 已完成的驗證

以下項目已成功：

- `pnpm install`
- `pnpm build`
- Astro 靜態輸出產生於 `dist/`
- 本地開發伺服器曾成功監聽 `http://127.0.0.1:4321/`
- 本地首頁 HTTP 回應為 `200`
- 回傳內容類型為 `text/html`
- 回傳 HTML 含 Astro 預設首頁內容

資料夾由中文名稱改為英文名稱後，已在新路徑重新執行 `pnpm install`，因此 `node_modules` 目前對應新路徑。

## 7. 尚未安裝或尚未設定

目前不要假設下列項目已經存在：

- React
- Vue
- Svelte
- GSAP
- Embla Carousel
- Tailwind CSS
- Astro Content Collections 的 schema／內容目錄
- Astro View Transitions 的頁面實作
- Prettier
- ESLint
- Astro Check（可能需要額外套件）
- Cloudflare Pages
- Cloudflare R2
- GitHub 遠端儲存庫／部署流程
- 正式圖片、影片、音訊或角色素材

安裝任何新 dependency 前，必須先說明用途、替代方案、整合成本與是否真的有必要，並取得使用者同意。

## 8. Git 狀態

- 原本已存在 `.git`。
- 兩份中文計畫書已在 Git 追蹤中。
- Astro 初始化產生的檔案目前尚未 commit。
- 不要自行 stage、commit、建立 branch、push 或建立 GitHub repository，除非使用者明確要求。

## 9. Codex 專案路徑問題

專案最初位於：

```text
C:\Users\Alan_Wu\Documents\幫厄倫蒂兒寫一個網站
```

後來改名為：

```text
C:\Users\Alan_Wu\Documents\earendel-so-elegant
```

舊 Codex 任務仍記錄舊中文工作目錄，因此可能顯示：

```text
ENOENT: no such file or directory, stat 'C:\Users\Alan_Wu\Documents\幫厄倫蒂兒寫一個網站'
```

這不是 Astro 或專案檔案損壞，而是舊 Codex 任務的工作目錄紀錄沒有更新。新任務必須由英文資料夾建立。

## 10. 使用者的協作偏好

本專案採「一步一步確認」方式進行。

必須遵守：

- 不要擅自替使用者決定專案名稱、網站名稱、框架、套件、目錄或部署方式。
- 不要因為初始化工具有預設值，就把預設值當成使用者已同意的決策。
- 遇到會影響專案方向的選擇，先用白話解釋它是什麼、優缺點與整合風險。
- 使用者特別擔心 AI 產生的程式只完成一半，或套件彼此不相容；應優先維持簡單、可驗證、低相依的架構。
- 能以 Astro、HTML、CSS、原生 TypeScript 清楚完成時，先不要加入前端框架。
- 每完成一步都要驗證，再說明結果與下一步。
- 若只是內部技術識別名稱，也要先說明它與網站顯示名稱的差異。
- 重大變更與新增 dependency 必須先取得確認。

## 11. 建議的下一步

初始化已完成，下一步尚未執行。

建議順序：

1. 先確認本地端 `pnpm dev` 能在新 Codex 任務中正常啟動。
2. 和使用者確認第一個 prototype 頁面要呈現的最小內容。
3. 先討論並決定首頁基本區塊，不要直接套用完整視覺設計。
4. 將 `index.astro` 的語言改為繁體中文，並設定已確認的中文顯示名稱。
5. 建立最小的頁面結構與原生 CSS，再讓使用者在瀏覽器驗收。
6. 之後才逐步加入圖片、動畫、Carousel、影音與內容系統。

第一個 prototype 可討論的最小區塊候選：

- Header／網站名稱
- Hero 主視覺區
- 應援活動成果摘要
- 圖片展示區
- YouTube／社群內容區
- Footer

這些只是討論候選，不代表使用者已經同意全部實作。

## 12. 現有規劃文件

詳細範圍與技術比較請閱讀：

- `厄倫蒂兒粉絲應援網站－開發計畫書.md`
- `第一階段工具與開發流程.md`

若本交接文件與實際程式狀態不一致，以實際檔案與重新執行的驗證結果為準，並先向使用者說明差異。
