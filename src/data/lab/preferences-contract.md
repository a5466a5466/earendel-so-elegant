# Lab 共用偏好契約（F26）

更新日期：2026-07-15

## 唯一來源

- 儲存鍵固定為 `earendel-lab-preferences-v1`，只有 `src/scripts/lab/preferences.ts` 可以直接讀寫或清除。
- 使用者設定為 `motion: system|reduce`、`sound: off|on`、`performance: auto|standard|economy`。
- 解析結果為 `resolvedMotion: full|reduce` 與 `resolvedPerformance: standard|economy`。
- HTML 根節點固定輸出 `data-motion`、`data-motion-setting`、`data-sound`、`data-performance`、`data-performance-setting`。

## 功能使用方式

TypeScript 功能初始化時使用 `getLabPreferencesSnapshot()`，後續更新使用 `onLabPreferencesChange(callback)`。不得自行讀取 localStorage、建立第二份狀態，或另外監聽 `prefers-reduced-motion`。

```ts
import {
  getLabPreferencesSnapshot,
  onLabPreferencesChange,
} from '../../scripts/lab/preferences';

const initial = getLabPreferencesSnapshot();
const stop = onLabPreferencesChange((detail) => {
  // detail.preferences 是使用者設定；resolvedMotion／resolvedPerformance 是可執行結果。
});

// 元件卸載或頁面替換時呼叫 stop()。
```

純 CSS 功能只讀取 `html[data-motion='reduce']`、`html[data-sound='off']` 與 `html[data-performance='economy']`。Astro 伺服器端輸出使用 Layout 的安全預設，不在 frontmatter 存取瀏覽器 API。

```css
html[data-motion='reduce'] .decorative-motion { animation: none; }
html[data-sound='off'] .sound-enabled-only { display: none; }
html[data-performance='economy'] .optional-particle { display: none; }
```

只有偏好控制 UI 可呼叫 `writeLabPreferences()`、`resetLabPreferences()` 與 `applyLabPreferences()`。所有套用結果都發送 `lab:preferences-change`，事件 detail 同時提供使用者設定、解析結果與來源。

同一頁若有第二個經核准的偏好控制入口，仍必須透過上述 API 寫入；共用 `LabControls` 會監聽 `lab:preferences-change` 並同步下拉選單與摘要，不得讓頁首與頁面內控制顯示不同狀態。

## 優先序與 fallback

- 動態：系統 reduced-motion 永遠可以把結果降為 reduce；站內設定不提供強迫完整動態的選項。
- 音效：預設 off。允許 on 只代表後續功能可在使用者操作後播放，不代表可自動播放。
- 效能：auto 參考 Save-Data 與 deviceMemory；無 API 時安全回到 standard。
- localStorage 缺少、拒絕、已滿或資料損壞時，回到 system／off／auto，不阻擋主要內容。
- JavaScript 不可用時，Layout 保留 full／off／standard 的安全屬性，主要內容仍由 Astro 靜態輸出。

## 初始化與頁面生命週期

`initializeLabPreferences()` 可重複呼叫。同一控制器不重複綁定；遇到新頁面控制器時先移除舊的 resize、media query、storage 與表單 listener。一般 MPA 重新整理會從唯一儲存鍵恢復；其他分頁變更則由 storage event 同步。
