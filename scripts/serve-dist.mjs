import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const PORT = parseInt(process.env.PORT || '4173', 10);
const DIST = new URL('../dist/', import.meta.url).pathname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const CLEAN_URLS = [
  'welcome-prep', 'first-dog-guide', 'first-cat-guide', 'starter-set',
  'journal-first-pet-checklist', 'journal-first-pet-cost', 'journal-pet-vaccine-schedule',
  'journal-dog-walk-when', 'journal-cat-cage-necessary', 'journal-first-days',
  'journal-home-safety', 'journal-first-shopping', 'journal-dog-alone-training',
  'journal-cat-toilet-fixes', 'journal-pet-fast-eating', 'journal-first-summer',
  'journal-pet-bousai', 'journal-kanto-pet-outings', 'dog-names', 'cat-names',
  'rabbit-names', 'privacy', 'about',
];

const server = createServer((req, res) => {
  let path = new URL(req.url, `http://${req.headers.host}`).pathname;

  if (path.endsWith('/')) path += 'index.html';
  const cleanName = path.replace(/^\//, '');
  if (CLEAN_URLS.includes(cleanName)) path = `/${cleanName}.html`;

  const filePath = join(DIST, path);
  if (!existsSync(filePath) || !filePath.startsWith(DIST)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  const ext = extname(filePath);
  const content = readFileSync(filePath);
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  res.end(content);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Preview: http://127.0.0.1:${PORT}/`);
});
