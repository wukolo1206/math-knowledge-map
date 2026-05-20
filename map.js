// map.js — 國小數學知識地圖
// 目前年級（保留供未來擴充用，地圖本身不特殊標示）
const CURRENT_GRADE = 3;
const CURRENT_SEMESTER = 2;

const DOMAIN_COLORS = {
  '數':  { bg: '#dbeafe', text: '#1d4ed8' },
  '計算':{ bg: '#d1fae5', text: '#065f46' },
  '量測':{ bg: '#fef3c7', text: '#92400e' },
  '空間':{ bg: '#ede9fe', text: '#5b21b6' },
  '關係':{ bg: '#fce7f3', text: '#9d174d' },
  '統計':{ bg: '#e0f2fe', text: '#0c4a6e' },
};

const GRADE_LABELS = [
  [1,1],[1,2],[2,1],[2,2],[3,1],[3,2],
  [4,1],[4,2],[5,1],[5,2],[6,1],[6,2],
];

const STRANDS = {
  '整數位值': ['G1A-U1','G1A-U3','G1A-U6','G1B-U1','G1B-U6','G2A-U1','G2B-U1','G3A-U1','G4A-U1','G4B-U3'],
  '加減':    ['G1A-U4','G1A-U7','G1A-U8','G1B-U2','G1B-U4','G1B-U8','G2A-U2','G2A-U6','G2B-U2','G3A-U2'],
  '乘除':    ['G2A-U7','G2A-U9','G2B-U5','G2B-U6','G2B-U9','G3A-U4','G3A-U7','G3B-U2','G4A-U2','G4A-U4','G4A-U8','G4B-U1','G4B-U8','G5A-U8'],
  '分數':    ['G2B-U10','G3A-U9','G3B-U1','G4A-U9','G4B-U7','G5A-U4','G5A-U6','G5B-U2','G6A-U2','G6B-U1'],
  '小數':    ['G3B-U5','G4A-U7','G4B-U5','G4B-U7','G5A-U1','G5B-U4','G5B-U6','G5B-U8','G6A-U4','G6B-U1'],
  '因倍數':  ['G5A-U2','G5A-U3','G6A-U1'],
  '幾何':    ['G1A-U5','G1B-U3','G2B-U3','G2B-U8','G3A-U5','G3B-U6','G4A-U3','G4A-U6','G4B-U2','G5A-U5','G5A-U7','G5A-U10','G6A-U6','G6A-U9'],
  '量測':    ['G1A-U2','G1B-U5','G1B-U7','G2A-U3','G2A-U10','G2B-U7','G3A-U3','G3A-U8','G3B-U4','G4A-U5','G5B-U10'],
  '面積體積':['G2A-U5','G3A-U6','G4B-U6','G4B-U10','G5A-U9','G5B-U1','G5B-U3','G5B-U7','G6A-U7','G6B-U3'],
  '時間':    ['G1A-U9','G1B-U9','G2A-U8','G2B-U4','G3B-U8','G4B-U9','G5B-U9'],
  '規律關係':['G2A-U4','G3B-U3','G3B-U7','G4B-U4','G6A-U3'],
  '統計':    ['G3B-U9','G4A-U10','G5B-U5','G6B-U6'],
  '比率速率':['G5B-U8','G6A-U5','G6A-U8','G6B-U2','G6B-U4'],
  '綜合解題':['G6B-U5'],
};

const STRAND_COLORS = {
  '整數位值':'#78716c', '加減':'#ef4444', '乘除':'#10b981',
  '分數':'#ec4899',     '小數':'#06b6d4', '因倍數':'#8b5cf6',
  '幾何':'#6366f1',     '量測':'#f59e0b', '面積體積':'#f97316',
  '時間':'#0ea5e9',     '規律關係':'#14b8a6', '統計':'#84cc16',
  '比率速率':'#d946ef', '綜合解題':'#64748b',
};

let units = [];
let viewMode   = 'all';    // 'all' | 'click'
let cardMode   = 'side';   // 'side' | 'float'
let layoutMode = 'fixed';  // 'fixed' | 'auto'
let selectedId = null;
let filterCode = null;  // null = 正常模式；'N-3-1' 等 = 篩選模式
let unitStrandColor = {};
let nodesDS, edgesDS, network, nodePositions;

