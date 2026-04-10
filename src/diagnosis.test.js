import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { getResults, matchesFilters, scoreMatch } from './diagnosis.js';
import { enrichNamesDatabase } from './name-enrichment.js';

function createFilters(overrides = {}) {
  return {
    species: new Set(),
    gender: new Set(),
    vibe: new Set(),
    color: new Set(),
    length: new Set(),
    theme: new Set(),
    callStyle: new Set(),
    ownerLifestyle: new Set(),
    wish: new Set(),
    uniqueness: new Set(),
    scene: new Set(),
    ...overrides,
  };
}

async function readNamesDataset() {
  const content = await readFile(new URL('../data/names.json', import.meta.url), 'utf8');
  return enrichNamesDatabase(JSON.parse(content));
}

test('matchesFilters keeps unknown color and unisex gender compatibility', () => {
  const item = {
    name: 'ソラ',
    reading: 'そら',
    meaning: '空のように広く自由',
    species: ['犬', '猫'],
    gender: 'どちらでも',
    vibe: ['かわいい'],
    color: ['なし'],
    length: '2',
    theme: ['自然・植物'],
  };

  const filters = createFilters({
    species: new Set(['犬']),
    gender: new Set(['メス']),
    color: new Set(['黒']),
  });

  assert.equal(matchesFilters(item, filters), true);
});

test('scoreMatch returns a bounded integer score with breakdown details', () => {
  const filters = createFilters({
    species: new Set(['犬']),
    gender: new Set(['メス']),
    vibe: new Set(['かわいい']),
    color: new Set(['茶色']),
    length: new Set(['2']),
    theme: new Set(['食べ物・スイーツ']),
  });
  const item = {
    name: 'モカ',
    reading: 'もか',
    meaning: '2023年犬4位。コーヒーモカのようなまろやかな茶色。',
    species: ['犬'],
    gender: 'メス',
    vibe: ['かわいい'],
    color: ['茶色'],
    length: '2',
    theme: ['食べ物・スイーツ'],
  };

  const match = scoreMatch(item, filters);

  assert.equal(Number.isInteger(match.score), true);
  assert.ok(match.score >= 0 && match.score <= 99);
  assert.equal(typeof match.rawScore, 'number');
  assert.equal(match.label, 'ぴったり');
  assert.equal(typeof match.breakdown.baseRatio, 'number');
  assert.ok(match.breakdown.components.species.value > 0.9);
  assert.ok(match.breakdown.tieBreakers.popularity.value > 0.6);
});

test('scoreMatch rewards exact metadata over generic fallback matches', () => {
  const filters = createFilters({
    species: new Set(['犬']),
    gender: new Set(['メス']),
    vibe: new Set(['かわいい']),
    color: new Set(['茶色']),
    length: new Set(['2']),
    theme: new Set(['食べ物・スイーツ']),
  });

  const exactItem = {
    name: 'モカ',
    reading: 'もか',
    meaning: '2023年犬4位。コーヒーモカのようなまろやかな茶色。',
    species: ['犬'],
    gender: 'メス',
    vibe: ['かわいい'],
    color: ['茶色'],
    length: '2',
    theme: ['食べ物・スイーツ'],
  };
  const genericItem = {
    name: 'パコ美',
    reading: 'ぱこみ',
    meaning: '大久保佳代子の愛犬。チワックス。番組共演多数。',
    species: ['犬', '猫', 'うさぎ', 'ハムスター', '鳥'],
    gender: 'どちらでも',
    vibe: ['かわいい'],
    color: ['なし'],
    length: '3',
    theme: ['洋風・モダン'],
  };

  const exactMatch = scoreMatch(exactItem, filters);
  const genericMatch = scoreMatch(genericItem, filters);

  assert.ok(exactMatch.score > genericMatch.score);
  assert.ok(exactMatch.breakdown.components.color.value > genericMatch.breakdown.components.color.value);
  assert.ok(exactMatch.breakdown.components.gender.value > genericMatch.breakdown.components.gender.value);
  assert.ok(exactMatch.breakdown.components.species.value > genericMatch.breakdown.components.species.value);
});

