const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceRoot = path.resolve(root, '..', '數學學習地圖', 'data');

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

function findDuplicates(items) {
  const seen = new Set();
  const duplicates = new Set();
  for (const item of items) {
    if (seen.has(item)) duplicates.add(item);
    seen.add(item);
  }
  return Array.from(duplicates);
}

const concepts = parseCsv(fs.readFileSync(path.join(sourceRoot, 'concepts.csv'), 'utf8'));
const relations = parseCsv(fs.readFileSync(path.join(sourceRoot, 'relations.csv'), 'utf8'));
const activityConcepts = parseCsv(fs.readFileSync(path.join(sourceRoot, 'activity_concepts.csv'), 'utf8'));
const activities = parseCsv(fs.readFileSync(path.join(sourceRoot, 'activities.csv'), 'utf8'));
const candidates = parseCsv(fs.readFileSync(path.join(sourceRoot, 'concept_candidates.csv'), 'utf8'));
const sourceUnits = parseCsv(fs.readFileSync(path.join(sourceRoot, 'units.csv'), 'utf8'));
const units = JSON.parse(fs.readFileSync(path.join(root, 'data', 'units.json'), 'utf8'));

const conceptIds = concepts.map((concept) => concept.concept_id);
const duplicateConceptIds = findDuplicates(conceptIds);
assert(duplicateConceptIds.length === 0, 'concept_id 重複: ' + duplicateConceptIds.join(', '));

const conceptById = new Map(concepts.map((concept) => [concept.concept_id, concept]));
const activityIds = new Set(activities.map((activity) => activity.activity_id));
const unitIds = new Set(sourceUnits.map((unit) => unit.unit_id));

for (const concept of concepts) {
  assert(concept.concept_id && concept.concept_id.trim(), '有概念缺少 concept_id');
  assert(concept.concept_name && concept.concept_name.trim(), concept.concept_id + ' 缺少 concept_name');
  assert(concept.unit_id && concept.unit_id.trim(), concept.concept_id + ' 缺少 unit_id');
  assert(unitIds.has(concept.unit_id), concept.concept_id + ' unit_id 斷鏈: ' + concept.unit_id);
  assert(concept.level && concept.level.trim(), concept.concept_id + ' 缺少 level');
  assert(concept.description && concept.description.trim(), concept.concept_id + ' 缺少 description');
  assert(concept.source_note && concept.source_note.trim(), concept.concept_id + ' 缺少 source_note');
}

for (const relation of relations) {
  assert(conceptById.has(relation.from_id), 'relations.csv from_id 斷鏈: ' + relation.from_id);
  assert(conceptById.has(relation.to_id), 'relations.csv to_id 斷鏈: ' + relation.to_id);
  assert(relation.relation_type && relation.relation_type.trim(), relation.from_id + ' -> ' + relation.to_id + ' 缺少 relation_type');
  assert(relation.note && relation.note.trim(), relation.from_id + ' -> ' + relation.to_id + ' 缺少 note');
}

for (const link of activityConcepts) {
  assert(activityIds.has(link.activity_id), 'activity_concepts.csv activity_id 斷鏈: ' + link.activity_id);
  assert(conceptById.has(link.concept_id), 'activity_concepts.csv concept_id 斷鏈: ' + link.concept_id);
}

for (const candidate of candidates.filter((item) => item.status === 'promoted_to_concepts')) {
  const linkedIds = candidate.linked_concept_ids.split(/[;|]/).map((item) => item.trim()).filter(Boolean);
  assert(linkedIds.length > 0, candidate.candidate_id + ' 已升級但缺少 linked_concept_ids');
  for (const conceptId of linkedIds) {
    assert(conceptById.has(conceptId), candidate.candidate_id + ' linked_concept_ids 斷鏈: ' + conceptId);
  }
}

for (const unit of units.filter((item) => item.title)) {
  const conceptsInUnit = Array.isArray(unit.concepts) ? unit.concepts : [];
  for (const concept of conceptsInUnit) {
    assert(conceptById.has(concept.id), unit.id + ' units.json concept id 來源缺漏: ' + concept.id);
  }

  const relationsInUnit = Array.isArray(unit.concept_relations) ? unit.concept_relations : [];
  for (const relation of relationsInUnit) {
    assert(relation.from && relation.from.trim(), unit.id + ' concept_relations 缺少 from');
    assert(relation.to && relation.to.trim(), unit.id + ' concept_relations 缺少 to');
    assert(relation.type && relation.type.trim(), unit.id + ' concept_relations 缺少 type');
  }
}

console.log('Data quality check passed');
