#!/bin/bash

# Clean previous build
rm -rf dist

# Create dist directory
mkdir -p dist

# Copy main HTML file
cp index.html dist/

# Copy CSS and JS directories
cp -r css dist/
cp -r js dist/

# Copy all assets from public directory to root of dist
cp -r public/* dist/

# Create a simple manifest for deployment info
echo "{\"buildTime\": \"$(date)\", \"version\": \"1.0.0\"}" > dist/build-info.json

echo "✅ Build completed successfully!"
echo "📁 Files copied to dist/ directory"
echo "🚀 Ready for deployment!"

# List the contents for verification
echo ""
echo "📋 Build contents:"
ls -la dist/
