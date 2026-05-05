#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SITE = 'https://sippomi.com';

function buildFigure({ slug, alt, photographer, photographerUrl, pexelsUrl }) {
  const credit = photographerUrl
    ? `Photo by <a href="${photographerUrl}" rel="nofollow noopener" target="_blank">${photographer}</a> / <a href="${pexelsUrl}" rel="nofollow noopener" target="_blank">Pexels</a>`
    : `Photo by ${photographer} / Pexels`;
  return `
    <section class="section article-hero-photo">
      <figure class="article-hero-figure">
        <img
          src="/images/journal/${slug}.webp"
          alt="${alt}"
          width="1200" height="800"
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
        <figcaption class="article-hero-figure__caption">${credit}</figcaption>
      </figure>
    </section>
`;
}

function alreadyInserted(html) {
  return html.includes('class="article-hero-figure"');
}

function insertAfterGuideHero(html, figureBlock) {
  // Find section guide-hero (or coming-hero fallback) opening, then locate matching </section>.
  let openIdx = html.search(/<section[^>]*class="[^"]*guide-hero[^"]*"[^>]*>/);
  if (openIdx === -1) openIdx = html.search(/<section[^>]*class="[^"]*coming-hero[^"]*"[^>]*>/);
  if (openIdx === -1) return null;
  // Walk through tags to find matching </section>
  const re = /<\/?section\b[^>]*>/g;
  re.lastIndex = openIdx;
  let depth = 0;
  let endIdx = -1;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m[0].startsWith('</section')) {
      depth--;
      if (depth === 0) {
        endIdx = m.index + m[0].length;
        break;
      }
    } else {
      depth++;
    }
  }
  if (endIdx === -1) return null;
  return html.slice(0, endIdx) + figureBlock + html.slice(endIdx);
}

function injectImageIntoJsonLd(html, imageUrl) {
  // Find <script type="application/ld+json"> blocks and add image to objects of @type Article/CollectionPage if missing
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (full, body) => {
    let data;
    try {
      data = JSON.parse(body);
    } catch {
      return full;
    }
    const apply = (node) => {
      if (Array.isArray(node)) return node.map(apply);
      if (!node || typeof node !== 'object') return node;
      const t = node['@type'];
      const isArticleLike = t === 'Article' || t === 'NewsArticle' || t === 'BlogPosting' || t === 'CollectionPage';
      if (isArticleLike && !node.image) {
        node.image = imageUrl;
      }
      for (const k of Object.keys(node)) {
        node[k] = apply(node[k]);
      }
      return node;
    };
    const updated = apply(data);
    const out = JSON.stringify(updated, null, 2);
    return `<script type="application/ld+json">\n${out}\n</script>`;
  });
}

async function main() {
  const spec = JSON.parse(await readFile(path.join(ROOT, 'data/journal-photo-spec.json'), 'utf-8'));
  const credits = JSON.parse(await readFile(path.join(ROOT, 'data/journal-photo-credits.json'), 'utf-8'));
  const creditMap = new Map(credits.map((c) => [c.slug, c]));

  let modified = 0;
  for (const article of spec.articles) {
    const file = path.join(ROOT, article.html);
    let html = await readFile(file, 'utf-8');
    if (alreadyInserted(html)) {
      console.log(`skip (already has figure): ${article.html}`);
      continue;
    }
    const credit = creditMap.get(article.slug) || {};
    const figure = buildFigure({
      slug: article.slug,
      alt: article.alt,
      photographer: credit.photographer || 'Pexels Contributor',
      photographerUrl: credit.photographer_url,
      pexelsUrl: credit.pexels_url,
    });
    const inserted = insertAfterGuideHero(html, figure);
    if (!inserted) {
      console.warn(`! could not find guide-hero in ${article.html}`);
      continue;
    }
    html = inserted;
    const imageUrl = `${SITE}/images/journal/${article.slug}.webp`;
    html = injectImageIntoJsonLd(html, imageUrl);
    await writeFile(file, html, 'utf-8');
    console.log(`updated: ${article.html}`);
    modified++;
  }
  console.log(`\nModified ${modified} file(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
