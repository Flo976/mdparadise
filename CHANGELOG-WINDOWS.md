# Windows Support Changelog
## Latest Updates (2025-10-31)
### Fixed Issues
#### ✅ Paths with Spaces in Username
**Problem:** Wi(e.g., "Florent Didelot") caused spawn errors:

          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-language">text</span>
              <button class="copy-code-button" data-code="      &lt;div class=&quot;code-block-wrapper&quot;&gt;
        &lt;div class=&quot;code-block-header&quot;&gt;
          &lt;span class=&quot;code-language&quot;&gt;text&lt;/span&gt;
          &lt;button class=&quot;copy-code-button&quot; data-code=&quot;'C:\Users\Florent' is not recognized...&quot; aria-label=&quot;Copy code&quot;&gt;
            &lt;svg class=&quot;copy-icon&quot; width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot;&gt;
              &lt;rect x=&quot;9&quot; y=&quot;9&quot; width=&quot;13&quot; height=&quot;13&quot; rx=&quot;2&quot; ry=&quot;2&quot;&gt;&lt;/rect&gt;
              &lt;path d=&quot;M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1&quot;&gt;&lt;/path&gt;
            &lt;/svg&gt;
            &lt;svg class=&quot;check-icon hidden&quot; width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot;&gt;
              &lt;polyline points=&quot;20 6 9 17 4 12&quot;&gt;&lt;/polyline&gt;
            &lt;/svg&gt;
            &lt;span class=&quot;copy-text&quot;&gt;Copy&lt;/span&gt;
          &lt;/button&gt;
        
        " aria-label="Copy code">
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="copy-text">Copy</span>
              </button>
            
            
```
      <div class="code-block-wrapper">
        <div class="code-block-header">
          <span class="code-language">text</span>
          <button class="copy-code-button" data-code="'C:\Users\Florent' is not recognized..." aria-label="Copy code">
            <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span class="copy-text">Copy</span>
          </button>
        
        
```

          
        
          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-language">text</span>
              <button class="copy-code-button" data-code="'C:\Users\Florent' is not recognized..." aria-label="Copy code">
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="copy-text">Copy</span>
              </button>
            
            
```
'C:\Users\Florent' is not recognized...
```

          
        
          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-language">text</span>
              <button class="copy-code-button" data-code="    **Solution:** Updated `frontend/bin/mdparadise.js` to:" aria-label="Copy code">
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="copy-text">Copy</span>
              </button>
            
            
```
    **Solution:** Updated `frontend/bin/mdparadise.js` to:
```

          
        
<li>Use command name instead of full path

</li>
<li>Add `node_modules/.bin` to PATH dynamically

</li>
<li>Enable shell mode on Windows for .cmd file support

</li>

#### ✅ Windows .cmd File Handling
**Problem:** On Windows, npm creates `.cmd` files in `.bin` directory, not executables

          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-language">text</span>
              <button class="copy-code-button" data-code="      &lt;div class=&quot;code-block-wrapper&quot;&gt;
        &lt;div class=&quot;code-block-header&quot;&gt;
          &lt;span class=&quot;code-language&quot;&gt;text&lt;/span&gt;
          &lt;button class=&quot;copy-code-button&quot; data-code=&quot;Error: spawn C:\...\next ENOENT&quot; aria-label=&quot;Copy code&quot;&gt;
            &lt;svg class=&quot;copy-icon&quot; width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot;&gt;
              &lt;rect x=&quot;9&quot; y=&quot;9&quot; width=&quot;13&quot; height=&quot;13&quot; rx=&quot;2&quot; ry=&quot;2&quot;&gt;&lt;/rect&gt;
              &lt;path d=&quot;M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1&quot;&gt;&lt;/path&gt;
            &lt;/svg&gt;
            &lt;svg class=&quot;check-icon hidden&quot; width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot;&gt;
              &lt;polyline points=&quot;20 6 9 17 4 12&quot;&gt;&lt;/polyline&gt;
            &lt;/svg&gt;
            &lt;span class=&quot;copy-text&quot;&gt;Copy&lt;/span&gt;
          &lt;/button&gt;
        
        " aria-label="Copy code">
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="copy-text">Copy</span>
              </button>
            
            
