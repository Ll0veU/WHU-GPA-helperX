
param(
    [Parameter(Position=0, Mandatory=$true)]
    [ValidateSet('package','release')]
    [string]$Command,
    [Parameter(Mandatory=$true)]
    [string]$Version
)

function Show-Help {
    Write-Host "Usage: ./release.ps1 -Command <package|release> -Version <version>" -ForegroundColor Yellow
    Write-Host "Examples:"
    Write-Host "  ./release.ps1 -Command package -Version 1.4.0"
    Write-Host "  ./release.ps1 -Command release -Version 1.4.0"
}

function Error-Exit($msg) {
    Write-Host "❌ Error: $msg" -ForegroundColor Red
    exit 1
}

function Success-Msg($msg) {
    Write-Host "✅ $msg" -ForegroundColor Green
}

function Warn-Msg($msg) {
    Write-Host "⚠️ $msg" -ForegroundColor Yellow
}

function Info-Msg($msg) {
    Write-Host "📋 $msg" -ForegroundColor Cyan
}

function Check-ProjectRoot {
    if (!(Test-Path "package.json")) { Error-Exit "package.json not found. Run this script from project root directory." }
    if (!(Test-Path "manifest.json")) { Error-Exit "manifest.json not found. This is not a Chrome extension project." }
    Success-Msg "Project root directory confirmed: $(Get-Location)"
}

function Update-Version($version) {
    Info-Msg "Updating version to $version"
    (Get-Content package.json) -replace '"version": *"[^"]*"', '"version": "$version"' | Set-Content package.json
    (Get-Content manifest.json) -replace '"version": *"[^"]*"', '"version": "$version"' | Set-Content manifest.json
    Success-Msg "Version updated in package.json and manifest.json"
}

function Check-GitTag($version) {
    $tag = "v$version"
    if (git tag -l | Select-String "^$tag$") { Error-Exit "Git tag $tag already exists!" }
}

function Check-UncommittedChanges {
    Info-Msg "Checking for uncommitted changes"
    $status = git status --porcelain
    if ($status) { Error-Exit "You have uncommitted changes. Please commit or stash them before creating a release." }
    Success-Msg "Working directory is clean"
}

function Commit-VersionChanges($version) {
    Info-Msg "Committing version changes"
    git add package.json manifest.json
    git commit -m "Bump version to $version"
    Success-Msg "Version changes committed"
}

function Package-Extension($version) {
    Info-Msg "Creating dist directory"
    Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
    New-Item -ItemType Directory -Force -Path dist | Out-Null
    Info-Msg "Copying extension files"
    Copy-Item manifest.json dist/
    Copy-Item popup.html dist/
    foreach ($dir in @('images','css','js')) {
        if (Test-Path $dir) { Copy-Item $dir dist/ -Recurse }
    }
    $zipName = "WHU-GPA-helperX-v$version.zip"
    Info-Msg "Creating zip file: $zipName"
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zipPath = Join-Path dist $zipName
    if (Test-Path $zipPath) { Remove-Item $zipPath }
    [System.IO.Compression.ZipFile]::CreateFromDirectory((Resolve-Path dist), $zipPath)
    Success-Msg "Extension packaged successfully!"
    $size = (Get-Item $zipPath).Length / 1KB
    Write-Host ("  📁 Package: dist/$zipName")
    Write-Host ("  📏 Size: {0:N1} KB" -f $size)
}

function Create-GitTag($version) {
    $tag = "v$version"
    Info-Msg "Creating git tag: $tag"
    git tag -a $tag -m "Release $tag"
    Success-Msg "Git tag $tag created successfully!"
    Warn-Msg "Don't forget to push the tag: git push origin $tag"
}

# Main
if ($PSCmdlet.MyInvocation.BoundParameters.Count -eq 0) { Show-Help; exit 1 }
Show-Help
Check-ProjectRoot

if ($Command -eq 'release') {
    Check-GitTag $Version
    Check-UncommittedChanges
}

Update-Version $Version
Package-Extension $Version

if ($Command -eq 'release') {
    Commit-VersionChanges $Version
    Create-GitTag $Version
}

Success-Msg ("$Command process completed!")
if ($Command -eq 'package') {
    Write-Host "\nNext steps:"
    Write-Host "  1. Test the extension by loading dist/ folder in Chrome"
    Write-Host "  2. Upload WHU-GPA-helperX-v$Version.zip to Chrome Web Store"
} else {
    Write-Host "\nNext steps:"
    Write-Host "  1. Push the git tag: git push origin v$Version"
    Write-Host "  2. GitHub Actions will automatically create a release"
    Write-Host "  3. Extension will be uploaded to Chrome Web Store"
}

