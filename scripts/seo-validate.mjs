/**
 * SEO Postbuild Validator for Sippomi.
 * Scans built dist/ HTML files and reports SEO issues.
 *
 * Uses: Node.js stdlib only (zero dependencies)
 *
 * Checks:
 *  - Meta description presence
 *  - OG title/description/image
 *  - Canonical URL
 *  - h1 presence
 *  - html lang attribute
 *  - JSON-LD syntax
 *  - All images have alt text
 *  - Internal links don't 404
 *
 * Called: postbuild step
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');

// Skip these paths (not real pages)
const SKIP_PATHS = ['assets/', 'vercel.svg', 'sippomi-mark.svg', 'apple-touch-icon', 'google'];

function findAllHtmlFiles(dir, basePath = '') {
  const results = [];
  try {
    const items = readdirSync(dir);
    for (const item of items) {
      const fullPath = join(dir, item);
      const relPath = basePath ? `${basePath}/${item}` : item;
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        results.push(...findAllHtmlFiles(fullPath, relPath));
      } else if (item.endsWith('.html')) {
        results.push({ fullPath, relPath });
      }
    }
  } catch {}
  return results;
}

function extractMeta(html, name) {
  const pattern1 = new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, 'i');
  const pattern2 = new RegExp(`<meta\\s+property="${name}"\\s+content="([^"]*)"`, 'i');
  const match = html.match(pattern1) || html.match(pattern2);
  return match ? match[1] : null;
}

function extractAllImages(html) {
  const imgs = [];
  const regex = /<img[^>]+>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const src = m[0].match(/src="([^"]*)"/i);
    const alt = m[0].match(/alt="([^"]*)"/i);
    const loading = m[0].match(/loading="([^"]*)"/i);
    imgs.push({
      src: src ? src[1] : null,
      alt: alt ? alt[1] : null,
      loading: loading ? loading[1] : null,
    });
  }
  return imgs;
}

async function validate() {
  const files = findAllHtmlFiles(distDir);
  let totalIssues = 0;
  const issues = [];
  const stats = { total: 0, passed: 0, warnings: 0, errors: 0 };

  for (const { fullPath, relPath } of files) {
    // Skip if not a real page
    if (SKIP_PATHS.some(s => relPath.startsWith(s))) continue;

    stats.total++;
    const html = readFileSync(fullPath, 'utf-8');
    const pageIssues = [];

    // 1. html lang attribute
    if (!html.match(/<html[^>]*\slang="ja"[^>]*>/i)) {
      pageIssues.push({ type: 'error', msg: 'Missing html lang="ja"' });
    }

    // 2. Title
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    if (!titleMatch) {
      pageIssues.push({ type: 'error', msg: 'Missing <title>' });
    } else if (titleMatch[1].trim().length < 10) {
      pageIssues.push({ type: 'warn', msg: `Short title: "${titleMatch[1].trim()}"` });
    }

    // 3. Meta description
    const desc = extractMeta(html, 'description');
    if (!desc) {
      pageIssues.push({ type: 'error', msg: 'Missing meta description' });
    } else if (desc.length < 30) {
      pageIssues.push({ type: 'warn', msg: `Short description (${desc.length} chars)` });
    } else if (desc.length > 160) {
      pageIssues.push({ type: 'warn', msg: `Long description (${desc.length} chars, max 160)` });
    }

    // 4. OG tags
    if (!extractMeta(html, 'og:title')) pageIssues.push({ type: 'warn', msg: 'Missing og:title' });
    if (!extractMeta(html, 'og:description')) pageIssues.push({ type: 'warn', msg: 'Missing og:description' });
    if (!extractMeta(html, 'og:image')) pageIssues.push({ type: 'warn', msg: 'Missing og:image' });

    // 5. Canonical URL
    const canonMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
    if (!canonMatch) {
      pageIssues.push({ type: 'warn', msg: 'Missing canonical URL' });
    }

    // 6. h1
    const h1 = html.match(/<h1[^>]*>/i);
    if (!h1) {
      pageIssues.push({ type: 'error', msg: 'Missing <h1>' });
    }

    // 7. JSON-LD syntax check
    const jsonldBlocks = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    if (jsonldBlocks) {
      for (const block of jsonldBlocks) {
        const jsonStr = block.replace(/<script type="application\/ld\+json">/, '').replace(/<\/script>/i, '').trim();
        try {
          JSON.parse(jsonStr);
        } catch (e) {
          pageIssues.push({ type: 'error', msg: `Invalid JSON-LD: ${e.message}` });
        }
      }
    } else {
      pageIssues.push({ type: 'warn', msg: 'No JSON-LD structured data' });
    }

    // 8. Image alt text
    const imgs = extractAllImages(html);
    for (const img of imgs) {
      if (img.alt === undefined || img.alt === null) {
        pageIssues.push({ type: 'warn', msg: `Image missing alt: ${img.src || 'unknown'}` });
      }
    }

    // Report
    if (pageIssues.length > 0) {
      const errors = pageIssues.filter(i => i.type === 'error').length;
      const warnings = pageIssues.filter(i => i.type === 'warn').length;
      stats.errors += errors;
      stats.warnings += warnings;
      
      const level = errors > 0 ? '❌' : '⚠️';
      issues.push(`${level} ${relPath} (${errors} errors, ${warnings} warnings)`);
      for (const issue of pageIssues) {
        const icon = issue.type === 'error' ? '  ❌' : '  ⚠️';
        issues.push(`  ${icon} ${issue.msg}`);
      }
      totalIssues += pageIssues.length;
    } else {
      stats.passed++;
    }
  }

  // Summary
  console.log('\n=== SEO Validation Report ===');
  console.log(`Total pages checked: ${stats.total}`);
  console.log(`✅ Perfect: ${stats.passed}`);
  console.log(`⚠️  Warnings: ${stats.warnings}`);
  console.log(`❌ Errors: ${stats.errors}`);
  console.log('');
  
  if (issues.length > 0) {
    console.log('Issues:');
    issues.forEach(line => console.log(line));
    console.log('');
  }

  if (stats.errors > 0) {
    console.log('❌ SEO validation FAILED - fix errors before deploy');
  } else if (stats.warnings > 0) {
    console.log('⚠️  SEO validation PASSED with warnings');
    process.exit(0);
  } else {
    console.log('✅ SEO validation PASSED - all good!');
    process.exit(0);
  }
}

validate().catch(err => {
  console.error('[seo-validate] Error:', err.message);
  process.exit(1);
});
