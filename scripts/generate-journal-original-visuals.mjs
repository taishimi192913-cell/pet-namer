#!/usr/bin/env node
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const WIDTH = 1200;
const HEIGHT = 800;

const COLORS = {
  base: '#f4eede',
  surface: '#ffffff',
  soft: '#f5f5f5',
  beige: '#e0ceaa',
  ink: '#1d1d1f',
  muted: '#6e6e73',
  blue: '#0071e3',
  red: '#7f0019',
  line: '#d8d8d9',
};

const THEMES = {
  'welcome-prep': { accent: COLORS.blue, warm: COLORS.beige, scene: 'welcome' },
  'first-dog-guide': { accent: COLORS.blue, warm: '#dac59e', scene: 'dogIntro' },
  'first-cat-guide': { accent: COLORS.red, warm: COLORS.beige, scene: 'catIntro' },
  'starter-set': { accent: COLORS.blue, warm: COLORS.beige, scene: 'supplies' },
  'journal-first-pet-checklist': { accent: COLORS.blue, warm: '#dedede', scene: 'checklist' },
  'journal-first-pet-cost': { accent: COLORS.blue, warm: COLORS.beige, scene: 'cost' },
  'journal-pet-vaccine-schedule': { accent: COLORS.blue, warm: '#dedede', scene: 'vaccine' },
  'journal-dog-walk-when': { accent: COLORS.blue, warm: COLORS.beige, scene: 'walk' },
  'journal-cat-cage-necessary': { accent: COLORS.red, warm: COLORS.beige, scene: 'cage' },
  'journal-first-days': { accent: COLORS.blue, warm: COLORS.beige, scene: 'firstDays' },
  'journal-home-safety': { accent: COLORS.blue, warm: '#dedede', scene: 'safety' },
  'journal-first-shopping': { accent: COLORS.blue, warm: COLORS.beige, scene: 'shopping' },
  'journal-dog-alone-training': { accent: COLORS.blue, warm: COLORS.beige, scene: 'crate' },
  'journal-cat-toilet-fixes': { accent: COLORS.red, warm: '#dedede', scene: 'litter' },
  'journal-pet-fast-eating': { accent: COLORS.blue, warm: COLORS.beige, scene: 'feeding' },
  'journal-first-summer': { accent: COLORS.blue, warm: COLORS.beige, scene: 'summer' },
  'journal-pet-bousai': { accent: COLORS.red, warm: COLORS.beige, scene: 'disaster' },
  'journal-kanto-pet-outings': { accent: COLORS.blue, warm: COLORS.beige, scene: 'outings' },
};

function hashString(value) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function makeRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = Math.imul(1664525, state) + 1013904223;
    return ((state >>> 0) / 4294967296);
  };
}

