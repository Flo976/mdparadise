# Étude de refonte de la sidebar MDParadise
## Document d'étude technique et fonctionnel

**Date:** 31 Octobre 2025
**Projet:** MDParadise
**Objectif:** Refonte complète de la sidebar avec shadcn/ui

---

## 1. Introduction et contexte

### 1.1 Objectif de la refonte
Créer une nouvelle sidebar moderne, plus large et plus fonctionnelle en utilisant les composants shadcn/ui via MCP. La nouvelle sidebar doit offrir une expérience utilisateur optimale pour la navigation et la gestion de fichiers Markdown.

### 1.2 Périmètre
- Remplacement complet du composant `FileSidebar` actuel
- Création d'un nouveau composant autonome
- Intégration avec l'écosystème shadcn/ui
- Amélioration de l'UX globale

---

## 2. Analyse de l'existant

### 2.1 Architecture actuelle

**Fichiers concernés:**
- `frontend/components/markdown-editor/file-sidebar.tsx` (190 lignes)
- `frontend/components/markdown-editor/file-tree.tsx` (275 lignes)
- `frontend/components/markdown-editor/file-context-menu.tsx`
- `frontend/lib/tree-utils.ts`

**Composants shadcn/ui actuellement utilisés:**
- `Sidebar`, `SidebarContent`, `SidebarGroup`, etc.
- `Input` (pour la recherche)
- `ScrollArea`
- `ContextMenu` (via FileContextMenu)

**Fonctionnalités implémentées:**
1. ✅ Affichage du logo et nom "MDParadise"
2. ✅ Affichage du chemin de base (baseDir)
3. ✅ Breadcrumb pour le fichier actuel
4. ✅ Section "Recent Files" (3 derniers fichiers modifiés)
5. ✅ Barre de recherche
6. ✅ Tree view avec dossiers et fichiers
7. ✅ Menu contextuel (clic droit) avec CRUD
8. ✅ Drag & drop pour déplacer fichiers/dossiers

### 2.2 Points forts de l'implémentation actuelle
- ✅ Séparation claire des responsabilités (FileSidebar, FileTree, FileContextMenu)
- ✅ Utilisation de hooks React (useState, useMemo, useCallback)
- ✅ Performance optimisée avec useMemo pour éviter les recalculs
- ✅ Support complet du CRUD (Create, Read, Update, Delete)
- ✅ Gestion d'état locale cohérente
- ✅ Intégration API bien structurée (apiClient)

### 2.3 Points à améliorer
- ⚠️ Largeur de la sidebar limitée (standard shadcn)
- ⚠️ Design visuel pourrait être plus moderne
- ⚠️ Pas de regroupement visuel clair entre les différentes sections
- ⚠️ Code dispersé sur plusieurs fichiers (peut être consolidé)

---

## 3. Spécifications de la nouvelle sidebar

### 3.1 Exigences fonctionnelles

**RF1 - Dimensions et layout**
- Largeur: Plus large qu'une sidebar standard (≈ 320-360px au lieu de 240-280px)
- Hauteur: 100vh (plein écran)
- Position: Fixe à gauche

**RF2 - Section Header**
- Logo MDParadise (image)
- Pas de nom "MDParadise" en titre
- Chemin du répertoire de base (baseDir) à mettre dans le header mais pas dans la sidebar

**RF3 - Section "Fichiers récents"**
- Affichage des 3 derniers fichiers modifiés (mtime)
- Icône d'horloge + label "Recent Files"
- Cliquables pour ouvrir le fichier
- Indication visuelle du fichier actuellement ouvert

**RF4 - Section "Recherche"**
- Barre de recherche avec placeholder "Search files..."
- Icône de recherche (loupe)
- Filtrage en temps réel sur nom et chemin
- Clear button pour effacer la recherche

**RF5 - Section "Tree View"**
- Arborescence des dossiers et fichiers
- Dossiers repliables/dépliables (collapsible)
- Icônes différenciées:
  - Dossier fermé: `Folder`
  - Dossier ouvert: `FolderOpen`
  - Fichier: `FileText`
  - Chevron: `ChevronRight` / `ChevronDown`
