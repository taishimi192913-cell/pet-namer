/**
 * Auto-generate sitemap.xml for Sippomi.
 * Uses: sitemap (ekalinin/sitemap.js, MIT, https://github.com/ekalinin/sitemap.js)
 *
 * Called: npm run build → vite build → postbuild
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'node:stream';
import { discoverPages } from './discover-pages.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

export const SITE_URL = 'https://sippomi.com';
const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// Priority/changeFreq mapping based on page type
function getPagePriority(cleanUrl) {
  if (cleanUrl === '/') return 1.0;
  if (cleanUrl.startsWith('/welcome-prep')) return 0.9;
  if (cleanUrl.startsWith('/dog-names') || cleanUrl.startsWith('/cat-names')) return 0.9;
  if (cleanUrl.startsWith('/first-dog') || cleanUrl.startsWith('/first-cat') || cleanUrl.startsWith('/starter-set')) return 0.9;
  if (cleanUrl.startsWith('/guide/')) return 0.8;
  if (cleanUrl.startsWith('/journal-')) return 0.8;
  if (cleanUrl.startsWith('/breeds/')) return 0.7;
  if (cleanUrl.startsWith('/rabbit') || cleanUrl.startsWith('/hamster') ||
      cleanUrl.startsWith('/ferret') || cleanUrl.startsWith('/bird') ||
      cleanUrl.startsWith('/reptile')) return 0.7;
  return 0.6;
}

function getChangeFreq(cleanUrl) {
  if (cleanUrl === '/') return 'weekly';
  if (cleanUrl.startsWith('/journal-')) return 'monthly';
  if (cleanUrl.startsWith('/breeds/')) return 'monthly';
  return 'weekly';
}

function isIndexablePage(page) {
  const html = readFileSync(page.sourcePath, 'utf-8');
  const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i);
  if (!robotsMatch) return true;
  return !robotsMatch[1].toLowerCase().split(',').map((item) => item.trim()).includes('noindex');
}

export function buildSitemapUrls({ date = TODAY } = {}) {
  const pages = discoverPages();

  return pages
    .filter(isIndexablePage)
    .map(page => ({
      url: page.cleanUrl,
      changefreq: getChangeFreq(page.cleanUrl),
      priority: getPagePriority(page.cleanUrl),
      lastmod: date,
    }));
}

export async function buildSitemapXml(options = {}) {
  const sitemapUrls = buildSitemapUrls(options);
  const stream = new SitemapStream({ hostname: SITE_URL });
  const xml = await streamToPromise(Readable.from(sitemapUrls).pipe(stream));
  return xml.toString();
}

async function generateSitemap() {
  const xml = await buildSitemapXml();
  const sitemapUrls = buildSitemapUrls();

  const outputPath = resolve(rootDir, 'public', 'sitemap.xml');
  writeFileSync(outputPath, xml, 'utf-8');
  const rootOutputPath = resolve(rootDir, 'sitemap.xml');
  writeFileSync(rootOutputPath, xml, 'utf-8');
  
  // Also update robots.txt
  const robotsPath = resolve(rootDir, 'public', 'robots.txt');
  const robots = `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`;
  writeFileSync(robotsPath, robots, 'utf-8');
  writeFileSync(resolve(rootDir, 'robots.txt'), robots, 'utf-8');

  console.log(`[sitemap] Generated ${sitemapUrls.length} URLs → public/sitemap.xml`);
  console.log(`[sitemap] Mirrored → sitemap.xml`);
  console.log(`[sitemap] Updated → public/robots.txt and robots.txt`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateSitemap().catch(err => {
    console.error('[sitemap] Error:', err.message);
    process.exit(1);
  });
}