// ── ID 對照 ────────────────────────────────────────────────────
function gToJsonId(gid) {
  var m = gid.match(/^G(\d)([AB])-U(\d+)$/);
  if (!m) return null;
  var grade = parseInt(m[1]), sem = m[2] === 'A' ? 1 : 2, no = parseInt(m[3]);
  var u = units.find(function(u) { return u.grade===grade && u.semester===sem && u.unit_number===no; });
  return u ? u.id : null;
}

function buildStrandColorMap() {
  Object.keys(STRANDS).forEach(function(name) {
    var color = STRAND_COLORS[name];
    STRANDS[name].forEach(function(gid) {
      var id = gToJsonId(gid);
      if (id && !unitStrandColor[id]) unitStrandColor[id] = color;
    });
  });
}

function buildNodePositions() {
  var SEM_IDX = {
    '1-1':0,'1-2':1,'2-1':2,'2-2':3,'3-1':4,'3-2':5,
    '4-1':6,'4-2':7,'5-1':8,'5-2':9,'6-1':10,'6-2':11
  };
  var pos = {};
  units.forEach(function(u) {
    pos[u.id] = { x: SEM_IDX[u.grade+'-'+u.semester] * 220, y: u.unit_number * 100 + 20 };
  });
  return pos;
}

function buildVisDatasets() {
  var nodeItems = units.map(function(u) {
    var dc = DOMAIN_COLORS[u.domain] || { bg: '#e2e8f0', text: '#475569' };
    var sc = unitStrandColor[u.id];
    var border = sc || dc.text;
    var p = nodePositions[u.id];
    var sl = u.semester === 1 ? '上' : '下';
    return {
      id: u.id,
      label: u.grade + '年' + sl + '\n' + u.title,
      title: u.grade + '年' + sl + ' U' + u.unit_number + '・' + u.title,
      x: p.x, y: p.y,
      fixed: { x: true, y: true },
      font: { size: 12, color: dc.text, face: 'system-ui', multi: false },
      color: {
        background: dc.bg, border: border,
        highlight: { background: dc.bg, border: border }
      },
      borderWidth: 3, borderWidthSelected: 4,
      shape: 'box', margin: 6,
      widthConstraint: { maximum: 110 }
    };
  });

  var edgeItems = [];
  var drawn = new Set();
  units.forEach(function(u) {
    (u.successors || []).forEach(function(sid) {
      var key = u.id + '|' + sid;
      if (drawn.has(key)) return;
      drawn.add(key);
      var toUnit = unitById(sid);
      edgeItems.push({
        id: key, from: u.id, to: sid,
        dashes: (toUnit && toUnit.grade !== u.grade) ? [5, 3] : false,
        color: { color: '#cbd5e1' },
        width: 1,
        arrows: { to: { enabled: true, scaleFactor: 0.5 } },
        smooth: { type: 'curvedCW', roundness: 0.1 }
      });
    });
  });

  return {
    nodesDS: new vis.DataSet(nodeItems),
    edgesDS: new vis.DataSet(edgeItems)
  };
}

function getDefaultNodeStyle(u) {
  var dc = DOMAIN_COLORS[u.domain] || { bg: '#e2e8f0', text: '#475569' };
  var sc = unitStrandColor[u.id];
  var border = (viewMode === 'all' && sc) ? sc : dc.text;
  return {
    id: u.id,
    color: { background: dc.bg, border: border,
             highlight: { background: dc.bg, border: border } },
    borderWidth: 3, opacity: 1
  };
}

function clearHighlight() {
  selectedId = null;
  nodesDS.update(units.map(function(u) {
    var p = nodePositions[u.id];
    return Object.assign(getDefaultNodeStyle(u), { hidden: false, x: p.x, y: p.y, fixed: { x: true, y: true } });
  }));
  edgesDS.update(edgesDS.getIds().map(function(eid) {
    return { id: eid, hidden: false, color: { color: '#cbd5e1' }, width: 1 };
  }));
  document.getElementById('card-panel').innerHTML =
    '<div class="card-empty"><div><div style="font-size:48px;margin-bottom:12px">🗺️</div>' +
    '<div>點選單元<br>查看知識脈絡</div></div></div>';
  if (cardMode === 'float') {
    document.getElementById('float-card').classList.remove('visible');
  }
  network.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
}

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

