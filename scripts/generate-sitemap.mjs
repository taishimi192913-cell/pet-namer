import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

export const SITE_URL = 'https://pet-namer.vercel.app';
export const routes = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/dog-names', changefreq: 'weekly', priority: '0.9' },
  { loc: '/cat-names', changefreq: 'weekly', priority: '0.9' },
  { loc: '/rabbit-names', changefreq: 'weekly', priority: '0.8' },
];

export function buildSitemapXml(date = new Date().toISOString().slice(0, 10)) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    ({ loc, changefreq, priority }) => `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
}

export async function writeSitemapFiles(date = new Date().toISOString().slice(0, 10)) {
  const xml = buildSitemapXml(date);
  await mkdir(publicDir, { recursive: true });
  await writeFile(path.join(rootDir, 'sitemap.xml'), xml, 'utf8');
  await writeFile(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await writeSitemapFiles();
}
