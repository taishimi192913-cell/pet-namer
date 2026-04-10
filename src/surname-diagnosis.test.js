import test from 'node:test';
import assert from 'node:assert/strict';

import { diagnoseSurnameFit } from './surname-diagnosis.js';

test('diagnoseSurnameFit resolves common surname readings from the database', () => {
  const diagnosis = diagnoseSurnameFit({
    surname: '佐藤',
    petName: 'ムース',
    petReading: 'むーす',
  });

  assert.ok(diagnosis);
  assert.equal(diagnosis.previewReading, 'さとう・むーす');
  assert.equal(diagnosis.source.lookupMatched, true);
  assert.equal(diagnosis.source.rank, 1);
  assert.ok(diagnosis.summary.includes('約188.7万人'));
});

test('diagnoseSurnameFit changes score across surnames when readings differ', () => {
  const satou = diagnoseSurnameFit({
    surname: '佐藤',
    petName: 'ムース',
    petReading: 'むーす',
  });
  const kondou = diagnoseSurnameFit({
    surname: '近藤',
    petName: 'ムース',
    petReading: 'むーす',
  });

  assert.ok(satou);
  assert.ok(kondou);
  assert.notEqual(satou.totalScore, kondou.totalScore);
  assert.notEqual(satou.previewReading, kondou.previewReading);
});

test('diagnoseSurnameFit lowers confidence when surname is not found and reading is missing', () => {
  const diagnosis = diagnoseSurnameFit({
    surname: '宇宙田',
    petName: 'レオ',
    petReading: 'れお',
  });

  assert.ok(diagnosis);
  assert.equal(diagnosis.source.lookupMatched, false);
  assert.ok(diagnosis.source.confidenceScore < 70);
  assert.ok(diagnosis.note.includes('ふりがな'));
});
