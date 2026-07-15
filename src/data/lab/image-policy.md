# Lab 活動圖片政策

更新日期：2026-07-15
適用階段：Phase 1・Step 2 起

## 1. 來源與存放位置

- 可由 Astro 最佳化的活動圖片放在 `src/assets/`。
- Content Collection 使用 `image()` 驗證本機圖片存在並取得原始尺寸。
- `public/lab-assets/` 只保留未最佳化的 SVG placeholder，作為比較、緊急背景 fallback 或不需轉換的公開檔案。
- 正式大型原圖與影音是否改放 R2，留待正式內容與部署階段決定。

## 2. 輸出格式

- `<Picture />` 依序提供 AVIF、WebP，再退回來源格式。
- 不透明來源使用 JPEG fallback。
- 透明來源使用 PNG fallback，不轉成會失去 alpha 的 JPEG。
- 圖片品質固定使用 Astro `mid` preset，正式素材可在 Step 2 驗收後依畫質再調整。

## 3. Responsive widths 與 sizes

活動卡：

```text
widths: 360, 540, 720, 900
sizes: 360～640 px 使用單欄；641～900 px 使用雙欄；桌機約 31vw、上限約 352 px
```

活動詳情主圖：

```text
widths: 640, 900, 1200
sizes: 小於內容容器時使用 viewport 寬度；桌機上限 1120 px
```

所有圖片輸出固定 `width`、`height` 與 3:2 容器比例，避免載入完成前版面高度為零。

## 4. Loading 規則

- 圖片管線頁只保留一張代表性 priority 示範圖，活動詳情主圖也作為獨立頁面的 priority 案例，輸出 eager／sync／high。
- 活動列表卡全部輸出 lazy／async。
- 正式站只應對真正可能成為 LCP 的首屏圖片使用 priority，不得讓大量圖片同時 eager loading。
- CSS 背景與 public fallback 不取代主要圖片的 alt。

## 5. 失敗 fallback

- Content Collection 的本機來源不存在時，build 必須以 `ImageNotFound` 失敗，不允許壞路徑進入正式輸出。
- `<Picture />` 依序退回 AVIF、WebP、來源格式。
- 圖片外層保留 3:2 比例與 public SVG 背景；即使請求失敗，版面不塌陷，alt 仍存在。
- Lab 列表保留一個刻意失敗的圖片案例，只用於人工確認 runtime fallback。
- 正式 build 不產生活動圖片轉換；輸出守門會移除 `/lab-assets/` 與三個已登記的 Lab 活動來源前綴，避免刪除 Lab 頁面後留下孤兒圖片。新增 Lab 專用圖片來源時，必須同步登記正式輸出清理前綴。

## 6. 遠端圖片

Phase 1・Step 2 不允許活動資料直接使用未核准遠端圖片。若未來需要遠端來源：

1. 先確認來源、授權、穩定網址與失效替代圖。
2. 在 Astro `image.domains` 或 `image.remotePatterns` 建立最小 allowlist。
3. 提供可靠 width／height，或只對已核准網域使用 `inferSize`。
4. 驗證 build timeout、遠端失效、快取與正式部署成本。
5. 未通過以上條件時，改用本機縮圖與外部原文連結。

## 7. 素材更新流程

目前三張 raster placeholder 由可信任的本機 SVG 產生。更新來源後執行：

```powershell
node scripts/generate-lab-event-images.mjs
pnpm build:lab
```

生成腳本使用已核准的 `sharp`，只在開發／build 階段執行，不進入瀏覽器 bundle。
