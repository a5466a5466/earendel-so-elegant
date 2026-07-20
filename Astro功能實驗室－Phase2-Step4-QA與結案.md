# Astro 功能實驗室 Phase 2・Step 4 整合 QA 與結案

- 日期：2026-07-20
- 狀態：技術 QA、使用者最終人工驗收與 Phase 2 結案完成
- 開始前 commit：`136b5c1 feat: complete animated cursor prototype`
- 完成 commit：`phase 2 step 4 done: 完成整合 QA 與 Phase 2 結案`
- Dependency：無新增

## 1. QA 範圍

- Lab／production 雙模式建置與正式輸出隔離。
- 32 個 Lab HTML 的 noindex、共用導覽、重複 ID 與內部連結。
- 360／768／1440 px 的 Lab 首頁、X／Threads、YouTube 與動畫游標主要路由。
- 手機選單、YouTube 單一播放器、動畫游標輸入語意與共用偏好降級。
- X／Threads／YouTube 與動畫游標在同一套 Lab 導覽、偏好及正式輸出守門下共存。
- 正式站候選內容、仍需替換項目與外部平台限制。

## 2. 自動與靜態檢查

| 項目 | 結果 | 證據 |
|---|---|---|
| `pnpm build:lab` | 通過 | 共 34 個頁面；其中 32 個位於 `/lab/` |
| Lab robots | 通過 | 32／32 均有 `noindex, nofollow, noarchive` |
| 共用導覽 | 通過 | 缺少 Navigation 或手機 Dialog：0 頁 |
| 重複 ID | 通過 | 0 頁 |
| Lab 內部連結 | 通過 | 指向不存在輸出的連結：0 筆 |
| 社群靜態結構 | 通過 | 10 張卡；X／Threads blockquote 各 5；官方 loader 各 1 |
| `pnpm build` | 通過 | 正式首頁與 404 存在 |
| 正式輸出隔離 | 通過 | 無 `dist/lab`、`dist/lab-assets`、Lab 命名 bundle 或 Sitemap `/lab/` 參照 |
| Dependency | 通過 | 維持 Astro 與 Sharp；Phase 2 未新增套件 |
| `git diff --check` | 通過 | 無 whitespace error；Windows 僅有 LF／CRLF 提示 |

## 3. 瀏覽器整合 QA

### 排版與導覽

- 360／768／1440 px 檢查 `/lab/`、`/lab/social-embeds/`、`/lab/youtube/`、`/lab/cursor/`，12 組皆無水平溢位。
- 360 px 手機選單可開啟與關閉；`aria-expanded` 正確切換，關閉後焦點回到選單按鈕。
- 主要路由標題、麵包屑、共用偏好與 Lab Navigation 均存在。

### X 與 Threads

- 10 張卡與 10 個原文連結保留；桌機維持雙欄 masonry，窄螢幕維持單欄。
- X／Threads 官方 loader 各一份，官方 iframe 可建立；Console 無 error 或 warning。
- 外部平台 script、瀏覽器追蹤保護、區域或網路政策仍可能影響 iframe，因此原文連結是必要降級出口。

### YouTube

- 初始為 0 iframe；點擊第一張後只建立 1 個 `youtube-nocookie.com` iframe。
- 切換第二張後仍只有 1 個 iframe，網址包含 `start=60`，確認舊播放器已被替換。
- 全程無水平溢位，Console 無 error 或 warning。

### 動畫游標與共用偏好

- 動態星環包含 4 顆獨立繞行星點，週期為 3.8／5.4／4.6／6.2 秒；2 顆順時針、2 顆逆時針，2 顆為四向星芒。
- 裝飾層 `pointer-events: none`；文字輸入成功且輸入框保留 `cursor: text`。
- 切為 reduced motion 時立即改為 native 並隱藏星環。
- 恢復完整動態後切為 economy，同樣立即改為 native 並隱藏星環。
- 恢復原設定後，跨頁仍維持同一份 motion、sound、performance 偏好；沒有建立第二份狀態。
- `pointer: coarse` 與 `hover: none` 已確認有 JavaScript media query 與 CSS media query 雙重守門；目前桌面瀏覽器只能模擬 viewport，不能把實體觸控結果誤標為通過。

## 4. 文件落差修復

- Step 1 紀錄的完成 commit 由「尚未建立」修正為 `f42deba feat: add X and Threads embed masonry`。
- Step 3「旋轉與呼吸」由待人工確認修正為技術與使用者人工驗收均通過。
- Phase 2 主控與 `handoff.md` 更新為 Step 4 技術 QA 完成、等待最終人工驗收。

## 5. 正式站候選與待替換項目

目前候選：

- X／Threads 採官方單篇貼文直接嵌入，每個平台只載入一份官方 script，並永久保留原文連結。
- YouTube 維持既有 click-to-load、`youtube-nocookie.com` 與單一播放器生命週期。
- F01 條件採用動態星環；只在精準 Hover 指標、完整動態與標準效能時啟用。

正式整合前仍須：

- 重新確認目前 5 則 X 與 5 則 Threads 網址仍公開、可嵌入，並決定是否就是正式內容；完整網址保留在 Step 1 紀錄。
- 以核准的品牌游標素材替換 32 × 32 幾何 placeholder，重新確認 hotspot。
- 在實體觸控裝置確認 coarse pointer 降級；Safari／Firefox、螢幕閱讀器與正式部署效能檢查依既有決策留到正式內容／部署階段。
- 正式部署時提供共用 Cookie／隱私告知；不在每張社群貼文前加入自製詢問。

## 6. 最終人工驗收

驗收項目：

- 360 px 或手機實機瀏覽社群、YouTube 與游標頁時，沒有被裁切或難以操作。
- X／Threads 十則貼文仍符合預期內容與多卡片閱讀感。
- YouTube 切換與動態星環在一般瀏覽器使用時沒有主觀上的干擾。
- 接受實體觸控、跨瀏覽器、螢幕閱讀器與正式內容效能留到正式整合／部署階段。

### 使用者驗收結果

- 2026-07-20 使用者完成 Phase 2 最終人工驗收，結果通過。
- X／Threads 多貼文版面、YouTube 操作與動畫游標的實際觀看及操作感受均接受目前版本。
- 接受實體觸控、Safari／Firefox、螢幕閱讀器與正式內容效能留到正式整合／部署階段。
- Step 4 與 Phase 2 正式結案；最新 10 筆自動同步維持暫緩，不阻擋結案。
