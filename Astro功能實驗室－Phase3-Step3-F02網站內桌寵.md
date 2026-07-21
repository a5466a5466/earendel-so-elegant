# Astro 功能實驗室 Phase 3・Step 3・F02 網站內桌寵

- 建立日期：2026-07-21
- 目前狀態：已完成使用者人工驗收，Step 3 正式完成
- 前置：Step 1 Svelte Island、Step 2 Live2D／Cubism runtime、F26 共用偏好
- Prototype：`/lab/desktop-pet/`
- Dependency：沿用現有 Svelte 與 Cubism SDK for Web，不新增套件

## 1. 目標

驗證 Live2D 人物能否從單頁展示卡片延伸為不妨礙閱讀的網站內桌寵。桌寵只在目前瀏覽器頁面內活動，不跨 Windows 桌面、其他應用程式或網站。

## 2. 第一版範圍

- 初始只顯示啟動按鈕，不下載 Core、模型或貼圖。
- 使用者開啟後，Koharu 以小型透明角色呈現，並在目前可視範圍內低頻隨機遊走；每次出發隨機選擇四向 Flick 其中一段循環，抵達後切回隨機 Idle。
- 點擊反應觸發 Tap motion 與短對話。
- 滑鼠與觸控可直接拖曳角色；拖曳與自主遊走都不會超出 viewport。
- 角色沒有卡片、舞台或視窗邊框；暫停／繼續與收合藏在角色旁的極簡選單。
- reduced motion、economy、頁籤隱藏會停止持續渲染與自主遊走。
- 手機預設維持收合，只有使用者主動開啟才載入簡化尺寸。

Koharu 是 Live2D 官方 Sample Model，只用於技術驗證，不代表厄倫蒂兒或正式網站角色。

## 3. 停止點

第一版不做元素碰撞、尋路、跨頁位置持久化、聲音、AI 對話、麥克風／攝影機或第二套人物 runtime。自主遊走只是 viewport 內的低頻隨機位置更新，不理解頁面元素，也不跨出目前網站。

## 4. 架構

- Astro 提供完整頁面說明與 SSR 啟動按鈕。
- Svelte 管理開關、載入、暫停、隨機目標、拖曳位置、對話及偏好狀態。
- Step 2 `Live2DAdapter` 繼續負責 Cubism 初始化、motion、render loop 與 dispose。
- 高頻人物繪製不透過 Svelte 更新 DOM；遊走只在每次選定新目標時更新位置，由 CSS transition 完成路徑。Flick motion 本身標記為 `Loop: true`，出發時指定一段、抵達時以 Idle motion 取代，不建立額外重播 interval。
- `pagehide`、Svelte unmount、收合與錯誤路徑共用冪等 cleanup。

## 5. QA 與完成條件

- `pnpm build:lab` 與 `pnpm build` 通過；正式輸出不含桌寵路由、bundle 或 Live2D 資產。
- 360／768／1440px 無水平溢位；桌寵不永久遮擋導覽、控制器或核心內容。
- 開啟前沒有模型請求；開啟、Tap、遊走、拖曳、暫停、繼續與收合正常。
- 收合後可重新開啟，始終只有一個 Canvas／renderer。
- reduced motion、economy、頁籤隱藏與離頁清理正常。
- 錯誤時回到可收合／重試狀態，Console error／warning 為 0。
- 使用者人工確認角色尺寸、透明無邊框外觀、拖曳手感、對話、遊走速度與遮擋程度。

## 6. 預定決策

初版固定角落控制面板未通過人工驗收；使用者明確指出桌寵應更小、無視窗邊框、會自行亂跑，且能直接拖曳與點擊。第二版因此把這四項列為必要行為，但仍不加入碰撞、尋路與持久化。

## 7. Prototype 實作與技術 QA（2026-07-21）

已建立 `/lab/desktop-pet/` 與 `DesktopPet.svelte`。初始 SSR 只提供右下角啟動按鈕，頁面資產 inventory 沒有 Live2D／Koharu／Cubism 資產；使用者開啟後才建立單一 Canvas 並載入 Step 2 runtime。第二版提供低頻隨機遊走、拖曳、四句循環對話、Tap 互動、暫停／繼續與收合；收合會把 Canvas 數量由 1 降為 0，重新開啟後仍只有一個 Canvas。

角色外層與 Canvas 都是透明、零邊框；桌機為 168×205px，手機為 136×166px。初版雖已移除 CSS 背景，但 Cubism Sample 的主 framebuffer 仍以 Alpha 1 清成不透明黑色；已將 WebGL context 明確設為 `alpha: true`，並把主畫布每幀 clear Alpha 改為 0，遮罩用 offscreen buffer 維持原設定。360px、768px、1440px 均無水平溢位，resize 會把角色重新限制在 viewport。手機啟動按鈕保留底部安全距離，避免行動瀏覽器 UI 與 Astro dev toolbar 攔截操作。reduced-motion 會立即切至 paused，切回完整動態後由使用者手動繼續。

透明與零邊框、Tap 對話、低頻遊走、暫停、繼續、單一 Canvas 與 viewport reflow 已通過瀏覽器 QA；一次遊走實測位移約 605px，仍完整位於 viewport。拖曳處理會先鎖定角色當下可見位置，避免抓住移動中角色時跳到原目的地。`pnpm build:lab` 通過；完成最後 QA 後再重跑 production isolation。

F16 完整 motion 檢視器完成後，F02 的遊走亦接上四向動作。每次出發會獨立隨機抽選 FlickLeft 04、FlickRight 09、FlickUp 07 或 FlickDown 08，並利用 motion 原生 Loop 持續到 CSS 位移結束；抵達時改播 Idle 06／A／B 其中一段，下次出發重新抽選。瀏覽器連續觀察約 23 秒，得到「向右 09 → 待機 A → 向下 08 → 待機 A → 向左 04 → 待機 06 → 向左 04 → 待機 B → 向下 08」的完整序列；移動途中暫停後位置維持不變，Canvas 仍只有一個。

## 8. 人工驗收與結論（2026-07-21）

使用者已完成新版桌寵人工驗收，確認小型比例、透明無邊框外觀、直接拖曳、點擊反應、遊走速度，以及移動期間四向 motion 循環、停下後回到 Idle 的搭配符合預期。

Step 3 最終採用目前版本，不追加碰撞、尋路或位置持久化，也不新增第二套角色 runtime。F02 網站內桌寵正式完成；下一步為 Phase 3・Step 4・F21 粒子、視差與 WebGL。