- Indentation visuelle pour la hiérarchie
- Highlight du fichier actuellement ouvert

**RF6 - Menu contextuel (clic droit)**
- Accessible sur fichiers ET dossiers
- Actions pour fichiers:
  - Créer un nouveau fichier
  - Renommer le fichier
  - Supprimer le fichier
- Actions pour dossiers:
  - Créer un nouveau fichier dans le dossier
  - Créer un nouveau sous-dossier
  - Renommer le dossier
  - Supprimer le dossier
- Confirmations pour les actions destructives

**RF7 - Interactions**
- Drag & drop pour déplacer fichiers/dossiers
- Double-clic pour ouvrir un fichier
- Clic simple sur dossier pour expand/collapse
- Responsive (adaptation mobile/desktop)

### 3.2 Design et UX

**Principes de design:**
1. **Clarté visuelle:** Séparations nettes entre les sections
2. **Hiérarchie:** Utilisation de tailles de police, couleurs et espacements
3. **Accessibilité:** Contrastes suffisants, labels ARIA
4. **Modernité:** Utilisation de shadcn/ui design tokens
5. **Fluidité:** Animations et transitions douces

**Couleurs et thèmes:**
- Support du mode clair et sombre (theme-aware)
- Utilisation des variables CSS shadcn (`bg-background`, `text-foreground`, etc.)
- Accents colorés pour les états (hover, active, drag-over)

---

## 4. Composants shadcn/ui identifiés

### 4.1 Composants principaux

| Composant | Rôle | Utilisation |
|-----------|------|-------------|
| **sidebar-11** | Template de sidebar avec file tree | Base de référence pour l'implémentation |
| **sidebar** | Composant Sidebar de base | Container principal |
| **collapsible** | Dossiers repliables | Arborescence de fichiers |
| **context-menu** | Menu clic droit | Actions CRUD |
| **input** | Barre de recherche | Filtrage des fichiers |
| **separator** | Séparateurs visuels | Délimitation des sections |
| **scroll-area** | Zone scrollable | Liste de fichiers |

### 4.2 Composants secondaires

| Composant | Rôle |
|-----------|------|
| **dialog** | Confirmations de suppression |
| **button** | Boutons d'action |
| **badge** | Indicateurs (nb de fichiers, etc.) |
| **tooltip** | Info-bulles |

### 4.3 Icônes (lucide-react)

```tsx
import {
  FileText,      // Fichier markdown
  Folder,        // Dossier fermé
  FolderOpen,    // Dossier ouvert
  ChevronRight,  // Dossier collapsed
  ChevronDown,   // Dossier expanded
  Search,        // Recherche
  Clock,         // Fichiers récents
  Plus,          // Créer
  Trash,         // Supprimer
  Edit,          // Renommer
  X,             // Fermer/Clear
} from "lucide-react";
```

---

## 5. Architecture technique proposée

### 5.1 Structure des composants

```
frontend/components/markdown-editor/
├── enhanced-sidebar/
│   ├── EnhancedSidebar.tsx           # Composant principal (nouveau)
│   ├── SidebarHeader.tsx             # Section header avec logo
│   ├── SidebarRecentFiles.tsx        # Section fichiers récents
│   ├── SidebarSearch.tsx             # Section recherche
│   ├── SidebarFileTree.tsx           # Section arborescence
│   ├── FileTreeNode.tsx              # Nœud d'arbre (récursif)
│   ├── FileContextMenu.tsx           # Menu contextuel (réutilisé/adapté)
│   ├── CreateFileDialog.tsx          # Dialog création fichier
│   ├── CreateFolderDialog.tsx        # Dialog création dossier
│   ├── RenameDialog.tsx              # Dialog renommage
│   ├── DeleteConfirmDialog.tsx       # Dialog confirmation suppression
│   └── types.ts                      # Types locaux
```

### 5.2 Flux de données

