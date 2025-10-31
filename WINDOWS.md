# 🪟 Windows Installation Guide for MDParadise

This guide provides Windows-specific instructions for installing and running MDParadise.

## Prerequisites

- **Node.js** 18+ (Download from [nodejs.org](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **PowerShell** (built into Windows)

## Installation Steps

### 1. Clone the Repository

Open PowerShell and run:

```powershell
cd ~\Documents\GitHub
git clone https://github.com/Flo976/mdparadise.git
cd mdparadise
```

### 2. Build the Project

Run the PowerShell build script:

```powershell
.\build-cli.ps1
```

If you get an execution policy error, run this first:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Alternative: Manual Build (if script doesn't work)**

```powershell
cd frontend
npm install
Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue
npm run build
```

### 3. Install Globally

```powershell
cd frontend  # if not already there
npm link
```

**Note:** You may need to run PowerShell as Administrator for `npm link` to work.

### 4. Verify Installation

```powershell
mdparadise --version
mdparadise --help
```

## Usage on Windows

### Basic Commands

```powershell
# Launch in current directory
mdparadise

# Launch in specific directory
mdparadise C:\Users\YourName\Documents\notes

# Custom port
mdparadise --port 3000

# Don't open browser automatically
mdparadise --no-open
```

### Using with Git Bash (Alternative)

If you have Git for Windows installed, you can use Git Bash to run the original bash scripts:

```bash
# In Git Bash
./build-cli.sh
cd frontend
npm link
```

### Using with WSL (Alternative)

If you have Windows Subsystem for Linux installed:

```bash
# In WSL terminal
./build-cli.sh
cd frontend
npm link
```

## Troubleshooting

### `mdparadise` command not found

After running `npm link`, you may need to:

1. **Close and reopen PowerShell** - The PATH may need to refresh
2. **Check npm global bin directory:**
   ```powershell
   npm config get prefix
   ```
   Make sure this path is in your system PATH environment variable.

3. **Add to PATH manually:**
   - Press `Win + X` and select "System"
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "User variables", edit `Path`
   - Add: `C:\Users\YourName\AppData\Roaming\npm` (adjust to your npm prefix)

### Script execution policy error

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Permission errors during `npm link`

Run PowerShell as Administrator:
- Right-click PowerShell icon
- Select "Run as Administrator"
- Navigate back to the frontend directory
- Run `npm link` again

### Port already in use

MDParadise automatically finds the next available port if 4445 is busy.

### Build fails with ENOENT errors

Make sure you're in the correct directory:
```powershell
cd mdparadise\frontend
npm install
```

## Development on Windows

### Running in development mode

```powershell
cd frontend
npm run dev
```

### Setting environment variables

```powershell
# PowerShell
$env:MDPARADISE_BASE_DIR="C:\Users\YourName\Documents\notes"
$env:PORT="3000"
npm run dev
```

### Building for production

```powershell
cd frontend
npm run build
```

## Uninstallation

```powershell
cd mdparadise\frontend
npm unlink
```

Then remove the cloned directory:
```powershell
cd ..\..\
Remove-Item -Path mdparadise -Recurse -Force
```

## Common Windows Issues

### Backslash vs Forward Slash

Windows uses backslashes (`\`) for paths. MDParadise handles both:
- ✅ `C:\Users\Name\Documents\notes`
- ✅ `C:/Users/Name/Documents/notes`

### Line Endings

If you're contributing to the project on Windows, configure Git to handle line endings:

```powershell
git config --global core.autocrlf true
```

### Symlink Support

Some features may require Developer Mode or Administrator privileges on Windows. Enable Developer Mode:
1. Settings → Update & Security → For developers
2. Enable "Developer Mode"

## Getting Help

If you encounter issues:
1. Check this guide
2. Check the main [README.md](README.md)
3. Open an issue on [GitHub](https://github.com/Flo976/mdparadise/issues)

---

**Made with ❤️ for Windows users**
