import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DATASET_URL =
  'https://raw.githubusercontent.com/shuheilocale/japanese-personal-name-dataset/main/japanese_personal_name_dataset/dataset/last_name_org.csv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(__dirname, '../data/japanese-surnames.json');

function parseCsvLine(line) {
  const [kanji = '', count = '0', reading = '', romaji = ''] = line.split(',');
  return {
    kanji: kanji.trim(),
    count: Number.parseInt(count, 10) || 0,
    reading: reading.trim(),
    romaji: romaji.trim(),
  };
}

async function main() {
  const response = await fetch(DATASET_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch surname dataset: ${response.status} ${response.statusText}`);
  }

  const csv = await response.text();
  const rows = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseCsvLine)
    .filter((row) => row.kanji && row.reading);

  const bySurname = {};
  rows.forEach((row, index) => {
    bySurname[row.kanji] = {
      reading: row.reading,
      romaji: row.romaji,
      count: row.count,
      rank: index + 1,
    };
  });

  const payload = {
    source: {
      name: 'Japanese Personal Name Dataset',
      dataset: 'last_name_org.csv',
      url: DATASET_URL,
      license: 'MIT',
      retrievedAt: new Date().toISOString(),
    },
    stats: {
      total: rows.length,
    },
    bySurname,
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${rows.length} surnames to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
