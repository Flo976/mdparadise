#!/bin/bash

# Script pour nettoyer le repo MDParadise des anciens fichiers

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "======================================"
echo "🧹 MDParadise - Repository Cleanup"
echo "======================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}Removing old Python venv directory...${NC}"
sudo rm -rf venv/
echo -e "${GREEN}✓${NC} Removed venv/"

echo -e "${BLUE}Removing node_modules at root (keeping frontend/node_modules)...${NC}"
rm -rf node_modules/
echo -e "${GREEN}✓${NC} Removed node_modules/"

echo -e "${BLUE}Removing package.json and package-lock.json at root...${NC}"
rm -f package.json package-lock.json
echo -e "${GREEN}✓${NC} Removed root package files"

echo -e "${BLUE}Removing old documentation files...${NC}"
rm -f DOCUMENTATION.md CLI_TRANSFORMATION_GUIDE.md
echo -e "${GREEN}✓${NC} Removed old documentation"

echo ""
echo -e "${GREEN}✅ Repository cleanup complete!${NC}"
echo ""
echo -e "${YELLOW}Remaining files to commit:${NC}"
echo "  - frontend/          (New Next.js application)"
echo "  - build-cli.sh       (Build script)"
echo "  - fix-cli-open.sh    (CLI fix script)"
echo "  - update-cli-port-detection.sh"
echo "  - QUICKSTART_CLI.md  (To be merged into README)"
echo "  - PORT_DETECTION.md  (To be merged into README)"
echo "  - CLAUDE.md          (Project context for AI)"
echo "  - LICENSE"
echo "  - .mcp.json"
echo "  - .gitignore"
echo "  - README.md          (To be updated)"
echo ""
