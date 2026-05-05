#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

async function loadEnv() {
  try {
    const env = await readFile(path.join(ROOT, '.env'), 'utf-8');
    for (const line of env.split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
    }
  } catch {
    /* no .env, fine */
  }
}

async function fetchPexels(query, perPage = 5) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape&size=medium`;
  const res = await fetch(url, { headers: { Authorization: process.env.PEXELS_API_KEY } });
  if (!res.ok) throw new Error(`Pexels ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.photos || [];
}

async function downloadAndOptimize(srcUrl, outPath, { width, quality }) {
  const res = await fetch(srcUrl);
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(outPath);
}

async function main() {
  await loadEnv();
  if (!process.env.PEXELS_API_KEY) {
    console.error('Missing PEXELS_API_KEY in environment.');
    process.exit(1);
  }

  const spec = JSON.parse(await readFile(path.join(ROOT, 'data/journal-photo-spec.json'), 'utf-8'));
  const outDir = path.join(ROOT, spec.outDir);
  await mkdir(outDir, { recursive: true });

  const force = process.argv.includes('--force');
  const credits = [];

  for (const article of spec.articles) {
    const outPath = path.join(outDir, `${article.slug}.webp`);
    if (!force && existsSync(outPath)) {
      console.log(`skip (exists): ${article.slug}`);
      // still record credit if available later
      continue;
    }
    console.log(`fetch: ${article.slug} — "${article.query}"`);
    let photos;
    try {
      photos = await fetchPexels(article.query, 5);
    } catch (e) {
      console.error(`  ! search failed: ${e.message}`);
      continue;
    }
    if (!photos.length) {
      console.error(`  ! no results for "${article.query}"`);
      continue;
    }
    const top = photos[0];
    const srcUrl = top.src.large2x || top.src.large || top.src.original;
    try {
      await downloadAndOptimize(srcUrl, outPath, spec.image);
      console.log(`  saved: ${path.relative(ROOT, outPath)} (photographer: ${top.photographer})`);
      credits.push({
        slug: article.slug,
        photographer: top.photographer,
        photographer_url: top.photographer_url,
        pexels_url: top.url,
        pexels_id: top.id,
      });
    } catch (e) {
      console.error(`  ! save failed: ${e.message}`);
    }
  }

  await writeFile(path.join(ROOT, 'data/journal-photo-credits.json'), JSON.stringify(credits, null, 2), 'utf-8');
  console.log(`\nWrote ${credits.length} credits to data/journal-photo-credits.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
