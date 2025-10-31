import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface SearchMatch {
  lineNumber: number;
  content: string;
  startIndex: number;
  endIndex: number;
}

interface SearchResult {
  file: {
    name: string;
    path: string;
    dir: string;
  };
  matches: SearchMatch[];
}

// Dossiers à ignorer
const IGNORED_DIRS = ['.git', 'node_modules', '__pycache__', '.venv', 'venv', '.next', 'dist', 'build'];

// Fonction pour extraire un snippet avec contexte
function extractSnippet(line: string, searchTerm: string, contextChars = 50): { content: string; startIndex: number; endIndex: number } {
  const lowerLine = line.toLowerCase();
  const lowerTerm = searchTerm.toLowerCase();
  const matchIndex = lowerLine.indexOf(lowerTerm);

  if (matchIndex === -1) {
    return { content: line.substring(0, 100), startIndex: 0, endIndex: 0 };
  }

  // Calculer les positions de début et fin avec contexte
  const start = Math.max(0, matchIndex - contextChars);
  const end = Math.min(line.length, matchIndex + searchTerm.length + contextChars);

  let snippet = line.substring(start, end);

  // Ajouter des ellipses si nécessaire
  if (start > 0) snippet = '...' + snippet;
  if (end < line.length) snippet = snippet + '...';

  // Calculer la position relative du match dans le snippet
  const snippetMatchStart = (start > 0 ? 3 : 0) + (matchIndex - start);
  const snippetMatchEnd = snippetMatchStart + searchTerm.length;

  return {
    content: snippet,
    startIndex: snippetMatchStart,
    endIndex: snippetMatchEnd
  };
}

// Fonction pour rechercher dans un fichier
async function searchInFile(filePath: string, searchTerm: string, maxMatches = 3): Promise<SearchMatch[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const matches: SearchMatch[] = [];
    const lowerTerm = searchTerm.toLowerCase();

    for (let i = 0; i < lines.length && matches.length < maxMatches; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes(lowerTerm)) {
        const snippet = extractSnippet(line, searchTerm);
        matches.push({
          lineNumber: i + 1,
          content: snippet.content,
          startIndex: snippet.startIndex,
          endIndex: snippet.endIndex
        });
      }
    }

    return matches;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return [];
  }
}

// Fonction pour parcourir récursivement les fichiers markdown
async function searchInDirectory(baseDir: string, searchTerm: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

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
          const matches = await searchInFile(fullPath, searchTerm);

          if (matches.length > 0) {
            const relativePath = path.relative(baseDir, fullPath);
            const dirName = path.dirname(relativePath);

            results.push({
              file: {
                name: entry.name,
                path: relativePath,
                dir: dirName === '.' ? '.' : dirName
              },
              matches
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }
  }

  await walkDir(baseDir);
  return results;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Le terme de recherche doit contenir au moins 2 caractères',
      }, { status: 400 });
    }

    const baseDir = process.env.MDPARADISE_BASE_DIR || process.cwd();

    // Rechercher dans les fichiers avec timeout de 5 secondes
    const timeoutPromise = new Promise<SearchResult[]>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout de recherche dépassé')), 5000);
    });

    const searchPromise = searchInDirectory(baseDir, query.trim());

    const results = await Promise.race([searchPromise, timeoutPromise]);

    return NextResponse.json({
      success: true,
      results,
      query: query.trim(),
      count: results.length,
    });
  } catch (error) {
    console.error('Error searching files:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
