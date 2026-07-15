---
schemaVersion: 1
record:
  id: "FXX"
  slug: "feature-slug"
  name: "功能名稱"
  phase: "Phase X"
  status: "planned" # planned | in-progress | testing | complete
  owner: ""
  createdAt: "YYYY-MM-DD"
  updatedAt: "YYYY-MM-DD"
  demoPath: "/lab/example/"

scope:
  prototype: "說明本次 Prototype 實際要證明的內容"
  formalPotential: "若採用，正式版可以擴充到哪裡"
  limitations: "瀏覽器、Astro 或專案範圍內明確做不到的部分"
  outOfScope:
    - "本次明確不處理的內容"

userExperience:
  scenario: "使用者在什麼情境下使用"
  interaction: "滑鼠、鍵盤、觸控與其他操作方式"
  expectedValue: "此功能如何幫助理解、瀏覽或回饋"
  knownRisks:
    - "可能造成困惑、遮擋、暈動或操作負擔的情況"

estimateHours:
  research: 0
  design: 0
  assets: 0
  development: 0
  responsive: 0
  accessibility: 0
  debug: 0
  qa: 0
  revision: 0
  prototypeTotal: 0
  formalIntegration: 0
  total: 0

actualHours:
  research: 0
  design: 0
  assets: 0
  development: 0
  responsive: 0
  accessibility: 0
  debug: 0
  qa: 0
  revision: 0
  total: 0
  estimateVariancePercent: null

assets:
  required:
    - name: "素材名稱"
      format: "PNG / SVG / MP4 / MP3 / other"
      dimensions: "寬 × 高或不適用"
      quantity: 0
      layered: false
      source: "自製 / 官方 / 授權來源"
      license: "授權條款或待確認"
      attribution: "署名方式或不適用"
      productionHours: 0
  fallbackAsset: "素材失效或低效能裝置使用的替代內容"

responsive:
  desktop1440: "pending" # pending | pass | conditional | fail | not-applicable
  tablet768: "pending"
  mobile360: "pending"
  landscape: "pending"
  touch: "pending"
  noHover: "pending"
  notes: "斷點、裁切、觸控目標與簡化策略"

dependencies:
  nativeApproach: "先測試的 Astro / HTML / CSS / TypeScript / Browser API 方案"
  packageCandidate: "套件名稱或無"
  packageVersion: ""
  addedTransferKb: null
  license: ""
  maintenanceStatus: ""
  integrationRisk: ""
  exitPlan: "套件不採用或移除時的替代方案"
  decision: "native" # native | package | pending | not-applicable
  rationale: "選擇原生或套件方案的客觀理由"

feasibility:
  level: "pending" # high | medium | low | pending
  technicalConditions: "技術前提"
  assetConditions: "素材前提"
  maintenanceConditions: "後續維護前提"

performance:
  initialJavaScriptKb: null
  imageKb: null
  fontKb: null
  otherMediaKb: null
  thirdPartyRequests: 0
  targetFps: 60
  observedFps: null
  memoryMb: null
  lcpMs: null
  cls: null
  lighthouse:
    performance: null
    accessibility: null
    bestPractices: null
    seo: null
  pageHiddenBehavior: "持續動畫或媒體在頁面不可見時如何處理"
  notes: "測試裝置、網路條件與結果限制"

accessibility:
  keyboard: "pending"
  focusOrder: "pending"
  focusReturn: "pending"
  screenReader: "pending"
  audioControls: "not-applicable"
  alternativeText: "pending"
  reducedMotion: "pending"
  colorContrast: "pending"
  notes: "使用的工具、操作路徑與已知限制"

compatibility:
  chrome: "pending"
  edge: "pending"
  firefox: "pending"
  safari: "pending"
  iosSafari: "pending"
  androidChrome: "pending"
  notes: "版本、實體裝置或模擬環境"

