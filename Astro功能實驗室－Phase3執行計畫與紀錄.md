# Astro 功能實驗室 Phase 3・執行計畫與紀錄

- 建立日期：2026-07-20
- 目前狀態：Step 1～6 全部完成；Phase 3 已結案
- 開始前 commit：`29c3316 phase 2 step 4 done: 完成整合 QA 與 Phase 2 結案`
- Dependency：已安裝官方 `@astrojs/svelte ^9.0.1`、`svelte ^5.56.6` 與其 TypeScript peer dependency；其他動畫／3D／遊戲 runtime 仍需先取得使用者同意

## 1. Phase 3 目標

Phase 3 驗證進階沉浸功能的品質上限與效能成本：

- F11：Interactive Islands 與 UI 框架必要性。
- F16：人物動畫／Live2D 類效果。
- F02：網站內桌寵。
- F21：粒子、視差與 WebGL 背景。
- F15：小遊戲。

本階段不是預設把五項都採用於正式網站；每項都必須有停止點，最後只挑最有價值且素材、授權、效能可負擔的候選。

## 2. 固定原則

- UI framework 固定使用 Svelte，不再執行 React／Svelte A/B；動畫 runtime 或 3D／遊戲引擎仍一次只評估一種。
- 原生 HTML／CSS／TypeScript 足夠時，不因「流行」而新增框架。
- 人物動畫、桌寵與小遊戲可先用幾何或抽象 placeholder；不可冒充正式角色素材。
- 所有持續動畫都必須整合 reduced motion、economy、頁籤隱藏與 cleanup。
- 桌寵只在網站頁面內活動，不宣稱能跨 Windows 桌面或其他程式。
- 手機、低效能與無 Hover 環境必須有靜態、降頻、收合或停用方案。
- 不開始 Phase 4 的後端、個資、Service Worker 或離線快取。

## 3. Step 總表

| Step | 功能 | 前置 | 狀態 |
|---:|---|---|---|
| 1 | F11 Interactive Islands 決策 | Phase 1～2 原生基線 | 完成；採用 Svelte 管理 Phase 3 低頻 UI 狀態 |
| 2 | F16 人物動畫／Live2D 類效果 | Step 1、F26 | 完成；採官方 Cubism SDK for Web 作為後續唯一人物 runtime 基線 |
| 3 | F02 網站內桌寵 | Step 2、F26；選配 Audio | 完成；已通過使用者人工驗收 |
| 4 | F21 粒子、視差與 WebGL | Scroll、F26、Step 2 | 完成；使用者人工驗收通過 |
| 5 | F15 小遊戲 | Audio、Step 1、Step 2；選配 Step 4 | 完成；使用者實際遊玩驗收通過 |
| 6 | Phase 3 整合 QA 與結案 | Step 1～5 決策 | 完成；採用候選、效能上限與工具鏈處置已核准 |

Phase 3 結案後才進入 Phase 4：F24 投稿表單／後端評估、F25 PWA，最後另做 Phase 4 整合 QA。

## 4. Step 1：F11 Interactive Islands 決策

### 目標

以一個真的具有多狀態、鍵盤操作、共用偏好與動態清單的「角色互動狀態台」比較：

1. 原生 TypeScript 版本。
2. 單一 UI 框架 Island 版本。

不接受只做計數器或靜態按鈕後就判定需要框架。

### 共同測試情境

- `idle`、`spark`、`cheer`、`sleep` 四個狀態。
- 點擊與鍵盤都能切換狀態。
- 顯示最近互動紀錄並可重設。
- reduced motion 與 economy 會降低或停用裝飾動畫。
- hydration 前後內容尺寸一致，無明顯 CLS。
- 離開頁面後 listener、timer 與訂閱可清理。
- 360／768／1440 px、鍵盤與 Console 通過。

### 評估指標

- 實作與維護複雜度。
- Client JavaScript 與依賴增加量。
- SSR HTML、hydration 行為與 layout shift。
- 與既有 Astro、共用偏好及 MPA 生命週期的整合成本。
- 是否能實際降低 Phase 3 後續人物、桌寵或遊戲的狀態管理成本。

### UI framework 決策

2026-07-20 使用者依本網站為個人開發的範例網站、初期開發時長及 Phase 3 五項需求，選定官方 `@astrojs/svelte` integration 與 Svelte，不再實作 React 候選。

Step 1 仍保留原生 TypeScript 基準，用來確認 Svelte 增加的 client JavaScript、hydration 與維護成本是否合理；這是導入驗證，不再是框架選型競賽。若單一功能以原生 TypeScript 更簡單，仍可保留原生實作，不強迫所有互動都改成 Svelte。

### Svelte 在 Phase 3 的責任邊界

