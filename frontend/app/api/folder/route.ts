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

// POST - Créer un nouveau dossier
export async function POST(request: NextRequest) {
  try {
    const baseDir = process.env.MDPARADISE_BASE_DIR || process.cwd();
    const body = await request.json();
    const folderPath = body.path;

    if (!folderPath) {
      return NextResponse.json(
        { success: false, error: 'Folder path is required' },
        { status: 400 }
      );
    }

    // Vérification de sécurité
    if (!isPathSafe(baseDir, folderPath)) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Valider le nom du dossier
    const folderName = path.basename(folderPath);
    const validation = isValidFoldername(folderName);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const fullPath = path.join(baseDir, folderPath);

    // Vérifier si le dossier existe déjà
    try {
      await fs.access(fullPath);
      return NextResponse.json(
        { success: false, error: 'Folder already exists' },
        { status: 409 }
      );
    } catch {
      // C'est OK, le dossier n'existe pas
    }

    // Créer le dossier
    await fs.mkdir(fullPath, { recursive: true });

    return NextResponse.json({
      success: true,
      message: 'Folder created successfully',
      path: folderPath,
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
