#!/usr/bin/env node

const { program } = require('commander');
const { spawn } = require('child_process');
const path = require('path');
const { exec } = require('child_process');
const net = require('net');

// Function to open URL in browser
function openBrowser(url) {
  const platform = process.platform;
  let command;

  if (platform === 'darwin') {
    command = `open "${url}"`;
  } else if (platform === 'win32') {
    command = `start "" "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  exec(command, (err) => {
    if (err) {
      console.log(`Please open ${url} in your browser`);
    }
  });
}

// Check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(true);
    });

    server.listen(port);
  });
}

// Find the next available port
async function findAvailablePort(startPort, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    const available = await isPortAvailable(port);
    if (available) {
      if (i > 0) {
        console.log(`⚠️  Port ${startPort} is in use, using port ${port} instead`);
      }
      return port;
    }
  }
  throw new Error(`Could not find an available port after ${maxAttempts} attempts starting from ${startPort}`);
}

program
  .name('mdparadise')
  .description('Beautiful Markdown editor with live preview')
  .version('2.0.0')
  .argument('[directory]', 'Directory to serve', process.cwd())
  .option('-p, --port <port>', 'Port number', '4445')
  .option('--no-open', 'Do not open browser automatically')
  .action(async (directory, options) => {
    const baseDir = path.resolve(directory);
    const requestedPort = parseInt(options.port);

    console.log('');
    console.log('======================================');
    console.log('📝 MDParadise - Starting...');
    console.log('======================================');
    console.log('');
    console.log(`📁 Directory: ${baseDir}`);
    console.log('');

    // Find available port
    let port;
    try {
      port = await findAvailablePort(requestedPort);
      console.log(`🌐 Port: ${port}`);
      console.log('');
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
      process.exit(1);
    }

    // Set environment variables
    process.env.MDPARADISE_BASE_DIR = baseDir;
    process.env.PORT = port.toString();

    // Start Next.js server
    const isWindows = process.platform === 'win32';
    const nextCommand = isWindows ? 'next.cmd' : 'next';
    const nextBinPath = path.join(__dirname, '..', 'node_modules', '.bin');

    const nextProcess = spawn(nextCommand, ['dev', '-p', port.toString()], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: {
        ...process.env,
        PATH: `${nextBinPath}${path.delimiter}${process.env.PATH}`
      },
      shell: isWindows, // Use shell on Windows to handle .cmd files
    });

    nextProcess.on('error', (err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });

    // Open browser after a delay
    if (options.open) {
      setTimeout(() => {
        const url = `http://localhost:${port}`;
        console.log('');
        console.log(`🚀 Opening ${url} in your browser...`);
        openBrowser(url);
      }, 3000);
    }

    // Handle termination
    process.on('SIGINT', () => {
      console.log('');
      console.log('Stopping MDParadise...');
      nextProcess.kill();
      process.exit(0);
    });
  });

program.parse();
