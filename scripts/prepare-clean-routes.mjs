/**
 * Prepare clean routes for static site deployment (Vercel).
 * Automatically creates /index.html subdirectories for all discovered pages.
 */
import { mkdir, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverPages } from './discover-pages.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

async function prepareCleanRoutes() {
  const pages = discoverPages();
  let count = 0;

  for (const page of pages) {
    if (page.cleanUrl === '/') continue; // root is already index.html

    const relPath = page.cleanUrl.replace(/^\//, '');
    const sourcePath = path.join(distDir, `${relPath}.html`);
    
    if (!existsSync(sourcePath)) continue;

    const targetDir = path.join(distDir, relPath);
    const targetPath = path.join(targetDir, 'index.html');

    await mkdir(targetDir, { recursive: true });
    await rename(sourcePath, targetPath);
    count++;
  }

  console.log(`[clean-routes] Prepared ${count} clean routes`);
}

prepareCleanRoutes().catch(err => {
  console.error('[clean-routes] Error:', err.message);
  process.exit(1);
});
