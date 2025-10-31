import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const BASE_DIR = process.env.MDPARADISE_BASE_DIR || process.cwd();

function isPathSafe(filepath: string): boolean {
  const fullPath = path.resolve(BASE_DIR, filepath);
  const baseDir = path.resolve(BASE_DIR);
  return fullPath.startsWith(baseDir);
}

export async function POST(request: NextRequest) {
  try {
    const { sourcePath, destinationPath } = await request.json();

    if (!sourcePath || !destinationPath) {
      return NextResponse.json(
        { success: false, error: "Source and destination paths are required" },
        { status: 400 }
      );
    }

    // Validate both paths
    if (!isPathSafe(sourcePath) || !isPathSafe(destinationPath)) {
      return NextResponse.json(
        { success: false, error: "Invalid file path" },
        { status: 403 }
      );
    }

    const sourceFullPath = path.join(BASE_DIR, sourcePath);
    const destFullPath = path.join(BASE_DIR, destinationPath);

    // Check if source exists
    try {
      await fs.access(sourceFullPath);
    } catch {
      return NextResponse.json(
        { success: false, error: "Source file not found" },
        { status: 404 }
      );
    }

    // Create destination directory if it doesn't exist
    const destDir = path.dirname(destFullPath);
    await fs.mkdir(destDir, { recursive: true });

    // Move the file
    await fs.rename(sourceFullPath, destFullPath);

    return NextResponse.json({
      success: true,
      newPath: destinationPath,
    });
  } catch (error) {
    console.error("Move error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to move file",
      },
      { status: 500 }
    );
  }
}
