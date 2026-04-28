import { mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const cleanRoutePages = [
  'about',
  'cat-names',
  'dog-names',
  'first-cat-guide',
  'first-dog-guide',
  'journal-cat-cage-necessary',
  'journal-cat-toilet-fixes',
  'journal-dog-alone-training',
  'journal-dog-walk-when',
  'journal-first-days',
  'journal-first-pet-checklist',
  'journal-first-pet-cost',
  'journal-first-shopping',
  'journal-first-summer',
  'journal-home-safety',
  'journal-kanto-pet-outings',
  'journal-pet-bousai',
  'journal-pet-fast-eating',
  'journal-pet-vaccine-schedule',
  'privacy',
  'rabbit-names',
  'starter-set',
  'welcome-prep'
];

for (const page of cleanRoutePages) {
  const sourcePath = path.join(distDir, `${page}.html`);
  const targetDir = path.join(distDir, page);
  const targetPath = path.join(targetDir, 'index.html');

  await mkdir(targetDir, { recursive: true });
  await rename(sourcePath, targetPath);
}
