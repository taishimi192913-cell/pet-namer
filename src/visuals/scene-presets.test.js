import assert from 'node:assert/strict';
import test from 'node:test';

import { getArticleScenePreset } from './scene-presets.js';

test('getArticleScenePreset matches pet bousai slugs to the emergency scene', () => {
  const preset = getArticleScenePreset('/images/journal/journal-pet-bousai.webp');

  assert.equal(preset.name, 'emergency');
  assert.ok(preset.tokens.includes('bousai'));
});

test('getArticleScenePreset returns a stable fallback for unknown slugs', () => {
  const preset = getArticleScenePreset('/images/journal/not-yet-mapped.webp');

  assert.equal(preset.name, 'default');
  assert.ok(preset.tokens.includes('default'));
});

test('getArticleScenePreset maps dog guide visuals to a dog scene', () => {
  const preset = getArticleScenePreset('/images/journal/first-dog-guide.webp');

  assert.equal(preset.name, 'dog');
  assert.equal(preset.animal, 'dog');
});
