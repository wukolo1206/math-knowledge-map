const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceRoot = path.resolve(root, '..', '數學學習地圖');
const unitsPath = path.join(root, 'data', 'units.json');

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

function relationTypeLabel(type) {
  const labels = {
    prerequisite: '先備',
    progression: '銜接',
    same_unit: '同單元',
    misconception: '易錯連結',
    related: '相關'
  };
  return labels[type] || type;
}

const units = JSON.parse(fs.readFileSync(unitsPath, 'utf8'));
const concepts = parseCsv(fs.readFileSync(path.join(sourceRoot, 'data', 'concepts.csv'), 'utf8'));
const relations = parseCsv(fs.readFileSync(path.join(sourceRoot, 'data', 'relations.csv'), 'utf8'));
const conceptById = new Map(concepts.map((concept) => [concept.concept_id, concept]));

let updated = 0;

for (const unit of units) {
  if (unit.grade !== 4 || unit.semester !== 2) continue;

  const sourceUnitId = 'G4B-U' + unit.unit_number;
  const unitConcepts = concepts.filter((concept) => concept.unit_id === sourceUnitId);
  const unitConceptIds = new Set(unitConcepts.map((concept) => concept.concept_id));

  unit.concepts = unitConcepts
    .filter((concept) => concept.level === '核心概念')
    .map((concept) => ({
      id: concept.concept_id,
      name: concept.concept_name,
      description: concept.description,
      source_note: concept.source_note
    }));

  unit.misconceptions = unitConcepts
    .filter((concept) => concept.level === '易錯概念')
    .map((concept) => ({
      id: concept.concept_id,
      name: concept.concept_name,
      description: concept.description,
      source_note: concept.source_note
    }));

  unit.concept_relations = relations
    .filter((relation) => unitConceptIds.has(relation.from_id) || unitConceptIds.has(relation.to_id))
    .filter((relation) => conceptById.has(relation.from_id) && conceptById.has(relation.to_id))
    .map((relation) => {
      const from = conceptById.get(relation.from_id);
      const to = conceptById.get(relation.to_id);
      return {
        from: from.concept_name,
        to: to.concept_name,
        type: relationTypeLabel(relation.relation_type),
        note: relation.note
      };
    });

  updated += 1;
}

fs.writeFileSync(unitsPath, JSON.stringify(units, null, 2) + '\n', 'utf8');
console.log('Synced G4B concepts for ' + updated + ' units');
