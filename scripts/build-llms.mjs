#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PAGES = [
  { path: 'index.html', url: 'https://sippomi.com/', section: '名前診断トップ' },
  { path: 'welcome-prep.html', url: 'https://sippomi.com/welcome-prep', section: 'お迎えガイド' },
  { path: 'first-dog-guide.html', url: 'https://sippomi.com/first-dog-guide', section: 'お迎えガイド' },
  { path: 'first-cat-guide.html', url: 'https://sippomi.com/first-cat-guide', section: 'お迎えガイド' },
  { path: 'starter-set.html', url: 'https://sippomi.com/starter-set', section: 'お迎えガイド' },
  { path: 'journal-first-pet-checklist.html', url: 'https://sippomi.com/journal-first-pet-checklist', section: '準備・初日' },
  { path: 'journal-first-pet-cost.html', url: 'https://sippomi.com/journal-first-pet-cost', section: '準備・初日' },
  { path: 'journal-first-shopping.html', url: 'https://sippomi.com/journal-first-shopping', section: '準備・初日' },
  { path: 'journal-first-days.html', url: 'https://sippomi.com/journal-first-days', section: '準備・初日' },
  { path: 'journal-home-safety.html', url: 'https://sippomi.com/journal-home-safety', section: '準備・初日' },
  { path: 'journal-pet-vaccine-schedule.html', url: 'https://sippomi.com/journal-pet-vaccine-schedule', section: '健康・しつけ' },
  { path: 'journal-dog-walk-when.html', url: 'https://sippomi.com/journal-dog-walk-when', section: '健康・しつけ' },
  { path: 'journal-dog-alone-training.html', url: 'https://sippomi.com/journal-dog-alone-training', section: '健康・しつけ' },
  { path: 'journal-cat-cage-necessary.html', url: 'https://sippomi.com/journal-cat-cage-necessary', section: '健康・しつけ' },
  { path: 'journal-cat-toilet-fixes.html', url: 'https://sippomi.com/journal-cat-toilet-fixes', section: '健康・しつけ' },
  { path: 'journal-pet-fast-eating.html', url: 'https://sippomi.com/journal-pet-fast-eating', section: '健康・しつけ' },
  { path: 'journal-first-summer.html', url: 'https://sippomi.com/journal-first-summer', section: '生活シーン' },
  { path: 'journal-pet-bousai.html', url: 'https://sippomi.com/journal-pet-bousai', section: '生活シーン' },
  { path: 'journal-kanto-pet-outings.html', url: 'https://sippomi.com/journal-kanto-pet-outings', section: '生活シーン' },
  { path: 'dog-names.html', url: 'https://sippomi.com/dog-names', section: '名前リスト' },
  { path: 'cat-names.html', url: 'https://sippomi.com/cat-names', section: '名前リスト' },
  { path: 'rabbit-names.html', url: 'https://sippomi.com/rabbit-names', section: '名前リスト' },
];

function extractMain(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  return m ? m[1] : html;
}

function htmlToText(html) {
  let s = html;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<nav[\s\S]*?<\/nav>/gi, '');
  s = s.replace(/<aside[\s\S]*?<\/aside>/gi, '');
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n\n# ${stripTags(t)}\n\n`);
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n\n## ${stripTags(t)}\n\n`);
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n\n### ${stripTags(t)}\n\n`);
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `- ${stripTags(t)}\n`);
  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => `${stripTags(t)}\n\n`);
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = stripTags(s);
  s = s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  s = s.split('\n').map((l) => l.trim()).filter(Boolean).join('\n');
  s = s.replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, '').trim();
}

function extractTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : '';
}

async function main() {
  const blocks = [];
  blocks.push('# シッポミ (sippomi.com) — Full Content');
  blocks.push('');
  blocks.push('> ペット名前診断と、犬・猫・うさぎを初めて迎える人向けの実用ガイド。本ファイルは LLM が記事内容を直接参照できるよう、主要記事の本文を結合したものです。');
  blocks.push('');
  let lastSection = '';
  for (const page of PAGES) {
    const file = path.join(ROOT, page.path);
    let html;
    try {
      html = await readFile(file, 'utf-8');
    } catch {
      console.warn('skip (not found):', page.path);
      continue;
    }
    if (page.section !== lastSection) {
      blocks.push('');
      blocks.push(`---`);
      blocks.push(`# Section: ${page.section}`);
      blocks.push(`---`);
      blocks.push('');
      lastSection = page.section;
    }
    const title = extractTitle(html);
    const main = extractMain(html);
    const body = htmlToText(main);
    blocks.push(`---`);
    blocks.push(`Source: ${page.url}`);
    blocks.push(`Title: ${title}`);
    blocks.push(`---`);
    blocks.push('');
    blocks.push(body);
    blocks.push('');
  }
  const out = blocks.join('\n');
  await writeFile(path.join(ROOT, 'public/llms-full.txt'), out, 'utf-8');
  console.log(`Wrote llms-full.txt (${out.length} chars, ${PAGES.length} pages)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