| 功能 | Svelte 負責 | 專用 runtime／原生層負責 |
|---|---|---|
| F11 Interactive Islands | UI、狀態、清單、偏好與互動事件 | Astro hydration 與 SSR 邊界 |
| F16 人物動畫／Live2D | 控制介面、角色狀態與載入／錯誤顯示 | Sprite、Rive／Lottie 或 Live2D 的 Canvas 渲染 |
| F02 網站內桌寵 | 情緒、台詞、開關、暫停及低頻狀態 | `requestAnimationFrame`、位置與動畫更新 |
| F21 粒子／視差／WebGL | 設定面板、模式切換及降級狀態 | CSS、Canvas、PixiJS／Three.js 的逐幀渲染 |
| F15 小遊戲 | 選單、分數、狀態與 UI overlay | DOM／Canvas 或必要時的遊戲 runtime |

高頻動畫與 GPU render loop 不經由 Svelte 逐幀更新 DOM；元件卸載時必須停止 listener、timer、animation frame、音訊及 renderer。F16 仍可獨立評估 Sprite、Rive、Lottie 或 Live2D runtime。

### Step 1 實作與技術 QA 紀錄

2026-07-20 已建立 `/lab/islands/`，以完全相同的四狀態角色互動情境並排比較原生 TypeScript 與 Svelte 5 Island。兩側都支援按鈕、方向鍵／Home／End、最多五筆最近紀錄、重設，以及 F26 reduced motion／economy 共用偏好。Svelte 使用 `client:load`，初始 HTML 已包含完整 SSR 內容；hydration 後才顯示 `Hydrated`，不使用空白 loading shell。

Svelte 只管理低頻狀態、清單與 UI 事件，未將裝飾動畫放入逐幀元件更新。原生版本在 `pagehide` 清理事件與偏好訂閱；Svelte 版本透過元件生命週期取消偏好訂閱。正式 build guard 也已納入本頁、Svelte 元件與目前 lab-only runtime 資產。

技術驗證結果：

- `pnpm build:lab` 通過，`/lab/islands/` 產生完整 SSR 頁面。
- `pnpm build` 通過；`dist/lab`、`dist/lab-assets` 與 Step 1 Svelte lab-only assets 均不留在正式輸出。
- 瀏覽器確認兩側狀態切換、鍵盤操作、五筆上限、重設、hydration 與共用偏好同步正常。
- 360／768／1440 px 無水平溢位；1440 px 為雙欄，360／768 px 為單欄。
- Console error／warning 為 0；`git diff --check` 無 whitespace error。

2026-07-20 使用者已完成人工驗收。驗收期間將狀態差異調整為可直接辨識：`spark` 星芒放大至 25px；`cheer` 角色上移 10px、星環週期縮短為 1.8 秒，三顆 35px 星芒同時自轉並以 1.25／1.8／2.45 秒不同週期繞中心公轉，其中一顆反向；`sleep` 維持縮小、降亮度與停止裝飾動畫。原生 TypeScript 與 Svelte 兩側共用相同視覺規則，使用者確認最終效果通過。

Step 1 結論：採用 Svelte 作為 Phase 3 複雜互動的低頻 UI／狀態層，但簡單功能仍可保留原生 TypeScript；人物、桌寵、Canvas、WebGL 與遊戲的高頻 render loop 不交由 Svelte 逐幀更新。Step 1 正式完成。

## 5. Step 2～5 的停止點

### Step 2・F16

- 先書面比較靜態圖／Animated WebP、Sprite、Rive／Lottie、Live2D。
- 一次只實作一種正式候選 runtime；沒有模型與授權時不直接安裝 Live2D SDK。
- 必須有靜態 fallback 與手機／低效能降級。
- 2026-07-20 使用者希望實際完成 Live2D 概念測試；目前規劃先以官方 Cubism SDK for Web 與授權條款允許的官方原創範例模型驗證網站整合，再選配原創概念人物與 Cubism Editor 建模。
- 詳細階段、授權閘門、使用者協助項目與 QA 條件記錄於 `Astro功能實驗室－Phase3-Step2-F16-Live2D概念驗證.md`。
- 2026-07-21 已以 Cubism SDK for Web 5-r.5 建立 `/lab/character-animation/`；不新增 npm dependency，原始 ZIP 不提交。Miara 最初通過初步瀏覽器 QA，但使用者認為風格不符，已改採官方 `koharu_haruto_ja` 配布包中的 Koharu。2048px 貼圖約 1.43 MB；Haruto 暫不納入。使用者已確認 Koharu 風格、比例與持續待機符合概念測試需求；共用偏好亦新增「完整動態」，並分開顯示設定值與解析結果。F16 隨後擴充為 6 群組、11 段 motion 的完整檢視器，可逐一指定 Idle 3 段、Tap 4 段與四向 Flick。
- 最終 QA 已完成：錯誤 fixture 可停止半初始化 renderer、保留 fallback 並正常重試；768／1440px 無溢位；三輪載入、暫停、繼續、離頁、返回與再載入皆維持單一 Canvas，Console error／warning 為 0。元件以冪等 `pagehide`／卸載 cleanup 釋放 runtime。Lab／production build 與正式輸出隔離通過，先前的 `picomatch` 問題未再重現。Step 2 正式完成，詳細證據位於 Step 2 紀錄。

### Step 3・F02