```
EditorLayout (parent)
    │
    ├─ props ──────────────────────────┐
    │  - files: MarkdownFile[]          │
    │  - currentFile: string | null     │
    │  - baseDir: string                │
    │  - onFileSelect: (path) => void   │
    │  - onRefresh: () => void          │
    │                                    │
    ▼                                    │
EnhancedSidebar ◄────────────────────────┘
    │
    ├─► SidebarHeader
    │   - baseDir
    │   - logo
    │
    ├─► SidebarRecentFiles
    │   - recentFiles (computed from files)
    │   - currentFile
    │   - onFileSelect
    │
    ├─► SidebarSearch
    │   - search: string (local state)
    │   - onSearchChange
    │
    └─► SidebarFileTree
        - fileTree (computed from files + search)
        - currentFile
        - onFileSelect
        - onRename, onDelete, onCreate...
        │
        └─► FileTreeNode (récursif)
            - node: TreeNode
            - level: number
            - handlers...
            │
            └─► FileContextMenu
                - path, type
                - handlers...
```

### 5.3 Gestion d'état

**État local (EnhancedSidebar):**
```tsx
const [search, setSearch] = useState("");
const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
const [isDragOver, setIsDragOver] = useState(false);
```

**État dérivé (computed avec useMemo):**
```tsx
const recentFiles = useMemo(() => {
  return [...files]
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, 3);
}, [files]);

const filteredFiles = useMemo(() => {
  if (!search) return files;
  return files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.path.toLowerCase().includes(search.toLowerCase())
  );
}, [files, search]);

const fileTree = useMemo(() => {
  return buildFileTree(search ? filteredFiles : files);
}, [files, filteredFiles, search]);
```

**Props héritées (du parent EditorLayout):**
- `files: MarkdownFile[]` - Liste complète des fichiers
- `currentFile: string | null` - Fichier actuellement ouvert
- `baseDir: string` - Répertoire de base
- `onFileSelect: (filepath: string) => void` - Callback sélection fichier
- `onRefresh: () => void` - Callback rafraîchissement liste

### 5.4 API et intégrations

**Utilisation de apiClient (déjà existant):**
```tsx
import { apiClient } from "@/lib/api/client";

// Opérations fichiers
await apiClient.createFile(filepath, content);
await apiClient.renameFile(oldPath, newPath);
await apiClient.deleteFile(filepath);

// Opérations dossiers
await apiClient.createFolder(folderpath);
await apiClient.renameFolder(oldPath, newPath);
await apiClient.deleteFolder(folderpath);
```

**Gestion des erreurs:**
```tsx
try {
  const result = await apiClient.deleteFile(filepath);
  if (result.success) {
    onRefresh(); // Rafraîchir la liste
    toast.success("File deleted successfully");
  } else {
    toast.error(result.error || "Failed to delete file");
  }
} catch (error) {
  console.error("Delete error:", error);
  toast.error("Network error");
}
```

### 5.5 Types TypeScript

**Types existants (réutilisés):**
```tsx
// De @/types
interface MarkdownFile {
  name: string;
  path: string;
  dir: string;
  size: number;
  mtime: number;
}

// De @/lib/tree-utils
interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
}
```

**Nouveaux types (enhanced-sidebar/types.ts):**
```tsx
export type FileOrFolderType = 'file' | 'folder';

export interface ContextMenuAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  separator?: boolean;
}

export interface FileTreeNodeProps {
  node: TreeNode;
  level: number;
  currentFile: string | null;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onContextMenu: (actions: ContextMenuAction[]) => void;
}
```

---

## 6. Plan d'implémentation

### 6.1 Phase 1: Préparation (1-2h)

**Étape 1.1 - Installation des dépendances shadcn/ui**
```bash
npx shadcn@latest add collapsible
npx shadcn@latest add context-menu
npx shadcn@latest add dialog
npx shadcn@latest add separator
# Input et ScrollArea déjà installés
```

**Étape 1.2 - Création de la structure de dossiers**
```bash
mkdir -p frontend/components/markdown-editor/enhanced-sidebar
touch frontend/components/markdown-editor/enhanced-sidebar/{EnhancedSidebar,SidebarHeader,SidebarRecentFiles,SidebarSearch,SidebarFileTree,FileTreeNode,types}.tsx
```

