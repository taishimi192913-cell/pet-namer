import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSitemapXml, routes, SITE_URL } from '../scripts/generate-sitemap.mjs';

test('sitemap generator outputs all public routes', () => {
  const xml = buildSitemapXml('2026-04-05');

  assert.ok(xml.includes('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes('<lastmod>2026-04-05</lastmod>'));

  for (const route of routes) {
    assert.ok(xml.includes(`<loc>${SITE_URL}${route.loc}</loc>`));
  }
});
