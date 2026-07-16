# Astro 功能實驗室 Phase 1・Step 13・F14 YouTube 影片嵌入

- 開始日期：2026-07-16
- 完成日期：2026-07-16
- 目前狀態：完成（技術驗證與使用者人工驗收均通過）
- 開始前 commit：`c74fc4f phase 1 step 12 done`
- 新增 dependency：無
- Prototype：`/lab/youtube/`

## 官方規則依據

- [YouTube IFrame API Reference](https://developers.google.com/youtube/iframe_api_reference)：官方範例 ID `M7lc1UVf-VE`、播放器尺寸、`origin` 與 iframe／API 使用方式。
- [YouTube Embedded Player Parameters](https://developers.google.com/youtube/player_parameters)：`autoplay`、`playsinline`、`start`、字幕與播放器 URL 格式。
- [YouTube 隱私增強模式](https://support.google.com/youtube/answer/171780)：將 embed domain 改為 `youtube-nocookie.com`；年齡限制內容可能要求回到 YouTube。

## 實作範圍

- 3 張 facade：官方文件測試影片從頭播放、同一影片從 60 秒開始、禁止嵌入／年齡限制的模擬 fixture。
- 初始只使用 Step 12 的本機 poster、站內標題、頻道與說明；沒有 iframe、YouTube script 或遠端 thumbnail。
- 點擊後才建立 `https://www.youtube-nocookie.com/embed/VIDEO_ID` iframe，帶入 `origin`、`playsinline=1`、字幕與 start 參數。
- 點擊另一張卡前先移除上一個 iframe，同時間最多一個第三方播放器。
- 每個已載入的播放器可由「關閉播放器」移除，恢復本機 facade 並把焦點送回播放按鈕。
- 第三張不發出第三方請求，直接顯示禁止嵌入、年齡限制、私人／刪除影片的站內 fallback。
- 所有卡片永久保留 `youtube.com/watch` 外部連結；iframe 慢速或內容不可用時仍有可靠出口。
- iframe 維持 16:9 且大於官方 200×200 最低要求；桌機三欄、平板圖文雙欄、手機單欄。
- 所有 click、reset、timeout、pagehide 與重新初始化生命週期可清理。
- 無 JavaScript 時不載入 iframe，外部 YouTube 連結仍可用。

## 暫定整合決策

目前只需要點擊後建立、指定開始時間、單一播放器與 fallback，直接 iframe 已足夠，不載入 IFrame Player API，也不安裝 wrapper 套件。跨來源 iframe 的 `load` 只表示播放器文件抵達，無法證明內部影片可播放，因此永久外部連結與發布前內容驗證仍是必要契約。若未來需要播放狀態同步、章節控制、跨播放器互斥或 error code，再評估官方 IFrame API。

## 技術驗證結果

- [x] `pnpm build:lab` 通過：28 個輸出頁，包含 `/lab/youtube/`。
- [x] `/lab/youtube/` 開發伺服器回應 HTTP 200。
- [x] 初始靜態 HTML 的 `<iframe>` 為 0、遠端 `<img src="https://…">` 為 0。
- [x] 靜態頁面具有 3 張 facade、3 個外部 YouTube fallback、3 個播放入口與唯一 player slot ID。
- [x] iframe 只由使用者 click 建立，使用 `youtube-nocookie.com`、`allowfullscreen`、限制過的 allow 清單與 `strict-origin-when-cross-origin`。
- [x] 第二張包含 `start=60`；建立前會關閉目前 active card，保證最多一個 iframe。
- [x] blocked fixture 不建立 iframe，立即顯示站內原因與外部連結。
- [x] reset 會移除 iframe、恢復 facade 與按鈕 listener，並把鍵盤焦點送回播放按鈕。
- [x] 頁面重複 ID 為 0；初始 poster 具有固定 960×540 intrinsic 尺寸與 alt。
- [x] `pnpm build` 通過；正式輸出無 `/lab/`、`/lab-assets/`、YouTube 或 Video bundle。
- [x] `git diff --check` 無 whitespace error，只有 Windows LF／CRLF 提示。
- [x] 使用者確認實際 YouTube 播放、60 秒開始、單一 iframe、關閉、手機與失效模擬。
- [x] 使用者核准目前直接 iframe 方案；現階段不需要官方 IFrame API。

## 人工驗收重點

1. 開啟 `/lab/youtube/`，尚未點擊時應只看到本機 poster，沒有 YouTube 播放器介面。
2. 點第一張「連線後播放」，確認 YouTube 隱私增強播放器才在此時出現並開始載入。
3. 點第二張，第一張應恢復 facade，只留下第二張播放器；影片應從約 60 秒開始。
4. 點「關閉播放器」，iframe 消失、poster 恢復，鍵盤焦點回到該卡播放按鈕。
5. 點第三張「模擬失效」，應直接顯示站內 fallback，不建立播放器；外部 YouTube 連結仍存在。
6. 若瀏覽器／網路阻擋 YouTube，確認播放器區仍維持 16:9，狀態文字與外部連結可用。
7. 以手機寬度查看三張卡，播放按鈕、iframe、關閉與外部連結不超出畫面。
8. 關閉 JavaScript 時，所有「前往 YouTube 觀看」連結仍可使用，且不出現空 iframe。
9. 判斷是否需要站內取得播放狀態或 error code；若不需要，固定採直接 iframe、不載入 IFrame API。

實際第三方播放器可用性、autoplay 政策、地區／帳號限制與網路阻擋由使用者在目標瀏覽器人工驗收，不以 iframe `load` 事件誤判影片成功播放。
