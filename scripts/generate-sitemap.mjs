import { mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

export const SITE_URL = 'https://sippomi.com';
export const routes = [
  { loc: '/', file: 'index.html', changefreq: 'weekly', priority: '1.0' },
  { loc: '/welcome-prep', file: 'welcome-prep.html', changefreq: 'weekly', priority: '0.9' },
  { loc: '/first-dog-guide', file: 'first-dog-guide.html', changefreq: 'weekly', priority: '0.9' },
  { loc: '/first-cat-guide', file: 'first-cat-guide.html', changefreq: 'weekly', priority: '0.9' },
  { loc: '/starter-set', file: 'starter-set.html', changefreq: 'weekly', priority: '0.8' },
  { loc: '/journal-first-pet-checklist', file: 'journal-first-pet-checklist.html', changefreq: 'weekly', priority: '0.8' },
  { loc: '/journal-first-pet-cost', file: 'journal-first-pet-cost.html', changefreq: 'weekly', priority: '0.8' },
  { loc: '/journal-pet-vaccine-schedule', file: 'journal-pet-vaccine-schedule.html', changefreq: 'weekly', priority: '0.8' },
  { loc: '/journal-dog-walk-when', file: 'journal-dog-walk-when.html', changefreq: 'weekly', priority: '0.8' },
  { loc: '/journal-cat-cage-necessary', file: 'journal-cat-cage-necessary.html', changefreq: 'weekly', priority: '0.8' },
  { loc: '/journal-first-days', file: 'journal-first-days.html', changefreq: 'weekly', priority: '0.8' },
  { loc: '/journal-home-safety', file: 'journal-home-safety.html', changefreq: 'weekly', priority: '0.8' },
  { loc: '/journal-first-shopping', file: 'journal-first-shopping.html', changefreq: 'weekly', priority: '0.8' },
  { loc: '/journal-dog-alone-training', file: 'journal-dog-alone-training.html', changefreq: 'weekly', priority: '0.8' },
  { loc: '/journal-cat-toilet-fixes', file: 'journal-cat-toilet-fixes.html', changefreq: 'weekly', priority: '0.8' },
  { loc: '/journal-pet-fast-eating', file: 'journal-pet-fast-eating.html', changefreq: 'weekly', priority: '0.8' },
  { loc: '/journal-first-summer', file: 'journal-first-summer.html', changefreq: 'weekly', priority: '0.8' },
  { loc: '/journal-pet-bousai', file: 'journal-pet-bousai.html', changefreq: 'weekly', priority: '0.8' },
  { loc: '/journal-kanto-pet-outings', file: 'journal-kanto-pet-outings.html', changefreq: 'weekly', priority: '0.8' },
  { loc: '/dog-names', file: 'dog-names.html', changefreq: 'weekly', priority: '0.9' },
  { loc: '/cat-names', file: 'cat-names.html', changefreq: 'weekly', priority: '0.9' },
  { loc: '/rabbit-names', file: 'rabbit-names.html', changefreq: 'weekly', priority: '0.8' },
];

async function getLastmod(filePath) {
  try {
    const s = await stat(filePath);
    return s.mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export async function buildSitemapXml() {
  const rows = [];
  for (const { loc, file, changefreq, priority } of routes) {
    const lastmod = await getLastmod(path.join(rootDir, file));
    rows.push(`  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.join('\n')}
</urlset>
`;
}

export async function writeSitemapFiles() {
  const xml = await buildSitemapXml();
  await mkdir(publicDir, { recursive: true });
  await writeFile(path.join(rootDir, 'sitemap.xml'), xml, 'utf8');
  await writeFile(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await writeSitemapFiles();
}
