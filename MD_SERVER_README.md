# 📝 MDParadise

Un serveur local élégant pour visualiser et éditer vos fichiers Markdown avec une interface moderne et intuitive.

Lancez-le depuis **n'importe quel dossier** et éditez vos fichiers .md dans un environnement visuel agréable !

## ✨ Fonctionnalités

- **Interface split-view** : Éditeur et prévisualisation côte à côte
- **Éditeur de code** : CodeMirror avec coloration syntaxique (thème Dracula)
- **Rendu Markdown** : Affichage en temps réel avec support complet (tableaux, code, listes, etc.)
- **Navigation facile** : Liste de tous vos fichiers .md avec recherche
- **Sauvegarde automatique** : Détection des modifications non sauvegardées
- **Accès réseau LAN** : Partagez avec d'autres appareils sur le même réseau
- **Raccourcis clavier** : `Ctrl+S` / `Cmd+S` pour sauvegarder
- **Modes d'affichage** : Basculez entre édition, prévisualisation ou les deux
- **Responsive** : Fonctionne sur mobile et tablette
- **Lancement depuis n'importe où** : Commande globale `mdparadise`

## 🚀 Installation

### Installation globale (recommandé)

Installez MDParadise une fois pour l'utiliser partout :

```bash
# Se placer dans le dossier mdparadise
cd /home/florent-didelot/Documents/GitHub/mdparadise

# Lancer l'installation interactive
./install.sh
```

Le script d'installation vous proposera plusieurs options :
1. **Lien symbolique dans /usr/local/bin** (nécessite sudo) ⭐ Recommandé
2. **Lien symbolique dans ~/.local/bin** (sans sudo)
3. **Alias dans votre shell** (bash/zsh)
4. **Affichage du chemin complet** (utilisation manuelle)

Après l'installation, utilisez simplement :

```bash
# Lancer dans le dossier courant
mdparadise

# Lancer dans un dossier spécifique
mdparadise ~/Documents/mon-projet

# Lancer dans vos notes
mdparadise ~/notes
```

### Installation locale (sans installation globale)

Si vous préférez ne pas installer globalement :

```bash
# 1. Installer les dépendances
pip3 install -r md_server_requirements.txt

# 2. Lancer directement
./start_md_server.sh                    # Dossier courant
./start_md_server.sh /chemin/dossier    # Dossier spécifique
```

## 📖 Utilisation

1. **Démarrer le serveur** dans un dossier contenant des fichiers .md
2. **Ouvrir votre navigateur** à l'une de ces adresses :
   - Local : `http://localhost:4444`
   - Réseau : `http://[votre-ip]:4444` (affiché au démarrage)
3. **Sélectionner un fichier** dans la barre latérale
4. **Éditer** le contenu dans l'éditeur de gauche
5. **Voir le rendu** en temps réel à droite
6. **Sauvegarder** avec le bouton ou `Ctrl+S`

## 🎯 Cas d'usage

- **Documentation de projet** : Éditer les README, docs techniques
- **Notes personnelles** : Gérer votre base de connaissances
- **Rédaction** : Articles de blog, tutoriels
- **Collaboration** : Partager l'accès sur le réseau local
- **Présentation** : Afficher des docs sur un grand écran

## 🔧 Configuration

Le serveur utilise par défaut le **port 4444**. Pour le modifier :

```python
# Dans md_server.py, ligne ~15
PORT = 4444  # Changez cette valeur
```

## 🌐 Accès depuis d'autres appareils

1. **Connectez tous les appareils au même réseau Wi-Fi**
2. **Notez l'IP affichée** au démarrage du serveur
3. **Ouvrez l'URL** sur n'importe quel appareil : `http://[IP]:4444`

Exemple : `http://192.168.1.42:4444`

## 📁 Structure des fichiers

```
/home/florent-didelot/Documents/GitHub/mdparadise/
├── md_server.py                # Serveur Flask principal
├── md_server_requirements.txt  # Dépendances Python
├── start_md_server.sh          # Script de lancement
├── install.sh                  # Script d'installation globale
└── MD_SERVER_README.md         # Ce fichier
```

## 🎨 Interface

### Barre latérale
- Liste tous les fichiers .md du dossier et sous-dossiers
- Recherche en temps réel
- Affichage du chemin complet

### Zone d'édition
- Éditeur CodeMirror avec thème Dracula
- Numérotation des lignes
- Retour à la ligne automatique

### Zone de prévisualisation
- Rendu GitHub-flavored Markdown
- Support des tableaux, listes, code
- Scrolling indépendant

### Barre d'outils
- Nom du fichier actuel
- Indicateur de sauvegarde
- Boutons de mode d'affichage
- Bouton de sauvegarde

## ⌨️ Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+S` / `Cmd+S` | Sauvegarder le fichier |
| Recherche dans la barre latérale | Filtrer les fichiers |

## 🔒 Sécurité

- **Pas d'accès en dehors du dossier** : Le serveur ne peut lire/écrire que dans le dossier de lancement
- **Réseau local uniquement** : Par défaut, accessible uniquement sur votre réseau
- **Pas d'authentification** : À utiliser dans un environnement de confiance

## 🐛 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier que Python 3 est installé
python3 --version

# Vérifier que les dépendances sont installées
pip3 list | grep Flask
```

### Impossible d'accéder depuis un autre appareil
- Vérifiez que les appareils sont sur le même réseau
- Vérifiez le pare-feu (autorisez le port 4444)
- Utilisez l'IP exacte affichée au démarrage

### Les fichiers ne s'affichent pas
- Le serveur scanne uniquement les fichiers `.md`
- Les dossiers `.git`, `node_modules`, etc. sont ignorés

## 🚀 Améliorations futures possibles

- Export en PDF
- Thèmes personnalisables
- Support des images inline
- Synchronisation multi-utilisateurs
- Authentification optionnelle
- Mode sombre/clair

## 📄 Licence

Libre d'utilisation pour vos projets personnels et professionnels.

---

## 💡 Exemples d'utilisation

```bash
# Éditer la documentation d'un projet
cd ~/projets/mon-app
mdparadise

# Éditer vos notes personnelles
mdparadise ~/Documents/notes

# Éditer la doc d'un repo Git
mdparadise ~/code/awesome-project/docs

# Ouvrir directement un dossier spécifique
mdparadise /tmp/markdown-files
```

**Astuce** : Créez un raccourci pour vos dossiers fréquents dans votre shell :

```bash
# Dans ~/.bashrc ou ~/.zshrc
alias mdnotes='mdparadise ~/Documents/notes'
alias mddocs='mdparadise ~/Documents/documentation'
```
