#!/usr/bin/env node
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}]/gu;
const SKIP_DIRS = new Set(['node_modules', 'dist', '.vercel', '.git', 'docs', 'tests', 'output', 'cursors', 'images', 'public']);
const TARGET_EXTS = new Set(['.html', '.css', '.js', '.mjs', '.svg', '.json']);
const SELF = path.basename(fileURLToPath(import.meta.url));

const findings = [];

async function* walk(dir) {
  const entries = await readdir(dir);
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    const s = await stat(full);
    if (s.isDirectory()) yield* walk(full);
    else if (TARGET_EXTS.has(path.extname(entry)) && entry !== SELF) yield full;
  }
}

for await (const file of walk(ROOT)) {
  const text = await readFile(file, 'utf-8');
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const matches = [...lines[i].matchAll(EMOJI_RE)];
    if (matches.length) {
      findings.push({
        file: path.relative(ROOT, file),
        line: i + 1,
        emoji: [...new Set(matches.map((m) => m[0]))].join(' '),
        sample: lines[i].trim().slice(0, 120),
      });
    }
  }
}

if (findings.length === 0) {
  console.log('OK: no emoji found.');
  process.exit(0);
}

console.log(`Found ${findings.length} line(s) with emoji:\n`);
for (const f of findings) {
  console.log(`${f.file}:${f.line}  ${f.emoji}`);
  console.log(`  ${f.sample}`);
}
process.exit(1);
