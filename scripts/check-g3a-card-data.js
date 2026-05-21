const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceRoot = path.resolve(root, '..', '數學學習地圖');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ''));
    rows.push(row);
  }

  const header = rows.shift().map((key) => key.replace(/^\uFEFF/, ''));
  return rows
    .filter((items) => items.some((item) => item !== ''))
    .map((items) => Object.fromEntries(header.map((key, index) => [key, items[index] || ''])));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const units = JSON.parse(fs.readFileSync(path.join(root, 'data', 'units.json'), 'utf8'));
const allConcepts = parseCsv(fs.readFileSync(path.join(sourceRoot, 'data', 'concepts.csv'), 'utf8'));
const sourceConcepts = allConcepts.filter((concept) => concept.unit_id.startsWith('G3A-'));
const relations = parseCsv(fs.readFileSync(path.join(sourceRoot, 'data', 'relations.csv'), 'utf8'));

for (let unitNo = 1; unitNo <= 9; unitNo += 1) {
  const sourceUnitId = 'G3A-U' + unitNo;
  const unit = units.find((item) => item.grade === 3 && item.semester === 1 && item.unit_number === unitNo);
  const concepts = sourceConcepts.filter((concept) => concept.unit_id === sourceUnitId);
  const conceptIds = new Set(concepts.map((concept) => concept.concept_id));
  const core = concepts.filter((concept) => concept.level === '核心概念');
  const misconceptions = concepts.filter((concept) => concept.level === '易錯概念');
  const relatedRelations = relations.filter(
    (relation) => conceptIds.has(relation.from_id) || conceptIds.has(relation.to_id)
  );

  assert(unit, '找不到三上第 ' + unitNo + ' 單元');
  assert(Array.isArray(unit.concepts), unit.id + ' 缺少 concepts');
  assert(unit.concepts.length === core.length, unit.id + ' 核心概念數量應為 ' + core.length);
  assert(Array.isArray(unit.misconceptions), unit.id + ' 缺少 misconceptions');
  assert(
    unit.misconceptions.length === misconceptions.length,
    unit.id + ' 易錯概念數量應為 ' + misconceptions.length
  );
  assert(Array.isArray(unit.concept_relations), unit.id + ' 缺少 concept_relations');
  assert(
    unit.concept_relations.length === relatedRelations.length,
    unit.id + ' 概念銜接數量應為 ' + relatedRelations.length
  );
}

console.log('G3A card data check passed');
