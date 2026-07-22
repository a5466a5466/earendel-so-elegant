# 功能實驗室部署政策

更新日期：2026-07-22

## 預設原則

- 本機開發模式保留首頁「功能實驗室」入口與所有 `/lab/` 頁面。
- GitHub Pages 正式建置公開首頁入口、所有 `/lab/` 頁面與 `/lab-assets/` 示範資產。
- 正式建置為 Project Pages 加上 `/earendel-so-elegant` base；本機 dev 與 Lab 驗收建置仍使用 `/`。
- Lab 頁面本身仍保留 `noindex, nofollow, noarchive`，作為開發與驗收環境的第二層保護。
- 正式站若未來加入 Sitemap，預設仍不列入 `/lab/`，除非另行決定讓實驗內容進入搜尋索引。
- 不使用 `robots.txt` 的 `Disallow: /lab/` 取代 `noindex`，避免搜尋引擎因無法讀取頁面而看不到 `noindex` 指示。

## 使用指令

本機開發，Lab 可見：

```powershell
pnpm dev
```

GitHub Pages 正式建置，保留公開 Lab 並套用 repository base：

```powershell
pnpm build
```

Lab 驗收建置，保留入口與頁面：

```powershell
pnpm build:lab
```

## 正式建置驗收

- `dist/index.html` 包含 `/earendel-so-elegant/lab/` 入口。
- `dist/lab/` 與 `dist/lab-assets/` 存在。
- 所有 Lab 內部路徑與 runtime 資產使用 `/earendel-so-elegant` base。
- 39 個 HTML 頁面、正式首頁與 404 頁正常輸出。
- 所有 Lab HTML 保留 `noindex, nofollow, noarchive`。

## Lab 建置驗收

- `dist/index.html` 包含 `/lab/` 入口。
- `dist/lab/index.html` 存在。
- `dist/lab/record-template/index.html` 存在。
- 所有 Lab HTML 仍包含 `noindex, nofollow, noarchive`。

## 公開 Lab 的授權與內容界線

公開展示不代表所有示範資產都是開源素材：

1. Live2D Framework、Cubism Core 與 Koharu 分別受 Live2D 專用條款約束。
2. 必須保留頁面署名、`src/vendor/live2d/licenses/` 與根目錄 `THIRD_PARTY_NOTICES.md`。
3. X、Threads、YouTube 內容仍屬原作者與平台，不因嵌入而轉移權利。
4. Repository 公開不構成對第三方資產重新授權。
5. 每次正式部署需重新執行路徑、資產、互動與 Console QA。
