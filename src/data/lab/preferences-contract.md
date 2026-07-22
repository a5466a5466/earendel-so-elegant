# Lab 共用偏好契約（F26）

更新日期：2026-07-15

## 唯一來源

- 儲存鍵固定為 `earendel-lab-preferences-v2`，只有 `src/scripts/lab/preferences.ts` 可以直接讀寫或清除。
- 使用者設定為 `motion: full|reduce`、`sound: on|off`、`performance: standard|economy`。
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

動態設定提供 `full`、`reduce`，效能設定提供 `standard`、`economy`；所有功能只使用實驗控制器解析後的狀態。純 CSS 功能只讀取 `html[data-motion='reduce']`、`html[data-sound='off']` 與 `html[data-performance='economy']`。Astro 伺服器端輸出使用完整動態、音效開啟與標準效能，不在 frontmatter 存取瀏覽器 API。

```css
html[data-motion='reduce'] .decorative-motion { animation: none; }
html[data-sound='off'] .sound-enabled-only { display: none; }
html[data-performance='economy'] .optional-particle { display: none; }
```

只有偏好控制 UI 可呼叫 `writeLabPreferences()`、`resetLabPreferences()` 與 `applyLabPreferences()`。所有套用結果都發送 `lab:preferences-change`，事件 detail 同時提供使用者設定、解析結果與來源。

共用 `LabControls` 是唯一偏好控制入口；其他頁面與元件只能讀取 Snapshot 或監聽事件，不得另設動態、音效或效能偏好控制。

## 優先序與 fallback

- 動態預設 full；只有使用者在實驗控制器明確選擇時才切換為 reduce。
- 音效預設 on，但瀏覽器仍要求聲音必須由使用者操作觸發，不會自動播放。
- 效能預設 standard；只有使用者明確選擇時才切換為 economy，不自動推測裝置效能。
- localStorage 缺少、拒絕、已滿或資料損壞時，回到 full／on／standard，不阻擋主要內容。
- JavaScript 不可用時，Layout 保留 full／on／standard 的預設屬性，主要內容仍由 Astro 靜態輸出。

## 初始化與頁面生命週期

`initializeLabPreferences()` 可重複呼叫。同一控制器不重複綁定；遇到新頁面控制器時先移除舊的 resize、pointer、storage 與表單 listener。一般 MPA 重新整理會從唯一儲存鍵恢復；其他分頁變更則由 storage event 同步。
