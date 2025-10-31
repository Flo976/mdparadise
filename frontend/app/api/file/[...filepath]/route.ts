import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Fonction pour vérifier la sécurité du chemin (éviter path traversal)
function isPathSafe(baseDir: string, filePath: string): boolean {
  const resolvedPath = path.resolve(baseDir, filePath);
  return resolvedPath.startsWith(baseDir);
}

// Validation des noms de fichiers
const INVALID_CHARS = /[<>:"|?*\x00-\x1F]/g;
const RESERVED_NAMES_WINDOWS = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];

function isValidFilename(filename: string): { valid: boolean; error?: string } {
  if (!filename || filename.trim().length === 0) {
    return { valid: false, error: 'Filename cannot be empty' };
  }

  if (filename.length > 255) {
    return { valid: false, error: 'Filename too long (max 255 characters)' };
  }

  if (INVALID_CHARS.test(filename)) {
    return { valid: false, error: 'Filename contains invalid characters' };
  }

  if (filename === '.' || filename === '..') {
    return { valid: false, error: 'Invalid filename' };
  }

  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
  if (RESERVED_NAMES_WINDOWS.includes(nameWithoutExt.toUpperCase())) {
    return { valid: false, error: 'Reserved filename' };
  }

  return { valid: true };
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

// DELETE - Supprimer un fichier
export async function DELETE(
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
      const stats = await fs.stat(fullPath);
      if (!stats.isFile()) {
        return NextResponse.json(
          { success: false, error: 'Not a file' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Supprimer le fichier
    await fs.unlink(fullPath);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT - Renommer ou déplacer un fichier
export async function PUT(
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

    // Récupérer le nouveau chemin depuis le body
    const body = await request.json();
    const newPath = body.newPath;

    if (!newPath) {
      return NextResponse.json(
        { success: false, error: 'New path is required' },
        { status: 400 }
      );
    }

    // Validation du nouveau nom de fichier
    const newFilename = path.basename(newPath);
    const validation = isValidFilename(newFilename);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const newFullPath = path.join(baseDir, newPath);

    // Vérification de sécurité pour le nouveau chemin
    if (!isPathSafe(baseDir, newPath)) {
      return NextResponse.json(
        { success: false, error: 'Access denied for new path' },
        { status: 403 }
      );
    }

    // Vérifier que le fichier source existe
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isFile()) {
        return NextResponse.json(
          { success: false, error: 'Source is not a file' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Source file not found' },
        { status: 404 }
      );
    }

    // Vérifier que le fichier de destination n'existe pas déjà
    try {
      await fs.access(newFullPath);
      return NextResponse.json(
        { success: false, error: 'Destination file already exists' },
        { status: 409 }
      );
    } catch {
      // C'est OK, le fichier n'existe pas
    }

    // Créer les dossiers parents si nécessaire
    const newDirPath = path.dirname(newFullPath);
    await fs.mkdir(newDirPath, { recursive: true });

    // Renommer/déplacer le fichier
    await fs.rename(fullPath, newFullPath);

    return NextResponse.json({
      success: true,
      message: 'File renamed/moved successfully',
      newPath,
    });
  } catch (error) {
    console.error('Error renaming/moving file:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