function esc(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function lineTexture(rnd, count, accent) {
  const lines = [];
  for (let i = 0; i < count; i += 1) {
    const x = Math.round(rnd() * WIDTH);
    const y = Math.round(rnd() * HEIGHT);
    const length = 22 + Math.round(rnd() * 120);
    const opacity = (0.025 + rnd() * 0.055).toFixed(3);
    const color = rnd() > 0.88 ? accent : COLORS.ink;
    lines.push(`<path d="M${x} ${y} l${length} ${Math.round((rnd() - 0.5) * 10)}" stroke="${color}" stroke-width="${(0.35 + rnd() * 0.65).toFixed(2)}" opacity="${opacity}"/>`);
  }
  return lines.join('');
}

function dots(rnd, count, accent) {
  const items = [];
  for (let i = 0; i < count; i += 1) {
    const x = Math.round(40 + rnd() * (WIDTH - 80));
    const y = Math.round(38 + rnd() * (HEIGHT - 76));
    const r = (0.7 + rnd() * 1.8).toFixed(1);
    const color = rnd() > 0.9 ? accent : COLORS.ink;
    items.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${(0.025 + rnd() * 0.055).toFixed(3)}"/>`);
  }
  return items.join('');
}

function blueprintGrid(rnd, accent, warm) {
  const lines = [];
  for (let x = 58; x < WIDTH; x += 64) {
    lines.push(`<path d="M${x} 58 v684" stroke="${COLORS.ink}" stroke-opacity=".025" stroke-width="1"/>`);
  }
  for (let y = 70; y < HEIGHT; y += 54) {
    lines.push(`<path d="M54 ${y} h1092" stroke="${COLORS.ink}" stroke-opacity=".025" stroke-width="1"/>`);
  }
  for (let i = 0; i < 16; i += 1) {
    const x = Math.round(90 + rnd() * 980);
    const y = Math.round(92 + rnd() * 560);
    const w = Math.round(60 + rnd() * 180);
    const h = Math.round(28 + rnd() * 96);
    lines.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${6 + Math.round(rnd() * 8)}" fill="none" stroke="${rnd() > 0.72 ? accent : warm}" stroke-opacity="${(0.045 + rnd() * 0.055).toFixed(3)}" stroke-width="${(0.8 + rnd() * 0.7).toFixed(2)}"/>`);
  }
  return `<g aria-hidden="true">${lines.join('')}</g>`;
}

function contourShade(rnd, accent) {
  const paths = [];
  for (let i = 0; i < 24; i += 1) {
    const y = Math.round(116 + i * 23 + rnd() * 9);
    const x1 = Math.round(48 + rnd() * 160);
    const x2 = Math.round(930 + rnd() * 190);
    const c1 = Math.round(260 + rnd() * 210);
    const c2 = Math.round(650 + rnd() * 200);
    paths.push(`<path d="M${x1} ${y} C${c1} ${y - 38} ${c2} ${y + 40} ${x2} ${y - 8}" fill="none" stroke="${i % 7 === 0 ? accent : COLORS.ink}" stroke-opacity="${(0.018 + rnd() * 0.027).toFixed(3)}" stroke-width="${(0.8 + rnd() * 1.2).toFixed(2)}"/>`);
  }
  return `<g aria-hidden="true">${paths.join('')}</g>`;
}

function measuringTicks(x, y, width, label, accent) {
  const ticks = [];
  for (let i = 0; i <= 8; i += 1) {
    const tx = x + i * (width / 8);
    ticks.push(`<path d="M${tx.toFixed(1)} ${y} v${i % 2 === 0 ? 16 : 10}" stroke="${COLORS.ink}" stroke-opacity=".16" stroke-width="1.6"/>`);
  }
  return `
    <g opacity=".82">
      <path d="M${x} ${y} h${width}" stroke="${COLORS.ink}" stroke-opacity=".16" stroke-width="1.6"/>
      ${ticks.join('')}
      <text x="${x}" y="${y + 34}" fill="${accent}" opacity=".55" font-size="11" font-weight="700" letter-spacing="2">${esc(label)}</text>
    </g>`;
}

function microNote(x, y, text, accent, rotate = 0) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" opacity=".58">
      <rect x="0" y="0" width="${Math.max(92, text.length * 8 + 30)}" height="30" rx="6" fill="#fff" stroke="${COLORS.ink}" stroke-opacity=".07"/>
      <circle cx="17" cy="15" r="4" fill="${accent}" opacity=".45"/>
      <text x="30" y="19" fill="${COLORS.ink}" opacity=".48" font-size="11" font-weight="700" letter-spacing="1.5">${esc(text)}</text>
    </g>`;
}

function pageTabs(x, y, accent, warm) {
  const tabs = ['route', 'care', 'memo'];
  return `
    <g transform="translate(${x} ${y})">
      ${tabs.map((tab, i) => `
        <g transform="translate(${i * 76} ${i % 2 ? 8 : 0})">
          <rect width="64" height="24" rx="12" fill="${i === 0 ? accent : warm}" opacity="${i === 0 ? '.62' : '.38'}"/>
          <text x="14" y="16" fill="${i === 0 ? '#fff' : COLORS.ink}" opacity="${i === 0 ? '.92' : '.5'}" font-size="9" font-weight="700" letter-spacing="1.5">${tab}</text>
        </g>`).join('')}
    </g>`;
}

function defs(accent) {
  return `
  <defs>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#1d1d1f" flood-opacity=".13"/>
    </filter>
    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#1d1d1f" flood-opacity=".10"/>
    </filter>
    <filter id="paperNoise">
      <feTurbulence type="fractalNoise" baseFrequency=".82" numOctaves="4" seed="11"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 .11"/>
      </feComponentTransfer>
    </filter>
    <linearGradient id="paperShade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset=".62" stop-color="#fafafa"/>
      <stop offset="1" stop-color="#ece5d7"/>
    </linearGradient>
    <linearGradient id="accentWash" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${accent}" stop-opacity=".16"/>
      <stop offset="1" stop-color="${accent}" stop-opacity=".015"/>
    </linearGradient>
  </defs>`;
}

function page({ x, y, w, h, rotate = 0, fill = 'url(#paperShade)', opacity = 1 }) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#shadow)" opacity="${opacity}">
      <rect x="0" y="0" width="${w}" height="${h}" rx="22" fill="${fill}" stroke="${COLORS.surface}" stroke-width="1.5"/>
      <rect x="0" y="0" width="${w}" height="${h}" rx="22" fill="transparent" stroke="${COLORS.ink}" stroke-opacity=".045"/>
      <rect x="0" y="0" width="${w}" height="${h}" rx="22" filter="url(#paperNoise)" opacity=".55"/>
    </g>`;
}

function ruledPaper(x, y, w, h, rotate, accent, rows = 8) {
  const lines = [];
  for (let i = 0; i < rows; i += 1) {
    const yy = 72 + i * ((h - 130) / Math.max(1, rows - 1));
    const length = w - 110 - (i % 3) * 52;
    lines.push(`<path d="M58 ${yy.toFixed(1)} h${length.toFixed(1)}" stroke="${COLORS.ink}" stroke-opacity=".12" stroke-width="2" stroke-linecap="round"/>`);
  }
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#shadow)">
      <rect width="${w}" height="${h}" rx="24" fill="url(#paperShade)"/>
      <rect x="0" y="0" width="${w}" height="${h}" rx="24" filter="url(#paperNoise)" opacity=".5"/>
      <path d="M58 44 h126" stroke="${accent}" stroke-width="5" stroke-linecap="round" opacity=".72"/>
      ${lines.join('')}
      <rect x="0" y="0" width="${w}" height="${h}" rx="24" fill="none" stroke="${COLORS.ink}" stroke-opacity=".055"/>
    </g>`;
}

function clipboard(x, y, rotate, accent, checks = 5) {
  const rows = [];
  for (let i = 0; i < checks; i += 1) {
    const yy = 98 + i * 50;
    rows.push(`
      <rect x="46" y="${yy - 16}" width="24" height="24" rx="6" fill="#fff" stroke="${COLORS.ink}" stroke-opacity=".18"/>
      <path d="M51 ${yy - 2} l8 8 l17 -24" fill="none" stroke="${i < 3 ? accent : COLORS.muted}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="${i < 3 ? '.85' : '.35'}"/>
      <path d="M92 ${yy} h${150 - (i % 2) * 38}" stroke="${COLORS.ink}" stroke-opacity=".16" stroke-width="3" stroke-linecap="round"/>`);
  }
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#shadow)">
      <rect width="290" height="386" rx="24" fill="#fbfbfb"/>
      <rect x="95" y="-20" width="100" height="48" rx="16" fill="${COLORS.beige}" stroke="#fff" stroke-width="3"/>
      ${rows.join('')}
      <rect width="290" height="386" rx="24" fill="none" stroke="${COLORS.ink}" stroke-opacity=".06"/>
    </g>`;
}

