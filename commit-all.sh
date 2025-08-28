#!/bin/bash
set -e

# Commit & push no submódulo (Wiki)
cd content/wiki
git add -A
if ! git diff --cached --quiet; then
  msg="chore: auto-commit wiki updates ($(date -u '+%Y-%m-%d %H:%M:%S UTC'))"
  git commit -m "$msg"
  git push origin main
  echo "✅ Wiki committed & pushed: $msg"
else
  echo "ℹ️  No changes to commit in Wiki"
fi
cd ../..

# Commit & push no repositório principal
git add -A
if ! git diff --cached --quiet; then
  msg="chore: auto-commit project updates ($(date -u '+%Y-%m-%d %H:%M:%S UTC'))"
  git commit -m "$msg"
  git push origin main
  echo "✅ Project committed & pushed: $msg"
else
  echo "ℹ️  No changes to commit in Project"
fi