fallbacks:
  javascriptDisabled: "JavaScript 關閉時的結果"
  thirdPartyBlocked: "第三方 script、Cookie 或追蹤被擋時的結果"
  assetFailure: "圖片、影片、音訊或模型失效時的結果"
  lowPerformance: "低效能或節能模式下的結果"
  unsupportedBrowser: "瀏覽器不支援 API 時的結果"

privacyAndLicensing:
  cookies: "無 / 有，說明用途"
  tracking: "無 / 有，說明用途"
  thirdPartyConnections:
    - "網域、傳送時機、傳送資料或無"
  contentRights: "角色、圖片、影音與文字授權"
  sdkLicense: "SDK 或套件授權"
  consentRequired: false
  notes: "需要再次確認的發布條件"

acceptance:
  criteria:
    - id: "AC-01"
      description: "可客觀重現與判定的條件"
      method: "測試步驟或測量方式"
      result: "pending" # pending | pass | fail | blocked | not-applicable
      evidence: "截圖、紀錄或檔案路徑"
  overall: "pending"
  testedAt: ""
  testedBy: ""

deliverables:
  demoPage: "/lab/example/"
  screenshots:
    desktop1440: ""
    tablet768: ""
    mobile360: ""
  keyboardTest: ""
  touchTest: ""
  reducedMotionTest: ""
  fallbackTest: ""
  performanceRecord: ""
  reusableComponent: ""
  remainingIssues:
    - "尚未解決的問題或無"

decision:
  result: "pending" # 採用 | 條件採用 | 保留研究 | 不採用 | pending
  rationale: "依驗收、效能、素材與維護成本說明原因"
  conditions:
    - "條件採用時必須滿足的條件或無"
  followUp:
    - "下一步工作或無"
---

# FXX　功能名稱－實驗紀錄

> 使用方式：複製本檔並重新命名為 `FXX-feature-slug.md`。保留所有欄位；不適用的項目填寫 `not-applicable` 並說明原因，不要直接刪除。

## 1. 實驗摘要

- **實驗目的**：
- **Demo 路徑**：`/lab/example/`
- **開始日期**：
- **完成日期**：
- **負責人**：
- **目前狀態**：規劃中／製作中／測試中／完成

## 2. 能力範圍與邊界

### Prototype 要證明什麼

請描述最小可驗證範圍。

### 正式版可擴充內容

請描述通過後可能整理成的頁面、元件或共用模組。

### 做不到與本次不處理的內容

- 

## 3. 使用者體驗

- **使用情境**：
- **主要操作路徑**：
- **對使用者的實際價值**：
- **可能造成的負擔**：
- **不能只靠 Hover、動畫或聲音傳達的資訊**：

## 4. 技術方案與套件決策

### 原生基線

請記錄 Astro、HTML、CSS、TypeScript 或瀏覽器 API 的做法與限制。

### 套件候選

| 項目 | 紀錄 |
|---|---|
| 套件與版本 | 無／待評估 |
| 增加的傳輸量 | 待測 |
| 授權 | 待確認 |
| 維護狀態 | 待確認 |
| 整合與衝突風險 | 待確認 |
| 移除與退出方案 | 待確認 |

### 最終選擇理由

請依程式量、JS 大小、功能缺口、無障礙與維護成本作出判斷。

## 5. 素材清單

| 素材 | 格式／尺寸 | 數量 | 分層 | 來源／授權 | 署名 | 製作工時 |
|---|---|---:|---|---|---|---:|
| 待填 | 待填 | 0 | 否 | 待確認 | 不適用 | 0 |

替代素材與載入失敗策略：

## 6. RWD 與輸入方式

| 情境 | 結果 | 證據與備註 |
|---|---|---|
| 桌機 1440 px | 待測 |  |
| 平板 768 px | 待測 |  |
| 手機 360 px | 待測 |  |
| 橫向畫面 | 待測 |  |
| 觸控 | 待測 |  |
| 無 Hover | 待測 |  |

## 7. 無障礙測試

