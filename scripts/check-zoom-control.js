const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'map.js'), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(html.includes('.zoom-btn'), 'index.html 缺少縮放按鈕樣式');
assert(!js.includes('zoom-select'), 'map.js 不應再使用縮放下拉選單');
assert(js.includes('setZoomScale'), 'map.js 缺少 setZoomScale 縮放函式');
assert(js.includes('fitCurrentView'), 'map.js 缺少適合畫面函式');
assert(js.includes('50%') && js.includes('100%') && js.includes('200%'), '縮放倍率缺少 50/100/200 選項');
assert(js.includes('適合畫面'), '縮放按鈕缺少適合畫面選項');
assert(js.includes('setActiveZoomButton'), 'map.js 缺少縮放按鈕狀態更新');
assert(js.includes('network.moveTo'), '縮放倍率未呼叫 vis network.moveTo');
assert(js.includes('formatIndicatorOption'), 'map.js 缺少課綱代碼文字格式化');
assert(js.includes('codeTextByCode'), 'map.js 缺少課綱代碼文字索引');

console.log('Zoom control check passed');
