# Analyse du besoin : CRUD complet pour fichiers et dossiers

## 📋 Résumé du besoin

MDParadise doit permettre de gérer complètement (CRUD) les fichiers et dossiers dans le répertoire où il est lancé.

**CRUD = Create, Read, Update, Delete**

---

## 🔍 État actuel (v2.0.0)

### ✅ Fonctionnalités existantes

| Opération | Fichiers | Dossiers | Implémentation |
|-----------|----------|----------|----------------|
| **Read (liste)** | ✅ | ✅ Implicite | `GET /api/files` - Liste tous les .md récursivement |
| **Read (contenu)** | ✅ | ❌ | `GET /api/file/[...filepath]` - Lit le contenu |
| **Update** | ✅ | ❌ | `POST /api/file/[...filepath]` - Sauvegarde |
| **Create** | ⚠️ Partiel | ⚠️ Partiel | POST crée les dossiers parents mais pas d'UI dédiée |
| **Delete** | ❌ | ❌ | Non implémenté |
| **Rename/Move** | ❌ | ❌ | Non implémenté |

### 🔒 Sécurité actuelle

- ✅ Protection path traversal (`isPathSafe()`)
- ✅ Vérification que tout reste dans `MDPARADISE_BASE_DIR`
- ✅ Dossiers ignorés : `.git`, `node_modules`, `__pycache__`, `.venv`, `venv`, `.next`, `dist`, `build`

### 🎨 Interface actuelle

**File Sidebar (frontend/components/markdown-editor/file-sidebar.tsx)**
- Liste des fichiers avec recherche
- Section "Recent Files" (3 derniers)
- Affichage par dossier
- Aucune action CRUD visible (sauf ouverture)

---

## 🎯 Besoins identifiés

### 1. Gestion des fichiers

#### Create (Créer)
- **Nouveau fichier vide** dans le dossier actuel
- **Nouveau fichier à partir d'un template** (optionnel)
- **Dupliquer un fichier existant**

#### Update (Modifier)
- ✅ Déjà implémenté (édition du contenu)
- ➕ **Renommer un fichier**
- ➕ **Déplacer un fichier** vers un autre dossier

#### Delete (Supprimer)
- **Supprimer un fichier** avec confirmation
- **Option de corbeille** (déplacer vers `.trash/` au lieu de supprimer définitivement) - optionnel

### 2. Gestion des dossiers

#### Create (Créer)
- **Nouveau dossier** dans l'arborescence
- **Création rapide** depuis la sidebar

#### Update (Modifier)
- **Renommer un dossier**
- **Déplacer un dossier** (avec tous ses fichiers)

#### Delete (Supprimer)
- **Supprimer un dossier vide**
- **Supprimer un dossier avec confirmation** si non vide
- **Nombre de fichiers affecté** dans la confirmation

### 3. Opérations avancées (bonus)

- **Déplacer plusieurs fichiers** en sélection multiple
- **Glisser-déposer** pour déplacer des fichiers/dossiers
- **Historique des suppressions** (undo)
- **Import de fichiers** depuis l'explorateur de fichiers

---

## 🏗️ Architecture proposée

### API Routes à ajouter

#### 1. `/api/file/[...filepath]` (extensions)

Ajouter les méthodes HTTP manquantes :

```typescript
// Actuellement : GET (lire) + POST (sauvegarder)
// À ajouter :

DELETE /api/file/[...filepath]
// Body: { confirm: boolean }
// Response: { success, message }

PUT /api/file/[...filepath]
// Body: { newPath: string } // Pour renommer/déplacer
// Response: { success, newPath }
```

#### 2. `/api/folder` (nouveau)

```typescript
POST /api/folder
// Body: { path: string, name: string }
// Response: { success, path }

DELETE /api/folder
// Body: { path: string, confirm: boolean, recursive: boolean }
// Response: { success, filesDeleted: number }

PUT /api/folder
// Body: { path: string, newPath: string }
// Response: { success, newPath }
```

#### 3. `/api/duplicate` (nouveau - optionnel)

```typescript
POST /api/duplicate
// Body: { sourcePath: string, destinationPath?: string }
// Response: { success, newPath }
```

### Types TypeScript à ajouter

