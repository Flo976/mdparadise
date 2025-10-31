import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface MarkdownFile {
  name: string;
  path: string;
  dir: string;
  size: number;
  mtime: number;
  type?: 'file' | 'directory';
}

// Dossiers à ignorer
const IGNORED_DIRS = ['.git', 'node_modules', '__pycache__', '.venv', 'venv', '.next', 'dist', 'build'];

async function getAllMarkdownFiles(baseDir: string): Promise<MarkdownFile[]> {
  const files: MarkdownFile[] = [];
  const directories = new Set<string>();

  async function walkDir(dir: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);

        if (entry.isDirectory()) {
          // Ignorer les dossiers spéciaux
          if (!IGNORED_DIRS.includes(entry.name) && !entry.name.startsWith('.')) {
            // Ajouter le dossier à la liste
            directories.add(relativePath);
            await walkDir(fullPath);
          }
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          const stats = await fs.stat(fullPath);
          const dirName = path.dirname(relativePath);

          files.push({
            name: entry.name,
            path: relativePath,
            dir: dirName === '.' ? '.' : dirName,
            size: stats.size,
            mtime: stats.mtimeMs,
            type: 'file',
          });
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }
  }

  await walkDir(baseDir);

  // Ajouter les dossiers comme entrées virtuelles
  for (const dirPath of directories) {
    const dirName = path.basename(dirPath);
    const parentDir = path.dirname(dirPath);

    files.push({
      name: dirName,
      path: dirPath,
      dir: parentDir === '.' ? '.' : parentDir,
      size: 0,
      mtime: Date.now(),
      type: 'directory',
    });
  }

  return files.sort((a, b) => a.path.localeCompare(b.path));
}

export async function GET(request: NextRequest) {
  try {
    // Récupérer le répertoire de base depuis les variables d'environnement
    const baseDir = process.env.MDPARADISE_BASE_DIR || process.cwd();

    const files = await getAllMarkdownFiles(baseDir);

    return NextResponse.json({
      success: true,
      files,
      base_dir: baseDir,
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
