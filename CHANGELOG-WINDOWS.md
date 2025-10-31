# Windows Support Changelog

## Latest Updates (2025-10-31)

### Fixed Issues

#### ✅ Paths with Spaces in Username
**Problem:** Windows usernames containing spaces (e.g., "Florent Didelot") caused spawn errors:
```
'C:\Users\Florent' is not recognized...
```

**Solution:** Updated `frontend/bin/mdparadise.js` to:
- Use command name instead of full path
- Add `node_modules/.bin` to PATH dynamically
- Enable shell mode on Windows for .cmd file support

#### ✅ Windows .cmd File Handling
**Problem:** On Windows, npm creates `.cmd` files in `.bin` directory, not executables
```
Error: spawn C:\...\next ENOENT
```

**Solution:** Script now:
- Detects Windows platform automatically
- Uses `next.cmd` instead of `next` on Windows
- Enables `shell: true` option for proper .cmd execution

### Documentation Improvements

#### New Files
- **build-cli.ps1** - PowerShell build script for Windows users
- **WINDOWS.md** - Comprehensive Windows installation guide with troubleshooting

#### Updated Files
- **README.md**:
  - Added Windows quick start section
  - Platform-specific installation instructions
  - Windows-specific troubleshooting
  - Links to WINDOWS.md throughout

- **WINDOWS.md** improvements:
  - Quick reference section at the top
  - Section on handling paths with spaces
  - Instructions for npm link refresh
  - More detailed PATH setup instructions

### What Works Now

✅ Installation on Windows via PowerShell
✅ Usernames with spaces (automatic handling)
✅ npm link with proper PATH detection
✅ PowerShell build script (.\build-cli.ps1)
✅ Manual build alternative
✅ Command execution from any directory
✅ Auto-detection of Windows platform
✅ Proper handling of .cmd files

### Installation Summary (Windows)

```powershell
# Clone
git clone https://github.com/Flo976/mdparadise.git
cd mdparadise

# Build
.\build-cli.ps1

# Install
cd frontend
npm link

# Close and reopen PowerShell, then:
mdparadise
```

### Troubleshooting Quick Fixes

**Command not found:**
```powershell
# 1. Close and reopen PowerShell
# 2. Add to PATH manually:
$npmPath = npm config get prefix
[Environment]::SetEnvironmentVariable("Path", "$([Environment]::GetEnvironmentVariable("Path", "User"));$npmPath", "User")
```

**Need to update after code changes:**
```powershell
cd mdparadise\frontend
npm link  # Run this again after any code updates
```

### Testing

Tested on:
- Windows 10/11
- PowerShell 5.1+
- Node.js 18+
- Usernames with and without spaces
- Multiple directory paths

All scenarios now working correctly.

---

**For detailed Windows instructions, see [WINDOWS.md](WINDOWS.md)**
