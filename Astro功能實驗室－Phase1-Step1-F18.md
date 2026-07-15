# Astro 功能實驗室 Phase 1・Step 1 F18 紀錄

- 更新日期：2026-07-15
- 狀態：完成
- 對應功能：F18 Content Collections／動態活動頁
- 開始前 commit：`c9de26c Astro 功能實驗室 Phase 1・執行計畫與紀錄`
- 新增 dependency：無

## 1. 本輪核准範圍

- 建立活動 Content Collection schema。
- 建立 3 筆合法 placeholder 活動資料。
- 建立 Lab 活動列表與動態詳情頁。
- 驗證日期排序、slug、標籤、選填媒體欄位、署名與相關活動資料。
- 暫時加入錯誤資料，確認 schema 會在 build 階段阻止建置；完成後移除錯誤檔案。
- 不實作 Gallery、Carousel、Lightbox、搜尋、播放器、第三方 embed 或正式活動視覺。
- 不新增套件。

## 2. 實作結果

### 2.1 Content Collection schema

已建立 `src/content.config.ts`，活動資料包含：

- 必填：`title`、`slug`、`date`、`summary`、`cover`、`coverAlt`、`theme`、`tags`、`credits`。
- 選填陣列並提供空陣列預設：`gallery`、`videos`、`audio`、`socialPosts`。
- 狀態：`featured`，預設為 `false`。
- slug 只允許小寫英數與連字號。
- summary 限制為 10～240 字元。
- cover 必須位於 `/lab-assets/events/`。
- 社群與署名連結若存在，必須是合法 URL。
- Gallery、影音、音訊、社群與署名皆有各自的巢狀 schema。

### 2.2 三筆測試資料

| Slug | 用途 | 代表欄位 |
|---|---|---|
| `starlight-birthday-project` | 完整媒體組合 | Featured、Gallery、YouTube、Audio、Social |
| `summer-letter-gallery` | 多圖與多標籤 | 2 筆 Gallery、空影音與社群陣列 |
| `moonlit-message-wall` | 精簡資料 | 無 Gallery／影音／音訊，有共同標籤與外部連結 |

三張封面皆為本專案自行建立、明確標示為 Step 1 placeholder 的 SVG，不使用第三方或未授權素材。圖片最佳化與 Lazy Loading 正式比較保留至 Step 2。

### 2.3 產生頁面

列表：

```text
/lab/events/
```

詳情：

```text
/lab/events/starlight-birthday-project/
/lab/events/summer-letter-gallery/
/lab/events/moonlit-message-wall/
```

列表依日期由新到舊排序。詳情頁顯示 Markdown 內容、日期、slug、媒體筆數、標籤、署名、外部連結，以及有共同標籤時的相關活動。

### 2.4 Lab 導覽

- Lab 共用導覽新增「活動資料」。
- Lab 首頁下一個實驗已由舊的 Navigation／Page Transition 候選更新為 Phase 1・Step 1 F18。
- Lab 首頁提供活動資料 Prototype 的直接入口。

## 3. 自動與靜態檢查

| 項目 | 結果 | 證據 |
|---|---|---|
| 合法資料 Content sync | 通過 | Astro 成功同步 `events` collection |
| `pnpm build:lab` | 通過 | 產生列表、3 個詳情頁、Lab 索引、模板頁、首頁與 404，共 8 頁 |
| 錯誤 schema 測試 | 通過（預期失敗） | 暫存錯誤資料使 build 回報 slug、date、cover、tags、credits 五類錯誤 |
| 錯誤測試檔清理 | 通過 | `__invalid-schema-test.md` 已移除，之後 Lab build 再次通過 |
| 列表筆數 | 通過 | 靜態 HTML 含 3 張活動卡 |
| 日期排序 | 通過 | 星光生日 → 盛夏來信 → 月光留言 |
| 詳情路由 | 通過 | 3 個 slug 皆產生獨立 `index.html` |
| Lab noindex | 通過 | 列表與 3 個詳情 HTML 均含 `noindex, nofollow, noarchive` |
| `pnpm build` | 通過 | 首頁與 404 保留，正式輸出的 `dist/lab/` 已移除 |
| Sitemap 保護 | 通過 | 正式輸出 Sitemap 數量為 0 |
| Dependency | 通過 | `package.json` 與 `pnpm-lock.yaml` 未變更，仍只有 Astro |
| `git diff --check` | 通過 | 無 whitespace error；只有既有 Windows 換行提示 |
| 本機 HTTP | 通過 | 開發伺服器 `/lab/events/` 回應 HTTP 200 |