```typescript
// types/index.ts

// Opérations sur fichiers
export interface CreateFileRequest {
  path: string;
  name: string;
  content?: string;
  template?: string;
}

export interface RenameFileRequest {
  path: string;
  newName: string;
}

export interface MoveFileRequest {
  path: string;
  newPath: string;
}

export interface DeleteFileRequest {
  path: string;
  confirm: boolean;
  moveToTrash?: boolean;
}

// Opérations sur dossiers
export interface CreateFolderRequest {
  parentPath: string;
  name: string;
}

export interface DeleteFolderRequest {
  path: string;
  confirm: boolean;
  recursive: boolean;
}

export interface FolderInfo {
  path: string;
  name: string;
  filesCount: number;
  foldersCount: number;
  size: number;
}

// Réponses
export interface FileOperationResponse {
  success: boolean;
  message?: string;
  error?: string;
  newPath?: string;
  filesAffected?: number;
}
```

### Structure de dossiers proposée

```
frontend/
├── app/
│   └── api/
│       ├── files/
│       │   └── route.ts              # GET (liste) ✅
│       ├── file/
│       │   └── [...filepath]/
│       │       └── route.ts          # GET, POST, PUT, DELETE
│       ├── folder/                   # ➕ NOUVEAU
│       │   ├── route.ts              # POST (créer)
│       │   ├── [path]/
│       │       └── route.ts          # DELETE, PUT
│       └── duplicate/                # ➕ NOUVEAU (optionnel)
│           └── route.ts              # POST
├── components/
│   └── markdown-editor/
│       ├── file-sidebar.tsx          # À modifier
│       ├── file-context-menu.tsx     # ➕ NOUVEAU
│       ├── folder-tree.tsx           # ➕ NOUVEAU (optionnel)
│       ├── create-file-dialog.tsx    # ➕ NOUVEAU
│       ├── create-folder-dialog.tsx  # ➕ NOUVEAU
│       ├── rename-dialog.tsx         # ➕ NOUVEAU
│       └── delete-confirm-dialog.tsx # ➕ NOUVEAU
└── lib/
    └── api/
        └── client.ts                 # À étendre avec nouvelles méthodes
```

---

## 🔐 Considérations de sécurité

### Protection path traversal (existant)

```typescript
function isPathSafe(baseDir: string, filePath: string): boolean {
  const resolvedPath = path.resolve(baseDir, filePath);
  return resolvedPath.startsWith(baseDir);
}
```

### Validations supplémentaires à ajouter

1. **Noms de fichiers/dossiers invalides**
   ```typescript
   const INVALID_CHARS = /[<>:"|?*\x00-\x1F]/g;
   const RESERVED_NAMES = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'LPT1']; // Windows

   function isValidName(name: string): boolean {
     if (!name || name.length > 255) return false;
     if (INVALID_CHARS.test(name)) return false;
     if (RESERVED_NAMES.includes(name.toUpperCase())) return false;
     if (name.startsWith('.') && name.length === 1) return false;
     return true;
   }
   ```

2. **Protection contre la suppression de dossiers critiques**
   ```typescript
   const PROTECTED_DIRS = ['.', '.git', 'node_modules'];

   function isProtectedPath(path: string): boolean {
     return PROTECTED_DIRS.some(dir => path.includes(dir));
   }
   ```

3. **Limites de taille**
   ```typescript
   const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
   const MAX_FOLDER_DEPTH = 20;
   ```

4. **Confirmation obligatoire pour suppression**
   - Dossiers non vides : afficher le nombre de fichiers
   - Fichiers récents (< 24h) : avertissement supplémentaire

---

## 🎨 Expérience utilisateur proposée

### Interface - File Sidebar

#### Version minimale (Quick Win)

**Ajout de boutons d'action :**

```
┌─────────────────────────────────────┐
│ 🔍 Search files...                  │
├─────────────────────────────────────┤
│ [+ New File] [+ New Folder]         │ ← Nouveaux boutons
├─────────────────────────────────────┤
│ 📄 Recent Files                     │
│   └─ README.md                      │
├─────────────────────────────────────┤
│ All Files                           │
│   📄 README.md            [⋮]       │ ← Menu contextuel
│   📁 docs/                          │
│     📄 guide.md           [⋮]       │
│     📄 api.md             [⋮]       │
└─────────────────────────────────────┘
```

**Menu contextuel (clic droit ou icône ⋮) :**
- ✏️ Rename
- 📋 Duplicate
- 🗑️ Delete
- ↗️ Move to...
- ℹ️ Properties (taille, date, path)

#### Version avancée (Full Feature)