- [ ] 鍵盤能完成所有主要操作。
- [ ] 焦點順序符合閱讀順序。
- [ ] 關閉覆蓋介面後焦點回到合理位置。
- [ ] 螢幕閱讀器能理解名稱、角色與狀態。
- [ ] 音訊可控制，且資訊不只靠聲音傳達。
- [ ] 圖片與媒體有適當替代文字。
- [ ] `prefers-reduced-motion` 與站內動態偏好有效。
- [ ] 文字與控制項對比足夠。

測試工具、路徑與限制：

## 8. 瀏覽器相容性

| 瀏覽器／裝置 | 版本 | 結果 | 已知差異 |
|---|---|---|---|
| Chrome |  | 待測 |  |
| Edge |  | 待測 |  |
| Firefox |  | 待測 |  |
| Safari |  | 待測 |  |
| iOS Safari |  | 待測 |  |
| Android Chrome |  | 待測 |  |

## 9. 降級與失敗處理

| 情境 | 預期結果 | 實際結果 | 通過 |
|---|---|---|---|
| JavaScript 關閉 | 核心內容仍可閱讀 | 待測 | 待定 |
| 第三方被阻擋 | 顯示可理解的 fallback | 待測 | 待定 |
| 素材載入失敗 | 保留尺寸、說明與替代內容 | 待測 | 待定 |
| 低效能／節能模式 | 停用或簡化非必要效果 | 待測 | 待定 |
| API 不支援 | 回到原生或靜態內容 | 待測 | 待定 |

## 10. 隱私與授權

- **Cookie**：
- **追蹤**：
- **第三方連線與傳送時機**：
- **角色、圖片、影音與文字權利**：
- **套件或 SDK 授權**：
- **是否需要使用者同意**：

## 11. 效能紀錄

測試裝置、網路與量測方式：

| 指標 | 實驗前 | 實驗後 | 差異／判讀 |
|---|---:|---:|---|
| 初始 JavaScript KB |  |  |  |
| 圖片 KB |  |  |  |
| 字型 KB |  |  |  |
| 其他媒體 KB |  |  |  |
| 第三方請求數 |  |  |  |
| FPS |  |  |  |
| 記憶體 MB |  |  |  |
| LCP ms |  |  |  |
| CLS |  |  |  |

| Lighthouse | 分數 | 備註 |
|---|---:|---|
| Performance |  |  |
| Accessibility |  |  |
| Best Practices |  |  |
| SEO |  |  |

## 12. 工時紀錄

| 工作 | 預估小時 | 實際小時 | 差異原因 |
|---|---:|---:|---|
| 研究 | 0 | 0 |  |
| 設計 | 0 | 0 |  |
| 素材 | 0 | 0 |  |
| 程式開發 | 0 | 0 |  |
| RWD | 0 | 0 |  |
| 無障礙 | 0 | 0 |  |
| 除錯 | 0 | 0 |  |
| QA | 0 | 0 |  |
| 修改輪次 | 0 | 0 |  |
| **合計** | **0** | **0** |  |

- **估算差異百分比**：
- **未來同類功能建議緩衝**：

## 13. 驗收標準與結果

| ID | 客觀條件 | 測試方法 | 結果 | 證據 |
|---|---|---|---|---|
| AC-01 | 待定義 | 待定義 | 待測 |  |

不得只填「看起來正常」；條件必須能被另一個人依相同步驟重現。

## 14. 交付物

- [ ] 可直接開啟的 `/lab/...` 示範頁。
- [ ] 原生與套件方案選擇理由。
- [ ] 1440 px 畫面紀錄。
- [ ] 768 px 畫面紀錄。
- [ ] 360 px 畫面紀錄。
- [ ] 鍵盤與觸控測試結果。
- [ ] reduced-motion 測試結果。
- [ ] 失敗 fallback 測試結果。
- [ ] 工時、素材與效能紀錄。
- [ ] 可重用元件，或不採用時的研究結論。

## 15. 最終結論

- **決策**：採用／條件採用／保留研究／不採用
- **理由**：
- **採用條件**：
- **仍待處理問題**：
- **下一步**：

若採用，請列出可重用元件與整合位置；若不採用，不要刪除本紀錄，應保留判斷原因。
