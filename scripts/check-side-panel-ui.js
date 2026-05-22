const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'map.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(html.includes('.card-tabs'), 'index.html 缺少 card-tabs 樣式');
assert(html.includes('.concept-card'), 'index.html 缺少 concept-card 樣式');
assert(html.includes('.source-note'), 'index.html 缺少 source-note 樣式');
assert(html.includes('font-size: 14px') || html.includes('font-size:14px'), '右側內容字級未提升到 14px');

assert(js.includes('cardTab'), 'map.js 缺少 cardTab 狀態');
assert(js.includes('setCardTab'), 'map.js 缺少 setCardTab 切換函式');
assert(js.includes('card-tab-btn'), 'renderCard 缺少 tab 按鈕');
assert(js.includes('概念') && js.includes('關聯') && js.includes('來源'), '右側 tabs 缺少概念/關聯/來源');

console.log('Side panel UI check passed');
