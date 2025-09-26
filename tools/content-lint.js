// tools/content-lint.js
"use strict";
/**
 * ================================================================
 *  P7CO® EcoResupply — Content Linter (blog/article)
 *  Auto-detect: scans both content/ and static/
 * ================================================================
 * Scanned paths (when exist):
 *  - content/{blog|article}/{pt|en|fr|de|es}/*.md
 *  - static/{blog|article}/{pt|en|fr|de|es}/*.md
 *  - images/**  (via /images/... or /proxy/image...&path=images/...)
 * Rules:
 *  - Frontmatter TOML (+++ ... +++)
 *  - Required: title, intro, image, date, tags, active
 *  - date: YYYY-MM-DD
 *  - image: real file under /images (any subfolder), JPEG 1200x675 ≤ 150KB
 *  - Sizes: blog ≤100KB, article ≤200KB
 *  - GDPR: no personal data in FM/body (author comes from site profile)
 * ================================================================
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const toml = require("@iarna/toml");
const sharp = require("sharp");

/* ------------------------------ config ---------------------------- */

const REPO_ROOT = process.cwd();

// content roots (auto-detect)
const CONTENT_ROOTS = ["content", "static"]
  .map((p) => path.join(REPO_ROOT, p))
  .filter((p) => fs.existsSync(p));

// we lint only these types (page excluded)
const CONTENT_TYPES = ["blog", "article"];

const SUPPORTED_LANGS = new Set(["pt", "en", "fr", "de", "es"]);

const ALLOWED_CATEGORIES = new Set([
  "guides","news","case-studies","esg","tech","p7co","policy",
  "community","innovation","circularity","events","na","opinion",
  "analysis","whitepaper","report","insight","legal","environment",
  "market","services","about","faq",
]);

// where images can live (any subfolder under these)
const IMAGES_ROOTS = [
  path.join(REPO_ROOT, "images"),
  path.join(REPO_ROOT, "static", "images"),
  path.join(REPO_ROOT, "content", "images"),
].filter(fs.existsSync);

const IMG_MAX_BYTES = 150 * 1024; // 150 KB
const IMG_WIDTH = 1200;
const IMG_HEIGHT = 675;

// skip validation for legacy basenames
const SKIP_IMAGE_BASENAMES = new Set(["p7co.png"]);

// markdown size limits
const MD_LIMITS = { blog: 100 * 1024, article: 200 * 1024 };

// GDPR – forbidden frontmatter keys
const FORBIDDEN_FM_KEYS = new Set([
  "author","authors","author_bio","author_image","author_image_url",
  "email","phone","contact","linkedin","twitter","x_handle",
  "github","github_username",
]);

// GDPR – allowed corporate email domains
const ALLOWED_EMAIL_DOMAINS = ["p7co.org", "ph7x.pt", "ph7x.com"];

// capture all emails (global)
const EMAIL_RX_GLOBAL = /\b[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,}|ph7x)\b/gi;

/* ---------- phone heuristics (robust, fewer false positives) ---------- */

// candidate “phone” tokens: start with +?digit and contain 8+ digits overall
const PHONE_CAND_RX = /\+?\d[\d\s()./\\-]{6,}\d/g;

// legit exceptions that are NOT phones:
const LER_RX       = /\b\d{2}\s\d{2}\s\d{2}\*?\b/;                // 20 01 01, 17 05 03*
const EU_REG_RX    = /\b\d{4}\/\d{3,4}\b/;                         // 2019/1009, 2000/532
const IMG_DIMS_RX  = /\b\d{3,5}\s?[x×]\s?\d{3,5}\b/i;              // 1200x675, 1200 × 675
const ISO_DATE_RX  = /\b\d{4}-\d{2}-\d{2}\b/;                      // 2025-04-01
const PT_DATE_RX   = /\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}\b/;      // 01/04/2025

/* ------------------------------ utils ------------------------------ */

function ghaError(fileAbs, message, startLine = 1) {
  const rel = path.relative(REPO_ROOT, fileAbs).replace(/\\/g, "/");
  console.error(`::error file=${rel},line=${startLine},col=1::${message}`);
}

function walkMarkdown(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkMarkdown(full, acc);
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
  return d.getUTCFullYear() === y && d.getUTCMonth() + 1 === m && d.getUTCDate() === day;
}