function card(x, y, w, h, rotate, accent, content = '') {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#softShadow)">
      <rect width="${w}" height="${h}" rx="18" fill="#fff"/>
      <rect width="${w}" height="${h}" rx="18" fill="none" stroke="${COLORS.ink}" stroke-opacity=".07"/>
      <path d="M28 36 h${Math.min(118, w - 74)}" stroke="${accent}" stroke-width="5" stroke-linecap="round" opacity=".72"/>
      ${content}
    </g>`;
}

function smallLabel(x, y, text, accent) {
  return `<text x="${x}" y="${y}" fill="${accent}" opacity=".58" font-size="12" font-weight="700" letter-spacing="3">${esc(text)}</text>`;
}

function pencil(x, y, rotate, accent) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#softShadow)">
      <rect x="0" y="0" width="250" height="20" rx="10" fill="${COLORS.ink}" opacity=".84"/>
      <rect x="36" y="0" width="146" height="20" fill="${accent}" opacity=".82"/>
      <path d="M250 10 l38 -16 v32z" fill="${COLORS.beige}"/>
      <path d="M288 -6 l18 16 l-18 16z" fill="${COLORS.ink}"/>
    </g>`;
}

function tape(x, y, rotate, accent) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" opacity=".72">
      <rect width="108" height="34" rx="7" fill="${accent}" opacity=".12"/>
      <path d="M12 8 h84 M12 25 h84" stroke="#fff" stroke-opacity=".42" stroke-width="2"/>
    </g>`;
}

function leash(x, y, rotate, accent) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#softShadow)">
      <path d="M20 210 C128 70 254 258 392 86 C442 24 488 48 500 100 C514 164 438 188 410 132" fill="none" stroke="${COLORS.ink}" stroke-width="16" stroke-linecap="round" opacity=".78"/>
      <path d="M36 208 C140 92 238 226 366 92" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round" opacity=".78"/>
      <path d="M118 130 C188 148 254 172 330 104" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".58"/>
      <circle cx="498" cy="108" r="48" fill="none" stroke="${COLORS.ink}" stroke-width="12" opacity=".82"/>
      <circle cx="498" cy="108" r="29" fill="none" stroke="#fff" stroke-width="3" opacity=".42"/>
      <path d="M398 105 l38 42" stroke="${COLORS.beige}" stroke-width="12" stroke-linecap="round" opacity=".72"/>
      <rect x="374" y="74" width="64" height="32" rx="14" fill="#fff" stroke="${accent}" stroke-opacity=".55" stroke-width="4"/>
      <path d="M386 90 h40" stroke="${COLORS.ink}" stroke-opacity=".26" stroke-width="3" stroke-linecap="round"/>
      <circle cx="44" cy="208" r="18" fill="#fff" stroke="${accent}" stroke-width="6"/>
      <circle cx="44" cy="208" r="7" fill="${COLORS.ink}" opacity=".22"/>
    </g>`;
}

function pawTrail(x, y, rotate, accent, count = 5) {
  const paws = [];
  for (let i = 0; i < count; i += 1) {
    const dx = i * 54;
    const dy = Math.sin(i) * 16;
    paws.push(`
      <g transform="translate(${dx} ${dy}) rotate(${i % 2 ? 11 : -8})" opacity=".08">
        <ellipse cx="0" cy="16" rx="11" ry="14" fill="${accent}"/>
        <circle cx="-14" cy="0" r="5" fill="${accent}"/>
        <circle cx="-4" cy="-8" r="5" fill="${accent}"/>
        <circle cx="8" cy="-7" r="5" fill="${accent}"/>
        <circle cx="17" cy="2" r="5" fill="${accent}"/>
      </g>`);
  }
  return `<g transform="translate(${x} ${y}) rotate(${rotate})">${paws.join('')}</g>`;
}