// ── 輔助函式 ───────────────────────────────────────────────────
function semLabel(s) { return s === 1 ? '上' : '下'; }
function gradeLabel(g, s) { return g + semLabel(s); }
function unitById(id) { return units.find(function(u) { return u.id === id; }); }

function allAncestors(id) {
  var visited = new Set(), queue = [id];
  while (queue.length) {
    var u = unitById(queue.shift());
    if (!u) continue;
    u.prerequisites.forEach(function(p) { if (!visited.has(p)) { visited.add(p); queue.push(p); } });
  }
  return visited;
}
function allDescendants(id) {
  var visited = new Set(), queue = [id];
  while (queue.length) {
    var u = unitById(queue.shift());
    if (!u) continue;
    u.successors.forEach(function(s) { if (!visited.has(s)) { visited.add(s); queue.push(s); } });
  }
  return visited;
}

function buildChain(id) {
  var up = [], cur = id, n = 0;
  while (cur && n++ < 30) {
    var u = unitById(cur); if (!u) break;
    up.unshift(cur);
    var preds = u.prerequisites.map(unitById).filter(Boolean)
      .sort(function(a,b){ return (a.grade*2+a.semester)-(b.grade*2+b.semester); });
    cur = preds.length ? preds[0].id : null;
  }
  var dn = [], cur2 = id; n = 0;
  while (cur2 && n++ < 30) {
    var u2 = unitById(cur2); if (!u2) break;
    if (cur2 !== id) dn.push(cur2);
    var succs = u2.successors.map(unitById).filter(Boolean)
      .sort(function(a,b){ return (a.grade*2+a.semester)-(b.grade*2+b.semester); });
    cur2 = succs.length ? succs[0].id : null;
  }
  return up.concat(dn);
}

// ── 子圖位置計算 ──────────────────────────────────────────────
function calcSubgraphPositions(id, ancestors, descendants) {
  var levels = {};
  levels[id] = 0;

  // BFS upward (prerequisites → negative levels)
  var queue = [{ nid: id, level: 0 }];
  while (queue.length) {
    var item = queue.shift();
    var u = unitById(item.nid);
    if (!u) continue;
    u.prerequisites.forEach(function(pid) {
      if (ancestors.has(pid) && !(pid in levels)) {
        levels[pid] = item.level - 1;
        queue.push({ nid: pid, level: item.level - 1 });
      }
    });
  }

  // BFS downward (successors → positive levels)
  queue = [{ nid: id, level: 0 }];
  while (queue.length) {
    var item = queue.shift();
    var u = unitById(item.nid);
    if (!u) continue;
    u.successors.forEach(function(sid) {
      if (descendants.has(sid) && !(sid in levels)) {
        levels[sid] = item.level + 1;
        queue.push({ nid: sid, level: item.level + 1 });
      }
    });
  }

  // Group nodes by level, then assign x/y
  var byLevel = {};
  Object.keys(levels).forEach(function(nid) {
    var lv = levels[nid];
    if (!byLevel[lv]) byLevel[lv] = [];
    byLevel[lv].push(nid);
  });

  var positions = {};
  Object.keys(byLevel).forEach(function(lv) {
    var nodes = byLevel[lv];
    nodes.forEach(function(nid, i) {
      positions[nid] = {
        x: (i - (nodes.length - 1) / 2) * 180,
        y: parseInt(lv) * 150
      };
    });
  });
  return positions;
}