- 優先沿用 Step 2 的人物渲染方式，不建立第二套角色 runtime。
- 基本需求為待機、點擊反應、關閉／暫停與不遮內容；拖曳與持久化不是第一版必要條件。
- 2026-07-21 初版固定角落控制面板未通過人工驗收，已依回饋重做為小型透明無邊框桌寵：Koharu 會在 viewport 內低頻隨機遊走，可直接拖曳並以點擊觸發 Tap 對話；暫停與收合改藏在極簡選單。每次出發會重新隨機抽選四向 Flick 其中一段原生循環，抵達後切回隨機 Idle。角色桌機為 168×205px、手機為 136×166px，透明／零邊框、遊走、點擊、360／768／1440px、單一 Canvas 與 viewport 限制已通過瀏覽器 QA；沒有新增 dependency。使用者已完成第二次人工驗收，確認尺寸、透明外觀、拖曳、點擊、遊走速度與 motion 搭配符合預期。Step 3 正式完成，詳細範圍與證據位於 `Astro功能實驗室－Phase3-Step3-F02網站內桌寵.md`。

### Step 4・F21

- CSS／Canvas 先行；只有需要真正 3D、shader 或模型才開 Three.js 決策閘門。
- 長時間執行不得持續增加記憶體，手機與 economy 必須降級。
- 2026-07-21 已開始 `/lab/ambient-effects/`：同頁比較 CSS 分層、Canvas 星塵與合併效果，提供模式切換、暫停、回復視角、桌機指標視差與點擊短星芒。Standard／Economy／Reduced motion、hidden tab、resize 與 cleanup 共用單一生命週期；粒子池有固定上限，DPR 上限 2。現有需求不需要 3D、shader 或模型，因此不新增 Three.js。詳細契約與 QA 條件記錄於 `Astro功能實驗室－Phase3-Step4-F21粒子視差與WebGL.md`。
- 2026-07-21 主要技術 QA 通過：Lab build 成功，桌機三模式與暫停／繼續正確，Economy 為 18 顆、Reduced motion 為靜態，360×800 為 32 顆且無水平溢位。預設 production build 在 Astro content sync 載入 `picomatch@4.0.5` 時遇到 `require is not defined`，發生於頁面編譯前；待工具鏈問題排除後補驗正式輸出排除條件。Step 4 尚待使用者人工驗收，不標記完成。
- 2026-07-22 修正視差離場即歸零而使重設按鈕無感的問題，並將抽象星塵／光暈景深增強為星塵 18px、遠景 12px、中景 28px、近景 44px；文字層保持固定。使用者重新驗證視差與「回復中央視角」後確認通過，Step 4 完成。正式網站若需照片或角色影像視差，素材另案處理。

### Step 5・F15

- 先做一個規則簡單、可重新開始、鍵鼠與觸控可玩的 Prototype。
- DOM／Canvas 先行；只有碰撞、場景或資源管理真的不足才評估遊戲引擎。
- 2026-07-22 使用者核准第一版概念「幫蒂兒收集氣質」：玩家在 30 秒內收集中央寫有「氣質」的發光星星，累積氣質值與 Combo，包含一般／閃耀氣質星、階段稱號、結算稱號及 10 Combo 的 3 秒「全體氣質時刻」。第一版使用既有 Svelte 管理低頻遊戲狀態、Canvas 2D 負責高頻繪製，沿用共用音效與偏好，不新增遊戲引擎，也不依賴角色或圖片素材。
- 鍵鼠、觸控與鍵盤皆需可完成一局；Reduced motion、Economy、hidden tab、Resize、重開與卸載有明確降級／清理契約。Live2D 角色反應、害羞星、語音與專用美術皆為核心玩法驗收後的選配，不阻擋第一版完成。詳細規劃與 QA 條件記錄於 `Astro功能實驗室－Phase3-Step5-F15小遊戲.md`。
- 2026-07-22 第一版已實作於 `/lab/mini-game/`：包含 30 秒狀態機、一般／閃耀氣質星、計分、Combo、全體氣質時刻、暫停／繼續／重開、四級結算稱號、本機最佳紀錄、Pointer 與完整鍵盤輸入。Lab build 39 頁、桌機實玩、Reduced motion／Economy、360×800 無溢位、生命週期與 Console QA 通過；production build 仍在頁面編譯前重現既有 `picomatch@4.0.5` 工具鏈錯誤。等待使用者人工完成一局並驗收玩法後再標記 Step 5 完成。
- 2026-07-22 使用者已完成實際遊玩驗收並確認目前效果可接受，Step 5 正式完成。第一版採用「幫蒂兒收集氣質」作為核心 Prototype；害羞星、Live2D 角色反應、語音與正式美術不納入本輪完成範圍。

## 6. 下一步

Phase 3 已結案。下一步開始 Phase 4・F24 投稿表單／後端評估；正式開發前先界定資料欄位、個資、審核、防濫用與靜態部署是否需要後端。F25 PWA／離線功能仍排在 F24 之後。production build 的 `picomatch`／Vite content sync 問題保留至乾淨依賴環境優先處理。
