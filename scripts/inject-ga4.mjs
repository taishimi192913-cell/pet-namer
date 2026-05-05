#!/usr/bin/env node
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const GA_ID = process.env.GA4_MEASUREMENT_ID || process.env.VITE_GA4_MEASUREMENT_ID || '';

if (!GA_ID) {
  console.log('[inject-ga4] GA4_MEASUREMENT_ID not set — skipping GA4 injection. Set it as a Vercel env var (G-XXXXXXXXXX) when ready.');
  process.exit(0);
}

if (!/^G-[A-Z0-9]{6,}$/.test(GA_ID)) {
  console.error(`[inject-ga4] Invalid GA4 ID: ${GA_ID}. Expected format G-XXXXXXXXXX.`);
  process.exit(1);
}

const SNIPPET = `
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}', { anonymize_ip: true });
  </script>`;

async function* walk(dir) {
  const entries = await readdir(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const s = await stat(full);
    if (s.isDirectory()) {
      yield* walk(full);
    } else if (entry.endsWith('.html')) {
      yield full;
    }
  }
}

let count = 0;
for await (const file of walk(DIST)) {
  const html = await readFile(file, 'utf-8');
  if (html.includes('googletagmanager.com/gtag/js')) continue;
  const replaced = html.replace(/<head([^>]*)>/i, `<head$1>${SNIPPET}`);
  if (replaced !== html) {
    await writeFile(file, replaced, 'utf-8');
    count++;
  }
}
console.log(`[inject-ga4] Injected GA4 (${GA_ID}) into ${count} HTML file(s).`);