```
      <div class="code-block-wrapper">
        <div class="code-block-header">
          <span class="code-language">text</span>
          <button class="copy-code-button" data-code="Error: spawn C:\...\next ENOENT" aria-label="Copy code">
            <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span class="copy-text">Copy</span>
          </button>
        
        
```

          
        
          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-language">text</span>
              <button class="copy-code-button" data-code="Error: spawn C:\...\next ENOENT" aria-label="Copy code">
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="copy-text">Copy</span>
              </button>
            
            
```
Error: spawn C:\...\next ENOENT
```

          
        
          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-language">text</span>
              <button class="copy-code-button" data-code="    **Solution:** Script now:" aria-label="Copy code">
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="copy-text">Copy</span>
              </button>
            
            
```
    **Solution:** Script now:
```

          
        
<li>Detects Windows platform automatically

</li>
<li>Uses `next.cmd` instead of `next` on Windows

</li>
<li>Enables `shell: true` option for proper .cmd execution

</li>

### Documentation Improvements
#### New Files

<li>**build-cli.ps1** - PowerShell build script for Windows users

</li>
<li>**WINDOWS.md** - Comprehensive Windows installation guide with troubleshooting

</li>

#### Updated Files
<li>**README.md**:

- Added Windows quick start section

<ul>
<li>Platform-specific installation instructions

</li>
<li>Windows-specific troubleshooting

</li>
<li>Links to WINDOWS.md throughout

</li>

<li>**WINDOWS.md** improvements:

<li>Quick reference section at the top

</li>
<li>Section on handling paths with spaces

</li>
<li>Instructions for npm link refresh

</li>
<li>More detailed PATH setup instructions

</li>

</li>
</ul>
### What Works Now
<p>✅ Installation on Windows via PowerShell
✅ Usernames with spaces (automatic handling)
✅ npm link with proper PATH detection
✅ PowerShell build script (.\build-cli.ps1)
✅ Manual build alternative
✅ Command execution from any directory
✅ Auto-detection of Windows platform
✅ Proper handling of .cmd files</p>
### Installation Summary (Windows)

          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-language">text</span>
              <button class="copy-code-button" data-code="      &lt;div class=&quot;code-block-wrapper&quot;&gt;
        &lt;div class=&quot;code-block-header&quot;&gt;
          &lt;span class=&quot;code-language&quot;&gt;powershell&lt;/span&gt;
          &lt;button class=&quot;copy-code-button&quot; data-code=&quot;# Clone" aria-label="Copy code">
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="copy-text">Copy</span>
              </button>
            
            
