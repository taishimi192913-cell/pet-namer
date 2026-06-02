import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const APP_STORE_PLACEHOLDER_PATTERN = /idXXXXXXXXX|\[APP_ID\]|YOUR_APP_STORE_ID/;
const VALID_APP_STORE_URL_PATTERN = /^https:\/\/apps\.apple\.com\/jp\/app\/(?:[^/?#]+\/)?id\d+(?:[?#].*)?$/;

test('public homepage does not ship placeholder App Store links', () => {
  const html = readFileSync('index.html', 'utf-8');

  assert.equal(APP_STORE_PLACEHOLDER_PATTERN.test(html), false);
});

test('name matcher config only declares a real App Store URL when one is known', () => {
  const appConfig = JSON.parse(readFileSync('apps/name-matcher/app.json', 'utf-8'));
  const appStoreUrl = appConfig.expo.ios?.appStoreUrl;

  assert.ok(
    !appStoreUrl || VALID_APP_STORE_URL_PATTERN.test(appStoreUrl),
    'appStoreUrl should be omitted until the numeric App Store ID is available',
  );
});

test('App Store URL validation accepts canonical URLs with app slugs', () => {
  assert.equal(VALID_APP_STORE_URL_PATTERN.test('https://apps.apple.com/jp/app/id1234567890'), true);
  assert.equal(VALID_APP_STORE_URL_PATTERN.test('https://apps.apple.com/jp/app/sippomi/id1234567890'), true);
  assert.equal(VALID_APP_STORE_URL_PATTERN.test('https://apps.apple.com/jp/app/%E3%81%97%E3%81%A3%E3%81%BD%E3%81%BF/id1234567890?l=ja'), true);
  assert.equal(VALID_APP_STORE_URL_PATTERN.test('https://apps.apple.com/jp/app/sippomi/idYOUR_APP_STORE_ID'), false);
});

test('affiliate href resolver prefers issued Rakuten affiliate URLs over search fallback', async () => {
  const module = await import('../src/affiliate-links.js');

  assert.equal(typeof module.resolveRakutenItemHref, 'function');
  assert.equal(
    module.resolveRakutenItemHref({
      label: 'キャリー',
      keyword: 'ペット キャリー',
      url: 'https://hb.afl.rakuten.co.jp/example-affiliate-link',
    }),
    'https://hb.afl.rakuten.co.jp/example-affiliate-link',
  );
  assert.equal(
    module.resolveRakutenItemHref({
      label: '食器',
      keyword: 'ペット 食器',
      href: 'https://a.r10.to/example-short-link',
    }),
    'https://a.r10.to/example-short-link',
  );
  assert.equal(
    module.resolveRakutenItemHref({
      label: '危険なURL',
      keyword: 'ペット 防災',
      url: 'https://example.com/not-rakuten',
    }),
    'https://search.rakuten.co.jp/search/mall/%E3%83%9A%E3%83%83%E3%83%88%20%E9%98%B2%E7%81%BD/',
  );
  assert.equal(
    module.resolveRakutenItemHref({
      label: 'url typo with valid href',
      keyword: 'ペット 防災',
      url: 'https://example.com/not-rakuten',
      href: 'https://hb.afl.rakuten.co.jp/valid-fallback-link',
    }),
    'https://hb.afl.rakuten.co.jp/valid-fallback-link',
  );
  assert.equal(
    module.resolveRakutenItemHref({ label: 'トイレ用品', keyword: '猫 トイレ' }),
    'https://search.rakuten.co.jp/search/mall/%E7%8C%AB%20%E3%83%88%E3%82%A4%E3%83%AC/',
  );
});
