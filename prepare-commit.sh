#!/bin/bash

# Script to prepare the repository for commit

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "======================================"
echo "📦 MDParadise - Prepare for Commit"
echo "======================================"
echo ""

# Check if we're in a git repo
if [ ! -d .git ]; then
  echo -e "${RED}❌ Error: Not in a git repository${NC}"
  exit 1
fi

echo -e "${BLUE}Current git status:${NC}"
git status --short
echo ""

echo -e "${YELLOW}Summary of changes:${NC}"
echo ""

echo -e "${GREEN}✅ Added:${NC}"
echo "  • frontend/                 (Complete Next.js application)"
echo "  • CLAUDE.md                 (AI context file)"
echo "  • LICENSE                   (MIT License)"
echo "  • build-cli.sh              (Build script)"
echo "  • fix-cli-open.sh           (CLI fix)"
echo "  • update-cli-port-detection.sh"
echo "  • cleanup-repo.sh           (This cleanup script)"
echo "  • .mcp.json                 (MCP configuration)"
echo "  • Documentation files       (QUICKSTART, PORT_DETECTION)"
echo ""

echo -e "${RED}✅ Removed:${NC}"
echo "  • md_server.py              (Old Python backend)"
echo "  • md_server_requirements.txt"
echo "  • install.sh                (Old installation)"
echo "  • start_md_server.sh        (Old launcher)"
echo ""

echo -e "${BLUE}✅ Modified:${NC}"
echo "  • README.md                 (Complete rewrite)"
echo "  • .gitignore                (Updated for Next.js)"
echo ""

echo -e "${YELLOW}Architecture Change:${NC}"
echo "  Before: Python Flask + Next.js (2 servers)"
echo "  After:  Next.js only (1 server with API routes)"
echo ""

echo -e "${YELLOW}New Features:${NC}"
echo "  • WYSIWYG editing mode"
echo "  • Copy code blocks"
echo "  • Anchor navigation"
echo "  • Auto port detection"
echo "  • State persistence (localStorage)"
echo "  • Recent files quick access"
echo "  • Auto file refresh"
echo "  • Mobile responsive UI"
echo ""

echo "======================================"
echo ""
echo -e "${BLUE}Ready to commit?${NC}"
echo ""
echo "To commit these changes, run:"
echo ""
echo -e "${GREEN}  git commit -m \"Complete rewrite: Migrate from Python/Flask to Next.js-only architecture"
echo ""
echo "  - Remove Python backend (Flask)"
echo "  - Implement Next.js API Routes"
echo "  - Add WYSIWYG editing mode"
echo "  - Add copy code blocks feature"
echo "  - Add anchor navigation"
echo "  - Add auto port detection"
echo "  - Add state persistence"
echo "  - Add recent files access"
echo "  - Update documentation"
echo "  - Improve mobile responsiveness"
echo ""
echo "  BREAKING CHANGE: Python is no longer required. Only Node.js 18+ is needed.\"${NC}"
echo ""
echo "Then push:"
echo -e "${GREEN}  git push origin main${NC}"
echo ""
echo "======================================"
echo ""

# Show untracked files that should be ignored
echo -e "${YELLOW}Files that should be in .gitignore (not committed):${NC}"
if [ -d "node_modules" ]; then
  echo "  • node_modules/             (in .gitignore)"
fi
if [ -d "frontend/.next" ]; then
  echo "  • frontend/.next/           (in .gitignore)"
fi
if [ -d "venv" ]; then
  echo -e "  ${RED}• venv/                     (SHOULD BE REMOVED - run ./cleanup-repo.sh)${NC}"
fi
if [ -f ".mdparadise-instance.json" ]; then
  echo "  • .mdparadise-instance.json (in .gitignore)"
fi
echo ""

echo -e "${BLUE}Next steps:${NC}"
echo "  1. Review the changes above"
echo "  2. Run ./cleanup-repo.sh (to remove venv/ if needed)"
echo "  3. Copy and run the git commit command above"
echo "  4. git push origin main"
echo ""
