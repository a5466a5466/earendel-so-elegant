# Astro 功能實驗室 Phase 1・Step 14・F10 Audio Player

- 開始日期：2026-07-16
- 完成日期：2026-07-16
- 目前狀態：完成（技術驗證與使用者人工驗收均通過）
- 開始前 commit：`791a654 phase 1 step 13 done`
- 新增 dependency：無
- Prototype：`/lab/audio/`

## 實作範圍

- 以 Node 內建 API 產生兩個八秒、24 kHz、單聲道 WAV 測試素材；生成腳本保留於 `scripts/generate-lab-audio-assets.mjs`，不依賴 ffmpeg 或第三方套件。
- 兩張主要音訊卡提供播放／暫停、播放進度、已播放／總長度、單曲音量、曲目資訊、狀態文字與 WAV 原始檔連結。
- `audio-manager.ts` 是主要音訊的唯一管理入口；開始新曲前會暫停目前曲目，同時最多一個主要音源。
- 沿用 `earendel-lab-preferences-v1` 與既有 preferences API；音效預設關閉，偏好關閉時主要音訊立即暫停並靜音。
- 開啟音效偏好只解除播放限制，不自動播放；每次出聲仍須由使用者按下播放。
- 曲目切換時保留上一首進度；重新整理不恢復播放。
- 播放器區離開可視範圍、頁籤隱藏或 MPA `pagehide` 時全部暫停，返回後不自動續播。
- 不存在的 WAV 只在使用者按下失敗測試後才載入，錯誤時保留控制卡、說明與降級狀態。
- 無 JavaScript 時 manager 不運作，但兩個 WAV 原始檔連結仍可使用。

## 暫定整合決策

目前採原生 `<audio>`、range controls 與小型共用 manager，不安裝 WaveSurfer 或播放器 wrapper。現階段沒有逐字稿對齊、音訊剪輯、頻譜分析或可縮放波形需求；裝飾性假波形也不應偽裝成真實內容。若正式需求出現可操作波形，再另行評估檔案預分析、套件成本、行動裝置效能與無障礙替代方案。

## 技術驗證結果

- [x] `pnpm build:lab` 通過：29 個輸出頁，包含 `/lab/audio/`。
- [x] `/lab/audio/` 開發伺服器回應 HTTP 200。
- [x] 兩個 WAV 均回應 HTTP 200 與 `audio/wav`，總大小 768,088 bytes。
- [x] 初始 HTML 有 2 個主要 `<audio>`、0 個 autoplay，失效 fixture 沒有初始 `src`。
- [x] 頁面重複 ID 為 0。
- [x] 所有播放只由按鈕 click 呼叫；全站音效 off 時 manager 拒絕播放。
- [x] manager 在播放前暫停其他主要音源，切換時不重設上一首進度。
- [x] 進度與音量使用原生 range，可由鍵盤操作；播放按鈕同步 `aria-pressed`，狀態使用 live region。
- [x] preference change、visibility change、Intersection Observer、pagehide 與重新初始化均有清理流程。
- [x] `pnpm build` 通過；正式輸出無 `/lab/`、`/lab-assets/`、Audio 或 audio-manager bundle。
- [x] 無新增 dependency。
- [x] 使用者確認實際聲音、互斥播放、進度／音量、偏好、不可見暫停、手機版與失效降級。
- [x] 使用者核准目前原生 audio 方案；現階段不需要真實波形或 WaveSurfer。

## 人工驗收重點

1. 開啟 `/lab/audio/`，保持頁首音效為「關閉」，按播放應不出聲並提示先開啟偏好。
2. 將頁首音效改為「開啟」；頁面仍不得自動出聲，按「星光來信」播放後才有聲音與進度。
3. 播放中按「月光回音」，第一首應暫停、第二首開始；回到第一首可從原位置手動繼續。
4. 拖動播放進度，確認時間同步；以滑鼠及鍵盤調整單曲音量。
5. 播放時把頁首音效改回「關閉」，應立即暫停；重新開啟後不得自動續播。
6. 播放時切換瀏覽器頁籤，或把整個播放器區捲出畫面，音訊應暫停且返回後不自動播放。
7. 按「載入不存在的音訊」，確認顯示降級成功，卡片與說明維持完整。
8. 以手機寬度檢查播放、進度、時間、音量與原始檔連結沒有超出卡片。
9. 判斷目前是否真的需要可操作的真實波形；若不需要，固定採原生 audio、不安裝 WaveSurfer。

瀏覽器音訊解碼、實際音量、頁籤可見性與聽覺結果由使用者在目標瀏覽器人工驗收；建置與靜態檢查不能取代實際聆聽。
