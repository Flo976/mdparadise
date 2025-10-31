#!/bin/bash

# Script d'installation de MDParadise
# Ce script permet de rendre la commande 'mdparadise' disponible globalement

echo "======================================"
echo "📦 MDParadise - Installation"
echo "======================================"
echo ""

# Déterminer le dossier d'installation
INSTALL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "📁 Dossier d'installation: $INSTALL_DIR"
echo ""

# Créer un environnement virtuel et installer les dépendances
VENV_DIR="$INSTALL_DIR/venv"

echo "🔍 Vérification de l'environnement Python..."

if [ ! -d "$VENV_DIR" ]; then
    echo "📦 Création de l'environnement virtuel..."

    # Vérifier si python3-venv est disponible
    if ! python3 -m venv --help &> /dev/null; then
        echo "❌ python3-venv n'est pas installé"
        echo ""
        echo "Installez-le avec:"
        echo "  sudo apt install python3-venv"
        echo "ou"
        echo "  sudo apt install python3-full"
        exit 1
    fi

    python3 -m venv "$VENV_DIR"

    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de la création de l'environnement virtuel"
        exit 1
    fi

    echo "✅ Environnement virtuel créé"
fi

# Activer le venv et installer les dépendances
echo "📦 Installation des dépendances Python..."
source "$VENV_DIR/bin/activate"

pip install -q --upgrade pip
pip install -q -r "$INSTALL_DIR/md_server_requirements.txt"

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation des dépendances"
    deactivate
    exit 1
fi

deactivate
echo "✅ Dépendances installées dans l'environnement virtuel"
echo ""

# Proposer les options d'installation
echo "Choisissez votre méthode d'installation:"
echo ""
echo "1) Lien symbolique dans /usr/local/bin (recommandé)"
echo "   → Nécessite sudo"
echo "   → Commande: mdparadise"
echo ""
echo "2) Lien symbolique dans ~/.local/bin"
echo "   → Pas de sudo nécessaire"
echo "   → Commande: mdparadise"
echo ""
echo "3) Alias dans votre shell (bash/zsh)"
echo "   → Pas de sudo nécessaire"
echo "   → Commande: mdparadise"
echo ""
echo "4) Afficher le chemin complet (utilisation manuelle)"
echo ""
read -p "Votre choix (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🔐 Installation dans /usr/local/bin (nécessite sudo)..."
        sudo ln -sf "$INSTALL_DIR/start_md_server.sh" /usr/local/bin/mdparadise

        if [ $? -eq 0 ]; then
            echo "✅ Installation réussie !"
            echo ""
            echo "Vous pouvez maintenant utiliser la commande 'mdparadise' depuis n'importe où:"
            echo "  mdparadise              → Lance dans le dossier courant"
            echo "  mdparadise /chemin/     → Lance dans un dossier spécifique"
        else
            echo "❌ Erreur lors de l'installation"
            exit 1
        fi
        ;;

    2)
        echo ""
        echo "📂 Installation dans ~/.local/bin..."
        mkdir -p ~/.local/bin
        ln -sf "$INSTALL_DIR/start_md_server.sh" ~/.local/bin/mdparadise

        if [ $? -eq 0 ]; then
            echo "✅ Lien symbolique créé !"
            echo ""

            # Vérifier si ~/.local/bin est dans le PATH
            if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
                echo "⚠️  Attention: ~/.local/bin n'est pas dans votre PATH"
                echo ""
                echo "Ajoutez cette ligne à votre ~/.bashrc ou ~/.zshrc:"
                echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
                echo ""
                echo "Puis rechargez votre shell avec:"
                echo "  source ~/.bashrc  (ou ~/.zshrc)"
            else
                echo "✅ ~/.local/bin est déjà dans votre PATH"
            fi

            echo ""
            echo "Vous pourrez utiliser la commande 'mdparadise' depuis n'importe où:"
            echo "  mdparadise              → Lance dans le dossier courant"
            echo "  mdparadise /chemin/     → Lance dans un dossier spécifique"
        else
            echo "❌ Erreur lors de la création du lien symbolique"
            exit 1
        fi
        ;;

    3)
        echo ""
        echo "📝 Configuration de l'alias..."

        # Détecter le shell
        if [ -n "$BASH_VERSION" ]; then
            SHELL_RC="$HOME/.bashrc"
        elif [ -n "$ZSH_VERSION" ]; then
            SHELL_RC="$HOME/.zshrc"
        else
            echo "Shell non détecté. Configurez manuellement l'alias dans votre fichier de configuration shell."
            echo "Alias à ajouter:"
            echo "  alias mdparadise='$INSTALL_DIR/start_md_server.sh'"
            exit 0
        fi

        ALIAS_LINE="alias mdparadise='$INSTALL_DIR/start_md_server.sh'"

        # Vérifier si l'alias existe déjà
        if grep -q "alias mdparadise=" "$SHELL_RC" 2>/dev/null; then
            echo "⚠️  Un alias 'mdparadise' existe déjà dans $SHELL_RC"
            read -p "Voulez-vous le remplacer? (y/n): " replace

            if [ "$replace" = "y" ] || [ "$replace" = "Y" ]; then
                # Supprimer l'ancien alias
                sed -i '/alias mdparadise=/d' "$SHELL_RC"
                echo "$ALIAS_LINE" >> "$SHELL_RC"
                echo "✅ Alias mis à jour dans $SHELL_RC"
            else
                echo "❌ Installation annulée"
                exit 0
            fi
        else
            echo "$ALIAS_LINE" >> "$SHELL_RC"
            echo "✅ Alias ajouté à $SHELL_RC"
        fi

        echo ""
        echo "Pour activer l'alias dans la session actuelle, exécutez:"
        echo "  source $SHELL_RC"
        echo ""
        echo "Ou ouvrez un nouveau terminal."
        echo ""
        echo "Vous pourrez ensuite utiliser la commande 'mdparadise' depuis n'importe où:"
        echo "  mdparadise              → Lance dans le dossier courant"
        echo "  mdparadise /chemin/     → Lance dans un dossier spécifique"
        ;;

    4)
        echo ""
        echo "📋 Chemin complet du script:"
        echo "  $INSTALL_DIR/start_md_server.sh"
        echo ""
        echo "Pour l'utiliser depuis n'importe où, vous pouvez:"
        echo "  1. Créer un alias dans votre shell:"
        echo "     alias mdparadise='$INSTALL_DIR/start_md_server.sh'"
        echo ""
        echo "  2. Ajouter le dossier à votre PATH:"
        echo "     export PATH=\"$INSTALL_DIR:\$PATH\""
        echo ""
        echo "  3. Utiliser le chemin complet:"
        echo "     $INSTALL_DIR/start_md_server.sh"
        ;;

    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

echo ""
echo "======================================"
echo "🎉 Installation terminée !"
echo "======================================"
