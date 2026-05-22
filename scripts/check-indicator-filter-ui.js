const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'map.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(html.includes('.filter-chip'), 'index.html 缺少目前篩選 chip 樣式');
assert(html.includes('.filter-summary-grid'), 'index.html 缺少指標摘要網格樣式');
assert(html.includes('.filter-objective-list'), 'index.html 缺少指標單元目標列表樣式');

assert(js.includes('buildIndicatorContextIds'), 'map.js 缺少指標脈絡節點計算');
assert(js.includes('renderFilterChip'), 'map.js 缺少工具列篩選 chip');
assert(js.includes('filter-context'), 'map.js 缺少指標脈絡節點樣式');
assert(js.includes('定位地圖'), '右側指標單元卡缺少定位地圖行為');
assert(js.includes('network.fit({ nodes: Array.from(visibleIds)'), '指標篩選未聚焦相關節點');

console.log('Indicator filter UI check passed');
