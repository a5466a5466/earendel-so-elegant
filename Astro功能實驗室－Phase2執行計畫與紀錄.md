# Astro 功能實驗室 Phase 2・執行計畫與紀錄

- 建立日期：2026-07-20
- 目前狀態：規劃完成，尚未開始實作
- 前置狀態：Phase 0、Phase 1 Step 1～18 已完成並由使用者驗收
- 規劃基線 commit：`dd14bc2 phase 1 step 18 done`
- 依據文件：`Astro功能實驗室－企劃書.md`、`Astro功能實驗室－Phase1-Step18-QA與結案.md`、`handoff.md`

## 1. 文件目的

Phase 2 驗證兩類高變動外部內容與一項裝飾互動：

- F12：X 公開貼文嵌入。
- F13：Threads 公開貼文嵌入。
- F01：動畫滑鼠。

本階段不是正式社群牆，也不代表三項功能一定會進入正式網站。每個 Step 必須得到「採用」、「條件採用」、「延後」或「不採用」的結論；開始前仍需使用者逐步核准，不能因本計畫建立完成就自動實作。

## 2. 2026-07-20 官方能力查核

### 2.1 X

- X 官方仍提供透過 X.com／publish.x.com 取得公開 Post embed code 的流程。
- 受保護帳號不提供 embed code；貼文刪除、轉為受保護或帳號停權後，文字可能仍留在既有嵌入碼中，但媒體不再由 X JavaScript 載入。
- X 官方隱私說明指出，X for Websites 內容可能把造訪頁面、IP、瀏覽器、作業系統與 Cookie 資訊提供給 X。
- 因此本專案不允許首屏自動載入 X script；必須先顯示本機靜態卡片，由使用者明確點擊後才連線。

官方來源：

- `https://help.x.com/en/using-x/how-to-embed-a-post`
- `https://help.x.com/en/x-for-websites-ads-info-and-privacy`

### 2.2 Threads

- Meta 已於 2025 年把 Threads 網頁體驗由 `threads.net` 遷移到 `threads.com`。
- 本次規劃查核時，Meta 開發文件端點受到 429／存取限制，不能把舊有 `embed.js` 或 oEmbed 端點視為已保證的 2026 契約。
- Step 3 開始時必須先從 Threads 當下官方分享／嵌入 UI 與官方開發文件重新取得真實 embed code、script host、URL 格式與使用限制。
- 若官方嵌入已不可用、需要未核准 App／Token、或無法建立可靠 fallback，允許以「靜態預覽卡＋原文連結」完成決策，不為了嵌入而導入第三方聚合器。

官方來源：

- `https://about.fb.com/news/2025/04/new-features-threads-web-experience/`
- Step 3 開始時重新查核 `https://developers.facebook.com/docs/threads/`

## 3. Phase 2 完成定義

Phase 2 完成時必須同時符合：

1. F12、F13、F01 都有最終狀態與使用者驗收紀錄。
2. X／Threads 初始 HTML 不建立第三方 iframe、遠端圖片或平台 script。
3. 未取得第三方同意前，不向 X／Meta 發送請求；靜態卡片與原文連結仍可使用。
4. 公開、刪除／轉私人、script 被擋、逾時與不支援情境都有可理解的 fallback。
5. 動畫滑鼠不遮擋點擊、選字或輸入，並在 coarse pointer、reduced motion、節能模式及 JavaScript 關閉時安全降級。
6. 所有 listener、loader、timer 與 `requestAnimationFrame` 可清理，初始化可重入。
7. Lab／正式雙模式 build、noindex、正式輸出隔離、360／768／1440 px、鍵盤與控制台回歸通過。
8. 沒有未核准 dependency、API 金鑰、Token、CMS 或後端服務。
9. 建立 Phase 2 QA／結案文件，明確列出正式站是否採用及後續前置條件。

## 4. 固定架構與變更邊界

### 4.1 沿用 Phase 1

- 保留 Astro 靜態 MPA、普通 `<a>`、原生 History 與 cross-document View Transition。
- 沿用 `events` Content Collection 的 `socialPosts`；不得為社群卡片建立第二份活動資料。
- 沿用 `earendel-lab-preferences-v1`；動畫滑鼠不得另建 motion／performance 儲存狀態。
- 沿用 Step 13 YouTube 的「本機 facade → 使用者手勢 → 單一第三方 loader → 永久外部連結」模式。
- 每項新 Lab 路由與資產必須被正式 build guard 排除。

### 4.2 第三方內容規則

- 靜態 facade 只使用專案內已核准的 placeholder、作者名稱、來源平台、替代摘要與原文連結。
- 不把第三方貼文全文或媒體複製成站內永久內容；fallback 只保留必要摘要與來源說明。
- 未經同意不載入 `widgets.js`、Threads embed script、iframe、遠端 thumbnail 或追蹤 pixel。
- 一份文件同一平台最多載入一份官方 script；重複點擊不得重複插入。
- 載入逾時不能永久卡在 loading；必須恢復可重試或外部觀看狀態。
- 不使用未確認維護、授權與隱私的 npm wrapper、embed 聚合器或代理服務。
- 若官方方案需要 App、Token、付費 API 或伺服器端 secret，立即停止該 Step 並另行提案，不把 secret 放進 Astro client bundle。