function buildLayeredLists(id) {
  var prereqLayers = [];
  var visited = new Set([id]);
  var currentLayer = (unitById(id).prerequisites || []).filter(function(pid) {
    if (!unitById(pid) || visited.has(pid)) return false;
    visited.add(pid);
    return true;
  });
  while (currentLayer.length) {
    prereqLayers.push(currentLayer.slice());
    var nextLayer = [];
    currentLayer.forEach(function(pid) {
      var pu = unitById(pid);
      if (!pu) return;
      (pu.prerequisites || []).forEach(function(ppid) {
        if (unitById(ppid) && !visited.has(ppid)) { visited.add(ppid); nextLayer.push(ppid); }
      });
    });
    currentLayer = nextLayer;
  }

  var succLayers = [];
  visited = new Set([id]);
  currentLayer = (unitById(id).successors || []).filter(function(sid) {
    if (!unitById(sid) || visited.has(sid)) return false;
    visited.add(sid);
    return true;
  });
  while (currentLayer.length) {
    succLayers.push(currentLayer.slice());
    var nextLayer = [];
    currentLayer.forEach(function(sid) {
      var su = unitById(sid);
      if (!su) return;
      (su.successors || []).forEach(function(ssid) {
        if (unitById(ssid) && !visited.has(ssid)) { visited.add(ssid); nextLayer.push(ssid); }
      });
    });
    currentLayer = nextLayer;
  }

  return { prereqLayers: prereqLayers, succLayers: succLayers };
}

// ── 工具列 ────────────────────────────────────────────────────

