const fs = require('fs');
const path = require('path');

const units = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'units.json'), 'utf8'));

const sampleIds = [
  '1u-u1-10-以內的數',
  '2d-u10-分數',
  '3d-u1-分數的加減',
  '4u-u3-角度',
  '5d-u8-比率與百分率',
  '6u-u9-放大圖-縮圖與比例尺',
  '6d-u6-圓形圖'
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const id of sampleIds) {
  const unit = units.find((item) => item.id === id);
  assert(unit, '找不到抽查單元 ' + id);

  assert(unit.title && unit.title.trim(), id + ' 缺少單元標題');
  assert(unit.domain && unit.domain.trim(), id + ' 缺少領域資料');
  assert(Array.isArray(unit.indicators), id + ' indicators 不是陣列');
  assert(Array.isArray(unit.objectives), id + ' objectives 不是陣列');

  const concepts = Array.isArray(unit.concepts) ? unit.concepts : [];
  assert(concepts.length > 0, id + ' 缺少核心概念');
  for (const concept of concepts) {
    assert(concept.name && concept.name.trim(), id + ' 有核心概念缺少 name');
    assert(concept.description && concept.description.trim(), id + ' 有核心概念缺少 description');
    assert(concept.source_note && concept.source_note.trim(), id + ' 有核心概念缺少 source_note');
  }

  const relations = Array.isArray(unit.concept_relations) ? unit.concept_relations : [];
  assert(relations.length > 0, id + ' 缺少概念銜接');
  for (const relation of relations) {
    assert(relation.from && relation.from.trim(), id + ' 有概念銜接缺少 from');
    assert(relation.to && relation.to.trim(), id + ' 有概念銜接缺少 to');
    assert(relation.type && relation.type.trim(), id + ' 有概念銜接缺少 type');
  }
}

console.log('Card render sample check passed for ' + sampleIds.length + ' units');