## 4. 錯誤資料驗證內容

錯誤測試曾暫時加入：

- 含空白與大寫字母的 slug。
- 無法轉成日期的字串。
- 不在 `/lab-assets/events/` 下的封面路徑。
- 空的 tags。
- 空的 credits。

Astro 以 `InvalidContentEntryDataError` 阻止建置，並逐項指出以上錯誤。測試檔已刪除，不會進入後續提交。

## 5. 人工瀏覽器驗收

瀏覽器自動控制再次遇到既有的初始化衝突，因此下列項目由使用者在本機頁面確認：

1. 開啟 `http://127.0.0.1:4321/lab/events/`，確認有 3 張活動卡，順序為星光生日、盛夏來信、月光留言。
2. 分別點開 3 張活動卡，確認各自進入正確 slug 的詳情頁。
3. 在詳情頁查看資料摘要，確認空的 Gallery／影音欄位顯示 `0 筆`，而不是留下破版空區塊。
4. 在盛夏來信或月光留言詳情頁確認「相同標籤的活動」能互相連結。
5. 使用「返回活動列表」、Lab Header「活動資料」與「實驗索引」確認導覽正確。
6. 以 360、768、1440 px 查看列表與至少一個詳情頁，確認沒有水平捲動、遮擋或文字溢出。
7. 只用 Tab／Shift+Tab／Enter 操作 Header、活動卡、Hero 操作與詳情頁連結，確認焦點清楚。
8. 直接貼上任一詳情網址並重新整理，確認頁面可以獨立開啟。
9. 視需要停用 JavaScript，確認活動列表與 Markdown 主要內容仍可閱讀。

使用者於 2026-07-15 實際查看活動列表、資料摘要與相關活動連結後，確認 Step 1 頁面與操作沒有問題，接受本輪驗收結果。

### 5.1 驗收期間發現並排除的環境問題

第一次人工查看時，活動列表為空且動態詳情網址回傳 404。檢查後確認程式與建置輸出正常，原因是新增 `src/content.config.ts` 後，原本持續執行的 Astro 開發伺服器只熱更新頁面外框，沒有重新載入新的 Content Collection。

停止舊程序並重新啟動 `pnpm dev --host 127.0.0.1` 後：

- 活動列表回傳 3 張卡片。
- 3 個動態詳情頁皆回應 HTTP 200。
- 盛夏來信與月光留言皆顯示相關活動連結。
- 空 Gallery／影片／音訊筆數正確顯示為 `0 筆`。

這是開發伺服器需要重啟的環境狀態，不是 Content Collection、資料或路由實作錯誤。日後新增或大幅修改 Content Collection 設定時，應主動重新啟動開發伺服器再進行人工驗收。

## 6. 目前決策

- Astro Content Collections：採用，零新增 dependency。
- 活動 URL：Prototype 採 `/lab/events/{slug}/`。
- 活動 slug：資料內明確指定並由 schema 驗證，不依賴中文檔名自動產生。
- 媒體欄位：本 Step 只驗證結構與筆數，不提前初始化播放器或第三方 script。
- 圖片：Step 1 使用 public SVG placeholder；Step 2 再決定 Astro Image、格式與輸出尺寸策略。
- CMS：不採用於 Phase 1。

## 7. 完成結論

Step 1 的 schema、3 筆測試資料、活動列表、動態詳情頁、錯誤資料驗證、正式／Lab build 與使用者人工驗收皆已完成。下一步為 Step 2「F20 圖片最佳化與 Lazy Loading」，開始前仍需由使用者確認範圍。
