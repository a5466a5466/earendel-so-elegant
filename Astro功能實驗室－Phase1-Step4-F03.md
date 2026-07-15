# Astro 功能實驗室 Phase 1・Step 4 F03 紀錄

- 開始日期：2026-07-15
- 狀態：完成（使用者已驗收目前 Prototype 範圍）
- 完成日期：2026-07-15
- 對應功能：F03 Navigation
- 開始前 commit：`55cfe45 phase1 step3 done`
- 新增 dependency：無

## 1. 範圍

- 固定 Lab 多頁、錨點、列表／詳情導覽規則。
- 建立固定 Header、桌機導覽、手機 Dialog、Escape／焦點返回。
- 修正巢狀路由 `aria-current`，並加入子頁麵包屑。
- 保留普通連結與無 JavaScript fallback，不提前實作 Page Transition。

## 2. 初始盤點

- 原 Layout 只有桌機橫向連結，手機僅縮小間距。
- `aria-current` 使用完整字串相等，活動詳情不會把活動資料標為目前區域。
- 活動詳情已有可靠的「返回活動列表」連結，但沒有麵包屑。
- 頁面錨點為普通 `<a href="#...">`，未攔截 History；固定 Header 上線後需補 scroll margin。

## 3. 實作決策

- 使用 Astro file routing、普通 `<a>`、原生 `<dialog>` 與小型 TypeScript；不新增套件。
- `catalog.ts` 集中路由正規化、目前區域與麵包屑規則。
- 手機選單關閉後由 Dialog 移除互動範圍，Escape 明確恢復按鈕焦點。
- 無 JavaScript 時隱藏無效選單按鈕，顯示普通連結列。
- 導覽規則記錄於 `src/data/lab/navigation-contract.md`。

## 4. 待驗證與人工驗收

- [x] Lab／正式 build 與正式資產隔離通過。
- [x] 7 個 Lab HTML 無重複 ID，且全部包含共用 Navigation 與 Dialog。
- [x] 活動詳情靜態輸出將活動資料標為目前區域，並包含三層麵包屑。
- [x] Lab 索引、活動列表、活動詳情、偏好契約與紀錄模板皆回應 HTTP 200。
- [x] 錨點目標、返回列表、noscript 導覽與固定 Header scroll margin 均存在。
- [x] Navigation 程式沒有使用 `pushState` 或 `replaceState`。
- [x] 使用者確認目前 Navigation Prototype 可接受。
- [x] 手機、完整鍵盤巡覽、深層路由與瀏覽器返回的人工 QA 經使用者確認不作為目前階段阻擋條件。
- [x] 上述技術實作與靜態證據保留，未來準備正式公開時再補跨裝置人工 QA。

## 4.1 技術驗證結果

| 項目 | 結果 | 證據 |
|---|---|---|
| `pnpm build:lab` | 通過 | 9 頁；7 個 Lab HTML |
| `pnpm build` | 通過 | 首頁保留，Lab 路由與資產移除 |
| 正式資產隔離 | 通過 | Layout、Controls、Navigation、preferences 與活動圖片殘留數 0 |
| 路由目前位置 | 通過 | 列表與 3 個詳情皆以活動資料為 current section |
| 麵包屑 | 通過 | 詳情頁為索引／活動資料／活動名稱 |
| HTML 基線 | 通過 | 重複 ID 0；Navigation 缺漏頁 0 |
| 原生 History | 通過 | 無 `pushState`／`replaceState`，所有路由使用普通連結 |
| 本機 HTTP | 通過 | 5 個主要驗收網址皆為 200 |
| `git diff --check` | 通過 | 無 whitespace error；僅 Windows 換行提示 |

## 5. 完成閘門

Step 4 技術工作與目前 Prototype 範圍的使用者驗收皆已完成。使用者於 2026-07-15 決定手機、完整鍵盤、深層路由與返回行為不需要在目前階段追加人工驗證；相關實作保留，但延伸 QA 不阻擋進入 Step 5。
