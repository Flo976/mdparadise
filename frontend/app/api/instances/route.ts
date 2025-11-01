import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

interface Instance {
  port: number;
  baseDir: string;
  url: string;
  isCurrent: boolean;
}

export async function GET() {
  try {
    const currentPort = parseInt(process.env.PORT || '3000');
    const currentBaseDir = process.env.MDPARADISE_BASE_DIR || process.cwd();

    // Find all running Next.js dev processes
    let processes: Instance[] = [];

    try {
      // Linux/macOS: use ps and grep
      const { stdout } = await execAsync('ps aux | grep "next dev" | grep -v grep || true');

      const lines = stdout.trim().split('\n').filter(line => line.trim());

      for (const line of lines) {
        // Extract port from command line: "next dev -p 4445"
        const portMatch = line.match(/next dev -p (\d+)/);
        if (portMatch) {
          const port = parseInt(portMatch[1]);

          // Try to detect base directory from the process
          // This is a simplification - in practice, we need to query each instance
          processes.push({
            port,
            baseDir: '', // Will be populated by querying each instance
            url: `http://localhost:${port}`,
            isCurrent: port === currentPort
          });
        }
      }
    } catch (err) {
      // On Windows or if ps fails, try alternative method
      console.error('Failed to detect processes:', err);
    }

    // If we couldn't detect any processes but we know we're running, add ourselves
    if (processes.length === 0) {
      processes.push({
        port: currentPort,
        baseDir: currentBaseDir,
        url: `http://localhost:${currentPort}`,
        isCurrent: true
      });
    }

    // Try to fetch base directory from each instance
    const instancesWithInfo = await Promise.all(
      processes.map(async (instance) => {
        if (instance.isCurrent) {
          return {
            ...instance,
            baseDir: currentBaseDir
          };
        }

        try {
          // Try to fetch the base directory from the instance's API
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 500);

          const response = await fetch(`http://localhost:${instance.port}/api/files`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            return {
              ...instance,
              baseDir: data.base_dir || ''
            };
          }
        } catch (err) {
          // Instance might not be responding or might not be MDParadise
          console.error(`Failed to fetch info from port ${instance.port}:`, err);
        }

        return instance;
      })
    );

    // Filter out instances that don't have a baseDir (not MDParadise instances)
    const mdParadiseInstances = instancesWithInfo.filter(
      instance => instance.baseDir || instance.isCurrent
    );

    return NextResponse.json({
      success: true,
      instances: mdParadiseInstances,
      currentPort
    });
  } catch (error) {
    console.error('Error detecting instances:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to detect instances' },
      { status: 500 }
    );
  }
}
