#!/bin/bash

# Simple script to remove venv directory

echo "Removing venv directory..."
sudo rm -rf venv/

echo "Removing root node_modules (keeping frontend/node_modules)..."
rm -rf node_modules/

echo "Removing root package files (keeping frontend/package.json)..."
rm -f package.json package-lock.json

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Remaining structure:"
ls -la | grep -E "^d|frontend|build-cli|README"
