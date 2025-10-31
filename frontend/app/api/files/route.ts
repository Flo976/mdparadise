import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface MarkdownFile {
  name: string;
  path: string;
  dir: string;
  size: number;
  mtime: number;
}

// Dossiers à ignorer
const IGNORED_DIRS = ['.git', 'node_modules', '__pycache__', '.venv', 'venv', '.next', 'dist', 'build'];

async function getAllMarkdownFiles(baseDir: string): Promise<MarkdownFile[]> {
  const files: MarkdownFile[] = [];

  async function walkDir(dir: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Ignorer les dossiers spéciaux
          if (!IGNORED_DIRS.includes(entry.name) && !entry.name.startsWith('.')) {
            await walkDir(fullPath);
          }
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          const stats = await fs.stat(fullPath);
          const relativePath = path.relative(baseDir, fullPath);
          const dirName = path.dirname(relativePath);

          files.push({
            name: entry.name,
            path: relativePath,
            dir: dirName === '.' ? '.' : dirName,
            size: stats.size,
            mtime: stats.mtimeMs,
          });
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }
  }

  await walkDir(baseDir);
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