### 4.3 動畫滑鼠規則

- 第一候選是小尺寸 CSS `cursor`；只有使用者確認需要時才增加 Pointer Events 拖尾。
- `pointer: coarse`、`hover: none`、reduced motion 或 economy 模式停用裝飾層。
- 原生文字輸入游標、文字選取、resize、拖曳及不允許操作狀態不得被品牌游標取代。
- 裝飾元素使用 `pointer-events: none`，不得進入 tab order 或無障礙樹。
- 不安裝動畫套件；原生 CSS、Pointer Events 與 `requestAnimationFrame` 足夠。

## 5. 不在 Phase 2

- 不建立即時 X／Threads feed、帳號登入、發文、按讚、回覆或 API 同步。
- 不建立 CMS、資料庫、Cloudflare Worker、Pages／R2 或正式部署。
- 不開始正式網站社群牆設計，不接入未取得授權的真實粉絲內容。
- 不做桌寵、粒子／WebGL、Live2D、互動 Island、小遊戲、投稿表單或 PWA。
- 不新增正式多語架構，也不完成延後的正式網址 QR。

## 6. Step 總表

| Step | 功能 | 前置 | Prototype 估時 | 狀態 |
|---:|---|---|---:|---|
| 1 | 外部內容 facade、同意與 fixture 契約 | Phase 1 完成 | 0.5～1 天 | 未開始 |
| 2 | F12 X 公開貼文嵌入 | Step 1、官方能力再確認 | 0.5～1.5 天 | 未開始 |
| 3 | F13 Threads 公開貼文嵌入 | Step 1～2、官方能力探測 | 0.5～2 天 | 未開始 |
| 4 | F01 動畫滑鼠 | 共用偏好、使用者核准素材 | 1～2 天 | 未開始 |
| 5 | Phase 2 整合 QA 與結案 | Step 1～4 定案 | 0.5～1 天 | 未開始 |

預估合計約 3～7.5 工作天，另加真實素材整理、平台變動研究、使用者驗收與修正輪次。這是 Prototype 估算，不等於正式社群牆整合工時。

## 7. 各 Step 執行規格

### Step 1：外部內容 facade、同意與 fixture 契約

**目標**

在碰觸 X／Threads script 前，先固定共用資料、隱私、載入、逾時、fallback 與生命週期契約。

**範圍**

- 定義共用 social embed item：平台、公開 URL、作者、替代摘要、內容類型、fallback 與測試狀態。
- 決定「每次點擊同意」或「本次瀏覽工作階段記住同意」；不預設永久 localStorage。
- 建立本機靜態 facade 與模擬成功、被擋、刪除／轉私人、逾時、不支援 fixture。
- 固定 loader 去重、逾時、重試、dispose 與 pagehide 行為。
- 產出 `src/data/lab/social-embed-contract.md`。

**完成閘門**

- JavaScript 關閉時靜態卡片與原文連結可用。
- 初始第三方請求為 0。
- 使用者核准同意粒度、替代摘要邊界與 failure fixture。
- 不新增 dependency。

### Step 2：F12 X 公開貼文嵌入

**目標**

驗證 X 官方 embed code／script 能否在隱私優先 facade 中可靠工作，並決定正式站採用方式。

**開始前資料**

- 1 筆公開文字 Post。
- 1 筆含圖片或影片的公開 Post。
- 1 筆 reply／conversation 案例。
- 1 筆站內模擬 unavailable fixture。
- 每筆都要有作者、替代摘要、原文連結與展示核准。

**驗證**

- 點擊前沒有 X script、iframe、遠端圖片或 X 網域請求。
- 點擊後只插入一次官方 loader；多卡載入不重複 script。
- 360 px 不溢出，高度變更不造成不可恢復跳動。
- 被廣告阻擋器／CSP 擋住、貼文刪除／轉私人、script timeout 時保留 fallback。
- reply、圖片／影片、深色模式與外部連結行為有紀錄。

**停止條件**

- 官方流程需要未核准 API 付費、Token 或 server secret。
- 無法在載入前維持零第三方連線。
- 官方樣式或高度在主要 viewport 無法形成可接受的穩定容器。

### Step 3：F13 Threads 公開貼文嵌入

**目標**

先重新確認 2026 官方能力，再決定採官方 embed 或只採靜態預覽卡。

**開始前能力探測**

