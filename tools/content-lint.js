// tools/content-lint.js
/**
 * ================================================================
 *  P7CO® EcoResupply Blog — Content Linter (with image validator)
 * ================================================================
 *
 * Purpose:
 *   Validate blog posts and associated images before merging.
 *   Runs locally or in GitHub Actions CI.
 *
 * Validations:
 *   1. Frontmatter
 *      - Must be enclosed with delimiters: +++ ... +++
 *      - Required fields: title, intro, image, date, tags, ativo
 *      - title: non-empty string, no HTML allowed
 *      - intro: non-empty string, max 280 chars
 *      - date: ISO YYYY-MM-DD (timestamps/Date accepted but normalized)
 *      - tags: non-empty array of strings
 *      - ativo: boolean (true/false)
 *      - image: path must start with /images/ and exist in repo
 *
 *   2. Content
 *      - Markdown body after frontmatter must not be empty
 *
 *   3. Images (strict rules)
 *      - Format: JPG/JPEG only
 *      - Dimensions: exactly 1200 x 675
 *      - Size: ≤ 150 KB
 *
 * Output:
 *   - GitHub Actions annotations (::error) for each problem
 *   - Exits with code 1 if any error is found
 *
 * Dependencies:
 *   - gray-matter (parse frontmatter)
 *   - sharp (image metadata validation)
 *
 * Usage:
 *   npm run lint:content
 *
 *   Add to package.json:
 *     "scripts": {
 *       "lint:content": "node tools/content-lint.js"
 *     }
 */


const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const sharp = require('sharp');

const REPO_ROOT = process.cwd();
const BLOG_ROOT = path.join(REPO_ROOT, 'content', 'blog');
const IMAGES_ROOT = path.join(REPO_ROOT, 'images');
const SUPPORTED = new Set(['en', 'pt', 'fr', 'de']);

const IMG_MAX_BYTES = 150 * 1024;
const IMG_WIDTH = 1200;
const IMG_HEIGHT = 675;

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) acc.push(full);
  }
  return acc;
}

