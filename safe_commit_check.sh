#!/bin/bash
# Quick commit script for CTF platform (safe files only)

echo "========================================"
echo "CTF Platform - Safe Git Commit Helper"
echo "========================================"
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Not a git repository. Initialize with: git init"
    exit 1
fi

echo "📋 Checking for sensitive files..."
echo ""

# Check if gitignore is properly set
if ! grep -q "VULNERABILITIES.md" .gitignore; then
    echo "⚠️  Warning: .gitignore may not be properly configured"
    echo "   Run: git checkout .gitignore"
    exit 1
fi

# Check for flags in staged files (excluding backend code which should have flags)
echo "🔍 Checking for flags in documentation files..."
if git diff --staged -- '*.md' '*.txt' | grep -E '^\+.*FLAG\{[a-z0-9_]+\}' > /dev/null; then
    echo "❌ ERROR: Found real flags in documentation!"
    echo "   Documentation should use generic FLAG{...} examples only"
    echo "   Unstage files with solutions: git reset HEAD <file>"
    exit 1
fi

echo "✅ No flags found in staged files"
echo ""

# Show what will be committed
echo "📝 Files to be committed:"
git status --short
echo ""

# Check for solution files
echo "🔒 Verifying solution files are excluded..."
SOLUTION_FILES=("VULNERABILITIES.md" "HINTS.md" "test_exploits.py" "exploit_toolkit.py" "test_hints.py" "TESTING_GUIDE.md" "QUICK_REFERENCE.md" "CHANGELOG.md")

for file in "${SOLUTION_FILES[@]}"; do
    if git ls-files --error-unmatch "$file" > /dev/null 2>&1; then
        echo "❌ ERROR: Solution file '$file' is tracked!"
        echo "   Remove with: git rm --cached $file"
        exit 1
    fi
done

echo "✅ Solution files are properly excluded"
echo ""

# Final confirmation
echo "========================================"
echo "✅ Ready to commit!"
echo "========================================"
echo ""
echo "Recommended commands:"
echo "  git commit -m 'Your message here'"
echo "  git push origin main"
echo ""
echo "Or to review changes:"
echo "  git diff --staged"
echo ""