```
      <div class="code-block-wrapper">
        <div class="code-block-header">
          <span class="code-language">powershell</span>
          <button class="copy-code-button" data-code="# Clone
```

          
        <p>git clone [https://github.com/Flo976/mdparadise.git](https://github.com/Flo976/mdparadise.git)
cd mdparadise</p>
# Build
.\build-cli.ps1

# Install
<p>cd frontend
npm link</p>
# Close and reopen PowerShell, then:
<p>mdparadise" aria-label="Copy code"&gt;
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"></svg>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                
                <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"></svg>
                  <polyline points="20 6 9 17 4 12"></polyline>
                
                <span class="copy-text">Copy</span>
              </p>

          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-language">text</span>
              <button class="copy-code-button" data-code="# Clone
git clone https://github.com/Flo976/mdparadise.git
cd mdparadise

# Build
.\build-cli.ps1

# Install
cd frontend
npm link

# Close and reopen PowerShell, then:
mdparadise" aria-label="Copy code">
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="copy-text">Copy</span>
              </button>
            
            
```
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

          
        
          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-language">text</span>
              <button class="copy-code-button" data-code="    ### Troubleshooting Quick Fixes" aria-label="Copy code">
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="copy-text">Copy</span>
              </button>
            
            
```
    ### Troubleshooting Quick Fixes
```

          
        **Command not found:**

          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-language">text</span>
              <button class="copy-code-button" data-code="      &lt;div class=&quot;code-block-wrapper&quot;&gt;
        &lt;div class=&quot;code-block-header&quot;&gt;
          &lt;span class=&quot;code-language&quot;&gt;powershell&lt;/span&gt;
          &lt;button class=&quot;copy-code-button&quot; data-code=&quot;# 1. Close and reopen PowerShell" aria-label="Copy code">
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="copy-text">Copy</span>
              </button>
            
            
```
      <div class="code-block-wrapper">
        <div class="code-block-header">
          <span class="code-language">powershell</span>
          <button class="copy-code-button" data-code="# 1. Close and reopen PowerShell
```

          
        # 2. Add to PATH manually:
<p>$npmPath = npm config get prefix
[Environment]::SetEnvironmentVariable("Path", "$([Environment]::GetEnvironmentVariable("Path", "User"));$npmPath", "User")" aria-label="Copy code"&gt;
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"></svg>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                
                <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"></svg>
                  <polyline points="20 6 9 17 4 12"></polyline>
                
                <span class="copy-text">Copy</span>
              </p>

          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-language">text</span>
              <button class="copy-code-button" data-code="# 1. Close and reopen PowerShell
# 2. Add to PATH manually:
$npmPath = npm config get prefix
[Environment]::SetEnvironmentVariable(&quot;Path&quot;, &quot;$([Environment]::GetEnvironmentVariable(&quot;Path&quot;, &quot;User&quot;));$npmPath&quot;, &quot;User&quot;)" aria-label="Copy code">
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="copy-text">Copy</span>
              </button>
            
            
```
# 1. Close and reopen PowerShell
# 2. Add to PATH manually:
$npmPath = npm config get prefix
[Environment]::SetEnvironmentVariable("Path", "$([Environment]::GetEnvironmentVariable("Path", "User"));$npmPath", "User")
```

          
        
          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-language">text</span>
              <button class="copy-code-button" data-code="    **Need to update after code changes:**

      &lt;div class=&quot;code-block-wrapper&quot;&gt;
        &lt;div class=&quot;code-block-header&quot;&gt;
          &lt;span class=&quot;code-language&quot;&gt;powershell&lt;/span&gt;
          &lt;button class=&quot;copy-code-button&quot; data-code=&quot;cd mdparadise\frontend" aria-label="Copy code">
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="copy-text">Copy</span>
              </button>
            
            
```
    **Need to update after code changes:**

      <div class="code-block-wrapper">
        <div class="code-block-header">
          <span class="code-language">powershell</span>
          <button class="copy-code-button" data-code="cd mdparadise\frontend
```

          
        <p>npm link  # Run this again after any code updates" aria-label="Copy code"&gt;
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"></svg>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                
                <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"></svg>
                  <polyline points="20 6 9 17 4 12"></polyline>
                
                <span class="copy-text">Copy</span>
              </p>

          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-language">text</span>
              <button class="copy-code-button" data-code="cd mdparadise\frontend
npm link  # Run this again after any code updates" aria-label="Copy code">
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="copy-text">Copy</span>
              </button>
            
            
```
cd mdparadise\frontend
npm link  # Run this again after any code updates
```

          
        
          <div class="code-block-wrapper">
            <div class="code-block-header">
              <span class="code-language">text</span>
              <button class="copy-code-button" data-code="    ### Testing" aria-label="Copy code">
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="copy-text">Copy</span>
              </button>
            
            
```
    ### Testing
```

          
        Tested on:

<li>Windows 10/11

</li>
<li>PowerShell 5.1+

</li>
<li>Node.js 18+

</li>
<li>Usernames with and without spaces

</li>
<li>Multiple directory paths

</li>

All scenarios now working correctly.

<hr>
**For detailed Windows instructions, see [WINDOWS.md](WINDOWS.md)**</li>