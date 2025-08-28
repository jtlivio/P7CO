// tools/content-lint.js
/**
 * ================================================================
 *  P7CO® EcoResupply Blog — Content Linter (with image validator)
 * ================================================================
 *
 * Scope:
 *  - Validates Markdown blog posts and cover images.
 *
 * Checked paths:
 * - content/blog/{pt|en|fr|de|es}/*.md
 * - images/**
 *
 * Rules:
 *  1) Frontmatter (required delimiters: +++ ... +++)
 *     - Required fields:
 *         • title      → non-empty string, no HTML
 *         • intro      → non-empty string, max 280 chars
 *         • image      → must start with "/images/", file must exist
 *         • date       → ISO format YYYY-MM-DD
 *         • tags       → non-empty array of strings
 *         • active     → boolean (true/false)
 *     - Optional fields:
 *         • category   → one of: guides, news, case-studies, esg, tech
 *         • lang       → must match folder (pt|en|fr|de|es) if present
 *
 *  2) Markdown body
 *     - Must not be empty
 *
 *  3) Cover image validation
 *     - Format: JPEG (.jpg/.jpeg)
 *     - Dimensions: exactly 1200 × 675 px
 *     - File size: ≤ 150 KB
 *
 *  4) Markdown file constraints
 *     - File size: ≤ 100 KB
 *     - No invalid control characters
 *       (ASCII ranges 0–8, 11, 12, 14–31, 127)
 *
 * Output:
 *  - Prints GitHub Actions annotations (::error) for each issue
 *  - Exits with code 1 if any error is found
 *
 * Usage:
 *   npm run lint:content
 *
 * Dependencies:
 *   - gray-matter (frontmatter parser)
 *   - sharp (image metadata validator)
 * ================================================================
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const toml = require("@iarna/toml");
const sharp = require("sharp");

const REPO_ROOT = process.cwd();
const BLOG_ROOT = path.join(REPO_ROOT, "content", "blog");
const IMAGES_ROOT = path.join(REPO_ROOT, "images");

const SUPPORTED_LANGS = new Set(["pt", "en", "fr", "de", "es"]);
const ALLOWED_CATEGORIES = new Set([
  "guides", // How-to articles, tutorials
  "news", // Updates, announcements
  "case-studies", // Real-world examples
  "esg", // Environmental, Social, Governance
  "tech", // Technology & tools
  "p7co", // Internal / brand-specific posts
  "policy", // Legislation, regulations, policies
  "community", // Contributions, stories from citizens & orgs
  "innovation", // New methods, startups, R&D
  "circularity", // Circular economy best practices
  "events", // Conferences, webinars, local events
  "na", // Not applicable
]);

const IMG_MAX_BYTES = 150 * 1024; // 150 KB
const IMG_WIDTH = 1200;
const IMG_HEIGHT = 675;

const MD_MAX_BYTES = 100 * 1024; // 100 KB
const INVALID_CTRL_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;

/* ------------------------------ utils ------------------------------ */
function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.isFile() && e.name.toLowerCase().endsWith(".md")) acc.push(full);
  }
  return acc;
}

