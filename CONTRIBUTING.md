# Contributing to P7CO® EcoResupply Blog

Thank you for considering contributing to the **P7CO® EcoResupply Blog**!
We welcome contributions that improve translations, fix mistakes, or add new articles.

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
3. Make your edits (Markdown files are under `/content/blog/{lang}/`).
4. Commit with a clear message:

   ```bash
   git commit -m "Fix typo in Portuguese blog post about recycling"
   ```
5. Open a Pull Request (PR) to the **main** branch.

## ✍️ Writing a Blog Post

* Add your new post under:

  * `content/blog/en/` for English posts.
  * `content/blog/pt/` for Portuguese posts.
  * `content/blog/fr/` for French posts.
  * `content/blog/de/` for German posts.
  * `content/blog/es/` for Spanish posts.

Each post must include YAML frontmatter at the top using `+++` delimiters:

```yaml
+++
title: "Sample Blog Post Title"
intro: "A short introduction for the P7CO EcoResupply blog."
image: /images/example.jpg
date: 2025-04-01
category: "guides"
tags: ["Sustainability", "Circular Economy"]
author: "Contributor Name"
author_bio: "Short bio or role."
author_image_url: /images/authors/sample.jpg
reading_time: 3
active: true
+++
```

## 🖼️ Image Requirements

To keep the blog consistent and performant, **all images must respect these rules**:

* **Format:** `.jpg` only (no `.png`, `.webp`, `.gif`).
* **Dimensions:** exactly **1200 × 675 px**.
* **Maximum size:** **150 KB**.

> ⚠️ Pull Requests with images that do not follow these rules will be rejected automatically by our linter in CI.

## 🌍 Categories

Allowed `category` values:

* **guides** → Tutorials, how-to articles.
* **news** → Updates and announcements.
* **case-studies** → Real-world examples.
* **esg** → Environmental, Social, Governance.
* **tech** → Technology & tools.
* **p7co** → Internal / brand-specific posts.
* **policy** → Legislation, regulations, policies.
* **community** → Stories and contributions from citizens & organizations.
* **innovation** → R\&D, startups, new methods.
* **circularity** → Circular economy practices.
* **events** → Conferences, webinars, and related events.
* **na** → Not applicable.

## 🌐 Translations

When contributing translations:

* Translate **title**, **intro**, **tags**, and **body** fields.
* Keep **date**, **image**, and **active** unchanged.
* Place translations in the appropriate folder (`/content/blog/{lang}/`).

## 📜 Code of Conduct

Please note that this project is released with a [Code of Conduct](CODE_OF_CONDUCT.md).
By participating in this project, you agree to abide by its terms.

## ✅ Checklist before submitting a PR

* [ ] Frontmatter is complete and valid.
* [ ] Images exist under `/images/` and respect format, size, and dimensions (JPG 1200×675 ≤150 KB).
* [ ] Content body is not empty.
* [ ] Category is one of the allowed values.
* [ ] File size ≤ 100 KB and contains no invalid characters.
* [ ] Changes follow the [Code of Conduct](CODE_OF_CONDUCT.md).