**Étape 1.3 - Copie de référence**
- Sauvegarder l'ancienne sidebar dans un dossier `_old/`
- Analyser le code de `sidebar-11` de shadcn

### 6.2 Phase 2: Implémentation des composants de base (3-4h)

**Étape 2.1 - EnhancedSidebar.tsx (composant principal)**
- Setup du composant avec props
- Structure de layout avec Sidebar shadcn
- Gestion de l'état local (search, expandedFolders)
- Computed values (recentFiles, filteredFiles, fileTree)
- Largeur personnalisée (className="w-80" ou w-96)

**Étape 2.2 - SidebarHeader.tsx**
- Logo MDParadise
- Titre "MDParadise"
- Affichage du baseDir avec tooltip si tronqué
- Séparateur visuel

**Étape 2.3 - SidebarRecentFiles.tsx**
- Section avec icône Clock
- Liste des 3 derniers fichiers
- Highlight du fichier actif
- Gestion du clic

**Étape 2.4 - SidebarSearch.tsx**
- Input avec icône Search
- Clear button (X)
- Gestion du state search
- Debounce optionnel pour performance

### 6.3 Phase 3: Implémentation de l'arborescence (4-5h)

**Étape 3.1 - SidebarFileTree.tsx**
- ScrollArea pour la zone scrollable
- Rendu de la liste de nœuds racine
- Gestion de l'état vide (aucun fichier)
- Drop zone pour drag & drop vers racine

**Étape 3.2 - FileTreeNode.tsx (composant récursif)**
- Affichage du nœud (icône + nom)
- Gestion expand/collapse pour dossiers
- Highlight du fichier actif
- Drag & drop handlers
- Récursion pour les enfants
- Indentation visuelle (niveau)

**Étape 3.3 - Collapsible integration**
- Utilisation de Collapsible shadcn
- Animation smooth pour expand/collapse
- Persistance de l'état expanded (localStorage optionnel)

### 6.4 Phase 4: Menu contextuel et CRUD (3-4h)

**Étape 4.1 - FileContextMenu.tsx**
- Adaptation du composant existant
- Context menu shadcn avec items conditionnels
- Séparation fichier/dossier
- Icônes pour chaque action

**Étape 4.2 - Dialogs de CRUD**
- CreateFileDialog.tsx: Formulaire avec Input (nom + path)
- CreateFolderDialog.tsx: Formulaire avec Input (nom)
- RenameDialog.tsx: Formulaire avec Input pré-rempli
- DeleteConfirmDialog.tsx: Confirmation avec détails (nom, type)

**Étape 4.3 - Intégration API**
- Appels à apiClient
- Gestion des erreurs avec toasts
- Rafraîchissement de la liste après chaque opération
- Mise à jour du fichier actif si renommé/supprimé

### 6.5 Phase 5: Drag & Drop (2-3h)

**Étape 5.1 - Implémentation du drag**
- Handler onDragStart
- DataTransfer avec path, type, name
- Effet visuel pendant le drag

**Étape 5.2 - Implémentation du drop**
- Handler onDragOver (folders only)
- Handler onDrop
- Validation (pas de drop sur soi-même ou enfants)
- Appel à renameFile/renameFolder (move)

**Étape 5.3 - Feedback visuel**
- Highlight de la drop zone
- Curseur approprié
- Indicateur de drag en cours

### 6.6 Phase 6: Styling et responsive (2-3h)

**Étape 6.1 - Styles personnalisés**
- Largeur de sidebar augmentée
- Espacements et paddings optimisés
- Couleurs et contraste (mode clair/sombre)
- Transitions et animations

**Étape 6.2 - Mode sombre**
- Test et ajustements pour dark mode
- Vérification des contrastes
- Icônes et séparateurs visibles

**Étape 6.3 - Responsive mobile**
- Adaptation pour écrans < 768px
- Sidebar en Sheet (drawer) sur mobile
- Bouton toggle pour ouvrir/fermer

### 6.7 Phase 7: Tests et intégration (2-3h)

