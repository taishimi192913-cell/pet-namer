import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const siteUrl = 'https://pet-namer.vercel.app';
const today = new Date().toISOString().slice(0, 10);

const routes = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/dog-names', changefreq: 'weekly', priority: '0.9' },
  { loc: '/cat-names', changefreq: 'weekly', priority: '0.9' },
  { loc: '/rabbit-names', changefreq: 'weekly', priority: '0.8' },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    ({ loc, changefreq, priority }) => `  <url>
    <loc>${siteUrl}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

await mkdir(publicDir, { recursive: true });
await writeFile(path.join(rootDir, 'sitemap.xml'), xml, 'utf8');
await writeFile(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
