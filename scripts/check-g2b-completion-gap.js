const fs = require('fs');
const path = require('path');

const units = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'units.json'), 'utf8'));

const expectedCoreCounts = new Map([
  [1, 4],
  [2, 4],
  [3, 4],
  [4, 5],
  [5, 2],
  [6, 4],
  [7, 3],
  [8, 2],
  [9, 3],
  [10, 2]
]);

for (const [unitNumber, expectedCount] of expectedCoreCounts.entries()) {
  const unit = units.find((item) => item.grade === 2 && item.semester === 2 && item.unit_number === unitNumber);
  if (!unit) {
    throw new Error('找不到二下第 ' + unitNumber + ' 單元');
  }

  const concepts = Array.isArray(unit.concepts) ? unit.concepts : [];
  if (concepts.length !== expectedCount) {
    throw new Error(unit.id + ' 核心概念數量應為 ' + expectedCount + '，實際為 ' + concepts.length);
  }

  if (!Array.isArray(unit.concept_relations) || unit.concept_relations.length === 0) {
    throw new Error(unit.id + ' 缺少概念銜接資料');
  }
}

console.log('G2B completion gap check passed');
