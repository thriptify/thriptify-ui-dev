#!/bin/bash
# Sync thriptify-ui-dev to thriptify-ui (production)
# Usage: ./scripts/sync-to-prod.sh v1.0.0

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./scripts/sync-to-prod.sh <version>"
  echo "Example: ./scripts/sync-to-prod.sh v1.0.0"
  exit 1
fi

echo "🔄 Syncing to production with version: $VERSION"

# Ensure we're in thriptify-ui-dev
if [[ ! "$PWD" == *"thriptify-ui-dev"* ]]; then
  echo "❌ Error: Run this script from thriptify-ui-dev directory"
  exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
  echo "⚠️  Warning: You have uncommitted changes in ui-dev"
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Optionally build to verify
echo "📦 Building to verify..."
npm run build 2>/dev/null || echo "No build script, skipping..."

# Copy files to production repo
echo "📋 Copying files to thriptify-ui..."
rsync -av --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.expo' \
  --exclude='_archive' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='*.log' \
  ./ ../thriptify-ui/

# Go to production repo
cd ../thriptify-ui

# Check what changed
echo ""
echo "📝 Changes to be committed:"
git status --short

# Commit
echo ""
echo "💾 Committing changes..."
git add .
git commit -m "release: $VERSION

Synced from thriptify-ui-dev
$(date +%Y-%m-%d)"

# Tag
git tag -a "$VERSION" -m "Release $VERSION"

echo ""
echo "✅ Done! Changes committed and tagged as $VERSION"
echo ""
echo "📤 To push to remote:"
echo "   cd ../thriptify-ui"
echo "   git push origin main --tags"
echo ""
echo "Or push now:"
read -p "Push to origin? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git push origin main --tags
  echo "✅ Pushed to origin!"
fi
