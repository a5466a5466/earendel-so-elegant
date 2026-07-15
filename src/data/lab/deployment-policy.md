# 功能實驗室部署政策

更新日期：2026-07-15

## 預設原則

- 本機開發模式保留首頁「功能實驗室」入口與所有 `/lab/` 頁面。
- 一般正式建置預設隱藏首頁入口，並移除輸出目錄中的 `/lab/`。
- Lab 頁面本身仍保留 `noindex, nofollow, noarchive`，作為開發與驗收環境的第二層保護。
- 正式站若未來加入 Sitemap，任何 Sitemap 都不得包含 `/lab/`；正式 build 會檢查並在違規時失敗。
- 不使用 `robots.txt` 的 `Disallow: /lab/` 取代 `noindex`，避免搜尋引擎因無法讀取頁面而看不到 `noindex` 指示。

## 使用指令

本機開發，Lab 可見：

```powershell
pnpm dev
```

正式建置，Lab 入口與頁面排除：

```powershell
pnpm build
```

Lab 驗收建置，保留入口與頁面：

```powershell
pnpm build:lab
```

## 正式建置驗收

- `dist/index.html` 不包含 `/lab/` 入口。
- `dist/lab/` 不存在。
- Sitemap 不存在，或存在但不包含 `/lab/`。
- 正式首頁與 404 頁仍正常輸出。

## Lab 建置驗收

- `dist/index.html` 包含 `/lab/` 入口。
- `dist/lab/index.html` 存在。
- `dist/lab/record-template/index.html` 存在。
- 所有 Lab HTML 仍包含 `noindex, nofollow, noarchive`。

## 未來公開 Lab

若未來決定正式公開 Lab，不可直接刪除保護機制。應先：

1. 確認所有實驗內容、素材與授權可公開。
2. 完成 Step 6 QA。
3. 決定是否仍維持 `noindex`。
4. 明確修改 build 模式與 Sitemap 策略。
5. 重新執行正式環境驗收。
