# 厄倫蒂兒好氣質網站－通用工作交接

最後更新：2026-07-18（Asia/Taipei）

這是本專案跨電腦、跨 Codex 任務與跨工作階段的第一入口。接手者必須先讀本文件，再依「恢復工作流程」核對實際 Git 狀態；本文件的 Git 資訊是更新當下的快照，不可取代現場檢查。

## 1. 目前工作快照

| 項目 | 狀態 |
|---|---|
| 專案 | `earendel-so-elegant` |
| Repository | `https://github.com/a5466a5466/earendel-so-elegant.git` |
| 分支 | `master` |
| HEAD | `068ee3e phase 0 step 14 done` |
| 遠端 | `master` 與 `origin/master` 同步 |
| 工作樹 | 有未提交變更：已完成並通過驗收的 Phase 1・Step 15 實作與紀錄 |
| Phase 0 | Step 1～6 完成 |
| Phase 1 | Step 1～15 完成 |
| 下一步 | 取得使用者指示後開始 Step 16・F22 分享與 QR |

最近完成的 Phase 1 功能：

- Step 1／F18：Content Collections、活動列表與動態詳情頁。
- Step 2／F20：Astro Picture、Sharp、響應式圖片、Lazy Loading 與 fallback。
- Step 3／F26：動態、音效、效能的共用偏好 API 與整合頁。
- Step 4／F03：共用 Navigation、手機 Dialog、路由目前位置與麵包屑。
- Step 5／F23：完成多語 Prototype，決策延後至正式站前採用。
- Step 6／F04：採用原生 MPA View Transition，不採 ClientRouter。

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
Astro功能實驗室－Phase1-Step5-F23.md
Astro功能實驗室－Phase1-Step6-F04.md
```

共用技術契約：

```text
src/data/lab/image-policy.md
src/data/lab/preferences-contract.md
src/data/lab/navigation-contract.md
src/data/lab/deployment-policy.md
src/data/lab/phase1a-architecture-baseline.md
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
語系決策：http://127.0.0.1:4321/lab/i18n/
轉場決策：http://127.0.0.1:4321/lab/transitions/
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

## 6. 近期進度與下一步：Phase 1・Step 16

Step 6 已由使用者驗收完成。最終決策為保留普通 Astro MPA 與原生 History，採用 native cross-document View Transition，不採用 ClientRouter。

Step 6 固定契約：

- 長淡入是預設候選；其餘七種動畫依內容語意個別採用。
- 所有效果是漸進增強，不得承擔導覽或狀態傳遞。
- Reduced motion、不支援環境與 JavaScript 關閉時維持普通換頁。
- 後續 script 維持每份文件初始化一次、可重入並提供 dispose。

Step 7 已於 2026-07-16 完成：Lab／正式雙模式、noindex、正式首頁、404、Step 1～6 契約及正式輸出隔離均通過；使用者亦已完成人工驗收。架構基線位於 `src/data/lab/phase1a-architecture-baseline.md`，是 Step 8～17 的固定前置。

Step 8・F05 Scroll Animation 已於 2026-07-16 完成：Prototype 位於 `/lab/scroll/`，原生 CSS、Intersection Observer 與 Scroll Timeline 的 reveal、sticky story、版面高度變更、reduced-motion、節能模式與 observer cleanup 均通過技術及使用者人工驗收。最終決策是不安裝 GSAP／ScrollTrigger。

Step 9・F06 Gallery 已於 2026-07-16 完成：Prototype 位於 `/lab/gallery/`，12 張不同比例本機測試圖、AVIF／WebP、responsive grid、caption、alt、作者／授權、裁切焦點、lazy loading、鍵盤原圖連結與失敗降級均通過技術及使用者人工驗收。最終採用響應式 CSS Grid，不採 Masonry 或額外版面套件。

