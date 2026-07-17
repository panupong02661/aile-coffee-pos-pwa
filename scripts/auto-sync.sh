#!/usr/bin/env bash
# ============================================================
# Auto-Sync watcher (Git Bash / macOS / Linux)
# Usage: bash scripts/auto-sync.sh
# ============================================================
set -u
INTERVAL="${INTERVAL:-60}"

echo ""
echo "========================================================"
echo "  Lovable Auto-Sync running — check every ${INTERVAL}s"
echo "  Ctrl+C to stop"
echo "========================================================"
echo ""

while true; do
  echo "[$(date '+%F %T')] checking for new commits..."

  if ! git fetch origin >/dev/null 2>&1; then
    echo "   [!] git fetch failed"
    sleep "$INTERVAL"; continue
  fi

  LOCAL="$(git rev-parse HEAD)"
  REMOTE="$(git rev-parse @{u} 2>/dev/null || echo "$LOCAL")"

  if [ "$LOCAL" = "$REMOTE" ]; then
    echo "   up to date"
    sleep "$INTERVAL"; continue
  fi

  echo ""
  echo "=========================================="
  echo "  New commit — syncing"
  echo "=========================================="

  PKG_CHANGED=0
  git diff --name-only HEAD "$REMOTE" | grep -q "^package.json$" && PKG_CHANGED=1

  echo "[1/4] git pull..."
  git pull --ff-only || { echo "   [X] git pull failed"; sleep "$INTERVAL"; continue; }

  if [ "$PKG_CHANGED" -eq 1 ]; then
    echo "[2/4] npm install (package.json changed)..."
    npm install || { echo "   [X] npm install failed"; sleep "$INTERVAL"; continue; }
  else
    echo "[2/4] skip npm install"
  fi

  echo "[3/4] npm run build..."
  npm run build || { echo "   [X] build failed"; sleep "$INTERVAL"; continue; }

  echo "[4/4] npx cap sync android..."
  npx cap sync android || { echo "   [X] cap sync failed"; sleep "$INTERVAL"; continue; }

  echo ""
  echo "=========================================="
  echo "  ✅ Done! Ready to Build APK in Android Studio"
  echo "  $(date '+%F %T')"
  echo "=========================================="
  printf '\a\a\a'

  sleep "$INTERVAL"
done
