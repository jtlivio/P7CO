#!/bin/bash
set -euo pipefail

# --- Submódulo (Wiki) ---
cd content/wiki
git add -A
if ! git diff --cached --quiet; then
  msg="chore: auto-commit wiki updates ($(date -u '+%Y-%m-%d %H:%M:%S UTC'))"
  git commit -m "$msg"
  git push origin HEAD:master
  echo "✅ Wiki committed & pushed: $msg"
else
  echo "ℹ️  No changes to commit in Wiki"
fi
cd ../..

# --- Repo principal ---
current_branch="$(git rev-parse --abbrev-ref HEAD)"
if git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
  git pull --rebase --autostash
else
  echo "ℹ️  No upstream set for '$current_branch' — skipping rebase"
fi

git add -A
if ! git diff --cached --quiet; then
  msg="chore: auto-commit project updates ($(date -u '+%Y-%m-%d %H:%M:%S UTC'))"
  git commit -m "$msg"
  git push origin HEAD
  echo "✅ Project committed & pushed on '$current_branch': $msg"
else
  echo "ℹ️  No changes to commit in Project"
fi
