import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('swipe card gesture target covers the visible card', async () => {
  const [screenSource, styleSource] = await Promise.all([
    readFile(new URL('../src/screens/SwipeScreen.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles.ts', import.meta.url), 'utf8'),
  ]);

  assert.match(
    styleSource,
    /cardGestureTarget:\s*\{[^}]*minHeight:\s*420/s,
    'gesture target needs at least the card visual height',
  );
  assert.match(
    screenSource,
    /styles\.cardGestureTarget/,
    'SwipeScreen should use the explicit gesture target style',
  );
  assert.doesNotMatch(
    screenSource,
    /<Animated\.View\s+entering=\{enteringFadeIn\}\s+style=\{\{\s*flex:\s*1\s*\}\}/,
    'GestureDetector child must not be only flex:1 because the visible card can overflow its touch bounds',
  );
});

test('pet artwork has dedicated coded portraits for every supported species', async () => {
  const source = await readFile(new URL('../src/components/PetSilhouette.tsx', import.meta.url), 'utf8');

  for (const species of ['犬', '猫', 'うさぎ', 'ハムスター', '鳥', '爬虫類', '魚', '小動物']) {
    assert.match(
      source,
      new RegExp(`species === '${species}'`),
      `${species} should have a dedicated SVG portrait instead of falling back to dog art`,
    );
  }
});
