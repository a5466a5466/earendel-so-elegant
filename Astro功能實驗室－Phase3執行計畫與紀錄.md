# Astro 功能實驗室 Phase 3・執行計畫與紀錄

- 建立日期：2026-07-20
- 目前狀態：Svelte 已由使用者選定；Step 1 F11 等待開始實作
- 開始前 commit：`29c3316 phase 2 step 4 done: 完成整合 QA 與 Phase 2 結案`
- Dependency：Svelte 已獲選為 Phase 3 UI framework，但尚未安裝；其他動畫／3D／遊戲 runtime 仍需先取得使用者同意

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
| 1 | F11 Interactive Islands 決策 | Phase 1～2 原生基線 | Svelte 已選定，等待開始實作 |
| 2 | F16 人物動畫／Live2D 類效果 | Step 1、F26 | 未開始 |
| 3 | F02 網站內桌寵 | Step 2、F26；選配 Audio | 未開始 |
| 4 | F21 粒子、視差與 WebGL | Scroll、F26、Step 2 | 未開始 |
| 5 | F15 小遊戲 | Audio、Step 1、Step 2；選配 Step 4 | 未開始 |
| 6 | Phase 3 整合 QA 與結案 | Step 1～5 決策 | 未開始 |

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

## 5. Step 2～5 的停止點

### Step 2・F16

- 先書面比較靜態圖／Animated WebP、Sprite、Rive／Lottie、Live2D。
- 一次只實作一種正式候選 runtime；沒有模型與授權時不直接安裝 Live2D SDK。
- 必須有靜態 fallback 與手機／低效能降級。

### Step 3・F02

- 優先沿用 Step 2 的人物渲染方式，不建立第二套角色 runtime。
- 基本需求為待機、點擊反應、關閉／暫停與不遮內容；拖曳與持久化不是第一版必要條件。

### Step 4・F21

- CSS／Canvas 先行；只有需要真正 3D、shader 或模型才開 Three.js 決策閘門。
- 長時間執行不得持續增加記憶體，手機與 economy 必須降級。

### Step 5・F15

- 先做一個規則簡單、可重新開始、鍵鼠與觸控可玩的 Prototype。
- DOM／Canvas 先行；只有碰撞、場景或資源管理真的不足才評估遊戲引擎。

## 6. 下一步

Svelte 選型與責任邊界已確定。下一個動作是在使用者指示開始 Step 1 後，安裝官方 `@astrojs/svelte` integration 與 Svelte，建立 `/lab/islands/` 的原生 TypeScript 基準及 Svelte「角色互動狀態台」，再依共同情境與評估指標完成技術 QA。React 不列入實作。