test('getResults reduces score ties on a real dataset scenario', async () => {
  const allNames = await readNamesDataset();
  const filters = createFilters({
    species: new Set(['犬', '猫']),
    vibe: new Set(['かわいい', '洋風']),
  });

  const { items } = getResults(allNames, filters);
  const uniqueScores = new Set(items.map((item) => item.match.score));
  const uniqueEffectiveScores = new Set(items.map((item) => Number(item.match.query.effectiveScore.toFixed(3))));

  assert.ok(uniqueScores.size >= 6);
  assert.ok(uniqueEffectiveScores.size >= 18);
});

test('getResults tops up sparse branches to at least twenty nearby candidates', async () => {
  const allNames = await readNamesDataset();
  const filters = createFilters({
    species: new Set(['うさぎ']),
    vibe: new Set(['話題']),
  });

  const { items, total } = getResults(allNames, filters);

  assert.ok(total >= 20);
  assert.ok(total <= 28);
  assert.equal(items.slice(0, 20).every((item) => item.species.includes('うさぎ')), true);
  assert.equal(items[0].match.query.tier, 'fallback');
  assert.deepEqual(items[0].match.query.relaxedCategories, ['vibe']);
});

test('getResults prefers keeping gender and species before relaxing impossible colors', async () => {
  const allNames = await readNamesDataset();
  const filters = createFilters({
    species: new Set(['猫']),
    gender: new Set(['オス']),
    vibe: new Set(['和風']),
    color: new Set(['三毛']),
  });

  const { items, total } = getResults(allNames, filters);
  const topTen = items.slice(0, 10);

  assert.ok(total >= 20);
  assert.equal(topTen.every((item) => item.species.includes('猫')), true);
  assert.equal(topTen.every((item) => item.gender !== 'メス'), true);
  assert.equal(topTen.every((item) => item.match.query.relaxedCategories.includes('color')), true);
});

test('getResults prefers strict matches over relaxed matches when scores tie', () => {
  const filters = createFilters({
    species: new Set(['犬']),
    gender: new Set(['メス']),
    vibe: new Set(['かわいい']),
    color: new Set(['茶色']),
  });
  const items = [
    {
      name: 'アズキ',
      reading: 'あずき',
      meaning: '小豆。毛色が赤茶色の柴犬や猫に人気。和風で可愛らしい響き。',
      species: ['猫', 'うさぎ', 'ハムスター', '犬'],
      gender: 'メス',
      vibe: ['かわいい', '和風'],
      color: ['茶色'],
      length: '3',
      theme: ['和風・古風', '食べ物・スイーツ'],
    },
    {
      name: 'パコ美',
      reading: 'ぱこみ',
      meaning: '大久保佳代子の愛犬。チワックス。番組共演多数。',
      species: ['犬'],
      gender: 'メス',
      vibe: ['かわいい'],
      color: ['なし'],
      length: '3',
      theme: ['洋風・モダン'],
    },
  ];

  const { items: ranked } = getResults(items, filters);

  assert.equal(ranked[0].name, 'アズキ');
  assert.deepEqual(ranked[0].match.query.relaxedCategories, []);
  assert.deepEqual(ranked[1].match.query.relaxedCategories, ['color']);
  assert.ok(ranked[0].match.query.effectiveScore > ranked[1].match.query.effectiveScore);
});

test('getResults keeps 4+ length results when long-name preference is selected', async () => {
  const allNames = await readNamesDataset();
  const filters = createFilters({
    species: new Set(['犬']),
    gender: new Set(['オス']),
    vibe: new Set(['かっこいい']),
    color: new Set(['黒']),
    length: new Set(['4+']),
    theme: new Set(['食べ物・スイーツ']),
    callStyle: new Set(['呼びやすい短さ']),
    ownerLifestyle: new Set(['カフェ・おうち時間']),
    wish: new Set(['健やかさ']),
    uniqueness: new Set(['みんなに親しみやすい']),
    scene: new Set(['静かな夜みたい']),
  });

  const { items } = getResults(allNames, filters);
  const actualLength = (item) => Math.max(
    Array.from(String(item.name || '').replace(/[\s・]/g, '')).length,
    Array.from(String(item.reading || '').replace(/[\s・]/g, '')).length,
  );

  assert.equal(items.length, 20);
  assert.equal(items.every((item) => actualLength(item) >= 4), true);
});
