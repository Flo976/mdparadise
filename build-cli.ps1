# PowerShell script to build MDParadise CLI on Windows

Write-Host "======================================"
Write-Host "MDParadise - Build CLI" -ForegroundColor Cyan
Write-Host "======================================"
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $scriptDir "frontend"

Write-Host "Navigating to frontend directory..." -ForegroundColor Blue
Set-Location $frontendDir

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Blue
npm install

Write-Host ""
Write-Host "Cleaning .next directory..." -ForegroundColor Blue
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
}

Write-Host ""
Write-Host "Building project..." -ForegroundColor Blue
npm run build

Write-Host ""
Write-Host "Build complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To install globally:" -ForegroundColor Blue
Write-Host "   npm link"
Write-Host ""
Write-Host "To test:" -ForegroundColor Blue
Write-Host "   mdparadise"
Write-Host ""