function normalizeDate(val) {
  if (val instanceof Date && !Number.isNaN(val.getTime())) {
    const y = val.getUTCFullYear();
    const m = String(val.getUTCMonth() + 1).padStart(2, '0');
    const d = String(val.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof val === 'string') {
    const m = val.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }
  return null;
}

function isIsoDate(dateOnly) {
  if (typeof dateOnly !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return false;
  const d = new Date(`${dateOnly}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  const [y, m, day] = dateOnly.split('-').map(Number);
  return d.getUTCFullYear() === y && d.getUTCMonth() + 1 === m && d.getUTCDate() === day;
}

function normalizeImagePath(val) {
  if (typeof val !== 'string') return val;
  const PREFIX = '/proxy/image?path=';
  if (val.startsWith(PREFIX)) {
    const q = val.slice(PREFIX.length);
    if (q.startsWith('images/')) return '/' + q;
  }
  return val;
}

function ghaError(file, message, startLine = 1) {
  const rel = path.relative(REPO_ROOT, file).replace(/\\/g, '/');
  console.error(`::error file=${rel},line=${startLine},col=1::${message}`);
}

function validateFrontmatter(f, data) {
  const errs = [];
  const required = ['title', 'intro', 'image', 'date', 'tags', 'ativo'];

  for (const key of required) {
    if (!(key in data)) errs.push(`Missing required frontmatter field: "${key}"`);
  }

  if ('title' in data && (typeof data.title !== 'string' || !data.title.trim()))
    errs.push(`"title" must be a non-empty string`);

  if ('intro' in data && (typeof data.intro !== 'string' || !data.intro.trim()))
    errs.push(`"intro" must be a non-empty string`);

  if ('date' in data) {
    const dOnly = normalizeDate(data.date);
    if (!dOnly || !isIsoDate(dOnly)) {
      errs.push(`"date" must be ISO YYYY-MM-DD (got: ${JSON.stringify(data.date)})`);
    } else {
      data.date = dOnly;
    }
  }

  if ('tags' in data) {
    const ok = Array.isArray(data.tags) && data.tags.length > 0 &&
               data.tags.every(t => typeof t === 'string' && t.trim());
    if (!ok) errs.push(`"tags" must be a non-empty array of strings`);
  }

  if ('ativo' in data && typeof data.ativo !== 'boolean')
    errs.push(`"ativo" must be boolean (true/false)`);

  if ('image' in data) {
    data.image = normalizeImagePath(data.image);
    if (typeof data.image !== 'string' || !data.image.startsWith('/images/')) {
      errs.push(`"image" must start with "/images/" (got: ${JSON.stringify(data.image)})`);
    } else {
      const rel = data.image.replace(/^\/+/, '');
      const imgPath = path.join(REPO_ROOT, rel);
      if (!fs.existsSync(imgPath)) errs.push(`Image file not found in repository: ${data.image}`);
    }
  }

  if ('intro' in data && typeof data.intro === 'string' && data.intro.length > 280)
    errs.push(`"intro" is too long (> 280 chars). Consider shortening.`);

  if ('title' in data && /<[^>]+>/.test(data.title))
    errs.push(`"title" should not contain HTML tags`);

  for (const e of errs) ghaError(f, e, 1);
  return errs;
}

async function validateImageFile(postFile, imageRel) {
  const errs = [];
  const rel = imageRel.replace(/^\/+/, ''); // images/...
  const full = path.join(REPO_ROOT, rel);

  if (!fs.existsSync(full)) {
    errs.push(`Image file does not exist: ${imageRel}`);
    return errs;
  }

  const ext = path.extname(full).toLowerCase();
  if (!(ext === '.jpg' || ext === '.jpeg')) {
    errs.push(`Image must be JPG (.jpg/.jpeg). Got: ${ext || 'no extension'}`);
  }

  const stats = fs.statSync(full);
  if (stats.size > IMG_MAX_BYTES) {
    errs.push(`Image too large: ${stats.size} bytes (max ${IMG_MAX_BYTES})`);
  }

  try {
    const meta = await sharp(full).metadata();
    if (meta.format !== 'jpeg') {
      errs.push(`Image format must be JPEG. Detected: ${meta.format || 'unknown'}`);
    }
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    if (w !== IMG_WIDTH || h !== IMG_HEIGHT) {
      errs.push(`Image dimensions must be ${IMG_WIDTH}x${IMG_HEIGHT}. Detected: ${w}x${h}`);
    }
  } catch (e) {
    errs.push(`Unable to read image metadata: ${(e && e.message) || e}`);
  }

  for (const e of errs) ghaError(postFile, `Image rule: ${e}`);
  return errs;
}

async function main() {
  if (!fs.existsSync(BLOG_ROOT)) {
    console.log(`No content/blog directory found. Skipping.`);
    return;
  }

  const files = walk(BLOG_ROOT);
  if (files.length === 0) {
    console.log(`No Markdown files found under content/blog.`);
    return;
  }

  let totalErrors = 0;

  for (const f of files) {
    const rel = path.relative(REPO_ROOT, f);
    const parts = rel.split(path.sep);
    const langIdx = parts.indexOf('blog') + 1;
    const lang = parts[langIdx];

    if (!SUPPORTED.has(lang)) {
      ghaError(f, `Invalid language folder "${lang}". Must be one of: ${[...SUPPORTED].join(', ')}`);
      totalErrors++;
      continue;
    }

    let fm;
    try {
      // Official delimiter: +++
      fm = matter.read(f, { delimiters: '+++' });
    } catch (e) {
      ghaError(f, `Invalid frontmatter (expected +++ ... +++): ${e.message}`);
      totalErrors++;
      continue;
    }

    if (!fm || !fm.data || Object.keys(fm.data).length === 0) {
      ghaError(f, `Missing frontmatter block at top of file ("+++ ... +++").`);
      totalErrors++;
      continue;
    }

    const errs = validateFrontmatter(f, fm.data);
    totalErrors += errs.length;

    const body = (fm.content || '').trim();
    if (!body) {
      ghaError(f, `Empty Markdown body after frontmatter.`);
      totalErrors++;
    }

    if (fm.data && typeof fm.data.image === 'string' && fm.data.image.startsWith('/images/')) {
      const imgErrs = await validateImageFile(f, fm.data.image);
      totalErrors += imgErrs.length;
    }
  }

  if (totalErrors > 0) {
    console.error(`\n❌ Content linter found ${totalErrors} issue(s). Please fix before merging.`);
    process.exit(1);
  } else {
    console.log('✅ Content linter passed. All posts and images are valid.');
  }
}

main().catch(err => {
  console.error(`::error::Unexpected linter failure: ${err && err.message ? err.message : err}`);
  process.exit(1);
});
