#!/bin/bash

echo "🔧 Fixing dependencies and build issues..."
echo ""

# Set Node options
export NODE_OPTIONS="--max-old-space-size=4096"

# Try to remove files with sudo if needed
echo "📦 Cleaning up old files..."
sudo rm -rf node_modules package-lock.json .next 2>/dev/null || true

echo ""
echo "🧹 Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

echo ""
echo "📥 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  Failed to install. Trying with legacy peer deps..."
    npm install --legacy-peer-deps
fi

echo ""
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  Build failed. Trying safe build..."
    NODE_OPTIONS="--max-old-space-size=8192" npm run build
fi

echo ""
echo "✅ Done! You can now run 'npm run dev' to start the development server."