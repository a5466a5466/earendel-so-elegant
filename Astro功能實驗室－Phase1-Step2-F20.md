# Astro 功能實驗室 Phase 1・Step 2 F20 紀錄

- 更新日期：2026-07-15
- 狀態：完成（使用者已人工驗收）
- 完成日期：2026-07-15
- 對應功能：F20 圖片最佳化與 Lazy Loading
- 開始前 commit：`397cad4 phase1 step1 done`
- 新增 dependency：`sharp@0.35.3`（使用者於 2026-07-15 明確核准）

## 1. 本輪核准範圍

- 使用同一批活動測試圖片建立 Astro 圖片最佳化管線。
- 驗證 AVIF、WebP 與來源格式 fallback。
- 建立卡片與詳情頁的 responsive `srcset`／`sizes`。
- 區分 Featured／詳情主圖 priority 與其他卡片 lazy loading。
- 驗證不透明 JPEG 與透明 PNG 來源。
- 驗證不存在的 Content Collection 本機圖片會阻止 build。
- 建立 runtime 圖片失敗 fallback 展示。
- 定義本機、public、遠端圖片與素材更新政策。
- 不實作 Gallery、Carousel、Lightbox 或正式活動視覺。

## 2. 套件決策

第一次使用 Astro `<Picture />` 建置時，Astro 回報 `MissingSharp`。`<Picture />` API 是 Astro 內建能力，但本機 build-time 的 AVIF／WebP 轉換需要圖片服務。

使用者明確核准安裝：

```text
sharp@0.35.3
```

Sharp 只在素材生成與 Astro build 階段使用，不會加入瀏覽器 JavaScript bundle。

安裝後曾評估直接 rasterize SVG，但 Astro 預設禁止處理 SVG，除非啟用 `image.dangerouslyProcessSVG`。本 Step 沒有降低全站安全預設，而是先用已核准的 Sharp 將可信任本機 SVG 轉成 JPEG／透明 PNG，再交給 Astro 圖片服務。

## 3. 實作結果

### 3.1 圖片來源

| 圖片 | Source | Raster input | 原始大小 |
|---|---|---|---:|
| 星光生日 | 本機 SVG | 2400×1600 JPEG | 185,412 bytes |
| 盛夏來信 | 本機 SVG | 2400×1600 JPEG | 133,992 bytes |
| 月光留言 | 透明本機 SVG | 2400×1600 PNG | 223,480 bytes |

`scripts/generate-lab-event-images.mjs` 可重建以上 raster input。public SVG 繼續作為未最佳化對照與背景 fallback。

### 3.2 Content Collection

- `cover` 與 Gallery `src` 改用 `image()`，不存在的本機檔案會阻止建置。
- 新增 `fallbackCover`，限制在 `/lab-assets/events/`。
- 新增 `coverPosition`，讓活動資料可決定裁切焦點。
- 所有活動封面已遷移至 `src/assets/lab/events/raster/`。

### 3.3 共用圖片元件

`OptimizedEventImage.astro` 統一提供：

- `<Picture />`。
- AVIF → WebP → JPEG／PNG fallback。
- `quality="mid"`。
- 卡片 360／540／720／900 px。
- 詳情 640／900／1200 px。
- 各使用情境的 `sizes`。
- priority 或 lazy loading。
- 3:2 尺寸預留、裁切焦點與 public SVG 背景 fallback。

### 3.4 遠端策略

目前活動 schema 只使用本機圖片。未來若需遠端圖片，必須先設定最小 allowlist、尺寸或 `inferSize`、授權、失效 fallback 與 build timeout 策略。完整規則記錄於 `src/data/lab/image-policy.md`。

## 4. 自動與靜態檢查