function normalizeDate(val) {
  if (val instanceof Date && !Number.isNaN(val.getTime())) {
    const y = val.getUTCFullYear();
    const m = String(val.getUTCMonth() + 1).padStart(2, "0");
    const d = String(val.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof val === "string") {
    const m = val.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
  }
  return null;
}

function isIsoDate(dateOnly) {
  if (typeof dateOnly !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateOnly))
    return false;
  const d = new Date(`${dateOnly}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  const [y, m, day] = dateOnly.split("-").map(Number);
  return (
    d.getUTCFullYear() === y &&
    d.getUTCMonth() + 1 === m &&
    d.getUTCDate() === day
  );
}

function normalizeImagePath(val) {
  if (typeof val !== "string") return val;
  const PREFIX = "/proxy/image?path=";
  if (val.startsWith(PREFIX)) {
    const q = val.slice(PREFIX.length);
    if (q.startsWith("images/")) return "/" + q;
  }
  return val;
}

function ghaError(file, message, startLine = 1) {
  const rel = path.relative(REPO_ROOT, file).replace(/\\/g, "/");
  console.error(`::error file=${rel},line=${startLine},col=1::${message}`);
}

/* ---------------------------- validators --------------------------- */
function validateFrontmatter(f, data, langFromPath) {
  const errs = [];
  const required = ["title", "intro", "image", "date", "tags", "active"];

  // required fields
  for (const key of required) {
    if (!(key in data))
      errs.push(`Missing required frontmatter field: "${key}"`);
  }

  // title
  if ("title" in data) {
    if (typeof data.title !== "string" || !data.title.trim()) {
      errs.push(`"title" must be a non-empty string`);
    } else if (/<[^>]+>/.test(data.title)) {
      errs.push(`"title" should not contain HTML tags`);
    }
  }

  // intro
  if ("intro" in data) {
    if (typeof data.intro !== "string" || !data.intro.trim()) {
      errs.push(`"intro" must be a non-empty string`);
    } else if (data.intro.length > 280) {
      errs.push(`"intro" is too long (> 280 chars). Consider shortening.`);
    }
  }

  // date
  if ("date" in data) {
    const dOnly = normalizeDate(data.date);
    if (!dOnly || !isIsoDate(dOnly)) {
      errs.push(
        `"date" must be ISO YYYY-MM-DD (got: ${JSON.stringify(data.date)})`
      );
    } else {
      data.date = dOnly; // normalize
    }
  }

  // tags
  if ("tags" in data) {
    const ok =
      Array.isArray(data.tags) &&
      data.tags.length > 0 &&
      data.tags.every((t) => typeof t === "string" && t.trim());
    if (!ok) errs.push(`"tags" must be a non-empty array of strings`);
  }

  // active
  if ("active" in data && typeof data.active !== "boolean") {
    errs.push(`"active" must be boolean (true/false)`);
  }

  // category
  if ("category" in data && data.category) {
    if (
      typeof data.category !== "string" ||
      !ALLOWED_CATEGORIES.has(data.category)
    ) {
      errs.push(
        `"category" must be one of: ${[...ALLOWED_CATEGORIES].join(", ")}`
      );
    }
  }

  // lang
  if ("lang" in data && data.lang) {
    if (typeof data.lang !== "string" || !SUPPORTED_LANGS.has(data.lang)) {
      errs.push(`"lang" must be one of: ${[...SUPPORTED_LANGS].join(", ")}`);
    } else if (data.lang !== langFromPath) {
      errs.push(
        `"lang" (${data.lang}) does not match folder language (${langFromPath}).`
      );
    }
  }

  // image
  if ("image" in data) {
    data.image = normalizeImagePath(data.image);
    if (typeof data.image !== "string" || !data.image.startsWith("/images/")) {
      errs.push(
        `"image" must start with "/images/" (got: ${JSON.stringify(
          data.image
        )})`
      );
    } else {
      const rel = data.image.replace(/^\/+/, "");
      const imgPath = path.join(REPO_ROOT, rel);
      if (!fs.existsSync(imgPath))
        errs.push(`Image file not found in repository: ${data.image}`);
    }
  }

  for (const e of errs) ghaError(f, e, 1);
  return errs;
}

async function validateImageFile(postFile, imageRel) {
  const errs = [];
  const rel = imageRel.replace(/^\/+/, ""); // images/...
  const full = path.join(REPO_ROOT, rel);

  if (!fs.existsSync(full)) {
    errs.push(`Image file does not exist: ${imageRel}`);
  } else {
    const ext = path.extname(full).toLowerCase();
    if (!(ext === ".jpg" || ext === ".jpeg")) {
      errs.push(
        `Image must be JPG (.jpg/.jpeg). Got: ${ext || "no extension"}`
      );
    }

    const stats = fs.statSync(full);
    if (stats.size > IMG_MAX_BYTES) {
      errs.push(`Image too large: ${stats.size} bytes (max ${IMG_MAX_BYTES})`);
    }

    try {
      const meta = await sharp(full).metadata();
      if (meta.format !== "jpeg") {
        errs.push(
          `Image format must be JPEG. Detected: ${meta.format || "unknown"}`
        );
      }
      const w = meta.width ?? 0;
      const h = meta.height ?? 0;
      if (w !== IMG_WIDTH || h !== IMG_HEIGHT) {
        errs.push(
          `Image dimensions must be ${IMG_WIDTH}x${IMG_HEIGHT}. Detected: ${w}x${h}`
        );
      }
    } catch (e) {
      errs.push(`Unable to read image metadata: ${(e && e.message) || e}`);
    }
  }

  for (const e of errs) ghaError(postFile, `Image rule: ${e}`);
  return errs;
}

function validateMarkdownFileBytesAndChars(filePath) {
  const errs = [];
  try {
    const buf = fs.readFileSync(filePath);
    const size = buf.length;
    if (size > MD_MAX_BYTES) {
      errs.push(
        `Markdown file too large: ${size} bytes (max ${MD_MAX_BYTES}).`
      );
    }
    const text = buf.toString("utf8");
    if (INVALID_CTRL_REGEX.test(text)) {
      errs.push(`Markdown contains invalid control characters.`);
    }
  } catch (e) {
    errs.push(
      `Unable to read file for size/charset validation: ${
        (e && e.message) || e
      }`
    );
  }
  for (const e of errs) ghaError(filePath, e);
  return errs;
}

/* ------------------------------- main ------------------------------ */
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
    // language by folder
    const rel = path.relative(REPO_ROOT, f);
    const parts = rel.split(path.sep);
    const blogIdx = parts.indexOf("blog");
    const langFromPath = blogIdx >= 0 ? parts[blogIdx + 1] : undefined;

    if (!langFromPath || !SUPPORTED_LANGS.has(langFromPath)) {
      ghaError(
        f,
        `Invalid language folder "${
          langFromPath ?? "(none)"
        }". Must be one of: ${[...SUPPORTED_LANGS].join(", ")}`
      );
      totalErrors++;
      continue;
    }

    // .md file size + invalid chars
    totalErrors += validateMarkdownFileBytesAndChars(f).length;

    // parse frontmatter
    let fm;
    try {
      fm = matter.read(f, {
        delimiters: "+++",
        language: "toml",
        engines: { toml: (src) => toml.parse(src) },
      });
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

    // validate frontmatter fields
    const fmErrs = validateFrontmatter(f, fm.data, langFromPath);
    totalErrors += fmErrs.length;

    // body not empty
    const body = (fm.content || "").trim();
    if (!body) {
      ghaError(f, `Empty Markdown body after frontmatter.`);
      totalErrors++;
    }

    // image strict validation
    if (
      fm.data &&
      typeof fm.data.image === "string" &&
      fm.data.image.startsWith("/images/")
    ) {
      const imgErrs = await validateImageFile(f, fm.data.image);
      totalErrors += imgErrs.length;
    }
  }

  if (totalErrors > 0) {
    console.error(
      `\n❌ Content linter found ${totalErrors} issue(s). Please fix before merging.`
    );
    process.exit(1);
  } else {
    console.log("✅ Content linter passed. All posts and images are valid.");
  }
}

main().catch((err) => {
  console.error(
    `::error::Unexpected linter failure: ${
      err && err.message ? err.message : err
    }`
  );
  process.exit(1);
});
