# Astro 功能實驗室 Phase 1・Step 9・F06 Gallery

- 開始日期：2026-07-16
- 完成日期：2026-07-16
- 目前狀態：完成，技術驗證與使用者人工驗收均通過
- 開始前 commit：`a576bbd phase1 step 8 done`
- 新增 dependency：無
- Prototype：`/lab/gallery/`

## 實作範圍

- 以既有合法 Placeholder 經 Sharp 產生 12 張 2:1、3:2、4:3、1:1 與多種直式比例圖片。
- Gallery schema 延伸 `position` 與 credit `license`，保留 alt、caption、作者與授權。
- 共用 `GalleryImage.astro` 使用 Astro Picture 輸出 AVIF、WebP 與來源 fallback。
- CSS Grid：桌機四欄、平板兩欄、窄手機一欄；寬幅圖片可跨欄。
- 全部圖片 lazy loading，固定尺寸／比例，原圖連結可用鍵盤操作。
- 另設 runtime 壞路徑，確認圖片失敗時 caption、alt、署名與網格不塌陷。
- Gallery item 作為 Step 10 Carousel 與 Step 11 Lightbox 的唯一共同資料。

## 暫定版面決策

目前採用有明確 DOM 閱讀順序的 CSS Grid，不使用 Masonry。Masonry 對現有 12 張測試圖沒有必要，反而增加載入前後版面變動與鍵盤順序難以預測的風險。最終決策待人工驗收。

## 技術驗證結果

- [x] `pnpm build:lab` 通過：24 個輸出頁、22 個 Lab HTML，包含 `/lab/gallery/`。
- [x] Gallery 輸出 12 個 `<picture>`、12 組 AVIF、12 組 WebP、12 張 lazy 圖片與 12 個原圖連結。
- [x] 12 筆 caption、alt、作者與授權欄位均存在；無 alt 圖片 0、重複 ID 0。
- [x] 12 張來源涵蓋 JPEG／PNG，檔案約 51–121 KB；透明來源維持 PNG fallback。
- [x] Runtime failure 卡存在，保留 3:2 比例、alt、caption 與署名區。
- [x] CSS 靜態確認桌機四欄、900 px 以下兩欄、480 px 以下一欄；寬圖在手機取消跨欄。
- [x] 每張原圖連結具有可見 focus 樣式與至少 44 px 媒體區；不攔截鍵盤或觸控手勢。
- [x] `pnpm build` 通過：最終只保留首頁與 404；Gallery 路由、12 張來源與命名 Lab 資產洩漏均為 0。
- [x] `git diff --check` 無 whitespace error，只有 Windows LF／CRLF 提示。
- [x] 桌機／平板／360 px 欄數、焦點裁切與鍵盤操作由使用者人工確認。
- [x] 使用者核准 CSS Grid，不採 Masonry。

## 人工驗收重點

1. 開啟 `/lab/gallery/`，確認共 12 張合法圖片，比例與 caption 不會互相重疊。
2. 第 4 張超寬幅圖片在桌機／平板跨兩欄，窄手機恢復單欄。
3. 直式與偏左／偏右焦點的圖片主體沒有被不合理裁掉。
4. 逐步縮到平板與約 360 px，確認四欄→兩欄→一欄且沒有水平捲動。
5. 使用 Tab 移動到圖片，應有清楚 focus；Enter 可在新分頁開啟原始測試圖。
6. 最下方失敗圖片維持固定比例，caption 與署名區不會向上塌陷。
7. 判斷目前 CSS Grid 是否足夠；若足夠，固定不採 Masonry。

## 使用者驗收與結論

- 驗收日期：2026-07-16
- 結果：使用者完成 Gallery 版面、圖片與失敗狀態驗證，確認 Step 9 完成。
- 版面決策：採用響應式 CSS Grid；目前不採 Masonry，也不新增 Gallery 版面套件。
- 固定資料：Carousel 與 Lightbox 必須沿用同一份 Gallery item、caption、alt、position 與 credit，不建立第二份圖片狀態。
- 下一步：Step 10・F07 Carousel。