| 項目 | 結果 | 證據 |
|---|---|---|
| `sharp@0.35.3` 安裝 | 通過 | package 與 lockfile 已更新，pnpm supply-chain policy 通過 |
| raster 素材生成 | 通過 | 2 張 JPEG、1 張透明 PNG，皆為 2400×1600 |
| Content image sync | 通過 | 三筆活動與 Gallery 本機圖片皆通過 `image()` |
| `pnpm build:lab` | 通過 | 8 頁與 57 個最佳化圖片工作完成 |
| AVIF | 通過 | 產生 18 個輸出，約 1,861～24,211 bytes |
| WebP | 通過 | 產生 18 個輸出，約 1,486～47,446 bytes |
| JPEG fallback | 通過 | 產生 14 個輸出，約 3,165～49,309 bytes |
| PNG fallback | 通過 | 產生 8 個輸出，約 4,074～223,480 bytes |
| 列表 `<picture>` | 通過 | 3 組，各有 AVIF、WebP、來源格式 |
| 卡片 `srcset` | 通過 | 每組含 360w、540w、720w、900w |
| 卡片 `sizes` | 通過 | 已輸出手機單欄、平板雙欄、桌機卡片寬度規則 |
| priority | 通過 | Loading Priority 代表圖輸出 eager／sync／high |
| lazy loading | 通過 | 下方三張活動卡全部輸出 lazy／async |
| 固定尺寸 | 通過 | 所有 img 輸出 width=2400、height=1600，CSS 保留 3:2 |
| 不存在本機圖片 | 通過（預期失敗） | 暫存資料使 build 回報 `ImageNotFound`，測試檔已刪除 |
| runtime fallback | 通過（靜態） | Lab 有刻意失敗案例、固定比例、背景、alt 與說明 |
| Dependency 邊界 | 通過 | 只新增已核准的 Sharp，無其他 dependency |
| `pnpm build` | 通過 | 正式輸出保留首頁與 404，移除 Lab 路由 |
| 正式圖片隔離 | 通過 | 移除 `/lab-assets/`，Lab 活動來源／最佳化孤兒圖片數為 0 |
| Sitemap | 通過 | 正式輸出 Sitemap 數量為 0 |
| `git diff --check` | 通過 | 無 whitespace error；只有既有 Windows 換行提示 |
| 本機 HTTP | 通過 | 重啟開發伺服器後，列表與 3 個詳情頁皆回應 200；列表含 3 組 Picture |

### 4.1 開發伺服器重啟

修改 Content Collection schema 為 `image()` 後，既有 Astro dev 程序再次只熱更新頁面外框，Collection 資料暫時顯示為空。交付人工驗收前已主動停止舊程序並重新啟動開發伺服器，重新確認 3 張活動卡、3 組 `<picture>` 與 3 個詳情路由全部正常。

日後只要新增或修改 `src/content.config.ts`，都應重新啟動 dev server，不能只依賴 HMR 判斷資料是否已載入。

## 5. 尚待人工瀏覽器驗收

1. 開啟 `http://127.0.0.1:4321/lab/events/`，確認 Hero 已更新為「活動圖片管線 Prototype」。
2. 查看「輸出與降級規則」四張卡：前三張應分別顯示 Responsive Widths、Loading Priority、Transparent Source 代表圖片；第四張刻意失敗圖片仍應保留固定高度、背景、alt／說明，不能讓版面塌陷。
3. 查看三張活動卡，確認圖片清晰、比例一致且沒有載入後跳動。
4. 確認月光留言透明圖能看見深藍 fallback 底色，透明區域沒有被轉成黑色或白色方塊。
5. 點進三個詳情頁，確認主圖清晰、比例與裁切位置合理。
6. 以 360、768、1440 px 檢查列表與詳情頁，確認沒有水平捲動、按鈕遮擋或圖片異常放大。
7. 快速重新整理列表頁，觀察 Featured 星光生日優先顯示，其餘圖片可稍後載入但不能造成版面跳動。
8. 停用 JavaScript，確認 `<picture>`、活動內容與 fallback 仍可閱讀。
9. 若開啟開發者工具 Network，可確認瀏覽器依支援格式選擇 AVIF／WebP，並依 viewport 選擇合理寬度；此項為加值檢查，不阻擋基本人工驗收。

## 6. 目前決策

- 使用 Astro `<Picture />` 與 Sharp：採用。
- 格式順序：AVIF → WebP → 來源 JPEG／PNG。
- 品質：Prototype 固定 `mid`，待正式素材再比較。
- 寬度：卡片 360／540／720／900；詳情 640／900／1200。
- Loading：管線代表圖／詳情主圖 priority，活動列表卡全部 lazy。
- 透明圖：保留 PNG fallback，不轉 JPEG。
- SVG：保留原始與 public fallback，不啟用 `dangerouslyProcessSVG`。
- 遠端圖片：Step 2 不採用；未來需另行設定 allowlist 與失效策略。

## 7. 完成條件

Step 2 技術工作與人工驗收皆已完成。使用者於 2026-07-15 確認頁面可接受，可依主控計畫開始 Step 3。

### 人工驗收修正紀錄

- 發現「輸出與降級規則」代表圖片缺少 `width: 100%`，導致 2400px 原圖只顯示左側背景，中央主體落在卡片可視範圍外。
- 已補上完整寬度、等比例高度與 `object-fit: cover`；三張規則預覽現在與下方活動卡採用一致的 3:2 顯示方式。
- Failure Fallback 原先使用固定 135px 高度，與前三張 3:2 預覽高度不一致，造成標題與說明文字上移。
- 已將失敗預覽改為相同的 3:2 比例，並讓失敗圖片填滿預留區域；載入錯誤時卡片文字仍維持一致基準線。
