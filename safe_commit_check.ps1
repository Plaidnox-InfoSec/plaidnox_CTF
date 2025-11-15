# PowerShell script for safe Git commit (Windows)

Write-Host "========================================"
Write-Host "CTF Platform - Safe Git Commit Helper"
Write-Host "========================================"
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "❌ Not a git repository. Initialize with: git init" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Checking for sensitive files..." -ForegroundColor Cyan
Write-Host ""

# Check if gitignore is properly set
$gitignoreContent = Get-Content .gitignore -Raw
if ($gitignoreContent -notmatch "VULNERABILITIES.md") {
    Write-Host "⚠️  Warning: .gitignore may not be properly configured" -ForegroundColor Yellow
    Write-Host "   Run: git checkout .gitignore"
    exit 1
}

# Check for flags in documentation files (excluding backend code which should have flags)
Write-Host "🔍 Checking for flags in documentation files..." -ForegroundColor Cyan
$stagedDiff = git diff --staged -- '*.md' '*.txt'
if ($stagedDiff -match 'FLAG\{[a-z0-9_]+\}') {
    Write-Host "❌ ERROR: Found real flags in documentation!" -ForegroundColor Red
    Write-Host "   Documentation should use generic FLAG{...} examples only"
    Write-Host "   Unstage files with solutions: git reset HEAD <file>"
    exit 1
}

Write-Host "✅ No flags found in staged files" -ForegroundColor Green
Write-Host ""

# Show what will be committed
Write-Host "📝 Files to be committed:" -ForegroundColor Cyan
git status --short
Write-Host ""

# Check for solution files
Write-Host "🔒 Verifying solution files are excluded..." -ForegroundColor Cyan
$solutionFiles = @(
    "VULNERABILITIES.md",
    "HINTS.md",
    "test_exploits.py",
    "exploit_toolkit.py",
    "test_hints.py",
    "TESTING_GUIDE.md",
    "QUICK_REFERENCE.md",
    "CHANGELOG.md"
)

$foundSolutionFiles = $false
foreach ($file in $solutionFiles) {
    $isTracked = git ls-files --error-unmatch $file 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "❌ ERROR: Solution file '$file' is tracked!" -ForegroundColor Red
        Write-Host "   Remove with: git rm --cached $file"
        $foundSolutionFiles = $true
    }
}

if ($foundSolutionFiles) {
    exit 1
}

Write-Host "✅ Solution files are properly excluded" -ForegroundColor Green
Write-Host ""

# Final confirmation
Write-Host "========================================"
Write-Host "✅ Ready to commit!" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""
Write-Host "Recommended commands:"
Write-Host "  git commit -m 'Your message here'"
Write-Host "  git push origin main"
Write-Host ""
Write-Host "Or to review changes:"
Write-Host "  git diff --staged"
Write-Host ""
