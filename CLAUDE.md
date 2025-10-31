# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MDParadise is a local Flask-based web server for viewing and editing Markdown files with a modern split-view interface. It can be launched from any directory and provides real-time preview of Markdown content with an integrated CodeMirror editor.

## Architecture

### Core Components

**md_server.py** - Main Flask application (single-file server)
- Flask server serving both API endpoints and embedded HTML/JS frontend
- Runs on port 4444 by default (configurable at line 20: `PORT = 4444`)
- All frontend code is embedded in `HTML_TEMPLATE` variable (lines 130-632)
- Uses `BASE_DIR = os.getcwd()` to determine working directory - the server can only access files within this directory and subdirectories

**start_md_server.sh** - Launch wrapper script
- Resolves symlinks to find actual installation directory
- Activates Python virtual environment from `venv/` directory
- Launches md_server.py with correct Python interpreter
- Can accept optional directory argument to change working directory

**install.sh** - Installation script
- Creates Python virtual environment in `venv/` directory
- Installs dependencies from `md_server_requirements.txt`
- Offers multiple installation methods (system-wide, user-local, alias-based)

### API Endpoints

- `GET /` - Serves main HTML interface
- `GET /api/files` - Returns list of all .md files in BASE_DIR (recursively)
- `GET /api/file/<path:filepath>` - Returns file content (both raw markdown and rendered HTML)
- `POST /api/file/<path:filepath>` - Saves file content

### Frontend Architecture

Single-page application embedded in HTML_TEMPLATE:
- **CodeMirror** editor (Dracula theme) for markdown editing
- **marked.js** for client-side markdown rendering
- Split-view layout: editor on left, preview on right
- File list sidebar with search functionality
- Three view modes: both panels, editor only, preview only

### Security Model

The server implements path traversal protection in md_server.py:
- Lines 74-76 and 113-114: Verifies requested file paths start with BASE_DIR
- Returns 403 Forbidden for paths outside BASE_DIR
- Ignores common directories: .git, node_modules, __pycache__, .venv, venv (line 39)

## Development Commands

### Installation
```bash
# Run interactive installation (creates venv, installs deps, sets up command)
./install.sh

# Manual installation without global command
pip3 install -r md_server_requirements.txt
```

### Running the Server
```bash
# If installed globally
mdparadise                    # Launch in current directory
mdparadise /path/to/folder   # Launch in specific directory

# Without installation
./start_md_server.sh          # Launch in current directory
./start_md_server.sh /path   # Launch in specific directory

# Direct execution (requires manual venv activation)
python3 md_server.py          # Launch in current directory
```

### Development Mode
The Flask server runs with `debug=True` by default (line 648). This enables:
- Auto-reload on code changes
- Detailed error pages
- Interactive debugger

## File Dependencies

**Python dependencies** (md_server_requirements.txt):
- Flask==3.0.0 - Web framework
- flask-cors==4.0.0 - CORS support
- markdown==3.5.1 - Server-side markdown rendering with extensions

**Frontend dependencies** (loaded via CDN in HTML_TEMPLATE):
- github-markdown-css - GitHub-style markdown rendering
- CodeMirror 5.65.16 - Code editor
- marked.js 11.1.1 - Client-side markdown parser

## Network Configuration

- Server binds to `0.0.0.0` (all interfaces) on port 4444
- Accessible locally at `http://localhost:4444`
- Accessible on LAN via local IP (displayed on startup)
- Uses socket connection to 8.8.8.8:80 to detect local IP address (md_server.py:23-32)

## Markdown Extensions

Server-side rendering uses these Python-Markdown extensions (md_server.py:87-94):
- `fenced_code` - Code blocks with syntax highlighting
- `tables` - GitHub-style tables
- `toc` - Table of contents
- `nl2br` - Newlines to breaks
- `codehilite` - Syntax highlighting
- `extra` - Collection of extra extensions

## Important Implementation Details

### File Discovery
The `get_all_markdown_files()` function (lines 34-52):
- Recursively walks directory tree from BASE_DIR
- Excludes hidden and dependency directories
- Returns sorted list with file metadata (name, path, directory, size)

### Virtual Environment
The project uses a Python virtual environment for isolation:
- Created in `venv/` directory within project root
- start_md_server.sh resolves symlinks to find correct venv path
- venv directory is owned by root (visible in git status output) - you may need sudo to modify

### Editor Integration
CodeMirror initialization (HTML_TEMPLATE lines 441-461):
- Theme: dracula
- Mode: markdown
- Line numbers enabled
- Keyboard shortcuts: Ctrl-S/Cmd-S for save
- Auto-updates preview on change

## MCP Configuration

The project has shadcn MCP server configured in .mcp.json for UI component development.