**Étape 7.1 - Intégration dans EditorLayout**
- Remplacement de `<FileSidebar>` par `<EnhancedSidebar>`
- Vérification des props
- Test de tous les workflows

**Étape 7.2 - Tests fonctionnels**
- Test de chaque fonctionnalité CRUD
- Test du drag & drop
- Test de la recherche
- Test des fichiers récents
- Test du responsive

**Étape 7.3 - Optimisations**
- Performance (useMemo, useCallback)
- Bundle size
- Accessibilité (ARIA labels)

**Étape 7.4 - Documentation**
- Commentaires dans le code
- Mise à jour du CLAUDE.md si nécessaire

### 6.8 Phase 8: Nettoyage (1h)

- Suppression de l'ancienne sidebar
- Suppression des fichiers inutilisés
- Commit Git propre
- Mise à jour des documentations d'analyse

---

## 7. Défis et solutions

### 7.1 Largeur personnalisée de la sidebar

**Défi:** Les sidebars shadcn ont une largeur standard (240-280px)

**Solution:**
```tsx
<Sidebar className="w-80 lg:w-96">
  {/* w-80 = 320px, w-96 = 384px */}
</Sidebar>
```

### 7.2 Performance avec de nombreux fichiers

**Défi:** Ralentissement avec des centaines de fichiers

**Solutions:**
1. **Virtualisation:** Utiliser `react-window` ou `@tanstack/react-virtual`
2. **Lazy loading:** Charger les dossiers à la demande
3. **Memoization:** useMemo pour fileTree et filteredFiles
4. **Debounce:** Pour la recherche

```tsx
const debouncedSearch = useMemo(
  () => debounce((value: string) => setSearch(value), 300),
  []
);
```

### 7.3 Gestion de l'état expanded/collapsed

**Défi:** Persistance de l'état des dossiers ouverts

**Solution 1:** État local simple
```tsx
const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
```

**Solution 2:** Persistance localStorage
```tsx
useEffect(() => {
  const saved = localStorage.getItem('mdparadise-expanded-folders');
  if (saved) {
    setExpandedFolders(new Set(JSON.parse(saved)));
  }
}, []);

useEffect(() => {
  localStorage.setItem(
    'mdparadise-expanded-folders',
    JSON.stringify([...expandedFolders])
  );
}, [expandedFolders]);
```

### 7.4 Menu contextuel sur mobile

**Défi:** Clic droit non disponible sur mobile

**Solutions:**
1. **Long press:** Détection de `onTouchStart` + timeout
2. **Bouton d'options:** Icône "..." à côté de chaque item
3. **Swipe actions:** Actions par glissement (complexe)

**Recommandation:** Option 2 (bouton "...") pour simplicité

### 7.5 Drag & drop responsive

**Défi:** Drag & drop difficile sur mobile

**Solution:**
- Désactiver sur mobile (< 768px)
- Alternative: boutons "Move to..." dans le menu contextuel

### 7.6 Synchronisation avec le backend

**Défi:** Fichiers créés/supprimés en dehors de l'app non détectés

**Solution actuelle:** Auto-refresh toutes les 5 secondes (déjà implémenté)
```tsx
// Dans EditorLayout.tsx:85-92
useEffect(() => {
  const interval = setInterval(() => {
    loadFiles();
  }, 5000);
  return () => clearInterval(interval);
}, [loadFiles]);
```

**Alternative:** WebSocket ou Server-Sent Events pour push en temps réel

---

## 8. Estimation et conclusion

### 8.1 Estimation de temps

| Phase | Description | Temps estimé |
|-------|-------------|--------------|
| Phase 1 | Préparation | 1-2h |
| Phase 2 | Composants de base | 3-4h |
| Phase 3 | Arborescence | 4-5h |
| Phase 4 | Menu contextuel et CRUD | 3-4h |
| Phase 5 | Drag & Drop | 2-3h |
| Phase 6 | Styling et responsive | 2-3h |
| Phase 7 | Tests et intégration | 2-3h |
| Phase 8 | Nettoyage | 1h |
| **TOTAL** | | **18-25h** |