function petSilhouette(x, y, scale, kind, accent) {
  if (kind === 'cat') {
    return `
      <g transform="translate(${x} ${y}) scale(${scale})" opacity=".10">
        <path d="M62 48 L78 6 L99 44 C136 36 171 45 193 66 L213 8 L232 70 C256 104 253 156 222 186 C185 222 106 223 68 187 C28 149 29 91 62 48Z" fill="${COLORS.ink}"/>
        <path d="M214 156 C310 130 304 228 222 204" fill="none" stroke="${COLORS.ink}" stroke-width="16" stroke-linecap="round"/>
        <path d="M86 64 q58 -24 118 0" fill="none" stroke="${accent}" stroke-width="7" stroke-linecap="round" opacity=".55"/>
      </g>`;
  }
  return `
    <g transform="translate(${x} ${y}) scale(${scale})" opacity=".11">
      <ellipse cx="142" cy="142" rx="122" ry="70" fill="${COLORS.ink}"/>
      <circle cx="58" cy="96" r="45" fill="${COLORS.ink}"/>
      <path d="M24 76 C-20 82 -16 142 28 142" fill="${COLORS.ink}"/>
      <path d="M244 118 C318 76 342 152 262 166" fill="none" stroke="${COLORS.ink}" stroke-width="16" stroke-linecap="round"/>
      <path d="M116 96 h112" stroke="${accent}" stroke-width="6" stroke-linecap="round" opacity=".6"/>
    </g>`;
}

function bowl(x, y, rotate, accent, warm) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#softShadow)">
      <ellipse cx="150" cy="70" rx="138" ry="44" fill="${warm}" opacity=".72"/>
      <path d="M24 70 h252 l-42 96 h-168z" fill="#fff" stroke="${COLORS.ink}" stroke-opacity=".08"/>
      <ellipse cx="150" cy="72" rx="126" ry="34" fill="none" stroke="${accent}" stroke-width="5" opacity=".62"/>
      <circle cx="112" cy="57" r="8" fill="${COLORS.ink}" opacity=".14"/>
      <circle cx="158" cy="61" r="7" fill="${COLORS.ink}" opacity=".14"/>
      <circle cx="202" cy="54" r="8" fill="${COLORS.ink}" opacity=".14"/>
    </g>`;
}

function slowFeeder(x, y, rotate, accent, warm) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#shadow)">
      <ellipse cx="184" cy="126" rx="174" ry="90" fill="#fff"/>
      <ellipse cx="184" cy="126" rx="144" ry="62" fill="${warm}" opacity=".72"/>
      <path d="M82 120 q30 -46 62 0 q30 46 62 0 q30 -46 62 0 q30 46 62 0" fill="none" stroke="${accent}" stroke-width="16" stroke-linecap="round" opacity=".82"/>
      <ellipse cx="184" cy="126" rx="174" ry="90" fill="none" stroke="${COLORS.ink}" stroke-opacity=".07" stroke-width="2"/>
    </g>`;
}

function carrier(x, y, rotate, accent, warm) {
  const bars = Array.from({ length: 5 }, (_, i) => `<path d="M${104 + i * 38} 106 v120" stroke="${COLORS.ink}" stroke-opacity=".18" stroke-width="6" stroke-linecap="round"/>`).join('');
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#shadow)">
      <rect x="0" y="72" width="352" height="230" rx="40" fill="#fff"/>
      <path d="M120 72 v-28 q0 -30 56 -30 t56 30 v28" fill="none" stroke="${COLORS.ink}" stroke-opacity=".55" stroke-width="12" stroke-linecap="round"/>
      <rect x="84" y="96" width="184" height="146" rx="28" fill="${warm}" opacity=".36"/>
      ${bars}
      <path d="M36 164 h42 M274 164 h42" stroke="${accent}" stroke-width="8" stroke-linecap="round" opacity=".72"/>
      <rect x="0" y="72" width="352" height="230" rx="40" fill="none" stroke="${COLORS.ink}" stroke-opacity=".065"/>
    </g>`;
}

function cage(x, y, rotate, accent) {
  const bars = Array.from({ length: 7 }, (_, i) => `<path d="M${54 + i * 50} 18 v296" stroke="${COLORS.ink}" stroke-opacity=".12" stroke-width="6"/>`).join('');
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#shadow)">
      <rect width="410" height="332" rx="30" fill="#fff"/>
      <path d="M0 112 h410 M0 224 h410" stroke="${COLORS.ink}" stroke-opacity=".10" stroke-width="6"/>
      ${bars}
      <rect x="96" y="126" width="212" height="136" rx="30" fill="${COLORS.beige}" opacity=".32"/>
      ${petSilhouette(102, 110, 0.54, 'cat', accent)}
      <rect width="410" height="332" rx="30" fill="none" stroke="${COLORS.ink}" stroke-opacity=".07"/>
    </g>`;
}

function roomPlane(accent, warm) {
  return `
    <g opacity=".92">
      <path d="M128 584 L1018 452 L1162 800 L0 800Z" fill="#fff" opacity=".64"/>
      <path d="M150 598 L1028 478" stroke="${COLORS.ink}" stroke-opacity=".08" stroke-width="2"/>
      <path d="M236 630 L1110 520" stroke="${COLORS.ink}" stroke-opacity=".05" stroke-width="1.5"/>
      <path d="M718 248 L1110 194 L1110 596 L718 650Z" fill="${warm}" opacity=".18"/>
      <path d="M718 248 L1110 194 L1110 596 L718 650Z" fill="none" stroke="${accent}" stroke-opacity=".10" stroke-width="2"/>
    </g>`;
}

