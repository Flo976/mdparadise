import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Fonction pour vérifier la sécurité du chemin
function isPathSafe(baseDir: string, filePath: string): boolean {
  const resolvedPath = path.resolve(baseDir, filePath);
  return resolvedPath.startsWith(baseDir);
}

// Validation des noms de dossiers
const INVALID_CHARS = /[<>:"|?*\x00-\x1F]/g;
const RESERVED_NAMES_WINDOWS = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
const PROTECTED_DIRS = ['.git', 'node_modules', '.next', 'dist', 'build', '.venv', 'venv'];

function isValidFoldername(foldername: string): { valid: boolean; error?: string } {
  if (!foldername || foldername.trim().length === 0) {
    return { valid: false, error: 'Folder name cannot be empty' };
  }

  if (foldername.length > 255) {
    return { valid: false, error: 'Folder name too long (max 255 characters)' };
  }

  if (INVALID_CHARS.test(foldername)) {
    return { valid: false, error: 'Folder name contains invalid characters' };
  }

  if (foldername === '.' || foldername === '..') {
    return { valid: false, error: 'Invalid folder name' };
  }

  if (RESERVED_NAMES_WINDOWS.includes(foldername.toUpperCase())) {
    return { valid: false, error: 'Reserved folder name' };
  }

  return { valid: true };
}

// Vérifier si un chemin est protégé
function isProtectedPath(folderPath: string): boolean {
  const parts = folderPath.split(path.sep);
  return PROTECTED_DIRS.some(protectedDir => parts.includes(protectedDir));
}

// Compter récursivement les fichiers et dossiers
async function countFolderContents(dirPath: string): Promise<{ filesCount: number; foldersCount: number }> {
  let filesCount = 0;
  let foldersCount = 0;

  async function walk(dir: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          foldersCount++;
          await walk(fullPath);
        } else {
          filesCount++;
        }
      }
    } catch (error) {
      console.error(`Error walking directory ${dir}:`, error);
    }
  }

  await walk(dirPath);
  return { filesCount, foldersCount };
}

// DELETE - Supprimer un dossier
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const baseDir = process.env.MDPARADISE_BASE_DIR || process.cwd();
    const resolvedParams = await params;
    const folderPath = resolvedParams.path.join('/');
    const fullPath = path.join(baseDir, folderPath);

    // Vérification de sécurité
    if (!isPathSafe(baseDir, folderPath)) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Vérifier si le chemin est protégé
    if (isProtectedPath(folderPath)) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete protected directory' },
        { status: 403 }
      );
    }

    // Vérifier que le dossier existe
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isDirectory()) {
        return NextResponse.json(
          { success: false, error: 'Not a directory' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Folder not found' },
        { status: 404 }
      );
    }

    // Compter le contenu avant suppression
    const { filesCount, foldersCount } = await countFolderContents(fullPath);

    // Supprimer le dossier de manière récursive
    await fs.rm(fullPath, { recursive: true, force: true });

    return NextResponse.json({
      success: true,
      message: 'Folder deleted successfully',
      filesDeleted: filesCount,
      foldersDeleted: foldersCount,
    });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT - Renommer ou déplacer un dossier
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const baseDir = process.env.MDPARADISE_BASE_DIR || process.cwd();
    const resolvedParams = await params;
    const folderPath = resolvedParams.path.join('/');
    const fullPath = path.join(baseDir, folderPath);

    // Vérification de sécurité
    if (!isPathSafe(baseDir, folderPath)) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Vérifier si le chemin est protégé
    if (isProtectedPath(folderPath)) {
      return NextResponse.json(
        { success: false, error: 'Cannot rename/move protected directory' },
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

    // Validation du nouveau nom de dossier
    const newFoldername = path.basename(newPath);
    const validation = isValidFoldername(newFoldername);
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

    // Vérifier que le dossier source existe
    try {
      const stats = await fs.stat(fullPath);
      if (!stats.isDirectory()) {
        return NextResponse.json(
          { success: false, error: 'Source is not a directory' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Source folder not found' },
        { status: 404 }
      );
    }

    // Vérifier que le dossier de destination n'existe pas déjà
    try {
      await fs.access(newFullPath);
      return NextResponse.json(
        { success: false, error: 'Destination folder already exists' },
        { status: 409 }
      );
    } catch {
      // C'est OK, le dossier n'existe pas
    }

    // Créer le dossier parent si nécessaire
    const newParentPath = path.dirname(newFullPath);
    await fs.mkdir(newParentPath, { recursive: true });

    // Renommer/déplacer le dossier
    await fs.rename(fullPath, newFullPath);

    return NextResponse.json({
      success: true,
      message: 'Folder renamed/moved successfully',
      newPath,
    });
  } catch (error) {
    console.error('Error renaming/moving folder:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
