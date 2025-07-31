#!/bin/bash

echo "🔧 Fixing bus error issues..."

# 1. Clear all caches
echo "1. Clearing caches..."
rm -rf .next .swc node_modules/.cache 2>/dev/null

# 2. Reset file permissions
echo "2. Resetting permissions..."
find . -type f -name "*.node" -exec chmod 644 {} \;

# 3. Set memory limits
echo "3. Setting memory limits..."
export NODE_OPTIONS="--max-old-space-size=4096"

# 4. Try build
echo "4. Attempting build..."
npm run build

echo "✅ Done!"