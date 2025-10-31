#!/bin/bash

# Script pour construire la CLI MDParadise

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/frontend"

echo "======================================"
echo "🔨 MDParadise - Build CLI"
echo "======================================"
echo ""

echo -e "${BLUE}Nettoyage du dossier .next...${NC}"
sudo rm -rf .next
mkdir -p .next
chmod 755 .next
echo -e "${GREEN}✓${NC} Nettoyé"

echo ""
echo -e "${BLUE}Construction du projet...${NC}"
npm run build

echo ""
echo -e "${GREEN}✅ Build terminé!${NC}"
echo ""
echo -e "📦 ${BLUE}Pour installer globalement:${NC}"
echo "   cd frontend"
echo "   npm link"
echo ""
echo -e "🚀 ${BLUE}Pour tester:${NC}"
echo "   mdparadise"
echo ""
