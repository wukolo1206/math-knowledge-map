const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const units = JSON.parse(fs.readFileSync(path.join(root, 'data', 'units.json'), 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const expected = new Map([
  [1, 4],
  [2, 4],
  [3, 2],
  [5, 4],
  [6, 3],
  [8, 3]
]);

for (const [unitNo, coreCount] of expected) {
  const unit = units.find((item) => item.grade === 3 && item.semester === 1 && item.unit_number === unitNo);
  assert(unit, '找不到三上第 ' + unitNo + ' 單元');
  assert(Array.isArray(unit.concepts), unit.id + ' 缺少 concepts');
  assert(unit.concepts.length === coreCount, unit.id + ' 核心概念數量應為 ' + coreCount);
  assert(Array.isArray(unit.concept_relations), unit.id + ' 缺少 concept_relations');
  assert(unit.concept_relations.length > 0, unit.id + ' 應有概念銜接資料');
}

console.log('G3A completion gap check passed');