function calendar(x, y, rotate, accent) {
  const cells = [];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const active = (row === 1 && col === 2) || (row === 2 && col === 4);
      cells.push(`<rect x="${42 + col * 38}" y="${92 + row * 36}" width="20" height="20" rx="5" fill="${active ? accent : COLORS.ink}" opacity="${active ? '.76' : '.12'}"/>`);
    }
  }
  return card(x, y, 260, 270, rotate, accent, `
    <path d="M0 66 h260" stroke="${COLORS.ink}" stroke-opacity=".08" stroke-width="3"/>
    ${cells.join('')}
    <path d="M44 232 h162" stroke="${COLORS.ink}" stroke-opacity=".12" stroke-width="3" stroke-linecap="round"/>
  `);
}

function medicine(x, y, rotate, accent) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#softShadow)">
      <rect x="0" y="42" width="132" height="206" rx="22" fill="#fff"/>
      <rect x="28" y="0" width="76" height="58" rx="14" fill="${COLORS.soft}" stroke="#fff" stroke-width="3"/>
      <path d="M66 96 v82 M25 137 h82" stroke="${accent}" stroke-width="16" stroke-linecap="round"/>
      <rect x="0" y="42" width="132" height="206" rx="22" fill="none" stroke="${COLORS.ink}" stroke-opacity=".07"/>
    </g>`;
}

function mapRoute(x, y, rotate, accent, warm) {
  const streetLines = Array.from({ length: 9 }, (_, i) => {
    const offset = i * 34;
    return `<path d="M${34 + offset} ${46 + (i % 3) * 16} l${64 + (i % 4) * 28} ${238 - (i % 2) * 46}" stroke="${COLORS.ink}" stroke-opacity=".055" stroke-width="2" stroke-linecap="round"/>`;
  }).join('');
  const nodes = Array.from({ length: 8 }, (_, i) => {
    const cx = 76 + i * 42;
    const cy = 256 - Math.sin(i * 1.2) * 48 - (i % 3) * 22;
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${i % 3 === 0 ? 5 : 3}" fill="${i % 3 === 0 ? accent : COLORS.ink}" opacity="${i % 3 === 0 ? '.5' : '.16'}"/>`;
  }).join('');
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#shadow)">
      <path d="M0 42 q0 -28 28 -34 l310 -52 q32 -5 44 24 l64 252 q8 31 -22 42 l-312 72 q-34 8 -46 -26z" fill="#fff"/>
      ${streetLines}
      <path d="M64 282 C110 170 194 226 238 132 C276 50 344 82 378 22" fill="none" stroke="${warm}" stroke-width="20" stroke-linecap="round"/>
      <path d="M66 282 C116 174 190 224 236 130 C274 54 342 82 376 22" fill="none" stroke="${accent}" stroke-width="4" stroke-dasharray="10 14" stroke-linecap="round"/>
      ${nodes}
      <circle cx="66" cy="282" r="18" fill="#fff" stroke="${accent}" stroke-width="6"/>
      <circle cx="376" cy="22" r="18" fill="#fff" stroke="${accent}" stroke-width="6"/>
      <path d="M88 278 h78 M310 36 h82" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".52"/>
      <path d="M36 84 h116 M284 208 h104 M120 36 h78" stroke="${COLORS.ink}" stroke-opacity=".12" stroke-width="4" stroke-linecap="round"/>
      ${measuringTicks(52, 314, 148, '900m', accent)}
      <path d="M0 42 q0 -28 28 -34 l310 -52 q32 -5 44 24 l64 252 q8 31 -22 42 l-312 72 q-34 8 -46 -26z" fill="none" stroke="${COLORS.ink}" stroke-opacity=".055"/>
    </g>`;
}

function houseSafety(x, y, rotate, accent, warm) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#shadow)">
      <rect width="390" height="288" rx="26" fill="#fff"/>
      <path d="M56 238 h284" stroke="${COLORS.ink}" stroke-opacity=".10" stroke-width="8" stroke-linecap="round"/>
      <rect x="54" y="72" width="96" height="144" rx="16" fill="${warm}" opacity=".44"/>
      <path d="M82 116 h40 M82 154 h40 M82 192 h40" stroke="${COLORS.ink}" stroke-opacity=".16" stroke-width="6" stroke-linecap="round"/>
      <path d="M212 90 C276 76 312 118 286 166 C264 206 320 214 338 172" fill="none" stroke="${COLORS.ink}" stroke-opacity=".30" stroke-width="9" stroke-linecap="round"/>
      <circle cx="338" cy="172" r="17" fill="#fff" stroke="${accent}" stroke-width="6"/>
      <path d="M212 90 l-18 -22 M212 90 l-4 -28" stroke="${accent}" stroke-width="6" stroke-linecap="round" opacity=".72"/>
      <rect width="390" height="288" rx="26" fill="none" stroke="${COLORS.ink}" stroke-opacity=".06"/>
    </g>`;
}

