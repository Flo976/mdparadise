#!/bin/bash

# Script pour installer TipTap et ses extensions

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "======================================"
echo "📦 Installation de TipTap"
echo "======================================"
echo ""

echo -e "${BLUE}Installation des packages TipTap...${NC}"
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-typography @tiptap/extension-placeholder @tiptap/extension-code-block-lowlight @tiptap/pm lowlight

echo ""
echo -e "${GREEN}✅ Installation terminée!${NC}"
echo ""
echo -e "${BLUE}Vous pouvez maintenant rebuild le projet:${NC}"
echo "   npm run build"
echo ""
