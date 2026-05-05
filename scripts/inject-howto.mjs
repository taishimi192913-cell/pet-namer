#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const TARGETS = [
  { file: 'welcome-prep.html', name: 'お迎え準備の進め方', url: 'https://sippomi.com/welcome-prep' },
  { file: 'first-dog-guide.html', name: '初めて犬を迎える人の進め方', url: 'https://sippomi.com/first-dog-guide' },
  { file: 'first-cat-guide.html', name: '初めて猫を迎える人の進め方', url: 'https://sippomi.com/first-cat-guide' },
  { file: 'journal-first-pet-checklist.html', name: 'お迎え準備チェックリスト', url: 'https://sippomi.com/journal-first-pet-checklist' },
  { file: 'journal-home-safety.html', name: '安全な部屋づくりの手順', url: 'https://sippomi.com/journal-home-safety' },
];

const STRIP_TAGS = /<[^>]+>/g;

function extractSteps(html) {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? html;
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2|<\/main|<\/article|<\/section><section)/gi;
  const steps = [];
  let m;
  while ((m = re.exec(main)) !== null) {
    const name = m[1].replace(STRIP_TAGS, '').trim();
    const after = m[2];
    const firstP = after.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const text = firstP ? firstP[1].replace(STRIP_TAGS, '').trim() : '';
    if (name && text) steps.push({ name, text });
  }
  return steps.slice(0, 8);
}

function howToBlock({ name, url, steps }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    inLanguage: 'ja',
    mainEntityOfPage: url,
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
  return `\n  <script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n  </script>`;
}

let modified = 0;
for (const t of TARGETS) {
  const file = path.join(ROOT, t.file);
  let html = await readFile(file, 'utf-8');
  if (html.includes('"@type": "HowTo"') || html.includes('"@type":"HowTo"')) {
    console.log(`skip (already has HowTo): ${t.file}`);
    continue;
  }
  const steps = extractSteps(html);
  if (steps.length < 3) {
    console.warn(`! too few steps in ${t.file} (${steps.length})`);
    continue;
  }
  const block = howToBlock({ name: t.name, url: t.url, steps });
  html = html.replace('</head>', `${block}\n</head>`);
  await writeFile(file, html, 'utf-8');
  console.log(`updated: ${t.file} (${steps.length} steps)`);
  modified++;
}
console.log(`\nModified ${modified} file(s).`);
