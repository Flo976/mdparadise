# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MDParadise is a Next.js-based markdown editor with live preview, WYSIWYG editing, and a modern UI. It's distributed as a global npm CLI tool that can be launched from any directory to browse and edit markdown files in that location.

## Architecture

### Technology Stack

- **Next.js 16** (App Router) - Server framework
- **React 19** with TypeScript - UI framework
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI components
- **CodeMirror** - Code editor with One Dark theme
- **marked.js** - Markdown parsing and rendering
- **Commander** - CLI argument parsing

### Core Architecture

```
CLI (bin/mdparadise.js)
  ↓ spawns
Next.js Dev Server
  ↓ serves
React App (app/page.tsx → EditorLayout)
  ↓ uses
API Routes (app/api/files, app/api/file/[...filepath])
  ↓ access
Node.js fs module (filesystem operations)
```

The application uses `MDPARADISE_BASE_DIR` environment variable to determine which directory to serve files from. This is set by the CLI entry point based on the directory argument.

### Key Components

**bin/mdparadise.js** - CLI entry point
- Parses command-line arguments (directory, port, --no-open)
- Detects available port (tries 4445, then increments if busy)
- Sets `MDPARADISE_BASE_DIR` and `PORT` environment variables
- Spawns Next.js dev server
- Opens browser automatically after 3-second delay (unless --no-open)

**app/api/files/route.ts** - File listing endpoint
- Recursively scans `MDPARADISE_BASE_DIR` for .md files
- Ignores: .git, node_modules, __pycache__, .venv, venv, .next, dist, build, and hidden directories
- Returns file metadata (name, path, dir, size, mtime)

**app/api/file/[...filepath]/route.ts** - File read/write endpoint
- GET: Returns file content
- POST: Saves file content
- Path traversal protection via `isPathSafe()` check

**components/markdown-editor/editor-layout.tsx** - Main UI component
- Manages application state (files list, current file, content, view mode)
- Auto-refreshes file list every 5 seconds
- Desktop: sidebar + resizable panels (editor/preview)
- Mobile: preview-only mode with menu sheet
- State persistence via localStorage (remembers last file and view mode)
- Unsaved changes warning
- Three view modes: both, editor-only, preview-only

**components/markdown-editor/editor.tsx** - CodeMirror editor
- Uses @uiw/react-codemirror with @codemirror/lang-markdown
- One Dark theme
- Ctrl+S / Cmd+S to save

**components/markdown-editor/preview.tsx** - Read-only markdown preview
- Uses marked.js for rendering
- GitHub markdown CSS styling
- Anchor navigation support
- Copy button on code blocks

**components/markdown-editor/wysiwyg-editor.tsx** - Editable preview
- Contenteditable-based visual editor
- Converts changes back to markdown on blur/input

## Development Commands

### Initial Setup

```bash
# Clone and install dependencies
git clone https://github.com/Flo976/mdparadise.git
cd mdparadise/frontend
npm install
```

### Build and Install CLI

**Linux/macOS:**
```bash
# From project root
./build-cli.sh        # Cleans .next, runs npm build
cd frontend
npm link              # Makes 'mdparadise' command available globally
```

**Windows:**
```powershell
.\build-cli.ps1       # Cleans .next, runs npm install + build
cd frontend
npm link
```

Note: `build-cli.sh` uses sudo to remove .next directory due to permission issues.

### Development Mode

```bash
cd frontend
npm run dev                                          # Starts dev server on port 3000
MDPARADISE_BASE_DIR=~/Documents/notes npm run dev   # Custom base directory
```

### Launch CLI

```bash
mdparadise                    # Launch in current directory
mdparadise ~/path/to/notes    # Launch in specific directory
mdparadise --port 3000        # Custom port
mdparadise --no-open          # Don't auto-open browser
```

### Uninstall

```bash
cd frontend
npm unlink
```

## Important Implementation Details

### Port Detection

The CLI automatically finds available ports by testing from 4445 upward. This allows multiple instances to run simultaneously without port conflicts. See `findAvailablePort()` in bin/mdparadise.js:52-64.

### Security Model

- Path traversal protection in API routes via `isPathSafe()` check
- Only allows access to files within `MDPARADISE_BASE_DIR` and subdirectories
- Returns 403 Forbidden for paths outside base directory

### State Persistence

The application saves editor state to localStorage (lib/persistence.ts):
- Last opened file path
- View mode (both/editor/preview)
- WYSIWYG edit state
- Base directory (to ensure state is only restored for same directory)

State is restored once on app load if the base directory matches.

### Mobile Responsiveness

The UI detects viewport width < 768px and switches to mobile mode:
- Forces preview-only view (no editor)
- Sidebar becomes a slide-in Sheet
- Hides desktop-only controls (save button, view toggle, edit preview button)

### File Auto-Refresh

The file list auto-refreshes every 5 seconds to detect new files without requiring page reload (editor-layout.tsx:86-92).

### Keyboard Shortcuts

- **Ctrl+S / Cmd+S**: Save current file
- **Ctrl+F / Cmd+F**: Search in editor (CodeMirror built-in)

### WYSIWYG Editor

When "Edit Preview" is clicked, the preview becomes contenteditable. Changes are converted back to markdown via:
- Headings: Parse text content and leading # characters
- Lists: Detect ul/ol structure and convert to - or 1. syntax
- Bold/italic: Convert <strong>/<em> tags to **/** markdown
- Links: Convert <a> tags to [text](url)
- Code blocks: Preserve <pre><code> as triple backticks

## Platform-Specific Considerations

### Windows

- Uses `next.cmd` instead of `next` command
- Requires `shell: true` option when spawning processes
- PowerShell execution policy may block scripts (see WINDOWS.md)
- npm link may require Administrator privileges
- See WINDOWS.md for detailed troubleshooting

### Linux/macOS

- Uses bash scripts with proper shebang
- May require sudo for .next directory cleanup due to file permissions

## Build Process

The build scripts (build-cli.sh, build-cli.ps1) perform these steps:
1. Clean .next directory (removes cached build artifacts)
2. Run `npm run build` (creates production build)
3. Instruct user to run `npm link` to install globally

The `npm link` command:
- Creates a symlink in global node_modules
- Makes the `mdparadise` command available system-wide
- Points to the bin/mdparadise.js entry point

## MCP Configuration

The project has shadcn MCP server configured in .mcp.json for UI component development.
