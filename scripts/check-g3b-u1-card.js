const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const units = JSON.parse(fs.readFileSync(path.join(root, 'data', 'units.json'), 'utf8'));
const mapJs = fs.readFileSync(path.join(root, 'map.js'), 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const unit = units.find((u) => u.id === '3d-u1-分數的加減');

assert(unit, '找不到 G3B-U1 分數的加減');
assert(Array.isArray(unit.concepts), 'G3B-U1 缺少 concepts 欄位');
assert(unit.concepts.length === 3, 'G3B-U1 concepts 應有 3 筆核心概念');
assert(
  unit.concepts.map((c) => c.name).join('|') === '和1一樣大的分數|同分母分數加法|同分母分數減法',
  'G3B-U1 核心概念名稱不符合預期'
);
assert(Array.isArray(unit.misconceptions), 'G3B-U1 缺少 misconceptions 欄位');
assert(unit.misconceptions.length === 1, 'G3B-U1 misconceptions 應有 1 筆易錯概念');
assert(unit.misconceptions[0].name === '分母意義混淆', 'G3B-U1 易錯概念名稱不符合預期');
assert(Array.isArray(unit.concept_relations), 'G3B-U1 缺少 concept_relations 欄位');
assert(unit.concept_relations.length > 0, 'G3B-U1 缺少概念銜接資料');
assert(mapJs.includes('核心概念'), 'map.js 卡片尚未呈現核心概念');
assert(mapJs.includes('容易卡住的點'), 'map.js 卡片尚未呈現容易卡住的點');
assert(mapJs.includes('概念銜接'), 'map.js 卡片尚未呈現概念銜接');

console.log('G3B-U1 card data check passed');