**Vue en arbre avec drag & drop :**

```
┌─────────────────────────────────────┐
│ MDParadise                          │
│ /home/user/documents                │
├─────────────────────────────────────┤
│ 🔍 Search...     [+ File] [+ Folder]│
├─────────────────────────────────────┤
│ ▼ 📁 docs/                     [⋮]  │
│   │ 📄 README.md               [⋮]  │
│   ▼ 📁 api/                    [⋮]  │
│     │ 📄 endpoints.md          [⋮]  │
│     └ 📄 auth.md               [⋮]  │
│ ▼ 📁 notes/                    [⋮]  │
│   └ 📄 ideas.md                [⋮]  │
│ 📄 TODO.md                     [⋮]  │
└─────────────────────────────────────┘
```

### Dialogues

#### 1. Créer un fichier

```
┌─────────────────────────────────────┐
│ Create New File                     │
├─────────────────────────────────────┤
│ Name: [__________________.md]       │
│                                     │
│ Location: [docs/          [📁]]     │
│                                     │
│ Template: [ Empty           ▼ ]     │
│   • Empty                           │
│   • Basic (Title + Headings)        │
│   • Meeting Notes                   │
│   • Daily Note                      │
│                                     │
│              [Cancel] [Create]      │
└─────────────────────────────────────┘
```

#### 2. Supprimer (avec confirmation)

```
┌─────────────────────────────────────┐
│ ⚠️  Delete File?                    │
├─────────────────────────────────────┤
│ Are you sure you want to delete:    │
│                                     │
│ 📄 docs/guide.md                    │
│                                     │
│ This action cannot be undone.       │
│                                     │
│ ☐ Move to trash instead             │
│                                     │
│           [Cancel] [Delete]         │
└─────────────────────────────────────┘
```

#### 3. Supprimer dossier (avec contenu)

```
┌─────────────────────────────────────┐
│ ⚠️  Delete Folder?                  │
├─────────────────────────────────────┤
│ This folder contains:               │
│                                     │
│ • 12 markdown files                 │
│ • 2 subfolders                      │
│                                     │
│ All content will be deleted.        │
│ This action cannot be undone.       │
│                                     │
│ Type "DELETE" to confirm:           │
│ [_______________________]           │
│                                     │
│              [Cancel] [Delete]      │
└─────────────────────────────────────┘
```

---

## 📊 Plan d'implémentation

### Phase 1 : Fondations (MVP) - 2-3 jours

**Objectif :** CRUD de base fonctionnel

1. **Backend API**
   - [ ] Ajouter DELETE à `/api/file/[...filepath]`
   - [ ] Ajouter PUT (rename) à `/api/file/[...filepath]`
   - [ ] Créer `/api/folder/route.ts` (POST pour créer)
   - [ ] Créer `/api/folder/[...path]/route.ts` (DELETE)
   - [ ] Ajouter validations de sécurité
   - [ ] Tests des routes API

2. **Types & Client API**
   - [ ] Ajouter types dans `types/index.ts`
   - [ ] Étendre `lib/api/client.ts` avec nouvelles méthodes

3. **UI - Composants de base**
   - [ ] `create-file-dialog.tsx`
   - [ ] `create-folder-dialog.tsx`
   - [ ] `rename-dialog.tsx`
   - [ ] `delete-confirm-dialog.tsx`
   - [ ] Ajouter boutons "New File" et "New Folder" dans sidebar

4. **Intégration**
   - [ ] Mettre à jour `file-sidebar.tsx` avec boutons d'action
   - [ ] Gérer le rechargement de la liste après opérations
   - [ ] Tests utilisateur de base

### Phase 2 : Améliorations UX - 1-2 jours

**Objectif :** Interface intuitive et feedback utilisateur

1. **Menu contextuel**
   - [ ] `file-context-menu.tsx` (clic droit sur fichier/dossier)
   - [ ] Icônes et raccourcis clavier

2. **Feedback utilisateur**
   - [ ] Toast notifications pour succès/erreur
   - [ ] États de chargement (spinners)
   - [ ] Messages d'erreur clairs

3. **Optimisations**
   - [ ] Rechargement optimiste (UI update avant API)
   - [ ] Debounce sur recherche
   - [ ] Cache des listes de fichiers

### Phase 3 : Fonctionnalités avancées - 2-3 jours (optionnel)

**Objectif :** Expérience pro-level

