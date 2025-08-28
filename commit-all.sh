#!/bin/bash
set -e

# Commit e push no submódulo (Wiki)
cd content/wiki
git add -A
if ! git diff --cached --quiet; then
  git commit -m "chore: auto-commit wiki updates"
  git push origin HEAD
fi
cd ../..

# Commit e push no repositório principal
git add -A
if ! git diff --cached --quiet; then
  git commit -m "chore: auto-commit project updates"
  git push origin HEAD
fi
