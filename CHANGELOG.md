# 📖 Changelog · P7CO® EcoResupply Blog

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## \[Unreleased]

### Added

* New blog posts in **PT/EN/FR/DE**.
* Spanish (`es/`) blog folder initialized.
* UI translation JSON structure under `/ui/{lang}/components/`.

### Changed

* Improved translation guides in `TRANSLATIONS.md`.
* Updated contribution workflow with stricter linter rules.

### Fixed

* Linter validation for categories and image dimensions.

## \[1.0.0] – 2025-04-01

### Added

* Initial project structure:

  * `content/blog/pt/`, `content/blog/en/`, `content/blog/fr/`, `content/blog/de/`
  * `images/` folder for blog illustrations
  * `.gitkeep` placeholders to preserve empty directories
* Governance & community files:

  * `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` (EN/PT/FR/DE)
  * `GOVERNANCE.md`, `TRANSLATIONS.md`, `SECURITY.md`
  * `.github/ISSUE_TEMPLATE/*`, `.github/PULL_REQUEST_TEMPLATE.md`
  * `.github/CODEOWNERS`, `.github/FUNDING.yml`
* Licensing:

  * `LICENSE` (GPL v3 for scripts/helpers)
  * `LICENSE-content.md` (CC BY 4.0 for articles/images)
* Academic citation support with `CITATION.cff`.

## \[0.1.0] – 2025-03-15

### Prototype

* Early draft repository with **Portuguese** and **English** posts.
* First tests with Markdown + YAML frontmatter.
* Proof-of-concept content validation.
