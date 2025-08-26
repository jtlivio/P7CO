# Contributing to P7CO Blog

Thank you for considering contributing to the **P7CO® EcoResupply Blog**!
We welcome contributions that help improve translations, fix mistakes, or add new articles about sustainability, circularity, environmental responsibility, and technology.

---

## 📝 How to Contribute

### 1. Reporting Issues

* Use the **GitHub Issues** tab to report problems, typos, or suggestions.
* Please provide clear context (file, section, language).

### 2. Submitting Changes

* Fork the repository.
* Create a new branch for your change:
  `git checkout -b fix/typo-article1`
* Make your edits:

  * Blog posts are under `content/blog/{lang}/` where `{lang}` is the language code (e.g. `en`, `pt`).
  * Images go to the `images/` folder.
* Commit with a clear message:
  `git commit -m "Fix typo in Portuguese blog post about recycling"`
* Open a Pull Request (PR) to the `main` branch.

### 3. Writing a Blog Post

* Add your new post under the correct language folder:

  * `content/blog/en/` for English posts.
  * `content/blog/pt/` for Portuguese posts.
* Each post **must** include YAML frontmatter at the top, for example:

```
---
title: "Title of the Post"
intro: "Short introduction (1–2 sentences)."
image: /images/example.jpg
date: 2025-04-01
tags: ["Sustainability", "Circular Economy"]
ativo: true
---
```

* Use **Markdown syntax** for formatting.
* Add images to `/images/` and reference them with a relative path.

### 4. Translations

* Translations are welcome!
* Place translated blog posts in the corresponding folder:

  * `content/blog/en/` for English translations.
  * `content/blog/pt/` for Portuguese translations.
* Ensure the frontmatter fields are also translated (title, intro, tags).

---

## ✅ Contribution Rules

* **Respectful communication**: follow our [Code of Conduct](CODE_OF_CONDUCT.md).
* **Clarity**: keep language clear, concise, and accessible.
* **Accuracy**: verify facts and cite reliable sources.
* **Neutrality**: avoid political bias; focus on sustainability and technology.

---

## 🔍 Review & Approval

* All contributions go through Pull Requests.
* The pH7x Systems editorial team reviews PRs before merging.
* Approved PRs will be published automatically in the next site deployment.

---

## 📜 License

* **Source code (scripts)** → [GPL v3.0](LICENSE)
* **Content (Markdown, articles, images)** → [CC BY-SA 4.0](LICENSE-content.md)