### 8.2 Priorités

**Priorité HAUTE (MVP):**
1. ✅ Structure de base (EnhancedSidebar, Header, Search, FileTree)
2. ✅ Arborescence collapsible
3. ✅ Menu contextuel avec CRUD
4. ✅ Intégration API

**Priorité MOYENNE:**
1. Drag & Drop
2. Fichiers récents
3. Styling avancé

**Priorité BASSE (nice-to-have):**
1. Virtualisation pour performance
2. Persistance de l'état expanded
3. Animations sophistiquées
4. WebSocket pour sync temps réel

### 8.3 Recommandations

1. **Approche incrémentale:** Implémenter phase par phase avec tests intermédiaires
2. **Réutilisation:** Réutiliser au maximum le code existant (tree-utils, apiClient)
3. **Référence shadcn:** S'inspirer fortement de `sidebar-11` pour la structure
4. **Mobile-first:** Penser responsive dès le début
5. **Accessibilité:** Ajouter les ARIA labels dès l'implémentation

### 8.4 Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|---------|------------|
| Performance avec nombreux fichiers | Moyenne | Élevé | Virtualisation / Lazy loading |
| Complexité du drag & drop | Faible | Moyen | Réutiliser code existant |
| Conflits CSS avec shadcn | Faible | Faible | Tester tôt, utiliser cn() |
| Régression fonctionnelle | Moyenne | Élevé | Tests exhaustifs avant merge |

### 8.5 Conclusion

La refonte de la sidebar avec shadcn/ui est **techniquement faisable** et **bien cadrée**. L'architecture proposée réutilise au maximum l'existant tout en apportant:

✅ **Modernité:** Design shadcn/ui cohérent
✅ **Fonctionnalité:** Toutes les features demandées
✅ **Maintenabilité:** Code structuré et typé
✅ **Performance:** Optimisations dès le départ
✅ **UX:** Navigation fluide et intuitive

**Prochaine étape recommandée:** Valider le design visuel (mockup/wireframe) avant de démarrer l'implémentation.

---

## 9. Annexes

### 9.1 Exemple de structure finale

```tsx
<EnhancedSidebar className="w-80">
  <SidebarHeader>
    <Logo />
    <Title>MDParadise</Title>
    <BaseDir>{baseDir}</BaseDir>
  </SidebarHeader>

  <SidebarContent>
    <SidebarRecentFiles
      files={recentFiles}
      currentFile={currentFile}
      onSelect={onFileSelect}
    />

    <Separator />

    <SidebarSearch
      value={search}
      onChange={setSearch}
      placeholder="Search files..."
    />

    <Separator />

    <SidebarFileTree
      tree={fileTree}
      currentFile={currentFile}
      onFileSelect={onFileSelect}
      onRename={handleRename}
      onDelete={handleDelete}
      onCreate={handleCreate}
    />
  </SidebarContent>
</EnhancedSidebar>
```

### 9.2 Commandes shadcn/ui à exécuter

```bash
# Navigation vers le dossier frontend
cd frontend

# Installation des composants nécessaires
npx shadcn@latest add collapsible
npx shadcn@latest add context-menu
npx shadcn@latest add dialog
npx shadcn@latest add separator
npx shadcn@latest add tooltip

# Vérifier les composants déjà installés
ls components/ui/
```

### 9.3 Ressources et références

**Documentation shadcn/ui:**
- [Sidebar component](https://ui.shadcn.com/docs/components/sidebar)
- [Collapsible](https://ui.shadcn.com/docs/components/collapsible)
- [Context Menu](https://ui.shadcn.com/docs/components/context-menu)
- [Dialog](https://ui.shadcn.com/docs/components/dialog)

**Exemples shadcn:**
- [sidebar-11](https://ui.shadcn.com/blocks#sidebar-11) - Sidebar with file tree
- [context-menu-demo](https://ui.shadcn.com/examples/context-menu)

**Icônes lucide-react:**
- [Lucide icons](https://lucide.dev/icons/)

---

**Document généré le:** 31 Octobre 2025
**Auteur:** Claude Code
**Version:** 1.0