// ── 選取單元 ──────────────────────────────────────────────────
function selectUnit(id) {
  var unit = unitById(id);
  if (!unit) return;
  selectedId = id;

  var ancestors   = allAncestors(id);
  var descendants = allDescendants(id);
  var visible = new Set([id]);
  ancestors.forEach(function(aid) { visible.add(aid); });
  descendants.forEach(function(did) { visible.add(did); });

  var subPos = calcSubgraphPositions(id, ancestors, descendants);

  nodesDS.update(units.map(function(u) {
    if (!visible.has(u.id)) {
      return { id: u.id, hidden: true };
    }
    var p = subPos[u.id] || nodePositions[u.id];
    var dc = DOMAIN_COLORS[u.domain] || { bg: '#e2e8f0', text: '#475569' };
    var colorStyle;
    if (u.id === id) {
      colorStyle = { color: { background: dc.bg, border: '#1e293b',
                    highlight: { background: dc.bg, border: '#1e293b' } }, borderWidth: 4 };
    } else if (ancestors.has(u.id)) {
      colorStyle = { color: { background: '#fff7ed', border: '#f97316',
                    highlight: { background: '#fff7ed', border: '#f97316' } }, borderWidth: 3 };
    } else {
      colorStyle = { color: { background: '#f0fdf4', border: '#22c55e',
                    highlight: { background: '#f0fdf4', border: '#22c55e' } }, borderWidth: 3 };
    }
    return Object.assign({ id: u.id, hidden: false, opacity: 1, x: p.x, y: p.y, fixed: { x: true, y: true } }, colorStyle);
  }));

  edgesDS.update(edgesDS.get().map(function(edge) {
    if (!visible.has(edge.from) || !visible.has(edge.to)) {
      return { id: edge.id, hidden: true };
    }
    var isPrereq = ancestors.has(edge.from) && (ancestors.has(edge.to) || edge.to === id);
    var isSucc   = (edge.from === id || descendants.has(edge.from)) && descendants.has(edge.to);
    var color = isPrereq ? '#f97316' : (isSucc ? '#22c55e' : '#cbd5e1');
    var width = (isPrereq || isSucc) ? 2.5 : 1;
    return { id: edge.id, hidden: false, color: { color: color }, width: width };
  }));

  network.fit({ nodes: Array.from(visible), animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
  renderCard(unit, id);
}

// ── 卡片 ──────────────────────────────────────────────────────
function renderCard(unit, selectedId) {
  var panel = cardMode === 'float'
    ? document.getElementById('float-card-body')
    : document.getElementById('card-panel');
  if (cardMode === 'float') {
    document.getElementById('float-card').classList.add('visible');
  }
  var dc = DOMAIN_COLORS[unit.domain] || { bg:'#e2e8f0', text:'#475569' };

  var lists = buildLayeredLists(selectedId);
  var directPrereq = lists.prereqLayers[0] || [];
  var directSucc   = lists.succLayers[0]   || [];

  function directLayerHTML(ids, cls) {
    if (!ids.length) return '<div class="empty-hint">無</div>';
    return ids.map(function(nid) {
      var u = unitById(nid); if (!u) return '';
      var sl = u.semester === 1 ? '上' : '下';
      return '<div class="layer-item ' + cls + '" onclick="selectUnit(\'' + nid + '\')">' +
        '<span class="layer-grade">' + u.grade + '年' + sl + '</span>' +
        '<span class="layer-title">' + u.title + '</span></div>';
    }).join('');
  }

  var prereqHTML = directLayerHTML(directPrereq, 'prereq-item');
  var succHTML   = directLayerHTML(directSucc,   'succ-item');

  var indHTML = unit.indicators.length
    ? unit.indicators.map(function(i) {
        return '<div class="indicator-item">' +
          '<div class="indicator-code" onclick="filterByCode(\'' + i.code + '\')" title="點擊篩選此代碼">' +
            i.code +
          '</div>' + i.text +
        '</div>';
      }).join('') : '<div class="empty-hint">待填入</div>';

  var actHTML = unit.activities.length
    ? unit.activities.map(function(a,i) {
        return '<div class="activity-item"><div class="activity-num">'+(i+1)+'</div><span>'+a+'</span></div>';
      }).join('') : '<div class="empty-hint">待填入</div>';

  var toolsHTML = unit.tools.length
    ? '<div class="section-label">教學工具</div><div>' +
        unit.tools.map(function(t) {
          return '<a href="'+t.url+'" target="_blank" class="tool-link">'+t.name+' →</a>';
        }).join('') + '</div>' : '';

  var notesHTML = unit.notes
    ? '<div class="section-label">備課提醒</div><div class="notes-box">'+unit.notes+'</div>' : '';

  var objHTML = unit.objectives.length
    ? '<ul style="padding-left:16px;font-size:12px;line-height:1.8;color:#374151">' +
        unit.objectives.map(function(o) { return '<li>'+o+'</li>'; }).join('') + '</ul>'
    : '<div class="empty-hint">待填入</div>';

  var conceptHTML = (unit.concepts && unit.concepts.length)
    ? unit.concepts.map(function(c) {
        return '<div class="indicator-item">' +
          '<div style="font-weight:700;color:#1e293b;margin-bottom:2px">' + c.name + '</div>' +
          '<div>' + c.description + '</div>' +
          (c.source_note ? '<div style="font-size:10px;color:#94a3b8;margin-top:3px">' + c.source_note + '</div>' : '') +
        '</div>';
      }).join('')
    : '';

  var misconceptionHTML = (unit.misconceptions && unit.misconceptions.length)
    ? unit.misconceptions.map(function(m) {
        return '<div class="notes-box" style="margin-bottom:6px">' +
          '<div style="font-weight:700;margin-bottom:2px">' + m.name + '</div>' +
          '<div>' + m.description + '</div>' +
          (m.source_note ? '<div style="font-size:10px;color:#a16207;margin-top:3px">' + m.source_note + '</div>' : '') +
        '</div>';
      }).join('')
    : '';

  var relationHTML = (unit.concept_relations && unit.concept_relations.length)
    ? '<ul style="padding-left:16px;font-size:12px;line-height:1.7;color:#374151">' +
        unit.concept_relations.map(function(r) {
          return '<li><strong>' + r.type + '</strong>：' + r.from + ' → ' + r.to +
            (r.note ? '<br><span style="color:#64748b">' + r.note + '</span>' : '') + '</li>';
        }).join('') + '</ul>'
    : '';

  panel.innerHTML =
    '<div class="card-content">' +
      '<span class="card-badge" style="background:'+dc.bg+';color:'+dc.text+'">' +
        gradeLabel(unit.grade,unit.semester)+'・'+unit.domain+'</span>' +
      '<div class="card-title">'+unit.title+'</div>' +
      (conceptHTML ? '<div class="section-label">核心概念</div>' + conceptHTML : '') +
      (misconceptionHTML ? '<div class="section-label">容易卡住的點</div>' + misconceptionHTML : '') +
      (relationHTML ? '<div class="section-label">概念銜接</div>' + relationHTML : '') +
      '<div class="section-label">課綱指標</div>' + indHTML +
      '<div class="section-label">學習目標</div>' + objHTML +
      '<div class="section-label">直接先備（' + directPrereq.length + '個）</div>' + prereqHTML +
      '<div class="section-label">直接後續（' + directSucc.length + '個）</div>' + succHTML +
      '<div class="section-label">課本活動</div>' + actHTML +
      toolsHTML + notesHTML +
    '</div>';
}

// ── 初始化 ────────────────────────────────────────────────────

function renderToolbar() {
  var tb = document.getElementById('toolbar');
  tb.innerHTML = '';

  // 主線群組
  var strandLbl = document.createElement('span');
  strandLbl.className = 'tb-label'; strandLbl.textContent = '主線';
  strandLbl.title = '展開/收起圖例'; strandLbl.onclick = toggleLegend;
  tb.appendChild(strandLbl);
  [['全線標示','all'],['點選高亮','click']].forEach(function(pair) {
    var btn = document.createElement('button');
    btn.className = 'mode-btn' + (viewMode === pair[1] ? ' active' : '');
    btn.textContent = pair[0]; btn.dataset.strand = pair[1];
    btn.onclick = function() { setStrandMode(pair[1]); };
    tb.appendChild(btn);
  });

  var sep1 = document.createElement('div'); sep1.className = 'tb-sep'; tb.appendChild(sep1);

  // 佈局群組
  var layoutLbl = document.createElement('span');
  layoutLbl.className = 'tb-label'; layoutLbl.textContent = '佈局';
  tb.appendChild(layoutLbl);
  [['固定年級','fixed'],['自動排列','auto']].forEach(function(pair) {
    var btn = document.createElement('button');
    btn.className = 'mode-btn' + (layoutMode === pair[1] ? ' active' : '');
    btn.textContent = pair[0]; btn.dataset.layout = pair[1];
    btn.onclick = function() { setLayout(pair[1]); };
    tb.appendChild(btn);
  });

  var sep2 = document.createElement('div'); sep2.className = 'tb-sep'; tb.appendChild(sep2);

  // 卡片群組
  var cardLbl = document.createElement('span');
  cardLbl.className = 'tb-label'; cardLbl.textContent = '卡片';
  tb.appendChild(cardLbl);
  [['側欄','side'],['浮窗','float']].forEach(function(pair) {
    var btn = document.createElement('button');
    btn.className = 'mode-btn' + (cardMode === pair[1] ? ' active' : '');
    btn.textContent = pair[0]; btn.dataset.card = pair[1];
    btn.onclick = function() { setCardMode(pair[1]); };
    tb.appendChild(btn);
  });

  var sep3 = document.createElement('div'); sep3.className = 'tb-sep'; tb.appendChild(sep3);

  // 搜尋框
  var search = document.createElement('input');
  search.id = 'search-box'; search.placeholder = '搜尋單元…';
  search.oninput = function() { applySearch(this.value.trim()); };
  tb.appendChild(search);

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

  buildLegend();
}

function buildLegend() {
  var leg = document.getElementById('strand-legend');
  leg.innerHTML = '';
  Object.keys(STRAND_COLORS).forEach(function(name) {
    var item = document.createElement('span');
    item.className = 'legend-item';
    item.innerHTML = '<i style="background:' + STRAND_COLORS[name] + '"></i>' + name;
    leg.appendChild(item);
  });
}

function toggleLegend() {
  document.getElementById('strand-legend').classList.toggle('open');
}

function setStrandMode(mode) {
  viewMode = mode;
  document.querySelectorAll('[data-strand]').forEach(function(b) {
    b.classList.toggle('active', b.dataset.strand === mode);
  });
  if (selectedId) {
    selectUnit(selectedId);
  } else {
    nodesDS.update(units.map(function(u) { return getDefaultNodeStyle(u); }));
  }
}

function applySearch(q) {
  if (!q) {
    if (selectedId) { selectUnit(selectedId); return; }
    nodesDS.update(units.map(function(u) { return getDefaultNodeStyle(u); }));
    edgesDS.update(edgesDS.getIds().map(function(eid) {
      return { id: eid, color: { color: '#cbd5e1' }, width: 1 };
    }));
    return;
  }
  var ql = q.toLowerCase();
  nodesDS.update(units.map(function(u) {
    var dc = DOMAIN_COLORS[u.domain] || { bg: '#e2e8f0', text: '#475569' };
    if (u.title.toLowerCase().indexOf(ql) !== -1) {
      return { id: u.id, color: { background: dc.bg, border: '#1e293b',
               highlight: { background: dc.bg, border: '#1e293b' } }, borderWidth: 3, opacity: 1 };
    }
    return { id: u.id, opacity: 0.1 };
  }));
  edgesDS.update(edgesDS.getIds().map(function(eid) {
    return { id: eid, color: { color: 'rgba(203,213,225,0.06)' }, width: 1 };
  }));
}

function setLayout(mode) {
  layoutMode = mode;
  document.querySelectorAll('[data-layout]').forEach(function(b) {
    b.classList.toggle('active', b.dataset.layout === mode);
  });
  if (mode === 'auto') {
    nodesDS.update(units.map(function(u) {
      return { id: u.id, fixed: { x: false, y: false } };
    }));
    network.setOptions({ physics: {
      enabled: true,
      barnesHut: { gravitationalConstant: -3000, centralGravity: 0.3, springLength: 180 }
    }});
    network.once('stabilized', function() {
      network.setOptions({ physics: { enabled: false } });
    });
  } else {
    network.setOptions({ physics: { enabled: false } });
    nodesDS.update(units.map(function(u) {
      var p = nodePositions[u.id];
      return { id: u.id, x: p.x, y: p.y, fixed: { x: true, y: true } };
    }));
    network.fit({ animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
  }
}

function setCardMode(mode) {
  cardMode = mode;
  var cardPanel = document.getElementById('card-panel');
  var floatCard = document.getElementById('float-card');
  document.querySelectorAll('[data-card]').forEach(function(b) {
    b.classList.toggle('active', b.dataset.card === mode);
  });
  if (mode === 'float') {
    cardPanel.classList.add('hidden');
    if (selectedId) {
      var unit = unitById(selectedId);
      if (unit) renderCard(unit, selectedId);
    }
  } else {
    cardPanel.classList.remove('hidden');
    floatCard.classList.remove('visible');
    if (selectedId) {
      var unit = unitById(selectedId);
      if (unit) renderCard(unit, selectedId);
    }
  }
}

function makeDraggable(el, handle) {
  handle.addEventListener('mousedown', function(e) {
    var rect = el.getBoundingClientRect();
    var startX = e.clientX, startY = e.clientY;
    var startLeft = rect.left;
    var startTop = rect.top;
    el.style.right = 'auto'; el.style.bottom = 'auto';
    el.style.left = startLeft + 'px'; el.style.top = startTop + 'px';
    function onMove(e) {
      el.style.left = (startLeft + e.clientX - startX) + 'px';
      el.style.top  = (startTop  + e.clientY - startY) + 'px';
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    e.preventDefault();
  });
}

async function init() {
  try {
    var resp = await fetch('data/units.json');
    units = await resp.json();
    buildStrandColorMap();
    nodePositions = buildNodePositions();

    var ds = buildVisDatasets();
    nodesDS = ds.nodesDS;
    edgesDS = ds.edgesDS;

    var container = document.getElementById('vis-container');
    network = new vis.Network(container, { nodes: nodesDS, edges: edgesDS }, {
      physics: { enabled: false },
      interaction: {
        hover: true, tooltipDelay: 200,
        zoomView: true, dragView: true,
        dragNodes: false, selectConnectedEdges: false
      },
      nodes: { shape: 'box', margin: 6, widthConstraint: { maximum: 110 } },
      edges: {
        arrows: { to: { enabled: true, scaleFactor: 0.5 } },
        smooth: { type: 'curvedCW', roundness: 0.1 }
      }
    });

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

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        if (filterCode) clearFilter();
        else clearHighlight();
      }
    });

    document.getElementById('float-card-close').onclick = function() {
      document.getElementById('float-card').classList.remove('visible');
      clearHighlight();
    };

    makeDraggable(
      document.getElementById('float-card'),
      document.getElementById('float-card-header')
    );

    renderToolbar();
  } catch(err) {
    document.getElementById('vis-container').innerHTML =
      '<p style="color:red;padding:16px">資料載入失敗：' + err.message +
      '<br>請用 python -m http.server 8080 啟動，再開啟 http://localhost:8080/knowledge-map/</p>';
  }
}

init();
