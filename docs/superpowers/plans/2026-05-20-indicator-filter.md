# 課綱代碼篩選 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在知識地圖新增課綱代碼篩選功能——從工具列或卡片代碼 chip 觸發，右側切換為多單元教學重點列表，地圖高亮相關節點。

**Architecture:** 在 `map.js` 新增 `filterCode` 狀態變數（null = 正常模式，字串 = 篩選模式），新增三個函式（filterByCode / clearFilter / renderFilterPanel），並修改 renderCard、renderToolbar、network click handler。所有改動集中在兩個檔案。

**Tech Stack:** 純 HTML + 原生 JS（無框架），vis-network，需用 `python -m http.server 8080` 啟動後在瀏覽器驗證。

---

## 檔案對照

| 檔案 | 動作 |
|------|------|
| `knowledge-map/index.html` | 新增 CSS（filter panel、chip hover、flash 動畫） |
| `knowledge-map/map.js` | 新增狀態變數、三個新函式、修改四處現有程式碼 |

---

## Task 1：CSS — 篩選面板與 chip 樣式

**Files:**
- Modify: `knowledge-map/index.html`（在 `</style>` 前插入）

- [ ] **Step 1：新增 CSS**

在 `index.html` 第 96 行（`</style>` 前）插入：

```css
/* ── 可點擊 indicator chip ── */
.indicator-code { cursor: pointer; transition: background .15s, color .15s; display: inline-block; }
.indicator-code:hover { background: #4f46e5; color: white; border-radius: 4px; padding: 1px 4px; }

/* ── 篩選面板 ── */
.filter-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px 8px; }
.filter-code-title { font-size: 18px; font-weight: 700; color: #4f46e5; }
.filter-close { background: none; border: none; cursor: pointer; font-size: 18px; color: #94a3b8; padding: 0 4px; line-height: 1; }
.filter-close:hover { color: #475569; }
.filter-desc-text { padding: 0 20px 8px; font-size: 12px; color: #64748b; line-height: 1.5; }
.filter-count { padding: 0 20px 12px; font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: .06em; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; }
.filter-unit { border-bottom: 1px solid #f1f5f9; }
.filter-unit-header { display: flex; align-items: center; gap: 8px; padding: 10px 20px; cursor: pointer; user-select: none; flex-wrap: wrap; }
.filter-unit-header:hover { background: #f8fafc; }
.filter-unit-toggle { font-size: 10px; color: #94a3b8; margin-left: auto; transition: transform .15s; }
.filter-unit.collapsed .filter-unit-toggle { transform: rotate(-90deg); }
.filter-unit-body { padding: 0 20px 12px; }
.filter-unit.collapsed .filter-unit-body { display: none; }
.current-grade-badge { font-size: 10px; background: #fef3c7; color: #92400e; border-radius: 10px; padding: 1px 8px; font-weight: 700; }
@keyframes filter-flash { 0%,100% { background: transparent; } 50% { background: #ede9fe; } }
.filter-unit-flash { animation: filter-flash .4s ease; }
```

- [ ] **Step 2：用瀏覽器開啟確認沒有 CSS 語法錯誤**

```
python -m http.server 8080
```
開啟 `http://localhost:8080/knowledge-map/`，主控台無錯誤。

- [ ] **Step 3：Commit**

```bash
git add knowledge-map/index.html
git commit -m "style: add CSS for indicator filter panel and chip hover"
```

---

## Task 2：新增狀態變數與三個函式

**Files:**
- Modify: `knowledge-map/map.js`

- [ ] **Step 1：新增 filterCode 狀態變數**

在 `map.js` 第 49 行（`let selectedId = null;` 之後）插入：

```js
let filterCode = null;  // null = 正常模式；'N-3-1' 等 = 篩選模式
```

- [ ] **Step 2：新增 filterByCode 函式**

在 `map.js` `clearHighlight` 函式之後（約第 161 行後）插入：

```js
function filterByCode(code) {
  filterCode = code;
  var sel = document.getElementById('filter-code-select');
  if (sel) sel.value = code;

  var matchIds = new Set();
  units.forEach(function(u) {
    if ((u.indicators || []).some(function(ind) { return ind.code === code; })) {
      matchIds.add(u.id);
    }
  });

  nodesDS.update(units.map(function(u) {
    if (matchIds.has(u.id)) {
      var dc = DOMAIN_COLORS[u.domain] || { bg: '#e2e8f0', text: '#475569' };
      return { id: u.id, opacity: 1,
               color: { background: dc.bg, border: '#1e293b',
                        highlight: { background: dc.bg, border: '#1e293b' } },
               borderWidth: 4 };
    }
    return { id: u.id, opacity: 0.15 };
  }));

  selectedId = null;
  renderFilterPanel(code, matchIds);
}

function clearFilter() {
  filterCode = null;
  var sel = document.getElementById('filter-code-select');
  if (sel) sel.value = '';
  nodesDS.update(units.map(function(u) { return getDefaultNodeStyle(u); }));
  document.getElementById('card-panel').innerHTML =
    '<div class="card-empty"><div><div style="font-size:48px;margin-bottom:12px">🗺️</div>' +
    '<div>點選單元<br>查看知識脈絡</div></div></div>';
}

function toggleFilterUnit(id) {
  var el = document.getElementById('filter-unit-' + id);
  if (el) el.classList.toggle('collapsed');
}
```

