#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const TARGETS = [
  'welcome-prep.html', 'first-dog-guide.html', 'first-cat-guide.html',
  'starter-set.html', 'journal-first-pet-checklist.html', 'journal-first-pet-cost.html',
  'journal-pet-vaccine-schedule.html', 'journal-dog-walk-when.html', 'journal-cat-cage-necessary.html',
  'journal-first-days.html', 'journal-home-safety.html', 'journal-first-shopping.html',
  'journal-dog-alone-training.html', 'journal-cat-toilet-fixes.html', 'journal-pet-fast-eating.html',
  'journal-first-summer.html', 'journal-pet-bousai.html', 'journal-kanto-pet-outings.html',
];

const HEADING_RE = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi;
const STRIP_TAGS = /<[^>]+>/g;

const HOT_PHRASES = ['初めて', '初めての', 'まずは', 'ポイント', 'チェック', 'まとめ'];
const NUMERIC_HEADING = /^\d+\.\s/;

const reports = [];

for (const file of TARGETS) {
  const html = await readFile(path.join(ROOT, file), 'utf-8');
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  const body = main.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const headings = [];
  let m;
  HEADING_RE.lastIndex = 0;
  while ((m = HEADING_RE.exec(body)) !== null) {
    headings.push({ level: m[1], text: m[2].replace(STRIP_TAGS, '').trim() });
  }
  const text = body.replace(STRIP_TAGS, ' ');
  const phraseCounts = Object.fromEntries(HOT_PHRASES.map((p) => [p, (text.match(new RegExp(p, 'g')) || []).length]));
  const numericHeadingCount = headings.filter((h) => NUMERIC_HEADING.test(h.text)).length;

  reports.push({
    file,
    headingCount: headings.length,
    numericHeadingCount,
    numericHeadingRatio: headings.length ? +(numericHeadingCount / headings.length).toFixed(2) : 0,
    phraseCounts,
    headings,
  });
}

let warnCount = 0;
console.log('# Content audit\n');
for (const r of reports) {
  const warns = [];
  if (r.numericHeadingRatio >= 0.5 && r.headingCount >= 4) warns.push(`数字並列見出し ${r.numericHeadingCount}/${r.headingCount} (${(r.numericHeadingRatio * 100).toFixed(0)}%)`);
  if (r.phraseCounts['初めて'] >= 6) warns.push(`「初めて」${r.phraseCounts['初めて']}回`);
  console.log(`## ${r.file}`);
  console.log(`headings=${r.headingCount}, numeric=${r.numericHeadingCount}, hot phrases=${JSON.stringify(r.phraseCounts)}`);
  if (warns.length) {
    warnCount += warns.length;
    console.log(`  WARN: ${warns.join(' / ')}`);
  } else {
    console.log('  OK');
  }
  console.log();
}
console.log(`---\nTotal warnings: ${warnCount}`);
process.exit(warnCount > 0 ? 0 : 0);