Step 10・F07 Carousel 已於 2026-07-16 完成：Prototype 位於 `/lab/carousel/`，直接沿用 Step 9 Gallery item 與圖片元件，以原生 CSS Scroll Snap 實作觸控滑動、框外 `<`／`>` 上下頁箭頭、8 個分頁、鍵盤、目前位置與手機下一張提示。不自動播放、不循環，並整合 reduced-motion 與可清理生命週期。Lab／production build、正式輸出隔離及使用者人工驗收均通過；最終採用原生 Scroll Snap，不安裝 Embla。

Step 11・F08 Lightbox 已於 2026-07-16 完成：Prototype 位於 `/lab/lightbox/`，沿用 12 筆 Gallery item 與 `GalleryImage.astro`，以原生 `<dialog>` 實作大圖、框外上下張、Esc／方向鍵／Home／End、觸控滑動、caption、作者／授權、焦點返回、背景鎖定、手機 safe-area 與大圖失敗 fixture。無 JavaScript或不支援 dialog 時縮圖仍是原圖連結。Lab／production build、HTTP 200、重複 ID、正式輸出隔離及使用者人工驗收均通過；最終採用原生 `<dialog>`，不安裝 PhotoSwipe。

Step 12・F09 自有 Video 已於 2026-07-16 完成：Prototype 位於 `/lab/video/`，使用本機生成的 4 秒 WebM／MP4、PNG poster 與繁中 VTT，同時測試有聲內容影片與靜音背景影片。內容影片不 autoplay，桌機標準模式只預載 metadata，手機／節能模式等待使用者載入；背景影片只有桌機＋完整動態＋標準效能才附加來源並靜音播放，其餘只顯示 poster。另有不存在來源的 failure fixture、完整 listener cleanup 與無 JavaScript MP4 連結。Lab／production build、HTTP／MIME、正式輸出隔離及使用者人工驗收均通過；最終採用原生 `<video>`，不安裝播放器套件。

Step 13・F14 YouTube 已於 2026-07-16 完成：Prototype 位於 `/lab/youtube/`，初始使用 Step 12 本機 poster、標題與來源說明，不建立 iframe、遠端圖片或 YouTube API script。使用者點擊後才建立 `youtube-nocookie.com` 隱私增強 iframe，同時間最多一個；第二張驗證指定 60 秒開始與切換時清除舊播放器，第三張模擬禁止嵌入／年齡限制／刪除的站內 fallback。每張卡永久保留 YouTube 外部連結，無 JavaScript 時亦可使用。Lab／production build、HTTP 200、初始第三方零請求結構、正式輸出隔離及使用者人工驗收均通過；固定採用直接 iframe，現階段不載入官方 IFrame API。

Step 14・F10 Audio Player 已於 2026-07-16 完成：Prototype 位於 `/lab/audio/`，以兩個本機生成的八秒 WAV 驗證播放／暫停、進度、單曲音量與曲目資訊。所有主要音源共用 `audio-manager.ts`，同時間最多播放一首；沿用全站音效偏好，預設 off、只能由使用者手勢啟動，切回 off 時立即暫停。播放器離開可視範圍、頁籤隱藏或 MPA pagehide 時亦暫停且不自動恢復。另有延遲要求不存在 WAV 的 failure fixture。Lab／production build、HTTP／MIME、初始無 autoplay、正式輸出隔離及使用者人工驗收均通過；固定採用原生 audio，現階段不需要真實波形或 WaveSurfer。

Step 15・F17 按鍵音效已於 2026-07-18 完成：Prototype 位於 `/lab/sound-effects/`，以單一 effect channel 播放成功、取消與 hover 三種短 WAV，包含快速觸發節流、節能模式、持久靜音、同區重新開啟、頁首偏好同步及切頁清理。Lab／production build、正式輸出隔離與使用者人工驗收均通過；最終採用原生 Audio 與 Step 14 共用 manager，不安裝 Howler。

下一步是 Step 16・F22 分享與 QR；開始前仍需由使用者確認範圍，預計比較 Web Share、Clipboard、靜態／動態 QR、下載與 API 不支援 fallback，不得自行加入 QR 套件。

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