- [ ] **Step 3：新增 renderFilterPanel 函式**

緊接在 `toggleFilterUnit` 之後插入：

```js
function renderFilterPanel(code, matchIds) {
  var matchUnits = units.filter(function(u) { return matchIds.has(u.id); });
  matchUnits.sort(function(a, b) {
    return (a.grade * 2 + a.semester) - (b.grade * 2 + b.semester);
  });

  var codeText = '';
  for (var i = 0; i < matchUnits.length; i++) {
    var found = (matchUnits[i].indicators || []).find(function(ind) { return ind.code === code; });
    if (found && found.text) { codeText = found.text; break; }
  }

  var html = '<div class="filter-header">' +
    '<span class="filter-code-title">' + code + '</span>' +
    '<button class="filter-close" onclick="clearFilter()">✕</button>' +
    '</div>';

  if (codeText) {
    html += '<div class="filter-desc-text">' + codeText + '</div>';
  }

  html += '<div class="filter-count">共 ' + matchUnits.length + ' 個單元</div>';

  matchUnits.forEach(function(u) {
    var dc = DOMAIN_COLORS[u.domain] || { bg: '#e2e8f0', text: '#475569' };
    var sl = u.semester === 1 ? '上' : '下';
    var isCurrent = (u.grade === CURRENT_GRADE && u.semester === CURRENT_SEMESTER);
    var objHTML = (u.objectives || []).map(function(o) {
      return '<li style="margin-bottom:3px">' + o + '</li>';
    }).join('');

    html += '<div class="filter-unit" id="filter-unit-' + u.id + '">' +
      '<div class="filter-unit-header" onclick="toggleFilterUnit(\'' + u.id + '\')">' +
        '<span class="card-badge" style="background:' + dc.bg + ';color:' + dc.text + ';margin:0;flex-shrink:0">' +
          u.grade + '年' + sl + '・' + u.domain + '</span>' +
        '<span style="font-size:13px;font-weight:700;color:#1e293b">' + u.title + '</span>' +
        (isCurrent ? '<span class="current-grade-badge">現正授課</span>' : '') +
        '<span class="filter-unit-toggle">▼</span>' +
      '</div>' +
      '<div class="filter-unit-body">' +
        '<ul style="padding-left:16px;font-size:12px;line-height:1.8;color:#374151">' + objHTML + '</ul>' +
      '</div>' +
    '</div>';
  });

  document.getElementById('card-panel').innerHTML = html;
}
```

- [ ] **Step 4：瀏覽器驗證函式載入無錯誤**

重新整理 `http://localhost:8080/knowledge-map/`，主控台輸入：
```js
filterByCode('N-3-1')
```
預期：右側出現篩選面板，地圖高亮含 N-3-1 的節點，其他節點淡化。

- [ ] **Step 5：Commit**

```bash
git add knowledge-map/map.js
git commit -m "feat: add filterByCode, clearFilter, renderFilterPanel"
```

---

## Task 3：修改 renderCard — indicator chips 可點擊

**Files:**
- Modify: `knowledge-map/map.js`（約第 392-395 行）

- [ ] **Step 1：修改 indHTML 產生邏輯**

找到這段：
```js
var indHTML = unit.indicators.length
  ? unit.indicators.map(function(i) {
      return '<div class="indicator-item"><div class="indicator-code">'+i.code+'</div>'+i.text+'</div>';
    }).join('') : '<div class="empty-hint">待填入</div>';
```

改為：
```js
var indHTML = unit.indicators.length
  ? unit.indicators.map(function(i) {
      return '<div class="indicator-item">' +
        '<div class="indicator-code" onclick="filterByCode(\'' + i.code + '\')" title="點擊篩選此代碼">' +
          i.code +
        '</div>' + i.text +
      '</div>';
    }).join('') : '<div class="empty-hint">待填入</div>';
```

- [ ] **Step 2：瀏覽器驗證**

1. 點地圖上任一節點，卡片出現
2. 找到「課綱指標」區塊
3. hover 代碼 chip → 應變紫色底
4. 點代碼 chip → 右側切換為篩選面板，工具列 select 同步顯示該代碼

- [ ] **Step 3：Commit**

```bash
git add knowledge-map/map.js
git commit -m "feat: make indicator chips clickable to trigger filter"
```

---

## Task 4：修改 renderToolbar — 新增 filter select

**Files:**
- Modify: `knowledge-map/map.js`（`renderToolbar` 函式，約第 432-486 行）

