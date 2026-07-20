# Astro 功能實驗室 Phase 1・Step 18・整合 QA 與結案

- 開始日期：2026-07-20
- 完成日期：2026-07-20
- 目前狀態：完成（自動、靜態、瀏覽器技術檢查與使用者最終人工驗收均通過）
- 開始前 commit：`279ddc6 phase 1 step 17 done`
- 分支：`master`
- 新增 dependency：無

## 本輪範圍

- 回歸 Step 1～17 的資料、圖片、偏好、導覽、轉場、Gallery、Carousel、Lightbox、影音、分享與搜尋契約。
- 驗證 360、768、1440 px 的主要路由、鍵盤操作、History、焦點返回與媒體清理。
- 執行 Lab／正式雙模式 build，檢查 noindex、內部連結、重複 ID、正式輸出隔離、首頁、404、Sitemap 與 dependency。
- 分開記錄技術通過、工具限制、延伸 QA 與使用者人工驗收。
- 修正通用交接、舊任務交接與 README 的文件落差。

## 自動與靜態檢查

### Lab build

- [x] `pnpm build:lab` 通過，共產生 32 頁。
- [x] `dist/lab/` 共有 30 個 Lab HTML。
- [x] 30 個 Lab HTML 均包含 `noindex, nofollow, noarchive`。
- [x] 重複 ID：0 頁。
- [x] 缺少共用 Navigation／手機選單：0 頁。
- [x] Lab 內部連結指向不存在輸出：0 筆。
- [x] Lab 模式首頁保留 `/lab/` 入口。

### 正式 build

- [x] `pnpm build` 通過；輸出守門在 Astro 產生 29 頁後移除 Lab 路由與專用資產。
- [x] `dist/index.html` 與 `dist/404.html` 存在。
- [x] `dist/lab/`、`dist/lab-assets/` 不存在。
- [x] 正式首頁不包含 `/lab/` 入口。
- [x] Lab 元件、導覽、偏好、搜尋、媒體與測試圖片命名 bundle 殘留：0。
- [x] Sitemap：目前 0 份；因此沒有 `/lab/` 洩漏。
- [x] `git diff --check` 沒有 whitespace error；Windows 只回報 LF／CRLF 提示。

### 環境與 dependency

- [x] Node.js：`v24.18.0`。
- [x] pnpm：`11.13.0`。
- [x] `pnpm list --depth 0` 只有 `astro@7.0.9` 與已核准的 `sharp@0.35.3`。
- [x] 沒有未核准 dependency。

## 瀏覽器整合檢查

使用 Codex 內建瀏覽器連接 `http://127.0.0.1:4321/`。主要矩陣涵蓋 `/lab/`、活動列表、活動詳情、Gallery、Carousel、Lightbox、Video、YouTube、Audio 與 Search。

### RWD 與文件基線

- [x] 360 × 800、768 × 900、1440 × 1000 三種 viewport，共 30 組路由／尺寸檢查均無水平溢出。
- [x] 每組均只有一個 `<h1>`、一個 `<main>`，`lang="zh-Hant"` 正確。
- [x] 每組均保留正確 Lab noindex。

### 導覽、鍵盤與 History

- [x] 360 px 手機選單可開啟原生 dialog，開啟後焦點位於關閉按鈕。
- [x] 點擊關閉後 dialog 關閉、`aria-expanded="false"`，焦點回到「選單」按鈕。
- [x] Search 輸入「生日」後 URL 寫入 `q`，結果由 3 筆變 1 筆。
- [x] 標籤「線上應援」顯示 2 筆；再組合 Gallery 顯示 1 筆。
- [x] 返回鍵由組合條件回到只有標籤，URL、表單與 2 筆結果同步恢復。
- [x] Carousel 在軌道按 `ArrowRight` 由 `1 / 8` 到 `2 / 8`；按 `End` 到 `8 / 8` 並停用下一張。

### Lightbox 與媒體生命週期

- [x] Lightbox 12 個縮圖入口存在；開啟第一張後 dialog、背景鎖定與關閉按鈕焦點正確。
- [x] 下一張更新為 `圖片 2 / 12` 並輸出 live announcement。
- [x] 關閉後焦點回到原縮圖，背景鎖定狀態於 close event 後清除。
- [x] YouTube 初始 iframe 為 0，沒有遠端 YouTube／Google script。
- [x] 載入第一張後只有一個 `youtube-nocookie.com` iframe；切到第二張後仍只有一個，舊 iframe 被移除，並帶入 `start=60`。
- [x] Audio 頁離開後新文件沒有 audio element 或殘留播放狀態。
- [x] 本輪瀏覽器控制台 error／warning：0。

