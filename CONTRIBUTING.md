# Contributing to P7CO® EcoResupply Content

Thank you for considering contributing to the **P7CO® EcoResupply Platform**! 🚀
We welcome contributions that improve translations, fix mistakes, or add new **Blog Posts**, **Pages**, or **Articles**.

## 📝 How to Contribute

### 1. Reporting Issues

* Use the **GitHub Issues** tab to report problems, typos, or suggestions.
* Please provide clear context (file, section, language).

### 2. Submitting Changes

1. Fork the repository.
2. Create a new branch for your change:

   ```bash
   git checkout -b fix/typo-article1
   ```
3. Make your edits (Markdown files are under `/content/{type}/{lang}/`).

   * `blog` → Blog posts
   * `page` → Static pages
   * `article` → In-depth articles, reports, whitepapers
4. Commit with a clear message:

   ```bash
   git commit -m "Fix typo in Portuguese blog post about recycling"
   ```
5. Open a Pull Request (PR) to the **main** branch.

## ✍️ Writing Content

Each content type (`blog`, `page`, `article`) must include **frontmatter** at the top using `+++` delimiters:

```yaml
+++
title: "Sample Title"
intro: "A short introduction for the P7CO EcoResupply platform."
image: /proxy/image?path=images/example.jpg
date: 2025-04-01
category: "guides"
tags: ["Sustainability", "Circular Economy"]
reading_time: 3
active: true
+++
```

### Required Fields

* **title** → Main title (used in headers and listings).
* **intro** → Short introduction (max 280 chars).
* **image** → Path to cover image.
* **date** → Publication date (`YYYY-MM-DD`).
* **tags** → Array of keywords.
* **active** → Boolean (`true`/`false`).

### Recommended Fields

* **category** → Must be one of the [allowed categories](#-categories).
* **reading\_time** → Estimated reading time in minutes.
* **author**, **author\_bio**, **author\_image\_url** (optional, for articles and blogs).

## 🖼️ Image Requirements

To keep content consistent and performant:

* **Format:** `.jpg` only (no `.png`, `.webp`, `.gif`).
* **Dimensions:** exactly **1200 × 675 px**.
* **Maximum size:** **150 KB**.

> ⚠️ Non-conforming images will be rejected automatically by CI.

## 🌍 Categories

Allowed `category` values:

* **guides** → Tutorials, how-to
* **news** → Updates, announcements
* **case-studies** → Real-world examples
* **esg** → Environmental, Social, Governance
* **tech** → Technology & tools
* **p7co** → Internal / brand-specific
* **policy** → Legislation, regulations
* **community** → Contributions, stories
* **innovation** → Startups, R\&D, new methods
* **circularity** → Circular economy practices
* **events** → Conferences, webinars
* **opinion** → Editorials, opinion pieces
* **analysis** → Comparisons, analysis
* **whitepaper** → Academic or technical papers
* **report** → Studies and reports
* **insight** → Market insights, trends
* **legal** → Legal and compliance articles
* **environment** → Environmental content
* **market** → Industry or market-focused
* **services** → Service description pages
* **about** → Institutional (about us)
* **faq** → Frequently asked questions
* **na** → Not applicable

## 🌐 Translations

When contributing translations:

* Translate **title**, **intro**, **tags**, and **body** fields.
* Keep **date**, **image**, and **active** unchanged.
* Place translations in the appropriate folder:

  * `/content/blog/{lang}/`
  * `/content/page/{lang}/`
  * `/content/article/{lang}/`

## 📜 Code of Conduct

Please note that this project is released with a [Code of Conduct](CODE_OF_CONDUCT.md).
By participating in this project, you agree to abide by its terms.

## ✅ Checklist before submitting a PR

* [ ] Frontmatter is complete and valid.
* [ ] Images exist under `/images/` and respect format, size, and dimensions.
* [ ] Content body is not empty.
* [ ] Category is one of the allowed values.
* [ ] File size ≤ 100 KB and contains no invalid characters.
* [ ] Changes follow the [Code of Conduct](CODE_OF_CONDUCT.md).
