# Astro 功能實驗室 Phase 1・Step 12・F09 自有 Video

- 開始日期：2026-07-16
- 目前狀態：完成（技術驗證與使用者人工驗收通過）
- 完成日期：2026-07-16
- 最新 commit：`77c07d6 phase 1 step 10 done`（開始時工作樹已包含使用者驗收完成的 Step 11）
- 新增 runtime dependency：無
- Prototype：`/lab/video/`

## 測試素材

- 使用暫時下載的 `ffmpeg-static` 產生 4 秒、960 × 540 的抽象星光測試片；生成後已移除工具與 pnpm allowBuilds 殘留。
- `starlight-motion-study.webm`：51,234 bytes，VP9／Opus。
- `starlight-motion-study.mp4`：48,872 bytes，H.264／AAC，faststart。
- `starlight-motion-poster.png`：24,508 bytes。
- `starlight-motion.zh-Hant.vtt`：3 段繁體中文字幕。
- 所有素材均位於 `public/lab-assets/video/`，只供 Lab 測試且不進 production。

## 實作範圍

- 內容影片：原生 controls、playsinline、WebM＋MP4、poster、繁中 VTT caption、直接 MP4 fallback。
- 內容影片沒有 `autoplay`；聲音只能由使用者按下原生播放控制啟動。
- 桌機標準模式只附加來源並預載 metadata；700 px 以下或節能模式先顯示 poster，點擊「載入內容影片」後才加入來源。
- 背景影片固定 muted、loop、playsinline；只有桌機、完整動態、標準效能三條件同時成立才附加來源並嘗試播放。
- 手機、reduced-motion 或 economy 會暫停、移除背景來源並回到 poster，不消耗背景影片頻寬。
- 背景影片提供明確播放／暫停控制和狀態文字，主要標題與內容不依賴影片。
- Failure fixture 只有使用者按下按鈕才載入不存在的 WebM／MP4；失敗後 poster、比例與說明仍保留。
- 偏好與 media query 變更會即時重新計算策略；所有事件、偏好 listener、media query 與 pagehide 皆可清理。
- 無 JavaScript 時提供直接 MP4 連結，不把無法使用的自訂行為當成唯一入口。

## 暫定套件決策

原生 `<video>` 已提供 controls、字幕、音量、全螢幕、鍵盤與多來源 fallback；專用腳本只負責來源附加、偏好降級與背景控制。因此核准不安裝播放器套件。只有正式需求出現 HLS／DASH、DRM、跨裝置串流品質或高度一致的自訂控制時才重新評估。

## 技術驗證結果

- [x] `pnpm build:lab` 通過：27 個輸出頁，包含 `/lab/video/`。
- [x] `/lab/video/` 開發伺服器回應 HTTP 200。
- [x] 靜態 HTML 具有 3 個 `<video>`、2 個內容來源、2 個背景來源、1 個 VTT track、2 個 failure source。
- [x] 靜態 HTML 沒有 `autoplay`；背景元素固定 `muted loop playsinline`。
- [x] 頁面重複 ID 為 0。
- [x] WebM、MP4、PNG、VTT 均回應 HTTP 200，MIME 分別為 `video/webm`、`video/mp4`、`image/png`、`text/vtt`。
- [x] 臨時 `ffmpeg-static` 已移除；`package.json`、lockfile 與 `pnpm-workspace.yaml` 無依賴或 allowBuilds 差異。
- [x] `pnpm build` 通過；正式輸出無 `/lab/`、`/lab-assets/`、Video bundle 或 `.mp4`／`.webm`／`.vtt`。
- [x] `git diff --check` 無 whitespace error，只有 Windows LF／CRLF 提示。
- [x] 使用者確認內容影片、字幕、背景影片、偏好切換、手機載入與失敗降級。
- [x] 使用者核准原生 `<video>`，不安裝播放器套件。

## 人工驗收重點

1. 開啟 `/lab/video/`，在桌機標準模式確認內容影片顯示 poster 與原生 controls，但不自行播放或出聲。
2. 使用原生播放鍵啟動影片，確認約 4 秒、可調音量、可暫停、可進入全螢幕。
3. 從原生字幕選單開啟／關閉繁中字幕，確認三段字幕隨時間切換。
4. 背景影片在桌機＋完整動態＋標準效能時應靜音循環；按右下按鈕可暫停與重新播放。
5. 將「減少動態」或「節能模式」打開，背景影片應回到 poster，控制停用且狀態說明原因。
6. 手機寬度下重新整理，內容影片先不下載並顯示「載入內容影片」；背景影片只顯示 poster。
7. 點擊手機／節能狀態的「載入內容影片」，來源加入後仍需再用原生控制才會播放與出聲。
8. 點擊「載入不存在的影片」，確認顯示降級成功文字，poster、固定比例與按鈕區沒有塌陷。
9. 判斷原生 controls 是否足夠；若不需要串流、DRM 或全自訂控制，固定不安裝播放器套件。

使用者已於 2026-07-16 在目標瀏覽器完成原生 controls、字幕、播放政策、偏好降級與失敗案例驗收；Step 12 正式關閉。
