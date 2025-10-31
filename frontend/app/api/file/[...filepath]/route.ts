import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Fonction pour vérifier la sécurité du chemin (éviter path traversal)
function isPathSafe(baseDir: string, filePath: string): boolean {
  const resolvedPath = path.resolve(baseDir, filePath);
  return resolvedPath.startsWith(baseDir);
}

// GET - Lire un fichier
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filepath: string[] }> }
) {
  try {
    const baseDir = process.env.MDPARADISE_BASE_DIR || process.cwd();
    const resolvedParams = await params;
    const filepath = resolvedParams.filepath.join('/');
    const fullPath = path.join(baseDir, filepath);

    // Vérification de sécurité
    if (!isPathSafe(baseDir, filepath)) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Vérifier que le fichier existe
    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Lire le contenu
    const content = await fs.readFile(fullPath, 'utf-8');

    // Pour l'instant, on ne fait pas de rendu HTML côté serveur
    // Le frontend utilise marked.js pour le rendu
    return NextResponse.json({
      success: true,
      content,
      html: '', // Le rendu HTML sera fait côté client
      path: filepath,
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - Sauvegarder un fichier
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ filepath: string[] }> }
) {
  try {
    const baseDir = process.env.MDPARADISE_BASE_DIR || process.cwd();
    const resolvedParams = await params;
    const filepath = resolvedParams.filepath.join('/');
    const fullPath = path.join(baseDir, filepath);

    // Vérification de sécurité
    if (!isPathSafe(baseDir, filepath)) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Récupérer le contenu depuis le body
    const body = await request.json();
    const content = body.content || '';

    // Créer les dossiers parents si nécessaire
    const dirPath = path.dirname(fullPath);
    await fs.mkdir(dirPath, { recursive: true });

    // Écrire le fichier
    await fs.writeFile(fullPath, content, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'File saved successfully',
    });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
