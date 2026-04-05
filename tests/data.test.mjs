import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function readJson(filePath) {
  const content = await readFile(new URL(`../${filePath}`, import.meta.url), 'utf8');
  return JSON.parse(content);
}

function isStringOrStringArray(value) {
  return typeof value === 'string'
    || (Array.isArray(value) && value.every((item) => typeof item === 'string'));
}

test('names dataset has required fields and enough entries', async () => {
  const names = await readJson('data/names.json');

  assert.ok(Array.isArray(names));
  assert.ok(names.length >= 1000);

  for (const entry of names) {
    assert.equal(typeof entry.name, 'string');
    assert.equal(typeof entry.reading, 'string');
    assert.equal(typeof entry.meaning, 'string');
    assert.ok(isStringOrStringArray(entry.species));
    assert.ok(isStringOrStringArray(entry.gender));
    assert.ok(isStringOrStringArray(entry.vibe));
  }
});

test('celebrity pets dataset is available for the landing page', async () => {
  const pets = await readJson('data/celebrity-pets.json');

  assert.ok(Array.isArray(pets));
  assert.ok(pets.length >= 10);

  for (const pet of pets) {
    assert.equal(typeof pet.name, 'string');
    assert.equal(typeof pet.reading, 'string');
    assert.ok(isStringOrStringArray(pet.species));
    assert.ok(isStringOrStringArray(pet.vibe));
    if (pet.imageUrl !== undefined) {
      assert.equal(typeof pet.imageUrl, 'string');
    }
  }
});
