import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Fonction pour vérifier la sécurité du chemin (éviter path traversal)
function isPathSafe(baseDir: string, filePath: string): boolean {
  const resolvedPath = path.resolve(baseDir, filePath);
  return resolvedPath.startsWith(baseDir);
}

// POST - Créer un fichier ou un dossier
export async function POST(request: NextRequest) {
  try {
    const baseDir = process.env.MDPARADISE_BASE_DIR || process.cwd();
    const body = await request.json();
    const { type, name, directory } = body;

    if (!type || !name) {
      return NextResponse.json(
        { success: false, error: 'Type et nom requis' },
        { status: 400 }
      );
    }

    // Construire le chemin complet
    const relativePath = directory ? path.join(directory, name) : name;
    const fullPath = path.join(baseDir, relativePath);

    // Vérification de sécurité
    if (!isPathSafe(baseDir, relativePath)) {
      return NextResponse.json(
        { success: false, error: 'Accès refusé' },
        { status: 403 }
      );
    }

    // Vérifier que le fichier/dossier n'existe pas déjà
    try {
      await fs.access(fullPath);
      return NextResponse.json(
        { success: false, error: 'Un fichier ou dossier avec ce nom existe déjà' },
        { status: 409 }
      );
    } catch {
      // Le fichier n'existe pas, on peut continuer
    }

    if (type === 'file') {
      // Créer les dossiers parents si nécessaire
      const dirPath = path.dirname(fullPath);
      await fs.mkdir(dirPath, { recursive: true });

      // Template markdown de base
      const fileName = path.basename(name, '.md');
      const template = `# ${fileName}

> Document créé le ${new Date().toLocaleDateString('fr-FR')}

## 📝 Description

Ajoutez ici une description de votre document.

## ✅ Checklist

- [ ] Tâche 1
- [ ] Tâche 2
- [ ] Tâche 3

## 📌 Notes

Ajoutez vos notes ici.

## 🔗 Liens utiles

- [Exemple de lien](https://exemple.com)

## 💡 Idées

- Point 1
- Point 2
- Point 3

---

*Dernière modification : ${new Date().toLocaleDateString('fr-FR')}*
`;

      // Créer le fichier avec le template
      await fs.writeFile(fullPath, template, 'utf-8');

      return NextResponse.json({
        success: true,
        message: 'Fichier créé avec succès',
        path: relativePath,
      });
    } else if (type === 'folder') {
      // Créer le dossier
      await fs.mkdir(fullPath, { recursive: true });

      return NextResponse.json({
        success: true,
        message: 'Dossier créé avec succès',
        path: relativePath,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Type invalide (file ou folder)' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating file/folder:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
