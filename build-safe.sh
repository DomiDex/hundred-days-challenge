#!/bin/bash

echo "🔧 Safe build script for Next.js"
echo "================================"

# Set Node.js options
export NODE_OPTIONS="--max-old-space-size=4096"

# Clear Next.js cache
echo "📦 Clearing Next.js cache..."
rm -rf .next 2>/dev/null || true

# Clear other caches
echo "🧹 Clearing temporary files..."
rm -rf .swc 2>/dev/null || true
rm -rf .eslintcache 2>/dev/null || true

# Try to build
echo "🚀 Starting build..."
npm run build

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
else
    echo "❌ Build failed. Trying alternative approach..."
    
    # Try with different Node options
    export NODE_OPTIONS="--max-old-space-size=8192 --no-warnings"
    npm run build
fi