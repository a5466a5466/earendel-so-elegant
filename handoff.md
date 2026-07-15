# 厄倫蒂兒好氣質網站－通用工作交接

最後更新：2026-07-15（Asia/Taipei）

這是本專案跨電腦、跨 Codex 任務與跨工作階段的第一入口。接手者必須先讀本文件，再依「恢復工作流程」核對實際 Git 狀態；本文件的 Git 資訊是更新當下的快照，不可取代現場檢查。

## 1. 目前工作快照

| 項目 | 狀態 |
|---|---|
| 專案 | `earendel-so-elegant` |
| Repository | `https://github.com/a5466a5466/earendel-so-elegant.git` |
| 分支 | `master` |
| HEAD | `bea7449 phase 1 step 4 done` |
| 遠端 | `master` 與 `origin/master` 同步 |
| 工作樹 | 有未提交變更：本次新增的 `handoff.md` |
| Phase 0 | Step 1～6 完成 |
| Phase 1 | Step 1～4 完成 |
| 下一步 | Step 5：F23 多語系路由決策（尚未開始） |

最近完成的 Phase 1 功能：

- Step 1／F18：Content Collections、活動列表與動態詳情頁。
- Step 2／F20：Astro Picture、Sharp、響應式圖片、Lazy Loading 與 fallback。
- Step 3／F26：動態、音效、效能的共用偏好 API 與整合頁。
- Step 4／F03：共用 Navigation、手機 Dialog、路由目前位置與麵包屑。

每個 Step 都已完成技術檢查與使用者確認。詳細決策不能只從程式碼推測，應讀取對應紀錄。

## 2. 權威文件閱讀順序

1. `handoff.md`（本文件）。
2. `Astro功能實驗室－Phase1執行計畫與紀錄.md`（目前 Step、範圍與完成閘門）。
3. 最新已完成 Step 與準備開始 Step 的紀錄文件。
4. `Astro功能實驗室－企劃書.md`（F01～F26 功能邊界與套件規則）。
5. `厄倫蒂兒粉絲應援網站－開發計畫書.md`（正式網站資訊架構與長期方向）。
6. 需要 Phase 0 背景時，再讀 `Astro功能實驗室－Phase0交接.md` 與 `Astro功能實驗室－Phase0-Step6-QA.md`。

目前相關 Step 紀錄：

```text
Astro功能實驗室－Phase1-Step1-F18.md
Astro功能實驗室－Phase1-Step2-F20.md
Astro功能實驗室－Phase1-Step3-F26.md
Astro功能實驗室－Phase1-Step4-F03.md
```

共用技術契約：

```text
src/data/lab/image-policy.md
src/data/lab/preferences-contract.md
src/data/lab/navigation-contract.md
src/data/lab/deployment-policy.md
```

## 3. 換電腦後的環境準備

需求：

- Git。
- Node.js `>=22.12.0`；目前驗證版本為 `v24.18.0`。
- Corepack／pnpm；專案固定 `pnpm@11.13.0`。

首次取得專案：

```powershell
git clone https://github.com/a5466a5466/earendel-so-elegant.git
Set-Location earendel-so-elegant
corepack enable
pnpm install --frozen-lockfile
```

若專案已存在：

```powershell
Set-Location <專案路徑>
git status --short --branch
git log -5 --oneline
git fetch --prune
```

不要在有未確認本機修改時直接 pull、reset 或 checkout。先辨認修改屬於誰、是否已提交，再決定如何同步。

## 4. 啟動與建置

啟動本機開發伺服器：

```powershell
pnpm dev --host 127.0.0.1
```

常用網址：

```text
首頁：http://127.0.0.1:4321/
Lab：http://127.0.0.1:4321/lab/
活動：http://127.0.0.1:4321/lab/events/
偏好：http://127.0.0.1:4321/lab/preferences/
紀錄模板：http://127.0.0.1:4321/lab/record-template/
```

建置：

```powershell
pnpm build:lab
pnpm build
```

- `pnpm build:lab` 保留 Lab 路由、首頁入口與實驗資產，供本機驗收。
- `pnpm build` 是正式模式：保留正式首頁與 404，移除 `/lab/`、`/lab-assets/`、Lab 專用 CSS／JavaScript／圖片，並檢查 Sitemap 不含 `/lab/`。
- 正式 build 會覆寫 `dist`；若之後要繼續查看 Lab 靜態輸出，最後再執行一次 `pnpm build:lab`。

## 5. 恢復工作流程

每次換電腦或開新任務，依序執行：