function shelf(x, y, rotate, accent, warm) {
  const products = Array.from({ length: 12 }, (_, i) => {
    const col = i % 6;
    const row = Math.floor(i / 6);
    const px = 42 + col * 50;
    const py = 76 + row * 88;
    const h = 48 + ((i * 13) % 22);
    return `<rect x="${px}" y="${py + (70 - h)}" width="30" height="${h}" rx="7" fill="${i % 4 === 0 ? accent : warm}" opacity="${i % 4 === 0 ? '.66' : '.5'}"/>`;
  }).join('');
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#shadow)">
      <rect width="390" height="276" rx="24" fill="#fff"/>
      <path d="M30 154 h330 M30 242 h330" stroke="${COLORS.ink}" stroke-opacity=".12" stroke-width="7" stroke-linecap="round"/>
      ${products}
      <rect width="390" height="276" rx="24" fill="none" stroke="${COLORS.ink}" stroke-opacity=".06"/>
    </g>`;
}

function litterBox(x, y, rotate, accent, warm) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#shadow)">
      <path d="M32 104 h368 l-54 182 h-260z" fill="#fff"/>
      <ellipse cx="216" cy="110" rx="184" ry="54" fill="${warm}" opacity=".55"/>
      <path d="M98 115 h238" stroke="${COLORS.ink}" stroke-opacity=".08" stroke-width="8" stroke-linecap="round"/>
      <path d="M150 76 L168 30 L190 72 Q238 58 286 78 L304 30 L324 84" fill="none" stroke="${accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".56"/>
      <path d="M32 104 h368 l-54 182 h-260z" fill="none" stroke="${COLORS.ink}" stroke-opacity=".06"/>
    </g>`;
}

