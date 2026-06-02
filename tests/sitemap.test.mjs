import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { discoverPages } from '../scripts/discover-pages.mjs';
import { buildSitemapUrls, buildSitemapXml, SITE_URL } from '../scripts/generate-sitemap.mjs';

test('dog and cat detail pages use flat clean URLs that match deployed routes', () => {
  const pages = discoverPages();
  const byPath = new Map(pages.map((page) => [page.path, page.cleanUrl]));

  assert.equal(byPath.get('dog-names-toy-poodle.html'), '/dog-names-toy-poodle');
  assert.equal(byPath.get('cat-names-ragdoll.html'), '/cat-names-ragdoll');
  assert.equal(byPath.get('guide/dog/index.html'), '/guide/dog');
  assert.equal(byPath.get('guide/cat/index.html'), '/guide/cat');
  assert.ok(![...byPath.values()].includes('/dog-names/toy-poodle'));
  assert.ok(![...byPath.values()].includes('/cat-names/ragdoll'));
});

test('sitemap outputs only indexable public routes without html suffixes', async () => {
  const urls = buildSitemapUrls();
  const locs = urls.map((url) => url.url);
  const xml = await buildSitemapXml();

  assert.ok(xml.includes('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes('<lastmod>'));
  assert.ok(locs.includes('/dog-names-toy-poodle'));
  assert.ok(locs.includes('/cat-names-ragdoll'));
  assert.ok(locs.includes('/starter-set'));
  assert.ok(!locs.includes('/dog-names/toy-poodle'));
  assert.ok(!locs.includes('/cat-names/ragdoll'));
  assert.ok(!locs.includes('/about'));
  assert.ok(!locs.includes('/privacy'));

  for (const loc of locs) {
    assert.ok(xml.includes(`<loc>${SITE_URL}${loc}</loc>`));
    assert.ok(!loc.endsWith('.html'));
  }
});

test('indexable source pages declare canonical and og:url matching sitemap clean URLs', () => {
  const sitemapLocs = new Set(buildSitemapUrls().map((url) => url.url));

  for (const page of discoverPages()) {
    if (!sitemapLocs.has(page.cleanUrl)) continue;

    const html = readFileSync(page.sourcePath, 'utf-8');
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
    const ogUrl = html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/i)?.[1];
    const expected = `${SITE_URL}${page.cleanUrl}`;

    assert.equal(canonical, expected, `${page.path} canonical`);
    assert.equal(ogUrl, expected, `${page.path} og:url`);
    assert.ok(!html.includes(`${expected}.html`), `${page.path} should not include html-suffixed public URL`);
  }
});