- [ ] **Step 1：在 renderToolbar 末尾（buildLegend() 前）加入 select**

找到 `renderToolbar` 函式內 `buildLegend();` 這行，在其**之前**插入：

```js
  var sep4 = document.createElement('div'); sep4.className = 'tb-sep'; tb.appendChild(sep4);

  var filterSelect = document.createElement('select');
  filterSelect.id = 'filter-code-select';
  filterSelect.style.cssText = 'padding:3px 8px;border-radius:16px;border:1.5px solid #cbd5e1;font-size:11px;color:#64748b;outline:none;cursor:pointer;background:white;';
  var defaultOpt = document.createElement('option');
  defaultOpt.value = ''; defaultOpt.textContent = '課綱代碼';
  filterSelect.appendChild(defaultOpt);

  var allCodes = [];
  units.forEach(function(u) {
    (u.indicators || []).forEach(function(ind) {
      if (allCodes.indexOf(ind.code) === -1) allCodes.push(ind.code);
    });
  });
  allCodes.sort().forEach(function(code) {
    var opt = document.createElement('option');
    opt.value = code; opt.textContent = code;
    filterSelect.appendChild(opt);
  });

  filterSelect.value = filterCode || '';
  filterSelect.onchange = function() {
    if (this.value) filterByCode(this.value);
    else clearFilter();
  };
  tb.appendChild(filterSelect);
```

- [ ] **Step 2：瀏覽器驗證**

1. 工具列最右側出現下拉選單，預設顯示「課綱代碼」
2. 選 N-1-1 → 篩選面板出現（5 個單元，全一年級）
3. 選回「課綱代碼」→ 篩選清除，地圖恢復
4. 此時從卡片 chip 點代碼 → select 同步顯示該代碼 ✓

- [ ] **Step 3：Commit**

```bash
git add knowledge-map/map.js
git commit -m "feat: add filter code select to toolbar"
```

---

## Task 5：修改 network click handler — 篩選模式行為

**Files:**
- Modify: `knowledge-map/map.js`（`init` 函式內，約第 635-641 行）

- [ ] **Step 1：修改 click handler**

找到：
```js
    network.on('click', function(params) {
      if (params.nodes.length > 0) {
        selectUnit(params.nodes[0]);
      } else {
        clearHighlight();
      }
    });
```

改為：
```js
    network.on('click', function(params) {
      if (params.nodes.length > 0) {
        var nodeId = params.nodes[0];
        if (filterCode) {
          var el = document.getElementById('filter-unit-' + nodeId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            el.classList.add('filter-unit-flash');
            setTimeout(function() { el.classList.remove('filter-unit-flash'); }, 400);
          }
        } else {
          selectUnit(nodeId);
        }
      } else {
        if (filterCode) clearFilter();
        else clearHighlight();
      }
    });
```

- [ ] **Step 2：修改 Escape 鍵處理**

找到：
```js
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') clearHighlight();
    });
```

改為：
```js
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        if (filterCode) clearFilter();
        else clearHighlight();
      }
    });
```

- [ ] **Step 3：瀏覽器完整驗證**

1. 從工具列選 `N-3-1` → 篩選面板顯示所有相關單元
2. 點地圖上高亮節點 → 面板 scroll 到該單元 + 短暫閃紫色
3. 點地圖空白處 → 篩選清除，地圖恢復正常
4. 篩選中按 Escape → 篩選清除
5. 點單元標題 → 該單元的教學重點條列收合/展開
6. 「現正授課」標籤出現在三下單元上
7. 卡片 chip 點擊 → 篩選啟動 + select 同步 + 原來的卡片被取代

- [ ] **Step 4：Commit + Push**

```bash
git add knowledge-map/map.js
git commit -m "feat: handle filter mode in map click and Escape handlers"
git push
```

---

## Self-Review

**Spec coverage check:**
- ✅ filterCode 狀態 → Task 2 Step 1
- ✅ filterByCode / clearFilter / renderFilterPanel → Task 2
- ✅ renderCard chips 可點擊 → Task 3
- ✅ 工具列 select → Task 4
- ✅ 地圖 click 篩選行為 → Task 5
- ✅ scroll + flash → Task 5 Step 1
- ✅ 現正授課標籤 → Task 2 Step 3（renderFilterPanel）
- ✅ CSS → Task 1
- ✅ 年級排序 → Task 2 Step 3（matchUnits.sort）
- ✅ Escape 清除篩選 → Task 5 Step 2

**Placeholder scan:** 無 TBD / TODO。

**Type consistency:** `filterCode`（Task 2 S1）→ 讀於 `filterByCode`（T2 S2）、`clearFilter`（T2 S2）、`renderToolbar` select value（T4 S1）、click handler（T5 S1）、Escape handler（T5 S2）—— 全部一致。函式名稱：`filterByCode`、`clearFilter`、`renderFilterPanel`、`toggleFilterUnit`—— 所有呼叫處均與定義一致。