function fanAndWater(x, y, rotate, accent, warm) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate})" filter="url(#shadow)">
      <circle cx="120" cy="112" r="86" fill="#fff"/>
      <circle cx="120" cy="112" r="54" fill="${warm}" opacity=".42"/>
      <path d="M120 112 C88 58 150 48 120 112 C176 90 194 148 120 112 C116 178 60 146 120 112Z" fill="${accent}" opacity=".42"/>
      <path d="M120 198 v82 M70 280 h100" stroke="${COLORS.ink}" stroke-opacity=".28" stroke-width="10" stroke-linecap="round"/>
      <rect x="238" y="74" width="96" height="212" rx="28" fill="#fff"/>
      <path d="M260 132 h52 M260 182 h52 M260 232 h52" stroke="${accent}" stroke-width="6" stroke-linecap="round" opacity=".62"/>
      <rect x="238" y="74" width="96" height="212" rx="28" fill="none" stroke="${COLORS.ink}" stroke-opacity=".06"/>
    </g>`;
}

function sceneObjects(scene, accent, warm) {
  const common = {
    welcome: [
      clipboard(126, 158, -5, accent, 5),
      carrier(645, 242, 5, accent, warm),
      bowl(455, 496, -7, accent, warm),
      petSilhouette(760, 442, 0.72, 'cat', accent),
      pawTrail(396, 236, -12, accent, 5),
      pencil(184, 586, -9, accent),
    ],
    dogIntro: [
      ruledPaper(118, 134, 374, 462, -7, accent, 9),
      leash(590, 270, -8, accent),
      petSilhouette(684, 452, 0.78, 'dog', accent),
      card(760, 138, 250, 166, 6, accent, `<path d="M34 88 h170 M34 122 h118" stroke="${COLORS.ink}" stroke-opacity=".13" stroke-width="4" stroke-linecap="round"/>`),
      pawTrail(410, 626, 8, accent, 4),
    ],
    catIntro: [
      ruledPaper(120, 148, 386, 448, -4, accent, 7),
      cage(632, 214, 3, accent),
      bowl(426, 536, -10, accent, warm),
      pawTrail(210, 616, -16, accent, 5),
      tape(386, 164, 10, accent),
    ],
    supplies: [
      clipboard(112, 128, -4, accent, 6),
      bowl(520, 508, -5, accent, warm),
      carrier(700, 190, 6, accent, warm),
      shelf(522, 116, -7, accent, warm),
      pencil(184, 610, -8, accent),
    ],
    checklist: [
      clipboard(146, 112, -5, accent, 7),
      clipboard(468, 170, 4, accent, 5),
      card(794, 210, 230, 320, -4, accent, `<path d="M40 96 h136 M40 148 h104 M40 200 h150 M40 252 h92" stroke="${COLORS.ink}" stroke-opacity=".13" stroke-width="4" stroke-linecap="round"/>`),
      pencil(222, 626, -8, accent),
      tape(464, 122, 8, accent),
    ],
    cost: [
      ruledPaper(132, 148, 390, 448, -5, accent, 8),
      card(676, 162, 302, 382, 4, accent, `<text x="38" y="118" fill="${COLORS.ink}" opacity=".62" font-size="48" font-weight="700">¥</text><path d="M38 166 h214 M38 216 h166 M38 266 h206 M38 316 h122" stroke="${COLORS.ink}" stroke-opacity=".12" stroke-width="5" stroke-linecap="round"/><path d="M198 94 h48 v48 h-48z" fill="${accent}" opacity=".65"/>`),
      pencil(196, 612, -7, accent),
      bowl(468, 512, 7, accent, warm),
    ],
    vaccine: [
      calendar(140, 160, -5, accent),
      medicine(506, 302, 8, accent),
      card(704, 190, 324, 242, 4, accent, `<path d="M42 98 h218 M42 146 h170 M42 194 h220" stroke="${COLORS.ink}" stroke-opacity=".12" stroke-width="5" stroke-linecap="round"/><path d="M238 34 v76 M200 72 h76" stroke="${accent}" stroke-width="10" stroke-linecap="round" opacity=".64"/>`),
      petSilhouette(722, 468, 0.62, 'dog', accent),
      tape(842, 168, -8, accent),
    ],
    walk: [
      mapRoute(128, 184, -6, accent, warm),
      leash(576, 238, 8, accent),
      card(730, 128, 220, 170, -5, accent, `<path d="M36 92 h142 M36 126 h86" stroke="${COLORS.ink}" stroke-opacity=".13" stroke-width="4" stroke-linecap="round"/>`),
      pawTrail(474, 608, -4, accent, 6),
    ],
    cage: [
      cage(626, 198, 4, accent),
      ruledPaper(126, 156, 350, 426, -6, accent, 7),
      bowl(440, 540, -8, accent, warm),
      tape(300, 148, 7, accent),
    ],
    firstDays: [
      ruledPaper(128, 146, 388, 456, -6, accent, 7),
      card(626, 258, 390, 214, 4, accent, `<ellipse cx="194" cy="106" rx="142" ry="54" fill="${warm}" opacity=".44"/><path d="M76 108 h236" stroke="${COLORS.ink}" stroke-opacity=".08" stroke-width="8" stroke-linecap="round"/>`),
      petSilhouette(686, 402, 0.72, 'dog', accent),
      bowl(480, 540, 8, accent, warm),
      tape(780, 244, -10, accent),
    ],
    safety: [
      houseSafety(604, 206, 4, accent, warm),
      clipboard(142, 126, -5, accent, 5),
      card(458, 510, 248, 132, -7, accent, `<path d="M36 86 h170" stroke="${COLORS.ink}" stroke-opacity=".13" stroke-width="4" stroke-linecap="round"/>`),
      pawTrail(840, 584, -12, accent, 4),
    ],
    shopping: [
      shelf(604, 174, 5, accent, warm),
      clipboard(130, 134, -5, accent, 6),
      bowl(502, 546, -8, accent, warm),
      carrier(760, 430, -4, accent, warm),
    ],
    crate: [
      carrier(620, 224, 4, accent, warm),
      ruledPaper(132, 150, 370, 432, -6, accent, 8),
      petSilhouette(724, 444, 0.62, 'dog', accent),
      card(430, 520, 226, 132, 8, accent, `<path d="M34 86 h162" stroke="${COLORS.ink}" stroke-opacity=".13" stroke-width="4" stroke-linecap="round"/>`),
    ],
    litter: [
      litterBox(618, 272, 3, accent, warm),
      ruledPaper(132, 146, 376, 448, -5, accent, 7),
      card(744, 140, 246, 134, -5, accent, `<path d="M36 86 h168" stroke="${COLORS.ink}" stroke-opacity=".13" stroke-width="4" stroke-linecap="round"/>`),
      pawTrail(396, 610, 8, accent, 5),
    ],
    feeding: [
      slowFeeder(614, 312, 4, accent, warm),
      ruledPaper(130, 146, 376, 448, -5, accent, 7),
      card(760, 164, 230, 162, 6, accent, `<path d="M38 92 h150 M38 126 h96" stroke="${COLORS.ink}" stroke-opacity=".13" stroke-width="4" stroke-linecap="round"/>`),
      petSilhouette(640, 468, 0.62, 'dog', accent),
    ],
    summer: [
      fanAndWater(622, 202, 4, accent, warm),
      ruledPaper(132, 148, 374, 444, -5, accent, 7),
      bowl(454, 548, -8, accent, warm),
      card(790, 510, 210, 126, -5, accent, `<path d="M36 80 h138" stroke="${COLORS.ink}" stroke-opacity=".13" stroke-width="4" stroke-linecap="round"/>`),
    ],
    disaster: [
      carrier(620, 224, 4, accent, warm),
      medicine(476, 332, -8, accent),
      clipboard(132, 126, -5, accent, 6),
      card(790, 144, 228, 134, -6, accent, `<path d="M38 86 h146" stroke="${COLORS.ink}" stroke-opacity=".13" stroke-width="4" stroke-linecap="round"/>`),
      tape(300, 122, 8, accent),
    ],
    outings: [
      mapRoute(128, 176, -6, accent, warm),
      leash(620, 282, 5, accent),
      card(770, 134, 238, 168, 6, accent, `<path d="M62 118 h114 M80 82 h78" stroke="${COLORS.ink}" stroke-opacity=".13" stroke-width="4" stroke-linecap="round"/><path d="M76 86 q44 -46 88 0" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round" opacity=".58"/>`),
      pawTrail(440, 622, -4, accent, 5),
    ],
  };
  return common[scene] || common.welcome;
}