1. 完整閱讀本文件與 Phase 1 主控文件。
2. 執行 `git status --short --branch` 與 `git log -5 --oneline`。
3. 確認本文件記載的 HEAD 是否仍是最新 checkpoint；若不同，以 Git 與最新 Step 紀錄為準。
4. 執行 `pnpm install --frozen-lockfile`。
5. 執行 `pnpm build:lab` 與 `pnpm build`，確認新電腦基線。
6. 啟動 dev server，打開 `/lab/` 確認 HTTP 與頁面可用。
7. 告知使用者目前完成到哪一步、下一步是什麼；取得開始指示後才改為「執行中」。
8. 一次只完成一個 Step：實作、技術驗證、使用者人工驗收、更新紀錄，再進下一步。

可交給新 Codex 任務的開場指令：

```text
請先完整閱讀 handoff.md、Astro功能實驗室－Phase1執行計畫與紀錄.md，
再核對 git status、git log 與 package.json。不要先修改程式或安裝套件；
先告訴我目前完成到哪個 Step、工作樹是否乾淨，以及下一個 Step 的範圍。
```

## 6. 下一步：Phase 1・Step 5

F23 多語系路由決策尚未開始。目標是在頁面繼續增加前，留下「Phase 1 採用」、「正式站前延後」或「不採用」的單一結論。

預定範圍：

- 使用最小繁中／日文／英文 placeholder 比較候選 URL。
- 決定預設語言是否帶 prefix、語言切換與缺翻譯 fallback。
- 檢查日期、文字長度、字型、換行、`lang` 與 `hreflang`。
- 評估翻譯、校對與內容維護成本。
- 優先評估 Astro 內建 i18n，不安裝翻譯套件。

Step 5 可以採用、延後或不採用，但不能以「之後再看」作結。開始前仍應由使用者確認本輪範圍。

## 7. 目前架構與重要限制

- Astro：`^7.0.9`。
- Sharp：`0.35.3`，已由使用者明確核准，用於圖片處理；它不是 AI 圖片生成器。
- 不得未經使用者核准新增 dependency。
- 專案沒有直接安裝 `tsc`／`@astrojs/check`；不要為了執行型別命令自行安裝。現階段以 Astro build 作為編譯基線。
- Content Collection schema 位於 `src/content.config.ts`。修改 schema 後應重新啟動 dev server，不能只依賴 HMR。
- Lab 偏好只使用 `earendel-lab-preferences-v1`，後續功能不得建立第二份 localStorage 或 reduced-motion 狀態。
- Lab 內部路由使用普通 `<a>` 與 Astro file routing；Step 4 沒有攔截 History。Page Transition／ClientRouter 要等 Step 6 決策。
- 手機、完整鍵盤、深層路由與返回行為已保留技術實作，但使用者決定它們不作為目前本機 Prototype 的追加人工 QA 阻擋條件。
- 正式首頁視覺不應因 Lab 實驗被任意修改。

## 8. 已知工具／環境狀況

- Codex 內建瀏覽器自動控制曾出現 `Cannot redefine property: process`，屬工具初始化問題，不是 Astro 頁面錯誤。
- 本機網址可正常以一般瀏覽器／Codex 內建瀏覽器手動查看；若自動視覺 QA 不可用，必須明確交由使用者人工驗收，不得誤標為自動通過。
- Windows 下 `git diff --check` 可能顯示 LF 將轉 CRLF 的提示；只要沒有 whitespace error，不視為失敗。

## 9. 工作與 Git 規則

- 未經使用者要求，不自行 stage、commit、push、建立 PR 或改分支。
- 工作樹若不乾淨，既有修改視為使用者資產；不要 reset、checkout 或覆寫無關內容。
- 每個 Step 必須保留：開始前 commit、範圍、dependency 決策、自動／靜態證據、人工驗收與最終結論。
- 使用者確認完成後，同步更新 Phase 1 主控文件、該 Step 紀錄與本文件的「目前工作快照」。
- Commit 後才更新本文件的 HEAD；尚未 commit 的工作必須明確寫成「工作樹有未提交變更」。

## 10. 更新本文件的最小清單

每次完成或中斷工作時，至少更新：

- 最後更新日期。
- 分支、HEAD、遠端同步與工作樹狀態。
- 已完成到哪個 Step。
- 下一個 Step 或具體阻擋條件。
- 新增／移除的 dependency。
- 新增的契約、路由與重要檔案。
- 尚未執行或經使用者決定延後的人工 QA。
- 新發現的工具或環境問題。
