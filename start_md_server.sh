#!/bin/bash

# Script de lancement du serveur Markdown
# Usage: ./start_md_server.sh [dossier]

echo "======================================"
echo "📝 Markdown Server - Lancement"
echo "======================================"
echo ""

# Si un dossier est spécifié, se déplacer dedans
if [ ! -z "$1" ]; then
    if [ -d "$1" ]; then
        cd "$1"
        echo "📁 Dossier: $1"
    else
        echo "❌ Erreur: Le dossier '$1' n'existe pas"
        exit 1
    fi
else
    echo "📁 Dossier: $(pwd)"
fi

echo ""

# Trouver le vrai chemin du script (suit les liens symboliques)
SCRIPT_PATH="${BASH_SOURCE[0]}"

# Suivre les liens symboliques pour trouver le vrai script
while [ -L "$SCRIPT_PATH" ]; do
    SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
    SCRIPT_PATH="$(readlink "$SCRIPT_PATH")"
    [[ $SCRIPT_PATH != /* ]] && SCRIPT_PATH="$SCRIPT_DIR/$SCRIPT_PATH"
done

SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"
SERVER_FILE="$SCRIPT_DIR/md_server.py"

# Vérifier si l'environnement virtuel existe
if [ ! -d "$VENV_DIR" ]; then
    echo "❌ Environnement virtuel non trouvé"
    echo ""
    echo "Veuillez exécuter le script d'installation :"
    echo "  cd $SCRIPT_DIR"
    echo "  ./install.sh"
    exit 1
fi

# Utiliser le Python du venv
PYTHON_BIN="$VENV_DIR/bin/python3"

if [ ! -f "$PYTHON_BIN" ]; then
    echo "❌ Python non trouvé dans l'environnement virtuel"
    echo ""
    echo "Réinstallez avec:"
    echo "  cd $SCRIPT_DIR"
    echo "  ./install.sh"
    exit 1
fi

# Vérifier que le serveur existe
if [ ! -f "$SERVER_FILE" ]; then
    echo "❌ Fichier md_server.py non trouvé dans: $SCRIPT_DIR"
    exit 1
fi

echo "✅ Environnement prêt"
echo ""

# Lancer le serveur avec le Python du venv
echo "🚀 Démarrage du serveur..."
echo ""

"$PYTHON_BIN" "$SERVER_FILE"