function editorialDetailLayer(scene, accent, warm) {
  const shared = [
    pageTabs(760, 88, accent, warm),
    microNote(82, 86, 'checked guide', accent, -2),
    measuringTicks(842, 686, 176, 'scale 1:12', accent),
  ];

  const layers = {
    walk: [
      microNote(760, 344, 'cool pavement', accent, -3),
      microNote(856, 390, 'short lead', accent, 2),
      microNote(594, 566, 'water break', accent, -4),
      `<g transform="translate(792 474) rotate(-5)" filter="url(#softShadow)">
        <rect width="258" height="124" rx="22" fill="#fff"/>
        <path d="M30 44 h82 M30 78 h132" stroke="${COLORS.ink}" stroke-opacity=".14" stroke-width="4" stroke-linecap="round"/>
        <path d="M188 32 v60 M158 62 h60" stroke="${accent}" stroke-width="8" stroke-linecap="round" opacity=".58"/>
        <rect width="258" height="124" rx="22" fill="none" stroke="${COLORS.ink}" stroke-opacity=".06"/>
      </g>`,
      `<g transform="translate(184 566) rotate(3)" opacity=".74">
        <rect width="214" height="72" rx="18" fill="#fff" stroke="${COLORS.ink}" stroke-opacity=".06"/>
        <path d="M30 28 h154 M30 48 h112" stroke="${COLORS.ink}" stroke-opacity=".12" stroke-width="3" stroke-linecap="round"/>
        <circle cx="172" cy="36" r="18" fill="none" stroke="${accent}" stroke-width="5" opacity=".62"/>
      </g>`,
    ],
    outings: [
      microNote(772, 336, 'shade route', accent, -4),
      microNote(514, 596, 'rest stop', accent, 2),
      microNote(870, 516, 'carry towel', accent, -2),
    ],
    supplies: [
      microNote(774, 432, 'daily items', accent, -3),
      microNote(456, 476, 'washable', accent, 2),
    ],
    shopping: [
      microNote(796, 472, 'size check', accent, -3),
      microNote(470, 502, 'starter kit', accent, 2),
    ],
    vaccine: [
      microNote(742, 482, 'clinic memo', accent, -3),
      microNote(422, 276, 'next date', accent, 2),
    ],
    disaster: [
      microNote(754, 432, '72h kit', accent, -3),
      microNote(444, 286, 'medicine', accent, 2),
    ],
    cage: [
      microNote(756, 546, 'quiet zone', accent, -3),
      microNote(392, 560, 'meal space', accent, 2),
    ],
    litter: [
      microNote(750, 470, 'sand depth', accent, -3),
      microNote(430, 566, 'clean cue', accent, 2),
    ],
    safety: [
      microNote(782, 514, 'cord lock', accent, -3),
      microNote(432, 494, 'room scan', accent, 2),
    ],
    feeding: [
      microNote(758, 502, 'slow pace', accent, -3),
      microNote(428, 558, 'portion memo', accent, 2),
    ],
    summer: [
      microNote(790, 470, 'cool spot', accent, -3),
      microNote(432, 552, 'water level', accent, 2),
    ],
    default: [
      microNote(776, 452, 'care note', accent, -3),
      microNote(428, 544, 'first week', accent, 2),
    ],
  };

  return [...shared, ...(layers[scene] || layers.default)].join('');
}

function svgForArticle(article) {
  const theme = THEMES[article.slug] || THEMES['welcome-prep'];
  const rnd = makeRandom(hashString(article.slug));
  const scene = sceneObjects(theme.scene, theme.accent, theme.warm).join('');
  const details = editorialDetailLayer(theme.scene, theme.accent, theme.warm);

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  ${defs(theme.accent)}
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${COLORS.base}"/>
  <rect width="${WIDTH}" height="${HEIGHT}" filter="url(#paperNoise)" opacity=".55"/>
  <path d="M0 0 H1200 V800 H0Z" fill="url(#accentWash)" opacity=".6"/>
  ${blueprintGrid(rnd, theme.accent, theme.warm)}
  ${contourShade(rnd, theme.accent)}
  <circle cx="1034" cy="134" r="286" fill="${theme.accent}" opacity=".035"/>
  <circle cx="118" cy="724" r="330" fill="${theme.warm}" opacity=".18"/>
  ${roomPlane(theme.accent, theme.warm)}
  ${page({ x: 74, y: 82, w: 482, h: 572, rotate: -7, opacity: 0.68 })}
  ${page({ x: 572, y: 110, w: 470, h: 512, rotate: 5, fill: COLORS.soft, opacity: 0.58 })}
  ${scene}
  ${details}
  <g font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Hiragino Kaku Gothic Pro', Meiryo, sans-serif">
    ${smallLabel(78, 706, 'SIPPOMI JOURNAL', theme.accent)}
    <text x="78" y="730" fill="${COLORS.muted}" opacity=".58" font-size="12" font-weight="600" letter-spacing="2">${esc(article.slug.replaceAll('-', ' / '))}</text>
  </g>
  <rect x="38" y="36" width="1124" height="728" rx="34" fill="none" stroke="${COLORS.ink}" stroke-opacity=".045"/>
  ${lineTexture(rnd, 110, theme.accent)}
  ${dots(rnd, 140, theme.accent)}
</svg>`;
}

async function main() {
  const spec = JSON.parse(await readFile(path.join(ROOT, 'data/journal-photo-spec.json'), 'utf-8'));
  const outDir = path.join(ROOT, spec.outDir || 'public/images/journal');
  await mkdir(outDir, { recursive: true });

  for (const article of spec.articles) {
    const svg = svgForArticle(article);
    const outFile = path.join(outDir, `${article.slug}.webp`);
    await sharp(Buffer.from(svg))
      .resize(WIDTH, HEIGHT, { fit: 'cover' })
      .webp({ quality: 88, smartSubsample: true })
      .toFile(outFile);
    console.log(`generated: ${path.relative(ROOT, outFile)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
