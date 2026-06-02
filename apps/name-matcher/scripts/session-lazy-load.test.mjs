import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('session data uses dynamic import for the names dataset', async () => {
  const source = await readFile(new URL('../src/session.ts', import.meta.url), 'utf8');

  assert.doesNotMatch(
    source,
    /import\s+\w+\s+from\s+['"]\.\/data\/names\.json['"]/,
    'names.json must not be loaded through a static import',
  );
  assert.match(
    source,
    /import\(\s*['"]\.\/data\/names\.json['"]\s*\)/,
    'names.json should be loaded through dynamic import()',
  );
  assert.match(
    source,
    /allNamesPromise\s*=\s*null/,
    'failed dynamic imports should clear the cached promise so a later retry can recover',
  );
  assert.match(
    source,
    /export\s+async\s+function\s+hydrateQueue/,
    'queue refill should await the lazily loaded dataset instead of returning underfilled queues while cold',
  );
});
