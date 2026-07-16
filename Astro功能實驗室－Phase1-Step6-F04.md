# Astro 功能實驗室 Phase 1・Step 6・F04 Page Transition

- 開始日期：2026-07-16
- 完成日期：2026-07-16
- 目前狀態：完成，技術驗證與使用者人工驗收均通過
- 開始前 commit：`14da708 phase1 step 5 done`
- 新增 dependency：無
- 最終核准決策：採用原生 MPA cross-document View Transition；不採用 ClientRouter

## 比較範圍

- 普通 MPA 無轉場：從 Step 6 列表前往既有活動詳情頁。
- 原生效果：長淡入、左右滑入、縮放進場、中央布幕揭露與共享元素。
- 共享元素：列表卡片與 `/lab/transitions/shared/` 使用相同 `view-transition-name`。
- 直接開啟、重新整理、返回、reduced-motion、不支援環境與 JavaScript 關閉的降級。

## 決策理由

原生跨文件 View Transition 不攔截連結、不改寫 History，也不改變 Astro MPA 的 script 執行模型。現階段沒有必須跨頁持續的播放器或共享狀態，因此 ClientRouter 帶來的 script 重建、焦點公告、捲動與 listener 管理成本沒有對應收益。

## 固定契約

完整規則位於 `src/data/lab/transition-contract.md`。摘要如下：

- 預設候選為長淡入；共享元素限少數明確情境。
- 不支援或 reduced-motion 時直接換頁。
- script 每份文件初始化一次，但初始化仍須可重入並提供 dispose。
- 不攔截 History，不讓轉場承擔內容或狀態傳遞。

## 驗收狀態

- [x] Lab build 通過，三個 Step 6 路由存在
- [x] 正式 build 不含 Step 6 路由或資產
- [x] 靜態確認 opt-in、共享名稱唯一、reduced-motion 與普通連結
- [x] 前進、返回、重整、深層網址與 HTTP 狀態通過
- [x] 使用者比較九種轉場與返回行為
- [x] 使用者核准「原生 MPA View Transition；不採 ClientRouter」

## 技術驗證結果

| 項目 | 結果 | 證據 |
|---|---|---|
| `pnpm build:lab` | 通過 | 16 個輸出頁面，含 3 個 Step 6 路由 |
| `pnpm build` | 通過 | 正式首頁保留；Lab、Step 6 路由與命名資產均為 0 |
| 原生 opt-in | 通過 | 列表、fade、shared 含 `@view-transition`；無轉場活動詳情不含 |
| 共享元素 | 通過 | 列表與 shared 詳情各 1 個；fade 詳情為 0 |
| Reduced motion | 通過 | system media query 與 Lab `data-motion='reduce'` 均停用動畫 |
| ClientRouter | 未採用 | 無 `astro:transitions` import、Router 元件、History 攔截或 client lifecycle 程式 |
| HTML 基線 | 通過 | 14 個 Lab HTML；重複 ID 0；缺少共用 Navigation 0 |
| 本機 HTTP | 通過 | Step 6 三頁與無轉場基線皆回應 200 |
| `git diff --check` | 通過 | 無 whitespace error；僅 Windows 換行提示 |

第一次 Lab build 曾因 `getStaticPaths()` 無法讀取頁面本地 `modes` 常數而失敗；模式資料已移至 `src/data/lab/transition-prototype.ts`，建置期與頁面渲染改用同一資料來源，後續 Lab／正式 build 均通過。

人工驗收第一輪回饋：原 180ms 淡入不夠明顯，已調整為 180ms 淡出、320ms 淡入，等待再次確認。

使用者要求擴充常用效果供測試；Prototype 已由 3 種增加為 6 種：無轉場、淡入、滑入、縮放、布幕揭露與共享元素。後四種皆為情境選項，不預設套用全站。

人工驗收第二輪回饋與修正：短淡入改為 650ms 長淡入；返回連結改為「六種」；縮放由 95.5% 加強為 88%；布幕由右側揭露改為中央向兩側展開，與右側滑入明確區隔。

人工驗收第三輪發現頁面返回連結沒有延續剛測試的效果。原因是返回目的頁原先固定為 fade；現改由返回連結帶入 `effect` 與 `direction=back`，列表頁在揭露前選用對應效果，Slide 返回方向則反轉為由左側進場。

人工驗收第四輪新增多元素接續、上下推入與點擊位置圓形揭露，Prototype 共 9 種。Circle 只在 pointerdown 記錄座標並維持普通連結；鍵盤操作與無 JavaScript 時安全降級。

## 使用者驗收與結論

- 驗收日期：2026-07-16
- 結果：使用者完成九種效果、頁面返回與多輪調整後，確認 Step 6 完成。
- 核准架構：保留普通 Astro MPA 與原生 History；採用 native cross-document View Transition，不採用 ClientRouter。
- 預設候選：260ms 淡出與 650ms 長淡入。
- 情境效果：Slide、Scale、Wipe、Shared、Stagger、Push、Circle 依內容語意個別採用，不全站混用。
- 降級：reduced-motion、不支援環境與 JavaScript 關閉時維持普通換頁。
