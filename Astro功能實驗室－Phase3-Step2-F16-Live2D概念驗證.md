# Astro 功能實驗室 Phase 3・Step 2・F16 Live2D 概念驗證

- 建立日期：2026-07-20
- 狀態：規劃完成；等待授權條款確認與 SDK／範例模型取得
- 開始前 commit：`970e216 phase 3 step 1 done: 完成 Svelte Interactive Island 驗證`
- Dependency：尚未新增；使用者明確核准前不得下載、安裝或提交 Live2D runtime
- 預定路由：`/lab/character-animation/`

## 1. 目標與結論邊界

本 Step 要驗證的是「真實 Cubism 模型能否在目前 Astro／Svelte 網站中，以可維護、可降級且可清理的方式運作」，不是在第一輪完成厄倫蒂兒正式角色模型，也不把官方範例角色冒充為網站正式素材。

2026-07-20 使用者表示沒有現成素材，但希望做到 Live2D 概念測試。依此採兩階段方案：

1. 先用官方 Cubism SDK for Web 與授權條款允許的官方原創範例模型完成網站整合 Prototype。
2. 第一階段通過後，再決定是否生成星空系原創概念人物、整理分層 PSD，並由 Cubism Editor 進行建模與輸出。

第一階段即能驗證 Live2D runtime、Canvas、模型動作、Svelte 控制、效能與 fallback，因此第二階段不是 Step 2 技術結論成立的必要條件。

## 2. 候選比較與選擇

| 方案 | 素材需求 | 互動能力 | 整合／效能成本 | 本 Step 結論 |
|---|---|---|---|---|
| 靜態圖／Animated WebP | 單張圖或預先輸出動畫 | 低 | 最低 | 保留作 fallback，不是主要 Prototype |
| Sprite | 逐格圖與狀態表 | 中 | 低至中 | 適合桌寵備案，但無法驗證 Live2D |
| Rive／Lottie | 專用向量動畫工程檔 | 中至高 | 中 | 不符合本輪明確的 Live2D 測試目標 |
| Live2D Cubism | `.moc3`、貼圖、motion、physics、model 設定 | 高 | 最高 | 選為唯一 Prototype runtime 候選 |

本輪只評估官方 Cubism SDK for Web，不同時加入 PixiJS wrapper、非官方 Live2D wrapper 或第二套角色 runtime。若官方 SDK 在目前架構不可接受，先記錄停止原因，再另開決策，不在同一輪疊加依賴。

## 3. 授權與取得閘門

開始實作前必須依序完成：

1. 使用者閱讀並自行接受當下適用的 Cubism SDK 使用條款。
2. 使用者閱讀官方範例模型的 Free Material License Agreement、Sample Data Terms 與該模型個別條款。
3. 選擇一個條款允許用於 SDK 整合測試的 Live2D 原創範例模型；避開合作角色與外部授權角色，除非另行核對其限制。
4. 從官方來源取得 Cubism SDK for Web 配布包。Cubism Core 不以 GitHub 原始碼取代，必須使用官方配布內容。
5. 取得包含 Web runtime 輸出檔的官方範例模型，核對 `.model3.json`、`.moc3`、texture、motion／expression／physics 等實際檔案。
6. 先在 repository 外或未追蹤暫存位置檢查檔案、版本、授權文字與大小；取得使用者明確核准後，才決定哪些檔案可加入專案。

授權確認與技術整合是兩件事。Codex 可以整理官方條款與檔案清單，但不代替使用者接受授權，也不提供法律判定。Prototype 若將來公開部署，必須再依當時身分、用途、營利規模與 Publication License 規則重新核對。

## 4. 使用者可能需要協助

### 必要

- 閱讀並接受官方 SDK 與範例模型條款。
- 若官方下載流程需要瀏覽器互動、Email 或人工同意，協助下載 Cubism SDK for Web 與選定範例模型。
- 將下載包放在雙方約定的暫存位置，保留原始壓縮檔與其授權文件供核對。

### 選配

- 第一階段通過後，嘗試安裝 Cubism Editor Trial／FREE。
- 依 Codex 提供的操作步驟匯入分層 PSD、建立最小參數與輸出 Web runtime 檔。
- 對角色概念、配色、動作速度、視線追蹤和網站呈現位置進行人工判斷。

若使用者無法完成 Cubism Editor 操作，可停在官方範例模型整合；不會把這項選配工作誤列為第一階段失敗。

## 5. Prototype 架構

### Astro／SSR

- 建立 `/lab/character-animation/`，初始 HTML 包含標題、說明、靜態預覽、授權標示與可操作的載入按鈕。
- 未執行 JavaScript、WebGL 不可用或模型載入失敗時，頁面仍保留靜態角色預覽與完整文字。
- Live2D、模型與本頁專用資產必須納入 production build guard，不得出現在正式輸出。

### Svelte