/**
 * Extract path relative to "images/" from:
 *  - "/images/foo.jpg"
 *  - "/proxy/image?path=images/foo.jpg"
 *  - "/proxy/image/xpto?path=images/sub/f.png&other=1"
 */
function extractImagesRel(imageVal) {
  if (typeof imageVal !== "string" || !imageVal.trim()) return null;

  const direct = imageVal.match(/^\/+images\/(.+)$/i);
  if (direct) return direct[1];

  const proxy = imageVal.match(/^\/+proxy\/image(?:\/[^?]*)?\?(.+)$/i);
  if (proxy) {
    const qs = proxy[1];
    const pairs = qs.split("&");
    for (const p of pairs) {
      const [kRaw, vRaw = ""] = p.split("=");
      const k = decodeURIComponent(kRaw || "").toLowerCase();
      if (k === "path") {
        const vDec = decodeURIComponent(vRaw || "");
        const m = vDec.match(/^\/?images\/(.+)$/i);
        if (m) return m[1];
      }
    }
  }
  return null;
}

/** try to resolve the physical image file in any configured root */
function resolveImageFullPath(relAfterImages) {
  for (const root of IMAGES_ROOTS) {
    const candidate = path.join(root, relAfterImages);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/* -------- link / context helpers (reduce phone false positives) ---- */

// consider “inside URL” if there is an http(s) token nearby, before or after
function isInsideUrl(text, idx) {
  const backStart = Math.max(0, idx - 120);
  const fwdEnd = Math.min(text.length, idx + 120);
  const backCtx = text.slice(backStart, idx).toLowerCase();
  const fwdCtx  = text.slice(idx, fwdEnd).toLowerCase();
  if (backCtx.includes("http://") || backCtx.includes("https://")) return true;
  if (fwdCtx.includes("http://") || fwdCtx.includes("https://")) return true;

  // if just before there is a URL-like path segment, treat as URL too
  const nearBack = text.slice(Math.max(0, idx - 24), idx).toLowerCase();
  if (/[/?](company|companies|status|channel|watch|v|posts|p)\/?$/.test(nearBack)) return true;

  return false;
}

// detect if token is inside markdown link URL: [label](https://...)
function isInsideMarkdownLinkUrl(text, idx) {
  const look = 200;
  const lpar = text.lastIndexOf("(", idx);
  const rpar = text.indexOf(")", idx);
  if (lpar !== -1 && rpar !== -1 && idx - lpar <= look && rpar - idx <= look) {
    const between = text.slice(lpar + 1, rpar).toLowerCase();
    if (between.includes("http://") || between.includes("https://")) return true;
  }
  return false;
}

// inside inline code?
function isInsideBackticks(text, idx) {
  const before = text.slice(0, idx);
  const ticks = (before.match(/`/g) || []).length;
  return ticks % 2 === 1;
}

/* ---------------------------- validators --------------------------- */

function validateNoPersonalFields(fAbs, data) {
  const errs = [];
  for (const k of Object.keys(data)) {
    if (FORBIDDEN_FM_KEYS.has(k)) {
      errs.push(`Frontmatter must not include personal fields "${k}". Author identity comes from site profile.`);
    }
  }
  for (const e of errs) ghaError(fAbs, e, 1);
  return errs;
}

function validateFrontmatter(fAbs, data, langFromPath) {
  const errs = [];
  const required = ["title", "intro", "image", "date", "tags", "active"];

  for (const key of required) {
    if (!(key in data)) errs.push(`Missing required frontmatter field: "${key}"`);
  }

  if ("title" in data) {
    if (typeof data.title !== "string" || !data.title.trim()) {
      errs.push(`"title" must be a non-empty string`);
    } else if (/<[^>]+>/.test(data.title)) {
      errs.push(`"title" should not contain HTML`);
    }
  }

  if ("intro" in data) {
    if (typeof data.intro !== "string" || !data.intro.trim()) {
      errs.push(`"intro" must be a non-empty string`);
    } else if (data.intro.length > 280) {
      errs.push(`"intro" too long (> 280 chars)`);
    }
  }

  if ("date" in data) {
    const dOnly = normalizeDate(data.date);
    if (!dOnly || !isIsoDate(dOnly)) {
      errs.push(`"date" must be ISO YYYY-MM-DD (got: ${JSON.stringify(data.date)})`);
    } else {
      data.date = dOnly;
    }
  }

  if ("tags" in data) {
    const ok = Array.isArray(data.tags) && data.tags.length > 0 && data.tags.every((t) => typeof t === "string" && t.trim());
    if (!ok) errs.push(`"tags" must be non-empty array of strings`);
  }

  if ("active" in data && typeof data.active !== "boolean") {
    errs.push(`"active" must be boolean (true/false)`);
  }

  if ("category" in data && data.category) {
    if (typeof data.category !== "string" || !ALLOWED_CATEGORIES.has(data.category)) {
      errs.push(`"category" must be one of: ${[...ALLOWED_CATEGORIES].join(", ")}`);
    }
  }

  if ("lang" in data && data.lang) {
    if (typeof data.lang !== "string" || !SUPPORTED_LANGS.has(data.lang)) {
      errs.push(`"lang" must be one of: ${[...SUPPORTED_LANGS].join(", ")}`);
    } else if (data.lang !== langFromPath) {
      errs.push(`"lang" (${data.lang}) does not match folder (${langFromPath})`);
    }
  }

  // image: accept /images/... OR /proxy/image...&path=images/...
  if ("image" in data) {
    if (typeof data.image !== "string" || !data.image.trim()) {
      errs.push(`"image" must be a non-empty string`);
    } else {
      const relAfterImages = extractImagesRel(data.image);
      if (!relAfterImages) {
        errs.push(`"image" must be either "/images/..." or "/proxy/image[/*]?path=images/..." (got: ${JSON.stringify(data.image)})`);
      } else {
        const imgFull = resolveImageFullPath(relAfterImages);
        if (!imgFull) errs.push(`Image not found: ${data.image}`);
      }
    }
  }

  for (const e of errs) ghaError(fAbs, e, 1);
  return errs;
}

async function validateImageFile(postFileAbs, imageValue) {
  const errs = [];
  const relAfterImages = extractImagesRel(imageValue);
  if (!relAfterImages) return errs; // already reported

  const full = resolveImageFullPath(relAfterImages);
  const base = path.basename(relAfterImages).toLowerCase();

  if (SKIP_IMAGE_BASENAMES.has(base)) return errs;

  if (!full) {
    errs.push(`Image file does not exist: ${imageValue}`);
  } else {
    const ext = path.extname(full).toLowerCase();
    if (!(ext === ".jpg" || ext === ".jpeg")) {
      errs.push(`Image must be JPG (.jpg/.jpeg). Got: ${ext}`);
    }
    const stats = fs.statSync(full);
    if (stats.size > IMG_MAX_BYTES) {
      errs.push(`Image too large: ${stats.size} bytes (max ${IMG_MAX_BYTES})`);
    }
    try {
      const meta = await sharp(full).metadata();
      if (meta.format !== "jpeg") {
        errs.push(`Image format must be JPEG. Detected: ${meta.format}`);
      }
      if (meta.width !== IMG_WIDTH || meta.height !== IMG_HEIGHT) {
        errs.push(`Image must be ${IMG_WIDTH}x${IMG_HEIGHT}. Detected: ${meta.width}x${meta.height}`);
      }
    } catch (e) {
      errs.push(`Unable to read image metadata: ${e.message}`);
    }
  }

  for (const e of errs) ghaError(postFileAbs, `Image rule: ${e}`);
  return errs;
}

function validateMarkdownFileBytesAndChars(fileAbs, byteLimit) {
  const errs = [];
  try {
    const buf = fs.readFileSync(fileAbs);
    if (buf.length > byteLimit) {
      errs.push(`Markdown too large: ${buf.length} bytes (max ${byteLimit})`);
    }
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(buf.toString("utf8"))) {
      errs.push(`Markdown contains invalid control characters.`);
    }
  } catch (e) {
    errs.push(`Unable to read file: ${e.message}`);
  }
  for (const e of errs) ghaError(fileAbs, e);
  return errs;
}

/* -------------------------- phone detection ------------------------ */

function bodyHasRealPhone(body) {
  const candidates = body.match(PHONE_CAND_RX) || [];
  if (!candidates.length) return false;

  for (const cand of candidates) {
    const digits = (cand.match(/\d/g) || []).length;
    if (digits < 8) continue; // too short

    const c = cand.trim();

    // clear exceptions
    if (LER_RX.test(c)) continue;
    if (EU_REG_RX.test(c)) continue;
    if (IMG_DIMS_RX.test(c)) continue;
    if (ISO_DATE_RX.test(c) || PT_DATE_RX.test(c)) continue;

    const idx = body.indexOf(cand);
    if (idx >= 0) {
      if (isInsideUrl(body, idx)) continue;
      if (isInsideMarkdownLinkUrl(body, idx)) continue;
      if (isInsideBackticks(body, idx)) continue;
    }

    // looks like a real phone
    return true;
  }
  return false;
}

/* ------------------------------- main ------------------------------ */

async function lintTypeAtRoot(rootAbs, type) {
  const typeRootAbs = path.join(rootAbs, type);
  if (!fs.existsSync(typeRootAbs)) return 0;

  const files = walkMarkdown(typeRootAbs);
  if (files.length === 0) return 0;

  let totalErrors = 0;

  for (const fAbs of files) {
    const rel = path.relative(REPO_ROOT, fAbs);
    const parts = rel.split(path.sep);
    const idx = parts.indexOf(type);
    const langFromPath = idx >= 0 ? parts[idx + 1] : undefined;

    if (!langFromPath || !SUPPORTED_LANGS.has(langFromPath)) {
      ghaError(fAbs, `Invalid language folder "${langFromPath}". Must be one of: ${[...SUPPORTED_LANGS].join(", ")}`);
      totalErrors++;
      continue;
    }

    const byteLimit = MD_LIMITS[type] || MD_LIMITS.blog;
    totalErrors += validateMarkdownFileBytesAndChars(fAbs, byteLimit).length;

    let fm;
    try {
      fm = matter.read(fAbs, {
        delimiters: "+++",
        language: "toml",
        engines: { toml: (src) => toml.parse(src) },
      });
    } catch (e) {
      ghaError(fAbs, `Invalid frontmatter: ${e.message}`);
      totalErrors++;
      continue;
    }

    if (!fm || !fm.data || Object.keys(fm.data).length === 0) {
      ghaError(fAbs, `Missing frontmatter block ("+++ ... +++").`);
      totalErrors++;
      continue;
    }

    // GDPR (frontmatter)
    totalErrors += validateNoPersonalFields(fAbs, fm.data).length;

    // frontmatter rules
    totalErrors += validateFrontmatter(fAbs, fm.data, langFromPath).length;

    // body + GDPR
    const body = (fm.content || "").trim();
    if (!body) {
      ghaError(fAbs, `Empty Markdown body`);
      totalErrors++;
    } else {
      // emails (block non-corporate)
      const emailMatches = body.match(EMAIL_RX_GLOBAL) || [];
      if (emailMatches.length) {
        const hasNonWhitelisted = emailMatches.some((raw) => {
          const email = raw.replace(/[),.;:]+$/, "");
          const domain = email.split("@").pop().toLowerCase();
          return !ALLOWED_EMAIL_DOMAINS.some((allow) => domain.endsWith(allow));
        });
        if (hasNonWhitelisted) {
          ghaError(fAbs, `Markdown body appears to contain a non-corporate email address. Remove personal data (GDPR).`);
          totalErrors++;
        }
      }

      // phones — with anti false-positive filters
      if (bodyHasRealPhone(body)) {
        ghaError(fAbs, `Markdown body appears to contain a phone number. Remove personal data (GDPR).`);
        totalErrors++;
      }
    }

    // image
    if (fm.data && typeof fm.data.image === "string") {
      totalErrors += (await validateImageFile(fAbs, fm.data.image)).length;
    }
  }

  return totalErrors;
}

async function main() {
  if (IMAGES_ROOTS.length === 0) {
    console.warn(`No images/ folders found (searched: /images, /static/images, /content/images) — image checks may fail.`);
  }

  if (CONTENT_ROOTS.length === 0) {
    console.log("No content/ or static/ folder detected. Nothing to lint.");
    return;
  }

  let totalErrors = 0;
  for (const root of CONTENT_ROOTS) {
    for (const type of CONTENT_TYPES) {
      totalErrors += await lintTypeAtRoot(root, type);
    }
  }

  if (totalErrors > 0) {
    console.error(`\n❌ Content linter found ${totalErrors} issue(s).`);
    process.exit(1);
  } else {
    console.log("✅ Content linter passed. All content is valid.");
  }
}

main().catch((err) => {
  console.error(`::error::Unexpected linter failure: ${err.message}`);
  process.exit(1);
});