## 工具限制與延伸 QA

以下不誤標為自動通過：

- 內建瀏覽器環境沒有實際播放測試 WAV；互斥播放的「真的有聲」需由使用者人工確認。
- 內建瀏覽器的合成 Escape 輸入沒有可靠觸發原生 dialog cancel；關閉按鈕與焦點返回已通過，Escape 保留人工確認。
- 內建瀏覽器本輪截圖逾時；RWD 使用 DOM 尺寸與水平溢出資料驗證，主觀視覺仍由人工查看。
- 尚未執行 Firefox、Safari／iOS Safari、Android Chrome、實體手機、螢幕閱讀器與完整跨瀏覽器矩陣。
- Lighthouse、網路節流與正式素材容量預算，仍等待正式內容與部署環境。
- X／Threads 真實嵌入、正式 YouTube 內容、社群平台分享預覽與正式網址 QR，尚未進入本階段。

## Phase 1 決策彙整

| 範圍 | 結論 |
|---|---|
| Content Collections、Navigation、搜尋、分享 | 採用 Astro／瀏覽器原生能力 |
| 圖片最佳化 | 採用 Astro Picture 與已核准 Sharp |
| 偏好與生命週期 | 採用單一共用 API 與 `earendel-lab-preferences-v1` |
| 多語系 | Prototype 完成；正式站前延後，未來繁中無 prefix、日文／英文有 prefix |
| Page Transition | 採原生 cross-document View Transition；不採 ClientRouter |
| Scroll Animation | 採 CSS／Intersection Observer；不安裝 GSAP |
| Gallery／Carousel／Lightbox | 採 CSS Grid／Scroll Snap／原生 dialog；不安裝 Masonry、Embla、PhotoSwipe |
| Video／Audio／按鍵音效 | 採原生媒體 API；不安裝播放器、WaveSurfer、Howler |
| YouTube | 採點擊後建立 `youtube-nocookie.com` iframe；目前不載入 IFrame API |
| QR Code | 正式網域與實體情境未固定，延後 |
| Pagefind | 目前只有 3 筆資料，延後到內容量與全文搜尋需求成立時再評估 |

Phase 1 實際執行日期為 2026-07-15～2026-07-20。既有 Step 文件記錄了每一步的開始／完成日期，但沒有一致記錄可加總的小時數，因此本次不虛構實際工時；Phase 2 應從第一個 Step 起補上研究、實作、素材、修正與 QA 的實際時數欄位。

## Phase 2 前置判定

技術上可以開始規劃 Phase 2，但仍需由使用者另行確認範圍，不自動開始。前置條件：

1. 使用者已完成下方人工驗收並於 2026-07-20 明確確認 Phase 1 結案。
2. X／Threads 實驗開始時重新確認官方嵌入政策、隱私、失效與 fallback。
3. 動畫滑鼠先取得有明確 hotspot、尺寸與授權的測試素材，觸控裝置維持停用。
4. 正式站整合前另行確認正式素材、內容架構、網域、Cloudflare Pages／R2 與部署策略。

## 使用者最終人工驗收

- [x] 在 360、768、1440 px 快速查看 Lab 首頁、活動、Gallery、Carousel、Lightbox、Video、Audio、YouTube、分享與搜尋，確認主觀視覺無異常。
- [x] 以鍵盤確認 skip link、手機選單 Escape、Carousel、Lightbox 與焦點返回。
- [x] 開啟音效後播放兩首 Audio，確認第二首會暫停第一首；切頁後不會繼續出聲。
- [x] 重複開關 Lightbox、YouTube、Video 與 Audio，確認沒有重複播放器或殘留聲音。
- [x] 確認上述延伸 QA 可留待正式內容／部署階段，不阻擋 Phase 1 結案。
- [x] 使用者已於 2026-07-20 明確確認 Phase 1 完成。

## 最終結論

技術檢查與使用者人工驗收均已完成，未發現阻擋 Phase 1 結案的程式問題。Phase 1 於 2026-07-20 正式結案；本輪文件尚未 commit，因此最終 commit 欄位須在使用者另行要求提交後更新。
