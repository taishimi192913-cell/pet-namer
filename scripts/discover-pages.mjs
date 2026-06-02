/**
 * Auto-discover all HTML pages for Sippomi.
 * Scans source directories for .html files and generates:
 *  - rollupOptions.input entries
 *  - cleanUrlToHtml map entries
 *  - clean route list for prepare-clean-routes.mjs
 *  - sitemap URL list
 *
 * GitHub: ekalinin/sitemap.js (MIT, https://github.com/ekalinin/sitemap.js)
 * Used via: npm install sitemap
 */
import { readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// Directories to scan for HTML files
const SCAN_DIRS = [
  '',                  // root directory
  'guide/first',
  'guide/dog',
  'guide/cat',
  'breeds/dogs',
  'breeds/cats',
];

// Files to exclude from discovery
const EXCLUDE_FILES = [
  '404',
];

const EXCLUDE_PATTERNS = [
  /^google/,           // Google verification files
  /^BingSiteAuth/,
  /^YahooSiteAuth/,
  /^journal-poop-/,    // Deprecated
];

// Common pages with explicit clean URLs
const CUSTOM_CLEAN_URLS = {
  'index': '/',
  'welcome-prep': '/welcome-prep',
  'first-dog-guide': '/first-dog-guide',
  'first-cat-guide': '/first-cat-guide',
  'starter-set': '/starter-set',
  'dog-names': '/dog-names',
  'cat-names': '/cat-names',
  'rabbit-names': '/rabbit-names',
  'privacy': '/privacy',
  'about': '/about',
};

/**
 * Discover all HTML pages.
 * @returns {Array<{name: string, path: string, cleanUrl: string, sourcePath: string}>}
 */
export function discoverPages() {
  const pages = [];

  for (const scanDir of SCAN_DIRS) {
    const fullDir = resolve(rootDir, scanDir);
    if (!existsSync(fullDir)) continue;

    const items = readdirSync(fullDir);
    for (const item of items) {
      if (!item.endsWith('.html')) continue;
      if (item === 'index.html') {
        // index.html in subdirectory → clean URL is the directory path
        const cleanName = scanDir ? '/' + scanDir.replace(/\\/g, '/') : '/';
        pages.push({
          name: scanDir ? scanDir.replace(/[\\/]/g, '-') : 'index',
          path: scanDir ? `${scanDir}/${item}` : item,
          cleanUrl: cleanName,
          sourcePath: resolve(fullDir, item),
        });
        continue;
      }

      const name = basename(item, '.html');
      if (EXCLUDE_FILES.includes(name)) continue;
      if (EXCLUDE_PATTERNS.some(p => p.test(name))) continue;

      const cleanName = scanDir
        ? `${scanDir}/${name}`
        : name;

      let cleanUrl;
      if (scanDir) {
        cleanUrl = `/${scanDir}/${name}`;
      } else if (CUSTOM_CLEAN_URLS[name]) {
        cleanUrl = CUSTOM_CLEAN_URLS[name];
      } else if (name.startsWith('journal-')) {
        cleanUrl = `/${name}`;
      } else if (name.startsWith('cat-names-')) {
        cleanUrl = `/${name}`;
      } else if (name.startsWith('dog-names-')) {
        cleanUrl = `/${name}`;
      } else if (name.endsWith('-names')) {
        cleanUrl = `/${name}`;
      } else {
        cleanUrl = `/${name}`;
      }

      pages.push({
        name: cleanName.replace(/[^a-zA-Z0-9_-]/g, '-'),
        path: scanDir ? `${scanDir}/${item}` : item,
        cleanUrl,
        sourcePath: resolve(fullDir, item),
      });
    }
  }

  // Sort: root pages first, then by cleanUrl
  pages.sort((a, b) => {
    const aDepth = (a.cleanUrl.match(/\//g) || []).length;
    const bDepth = (b.cleanUrl.match(/\//g) || []).length;
    if (aDepth !== bDepth) return aDepth - bDepth;
    return a.cleanUrl.localeCompare(b.cleanUrl);
  });

  return pages;
}

/**
 * Generate Vite-compatible rollupOptions.input entries.
 */
export function generateViteInputs(pages) {
  const inputs = {};
  for (const page of pages) {
    inputs[page.name] = resolve(rootDir, page.path);
  }
  return inputs;
}

/**
 * Generate clean URL → HTML file map for Vite middleware.
 */
export function generateCleanUrlMap(pages) {
  const map = {};
  for (const page of pages) {
    map[page.cleanUrl] = `/${page.path}`;
  }
  return map;
}

/**
 * Generate list of clean route strings for prepare-clean-routes.mjs.
 */
export function generateCleanRoutes(pages) {
  const routes = [];
  for (const page of pages) {
    // Skip root index - Vite handles it automatically
    if (page.cleanUrl === '/') continue;
    // Clean routes that need /index.html in a subdirectory
    const route = page.cleanUrl.replace(/^\//, '');
    routes.push(route);
  }
  return routes.sort();
}

// Run directly: outputs to console
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const pages = discoverPages();
  console.log(`Discovered ${pages.length} pages:\n`);

  const byType = {};
  for (const p of pages) {
    const type = p.cleanUrl.startsWith('/journal') ? 'Journal' :
                 p.cleanUrl.startsWith('/cat-names') ? 'Dog Breed' :
                 p.cleanUrl.startsWith('/dog-names') ? 'Cat Breed' :
                 p.cleanUrl.startsWith('/guide') ? 'Guide' :
                 p.cleanUrl.startsWith('/breeds') ? 'Breed' :
                 p.cleanUrl === '/' ? 'Home' :
                 p.cleanUrl.startsWith('/rabbit') || p.cleanUrl.startsWith('/hamster') || p.cleanUrl.startsWith('/ferret') || p.cleanUrl.startsWith('/bird') || p.cleanUrl.startsWith('/reptile') ? 'Small Pet' :
                 'Page';
    if (!byType[type]) byType[type] = [];
    byType[type].push(p);
  }

  for (const [type, items] of Object.entries(byType)) {
    console.log(`  ${type} (${items.length}):`);
    for (const p of items) {
      console.log(`    ${p.cleanUrl} ← ${p.path}`);
    }
  }
  console.log(`\nTotal: ${pages.length} pages`);
}