1. **Drag & Drop**
   - [ ] Bibliothèque DnD (react-dnd ou dnd-kit)
   - [ ] Déplacement visuel de fichiers/dossiers
   - [ ] Indicateurs visuels de drop zones

2. **Vue en arbre**
   - [ ] `folder-tree.tsx` avec collapse/expand
   - [ ] Compteurs de fichiers par dossier
   - [ ] Navigation clavier (flèches)

3. **Templates & Import**
   - [ ] Templates de fichiers prédéfinis
   - [ ] Import de fichiers depuis l'explorateur
   - [ ] Export de fichiers/dossiers (.zip)

4. **Corbeille (soft delete)**
   - [ ] Dossier `.trash/` automatique
   - [ ] Interface "Restore from trash"
   - [ ] Nettoyage auto après 30 jours

---

## 🎬 Maquettes d'interface (ASCII)

### Vue principale avec actions

```
┌────────────────────────────────────────────────────────────────┐
│ [☰] MDParadise              /home/user/notes         [⚙️] [?] │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│ ┌──────────────┐  ┌────────────────────────────────────────┐  │
│ │ FILES        │  │ EDITOR                                 │  │
│ │              │  │                                        │  │
│ │ 🔍 Search... │  │ # Welcome to MDParadise               │  │
│ │              │  │                                        │  │
│ │ [+ File]     │  │ Edit your markdown files here...      │  │
│ │ [+ Folder]   │  │                                        │  │
│ │──────────────│  │                                        │  │
│ │ 📄 README.md │  │                                        │  │
│ │ 📁 docs/ [⋮]│  │                                        │  │
│ │   📄 api.md  │  └────────────────────────────────────────┘  │
│ │   📄 faq.md  │                                               │
│ └──────────────┘                                               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Menu contextuel

```
    📁 docs/  [⋮] ← Click
                ┌──────────────────┐
                │ ✏️  Rename       │
                │ 📋 Duplicate     │
                │ ↗️  Move to...   │
                │ ──────────────── │
                │ 🗑️  Delete       │
                │ ──────────────── │
                │ ℹ️  Properties   │
                └──────────────────┘
```

---

## ⚠️ Risques et limitations

### Risques

1. **Perte de données**
   - Mitigation : Confirmation obligatoire + option corbeille

2. **Path traversal**
   - Mitigation : Validation stricte de tous les chemins

3. **Conflits de noms**
   - Mitigation : Vérification d'existence avant création/rename

4. **Opérations concurrentes**
   - Mitigation : Rechargement automatique de la liste après chaque opération

### Limitations connues

1. **Pas de versioning**
   - Les suppressions sont définitives (sauf si corbeille activée)

2. **Pas de permissions utilisateur**
   - Tout utilisateur peut tout modifier (OK pour usage local)

3. **Pas de synchronisation multi-utilisateurs**
   - Usage single-user uniquement

4. **Limite de taille**
   - Pas optimisé pour > 1000 fichiers

---

## 📈 Métriques de succès

1. **Fonctionnel**
   - ✅ 100% des opérations CRUD fonctionnelles
   - ✅ 0 path traversal possible
   - ✅ Toutes les validations en place

2. **UX**
   - ✅ Temps de création fichier < 3 secondes
   - ✅ Feedback visuel sur toutes les actions
   - ✅ Pas de rechargement de page nécessaire

3. **Robustesse**
   - ✅ Gestion d'erreurs complète
   - ✅ Confirmations sur actions destructives
   - ✅ Tests sur Windows, Linux, macOS

---

## 🚀 Commencer l'implémentation

**Prochaines étapes suggérées :**

1. ✅ Valider cette analyse avec l'équipe/utilisateurs
2. Choisir la phase d'implémentation (MVP vs Full)
3. Créer une branche `feature/crud-operations`
4. Commencer par Phase 1 - Backend API
5. Tests au fur et à mesure
6. Documentation utilisateur

**Estimation totale :**
- **MVP (Phase 1)** : 2-3 jours
- **UX améliorée (Phase 2)** : +1-2 jours
- **Features avancées (Phase 3)** : +2-3 jours

**Total** : 5-8 jours pour une implémentation complète

---

**Questions ouvertes :**
1. Voulez-vous une corbeille ou suppression définitive ?
2. Faut-il des templates de fichiers prédéfinis ?
3. Drag & Drop est-il prioritaire ?
4. Limite de taille de fichiers à définir ?
