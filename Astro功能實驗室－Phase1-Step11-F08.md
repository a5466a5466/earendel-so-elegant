# Astro 功能實驗室 Phase 1・Step 11・F08 Lightbox

- 開始日期：2026-07-16
- 目前狀態：完成（技術驗證與使用者人工驗收通過）
- 完成日期：2026-07-16
- 開始前 commit：`77c07d6 phase 1 step 10 done`
- 新增 dependency：無
- Prototype：`/lab/lightbox/`

## 實作範圍

- 直接沿用 Step 9 Gallery Collection 的 12 個 item 與共用 `GalleryImage.astro`，不複製 caption、alt、作者或授權資料。
- 縮圖仍是普通原圖連結；JavaScript 與原生 `<dialog>` 可用時才攔截並增強為 Lightbox。
- 大圖、caption、作者、授權、原圖連結、目前張數、關閉控制與框外上一張／下一張。
- Esc 使用 dialog 原生關閉；方向鍵、Home、End 與左右觸控滑動可切換。
- 開啟後焦點移到關閉按鈕；原生 modal 隔離背景，關閉後焦點回到原縮圖。
- 第一張／最後一張停用對應箭頭，不循環、不複製圖片。
- `env(safe-area-inset-*)`、`svh`、直橫向 `object-fit: contain` 與窄手機控制排列。
- 燈箱開啟時鎖定背景捲動；pagehide 與重新初始化時移除所有 listener 及狀態。
- 獨立 Runtime Failure 入口刻意指向不存在的大圖，保留固定空間、alt、caption、原圖連結與關閉控制。

## 暫定套件決策

原生 `<dialog>` 已涵蓋目前需求的 modal 語意、背景隔離、Escape、焦點限制與漸進降級；上下張、焦點返回和觸控滑動只需小型專用腳本。因此核准不安裝 PhotoSwipe。未來若正式站新增圖片內手勢縮放、平移、深層連結或複雜動畫等明確需求，再重新提出套件評估。

## 技術驗證結果

- [x] `pnpm build:lab` 通過：26 個輸出頁，包含 `/lab/lightbox/`。
- [x] `/lab/lightbox/` 開發伺服器回應 HTTP 200。
- [x] 靜態 HTML 具有 12 個可降級原圖連結、12 個 Picture、1 個 dialog、關閉／上一張／下一張與 live region。
- [x] Lightbox 頁面重複 ID 為 0。
- [x] TypeScript 支援 click、ArrowLeft、ArrowRight、Home、End、原生 Esc close、backdrop、touch swipe、image error 與焦點返回。
- [x] Listener、touch handler、body 狀態與 pagehide 均提供清理；初始化可重入。
- [x] 480 px 下採滿版 `100svh` 與 safe-area；caption／原圖連結改為單欄，圖片以 contain 保留長寬比。
- [x] 無 JavaScript或不支援 `showModal()` 時不攔截縮圖與 failure fixture 的普通連結。
- [x] `pnpm build` 通過；正式輸出無 `/lab/`、`/lab-assets/`、Lightbox bundle 或 Gallery 圖片資產。
- [x] `git diff --check` 無 whitespace error，只有 Windows LF／CRLF 提示。
- [x] 使用者完成 Prototype 操作與視覺確認，核准 Step 11 完成。
- [x] 使用者核准原生 `<dialog>`，不採 PhotoSwipe。

## 人工驗收重點

1. 開啟 `/lab/lightbox/`，點任一縮圖，確認大圖、說明、作者、授權與張數正確。
2. 使用左右框外箭頭走到第一張與最後一張，確認邊界按鈕停用且不循環。
3. 使用鍵盤左右方向鍵、Home、End；按 Esc 或右上角 `×` 關閉。
4. 關閉後焦點應回到剛才的縮圖，頁面瀏覽位置不跳回頂端。
5. 開啟時嘗試 Tab，焦點不應進入背景頁面；背景也不應捲動或被點擊。
6. 手機直向與橫向查看寬圖、方圖、直圖；控制、caption 與關閉鍵不可被瀏海／系統區遮住。
7. 在圖片區左右滑動切換，垂直手勢仍能正常處理，不應誤切圖片。
8. 點擊「開啟失敗降級測試」，確認破圖改為提示，但燈箱高度、說明與關閉控制仍存在。
9. 判斷是否真的需要圖片內雙指縮放／平移；若不需要，固定採原生 `<dialog>`、不安裝 PhotoSwipe。

使用者已於 2026-07-16 完成實際查看與操作驗收；原生 `<dialog>` 版本正式保留，Step 11 關閉。
