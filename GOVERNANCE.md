# P7CO® EcoResupply · Articles, Blog and UI

This repository hosts the **content and UI translations** for the **P7CO® EcoResupply** platform, including:

* **Articles**: in-depth technical reports, whitepapers, and case studies.
* **Blog**: shorter updates, opinion pieces, and community posts.
* **UI**: JSON translation files for the non-application scope (static pages, marketing).

[![Content Lint](https://github.com/jtlivio/P7CO/actions/workflows/content-lint.yml/badge.svg)](https://github.com/jtlivio/P7CO/actions/workflows/content-lint.yml) ![License: CC BY-SA 4.0](https://img.shields.io/badge/license-CC--BY--SA--4.0-green) ![Made in Portugal](https://img.shields.io/badge/made%20in-Portugal-red) ![Open Data](https://img.shields.io/badge/open--data-verified-brightgreen) ![GitHub Repo Stars](https://img.shields.io/github/stars/jtlivio/P7CO?style=social)

<p align="center">
  <img src="static/images/p7co.png" alt="P7CO® EcoResupply Logo" width="240"/>
</p>

## 🌍 About

**Mission**
Empower the transition to a circular economy through open knowledge, reusable assets, and transparent governance.

**Vision**
A platform where companies, citizens, and institutions collaborate by sharing articles, research, and practices that make sustainability measurable and actionable.

## 🗂️ Repository Layout

Rooted at `/static`:

```
static/
  blog/{pt|en|fr|de|es}/        # Blog posts per language
  article/{pt|en|fr|de|es}/     # Long-form articles, reports, whitepapers
  page/{pt|en|fr|de|es}/        # Site pages
  ui/{lang}/components/*.json   # UI translations
  images/                       # Shared images
```

## 📝 Frontmatter Specification (TOML with `+++`)

All Markdown content (`blog`, `article`, `page`) requires TOML frontmatter:

```toml
+++
title = "Circular Economy: A Global Challenge"
intro = "A short introduction."
image = "/proxy/image?path=images/example.jpg"
date = 2025-04-01
category = "guides"
tags = ["Sustainability", "Circular Economy"]
reading_time = 6
active = true
+++
```

### Required

* `title` (string, no HTML)
* `intro` (string ≤ 280 chars)
* `image` (path under `/images/`)
* `date` (ISO `YYYY-MM-DD`)
* `tags` (array of strings)
* `active` (boolean)

### Optional

* `updated_at` (ISO date)
* `category` (see [Categories](#-categories))
* `reading_time` (integer)
* `lang` (pt, en, fr, de, es — must match folder)
* `slug` (defaults to filename)
* `author`, `author_bio`, `author_image_url` (allowed only in **articles** and **blog**, never for pages or UI — and must not contain personal data; profiles are managed by the site).

## 🖼️ Image Rules

* Format: `.jpg` only
* Dimensions: 1200 × 675 px
* Max size: 150 KB

Pull Requests with invalid images will be rejected automatically.

## 🌐 Categories

Allowed categories:

```
guides, news, case-studies, esg, tech, p7co, policy, community,
innovation, circularity, events, opinion, analysis, whitepaper,
report, insight, legal, environment, market, services, about, faq, na
```

## 🔍 Lint & CI

Content is validated by **Content Lint** workflow:

* Validates frontmatter structure
* Checks image rules
* Enforces max Markdown size (100 KB)
* Detects invalid control characters

## 🔐 Branch Protection

* `main` is protected
* All contributions via Pull Requests
* **Lint checks must pass** before merge
* Minimum 1 review approval required

## 🤝 Contributing

* Use Issues for bug reports, translation requests, or suggestions.
* Fork → Branch → Edit → PR against `main`.
* Respect GDPR: authorship metadata is not stored in content files; user profiles provide attribution.

See [CONTRIBUTING.md](CONTRIBUTING.md), [TRANSLATIONS.md](TRANSLATIONS.md), [GOVERNANCE.md](GOVERNANCE.md).

## 📜 Licenses

* **Source code (scripts, helpers):** GNU GPL v3.0
* **Content (articles, blog, images):** CC BY-SA 4.0

## 📬 Contact

🌐 [p7co.org](https://p7co.org)
📩 [hello@p7co.org](mailto:hello@p7co.org)