1. 從 `threads.com` 公開 Post 的官方分享 UI 取得當下 embed 選項。
2. 重新讀取 Meta Threads 開發文件，記錄 endpoint、script host、是否需 App／Token 與使用限制。
3. 取得至少文字、圖片、影片各一筆經核准公開 URL；若任一類型無法合法取得，以明確缺口結案，不臆造資料。
4. 驗證 `threads.net` 舊連結與 `threads.com` 新連結的真實行為，不自行猜測或靜默改寫。

**驗證**

- 沿用 Step 1 facade、同意、逾時、重試、fallback 與外部連結。
- 點擊前第三方請求為 0；點擊後 script 去重。
- 長文、圖片、影片、刪除／轉私人與 script blocked 狀態有結果。
- 360 px 不溢出，長文與不可預測高度不遮住後續內容。

**允許的最終結論**

- 官方 embed 可控：採用或條件採用。
- 官方 embed 不穩定／需未核准權限：正式採靜態卡＋原文連結，embed 延後。
- 不採用未受信任聚合器作為替代。

### Step 4：F01 動畫滑鼠

**目標**

比較原生游標、品牌靜態游標與可選拖尾，在不降低可用性與效能的前提下決定是否採用。

**開始前素材閘門**

- 需要使用者核准的 32×32 或 48×48 PNG／SVG 測試素材。
- 每個素材要記錄 hotspot、用途、透明邊界與授權。
- 若沒有核准素材，先用幾何 placeholder 驗證技術，但不能據此決定正式視覺。

**Prototype 變體**

1. 原生游標基線。
2. 只有一般／連結狀態的 CSS 靜態游標。
3. 使用者另行核准後才加入輕量星屑／光點拖尾。

**驗證**

- 連結、按鈕、輸入、選字、scrollbar、拖曳與 disabled 狀態正確。
- 精準滑鼠才啟用；手機／平板 coarse pointer 完全沒有殘留。
- reduced motion、economy、頁籤隱藏與 pagehide 停止 frame／timer。
- 60 秒快速移動不持續增加 DOM；粒子數有硬上限。
- 360／768／1440 px、125%／200% 縮放與鍵盤導覽不受影響。

**完成閘門**

- 使用者在三個變體中選擇採用、條件採用或不採用。
- 不安裝套件，不建立第二份偏好。

### Step 5：Phase 2 整合 QA 與結案

**目標**

確認兩個外部平台與裝飾層能共存，完成 Phase 2 決策與正式站前置清單。

**範圍**

- 快速切頁、重複同意／載入、loader 去重、逾時、返回與 pagehide cleanup。
- X／Threads／YouTube 同頁時初始第三方請求、單一 loader 與多播放器邊界。
- 動畫滑鼠與 dialog、Carousel、Lightbox、Video、Audio、搜尋及文字輸入的交互回歸。
- 360／768／1440 px、鍵盤、reduced motion、economy、coarse pointer。
- Lab／正式 build、noindex、Sitemap、dependency、首頁、404 與正式輸出隔離。
- 建立 Phase 2 QA／交接文件，列出正式站採用條件與延伸跨瀏覽器 QA。

## 8. 素材與使用者決策清單

開始 Step 1 前不需要真實第三方內容；只建立契約與本機 fixture。開始後續 Step 前分別需要：

- X：3 筆經核准公開 Post URL、作者、替代摘要與展示同意。
- Threads：能力探測後再提供文字／圖片／影片公開 URL，不預先假設格式。
- 動畫滑鼠：核准的游標／星屑 placeholder 或正式素材、hotspot 與授權。
- 同意策略：每次點擊，或只在本次瀏覽工作階段記住；Phase 2 不永久記住第三方同意。

## 9. 實際工時紀錄規則

Phase 1 缺少一致的可加總小時數。Phase 2 每個 Step 從開始起必須分開記錄：

| 類別 | 實際時數 |
|---|---:|
| 官方文件／平台研究 |  |
| 程式實作 |  |
| 測試素材與資料整理 |  |
| 自動／靜態 QA |  |
| 人工驗收與修正 |  |
| 合計 |  |

不得用預估倒填實際工時；若無可靠開始／結束紀錄，填「未記錄」並說明。

## 10. 每個 Step 的固定紀錄

每一步另建 `Astro功能實驗室－Phase2-StepX-*.md`，至少包含：

- 狀態、開始／完成日期、開始前／完成 commit。
- 本輪核准範圍與使用者提供素材。
- 官方文件查核日期與來源。
- 實作檔案、路由、資料與 dependency 決策。
- 初始第三方請求、失敗 fixture、RWD、鍵盤、偏好與 cleanup 證據。
- 自動檢查、瀏覽器檢查、使用者人工驗收與延伸 QA。
- 實際工時表。
- 最終採用／條件採用／延後／不採用結論。

## 11. 下一個動作

Phase 2 尚未開始。下一個可執行動作是由使用者核准 Step 1「外部內容 facade、同意與 fixture 契約」的範圍；核准前不修改程式、不加入路由、不安裝套件，也不要求真實 X／Threads 素材。
