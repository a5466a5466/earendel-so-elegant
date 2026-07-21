# Astro 功能實驗室 Phase 4・停止決策與 GitHub Pages 部署轉向

- 決策日期：2026-07-22
- 目前狀態：Phase 4 功能 Prototype 暫不執行；轉入 GitHub Pages 部署準備
- 決策前 commit：`9a91287 phase 3 done: 完成整合 QA 與結案`
- Dependency：不新增後端、表單或 PWA dependency

## 1. 背景

原企劃的 Phase 4 包含 F24 投稿表單／後端評估與 F25 PWA／離線瀏覽。使用者確認網站預計部署到 GitHub Pages，因此重新檢查這兩項功能的實際價值與維護責任。

GitHub Pages 是靜態託管環境，可以提供 HTML、CSS、JavaScript 與靜態資產，但不能直接執行網站自己的後端、資料庫或 Serverless Function。前端可以顯示及驗證表單，卻不能安全地自行完成投稿接收、永久儲存、審核、防垃圾訊息或刪除請求。

## 2. F24 投稿表單／後端決策

決策：**目前延後，不實作。**

本階段不建立：

- 真實投稿接收與永久儲存。
- 資料庫、Serverless Function 或管理後台。
- Formspree 等第三方表單服務。
- 圖片上傳、公開留言牆或審核流程。
- Email、電話等個人資料欄位。
- 只有外觀但會讓使用者誤以為已成功送出的假表單。

未來只有在出現明確的集中收件需求，且能決定資料用途、保存期間、審核人、垃圾訊息防護、刪除請求與部署責任後，才重新評估 F24。網站若仍部署在 GitHub Pages，後端必須由獨立服務承擔，不能把秘密金鑰放在前端，也不能讓瀏覽器直接寫入 Repository。

## 3. F25 PWA／離線瀏覽決策

決策：**目前不採用，延後到出現實際需求。**

目前網站以粉絲內容、活動頁與互動展示為主，沒有足夠強的離線閱讀、安裝成 App 或高頻回訪需求。現在加入 Service Worker 的成本大於收益：

- 快取舊版頁面或資產會增加更新與除錯困難。
- Live2D、圖片與影音資產容量較大，不適合預設完整離線快取。
- GitHub Pages Repository 子路徑需要額外處理 manifest、scope、start URL 與快取路徑。
- 還需維護安裝圖示、離線頁、版本升級與清除舊快取策略。

未來只有在使用者需要安裝至主畫面、穩定離線閱讀或接近 App 的體驗時，才重新開啟 F25 dependency 與 Service Worker 決策閘門。

## 4. Phase 4 結論

Phase 4 不進入功能實作，也不建立空殼 Prototype。F24 與 F25 都保留在未來需求清單，但不阻擋目前網站發布。功能實驗階段至 Phase 3 結束，下一階段改為 GitHub Pages 部署準備。

## 5. 下一階段順序

1. 修復或在乾淨依賴環境排除 production build 的 `picomatch@4.0.5`／Vite content sync 錯誤。
2. 確認 GitHub Pages 發布型態：使用者／組織站點或 Project Pages，以及對應的正式 URL。
3. 設定 Astro `site`／必要時的 `base`，並確認 root-relative 路由與 `lab-assets` 在 Repository 子路徑下的行為。
4. 建立或檢查 GitHub Actions 靜態部署流程。
5. 決定正式版本是否保留 `/lab/`；目前 production guard 預設排除 Lab。
6. 驗證首頁、404、深層網址、重新整理、圖片、音訊、Live2D 資產與手機版。
7. 完成首次 GitHub Pages 部署與部署後回歸。

部署準備不得順便引入後端或 Service Worker。若未來重新考慮 F24／F25，必須另開決策文件並重新取得使用者同意。
