# 課綱代碼篩選功能設計

**日期：** 2026-05-20
**目標檔案：** `knowledge-map/map.js`、`knowledge-map/index.html`

---

## 功能概述

在知識地圖網頁新增「按課綱代碼篩選」功能。選取一個代碼（如 N-3-1）後，地圖高亮所有含該代碼的單元，右側顯示這些單元的教學重點列表（可展開/收合），讓老師快速看出一條課綱學習內容跨哪些年級出現、每年的教學重點是什麼。

---

## 架構

### 新增狀態變數

```js
let filterCode = null;  // null = 正常模式；"N-3-1" = 篩選模式
```

現有 `viewMode`、`cardMode`、`layoutMode` 保持不變，`filterCode` 獨立運作。

### 新增函式

| 函式 | 說明 |
|------|------|
| `filterByCode(code)` | 設定 filterCode、更新地圖高亮、呼叫 renderFilterPanel |
| `renderFilterPanel(code)` | 產生右側多單元列表 HTML |
| `clearFilter()` | 清除 filterCode、還原地圖、右側回預設狀態 |

### 現有函式改動

| 函式 | 改動 |
|------|------|
| `renderCard()` | 每個 indicator code chip 加 `onclick="filterByCode('...')"` |
| `renderToolbar()` | 加一個 `<select>` 下拉選單 |

---

## 篩選面板（右側）

進入篩選模式後，右側卡片整個替換為篩選面板：

```
┌─────────────────────────────────┐
│ N-3-1  ✕                        │  代碼 + 關閉按鈕
│ 除以一位數：除法直式計算…        │  代碼說明文字
│ 共 3 個單元                      │
├─────────────────────────────────┤
│ 3年下・數  U2 除法               │  精簡列（預設展開）
│ • 理解除法算式的意義              │
│ • 解決…                          │
├─────────────────────────────────┤
│ 4年上・數  U4 整數的除法  ▶      │  點標題可收合/展開
└─────────────────────────────────┘
```

**排序：** 年級 → 學期（1上 → 1下 → 2上 → … → 6下）

**預設狀態：** 全部展開（教學重點條列 3-6 條，不長）

**三下單元標示：** 加小標籤 `現正授課`

**點地圖節點：** 該單元在列表中 scroll into view + 短暫閃爍（border 加深 0.4s）

**點標題：** toggle 展開/收合

---

## 地圖行為（篩選模式中）

- 含該代碼的節點：正常顏色 + 深色邊框（`#1e293b`），opacity 1
- 其他節點：opacity 降至 0.3，`pointer-events: none`（不可點擊）
- 關閉篩選：所有節點 opacity 還原，回到原本 viewMode

---

## 篩選入口

### 工具列下拉選單

位置：工具列最右側（搜尋框右邊）

```
[全部] [點選] | 固定 自動 | 🔍搜尋  [課綱代碼 ▼]
```

- 預設選項：「課綱代碼」（灰色提示）
- 選項來源：從 units 陣列收集所有不重複 indicator code，字母排序
- 選完觸發 `filterByCode(code)`
- 篩選中：選單顯示目前代碼
- 選回「課綱代碼」→ 觸發 `clearFilter()`

### 卡片上的代碼 chip

```
課綱指標
┌────────────────────────────┐
│ [N-3-5]  除以一位數：除法… │
└────────────────────────────┘
```

- `N-3-5` 用 chip 樣式（深色背景，可 hover）
- `onclick="filterByCode('N-3-5')"`
- 觸發後同步更新工具列下拉顯示值

---

## 樣式新增

```css
/* 可點擊的 indicator code chip */
.indicator-code { cursor: pointer; }
.indicator-code:hover { background: #4f46e5; color: white; border-radius: 4px; }

/* 篩選面板 */
.filter-header { display: flex; justify-content: space-between; ... }
.filter-desc { font-size: 12px; color: #64748b; ... }
.filter-unit { border-bottom: 1px solid #f1f5f9; ... }
.filter-unit-header { cursor: pointer; ... }
.filter-unit.current-grade .filter-unit-header::after { content: '現正授課'; ... }
```

---

## 不在此次範圍

- activities 欄位填入
- 多代碼同時篩選
- 篩選結果匯出