- 只管理低頻 UI：未載入／載入中／就緒／暫停／錯誤、表情與動作選擇、偏好與狀態訊息。
- 不經由 Svelte 逐幀更新角色參數或 DOM。
- 元件卸載時呼叫 Live2D adapter 的 `dispose()`，並取消所有偏好訂閱。

### Live2D adapter

- 封裝 SDK 初始化、Canvas、模型載入、motion、expression、視線追蹤、pause／resume、resize 與 dispose。
- 初始只顯示靜態預覽；由使用者按下「載入 Live2D」後才動態載入 runtime 與模型。
- 同一頁只保留一個 renderer 與一個 animation loop；重複載入不得建立重複 listener 或 Canvas。
- `pagehide`、頁籤隱藏、Svelte unmount 與錯誤路徑都必須停止 animation frame 並釋放可釋放資源。

## 6. 最小互動範圍

- 待機呼吸與眨眼。
- 點擊角色觸發一個短 motion。
- 至少兩個可辨識 expression／motion 狀態。
- 視線追蹤預設可關閉，並提供清楚開關。
- 暫停／繼續與回復預設。
- 模型載入進度、成功和錯誤訊息。
- 一個故意不存在或損壞的模型 fixture，驗證錯誤不會拖垮整頁。

第一版不做攝影機臉部追蹤、麥克風、口型同步、AI 對話、拖曳桌寵或跨頁持久角色。這些都會擴大權限、個資、效能或授權範圍，必須另行決策。

## 7. 降級與生命週期契約

- `reduced motion`：停止自動待機、物理與視線追蹤；只保留使用者主動觸發的短反應，若仍不合適則回到靜態圖。
- `economy`：降低更新負擔、關閉物理及視線追蹤；若實測仍太重，直接使用靜態 fallback。
- 手機／coarse pointer：限制 Canvas 與貼圖成本，不依賴 Hover，視線追蹤預設關閉。
- `document.hidden`：暫停 render loop，不在背景頁籤持續消耗 CPU／GPU；返回前景不自動播放使用者已手動暫停的內容。
- resize：不得建立新 renderer；只更新 Canvas 尺寸與投影／模型配置。
- load error：顯示靜態預覽、原因與可重試控制，不留下半初始化 renderer。
- dispose：停止 animation frame、移除 listener、取消訂閱並釋放 renderer／模型參照。

## 8. QA 與完成條件

### 靜態與建置

- `pnpm build:lab` 通過，頁面有完整 SSR fallback。
- `pnpm build` 通過，且正式 `dist` 不含 Live2D SDK、Cubism Core、模型、貼圖、本頁路由或其他 Lab 專用資產。
- `git diff --check` 無 whitespace error；新增第三方檔案有清楚來源與授權紀錄。

### 瀏覽器與生命週期

- 360／768／1440 px 無水平溢位，Canvas 不遮擋主要操作。
- 未按載入前不建立 Live2D renderer，也不請求模型貼圖。
- 待機、點擊 motion、狀態切換、暫停、恢復與視線追蹤正常。
- reduced motion、economy、手機降級與靜態 fallback 正常。
- 反覆載入／暫停／切換狀態不增加 Canvas、listener 或 animation loop。
- 頁籤隱藏、返回、離頁和錯誤 fixture 後無持續更新或未處理例外。
- Console error／warning 為 0；可觀察範圍內無持續增加的記憶體或 GPU 工作。

### 人工驗收

- 使用者確認角色大小、位置、動作速度、視線追蹤與操作感受。
- 使用者確認官方範例模型只作技術測試，沒有被呈現為厄倫蒂兒或正式角色素材。
- 記錄是否值得延伸到 Step 3 網站內桌寵，以及是否進入原創概念模型階段。

## 9. 第二階段：原創概念模型（選配）

若第一階段通過且使用者希望繼續：

1. 先決定原創星空系測試人物的外觀與最小動作，不模仿或冒充現有角色。
2. 生成概念立繪與透明背景參考圖。
3. 規劃並整理眼睛、眉毛、嘴、臉、前／側／後髮、身體、衣服與飾品等分層；補畫遮蔽區域。
4. 使用 Cubism Editor 建立最小模型：眨眼、嘴型、呼吸、頭部角度、髮飾物理與一個點擊 motion。
5. 輸出 Web runtime 檔，替換第一階段官方範例模型後重跑全部 QA。

AI 生成圖不等於可直接使用的 Live2D 模型。分層邊緣、補畫、ArtMesh、參數、deformer、physics、motion 與輸出都需要額外處理；若成本超過本網站價值，保留官方模型的技術結論並停止即可。

## 10. 下一個動作

不修改程式、不安裝 dependency。先由使用者閱讀官方條款並取得 Cubism SDK for Web 配布包與一個官方原創範例模型；取得後先做檔案、版本、大小、來源與授權核對，再提出精確的 repository 納入清單供使用者核准。
