# Astro 功能實驗室 Phase 1・Step 10・F07 Carousel

- 開始日期：2026-07-16
- 目前狀態：完成（技術驗證與使用者人工驗收通過）
- 完成日期：2026-07-16
- 開始前 commit：`3a3cd33 phase 1 step 9 done`
- 新增 dependency：無
- Prototype：`/lab/carousel/`

## 實作範圍

- 直接使用 Step 9 Gallery Collection 的前 8 個 item 與共用 `GalleryImage.astro`。
- 原生 CSS Scroll Snap、觸控／觸控板慣性與下一張露出提示。
- 上一張／下一張、8 個分頁、目前位置與 `aria-live` 狀態。
- Carousel 軌道支援左右方向鍵、Home、End；原圖連結保留鍵盤操作。
- 第一／最後一張 disabled，不複製 slide、不偽造 loop。
- 不自動播放，不需要暫停控制。
- Reduced motion 立即定位；resize、scroll frame、偏好 listener 與 pagehide 可清理。
- JavaScript 關閉時仍可原生水平捲動並閱讀 8 張內容。
- 人工驗收調整：上一張／下一張先改為左右覆蓋箭頭，最終依回饋調整成圖片框外側的 `<`、`>`；左側切上一張、右側切下一張，下方只保留分頁。

## 暫定套件決策

原生 Scroll Snap 已涵蓋正式需求：觸控滑動、按鈕、分頁、鍵盤、目前位置與 responsive peek。Prototype 不需要 loop、複雜拖曳狀態或可變寬精準對齊，因此核准不安裝 Embla Carousel。

## 技術驗證結果

- [x] `pnpm build:lab` 通過：25 個輸出頁、23 個 Lab HTML，包含 `/lab/carousel/`。
- [x] 靜態 HTML 具有 8 slides、8 個 Picture、上一張／下一張、8 個分頁與唯一初始 `aria-current`。
- [x] Carousel viewport 可聚焦，具有 region／carousel 說明；狀態使用 `output` 與 `aria-live="polite"`。
- [x] TypeScript 支援 ArrowLeft、ArrowRight、Home、End；按鈕與分頁共用同一 index／render。
- [x] 原生 Scroll Snap、`touch-action: pan-x pan-y` 與 overscroll containment 保留觸控／垂直手勢。
- [x] 700 px 以下控制器重排；480 px 以下 slide 寬為 viewport 減 64 px，保留下一張提示且分頁可換行。
- [x] 無 autoplay 屬性、`setInterval` 或 `setTimeout`；不自動播放。
- [x] Reduced motion 使用立即定位；resize／scroll animation frame、偏好 listener、所有按鈕與 pagehide listener 均可清理。
- [x] 無 JavaScript 時 8 張內容與水平 Scroll Snap 仍存在；只停用狀態增強。
- [x] 重複 ID 0、無 alt 圖片 0、共用 Navigation 目前位置正確。
- [x] `pnpm build` 通過：最終只保留首頁與 404；Carousel bundle、Gallery 圖片與命名 Lab 資產洩漏均為 0。
- [x] `git diff --check` 無 whitespace error，只有 Windows LF／CRLF 提示。
- [x] 使用者完成 Prototype 操作與視覺確認，核准 Step 10 完成。
- [x] 使用者核准原生 Scroll Snap，不採 Embla。

## 人工驗收重點

1. 開啟 `/lab/carousel/`，使用上一張／下一張走完 8 張；第一張上一張 disabled，最後一張下一張 disabled。
2. 點擊 1～8 分頁，可直接定位，位置文字與黑色目前分頁同步。
3. 將焦點移到圖片軌道，使用左右方向鍵、Home、End。
4. 直接拖曳水平捲軸、觸控板或手機左右滑動，狀態應跟著最近的 slide 更新。
5. 手機寬度應露出下一張一小部分；按鈕與分頁不超出畫面，也不阻止垂直捲動。
6. 切換「減少動態」，按鈕／分頁應立即定位，不播放平滑捲動。
7. 前往其他 Lab 頁再返回、調整視窗寬度，Carousel 仍可正常操作。
8. 判斷原生 Scroll Snap 是否足夠；若足夠，固定不採 Embla。

使用者已於 2026-07-16 完成實際查看與操作驗收；框外 `<`、`>` 箭頭版本暫定保留，Step 10 正式關閉。
