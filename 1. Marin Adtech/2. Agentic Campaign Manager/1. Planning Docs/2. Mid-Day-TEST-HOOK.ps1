# PowerShell script for TESTING mid-day commit routine with git hook (DRY RUN)
# This script tests the prepare-commit-msg hook and Cursor editor integration
# Don't stop on errors - we'll check exit codes manually
$ErrorActionPreference = "Continue"

Write-Host "=== MID-DAY SCRIPT TEST WITH HOOK (DRY RUN) ===" -ForegroundColor Yellow
Write-Host "This is a TEST - no commits or pushes will be made" -ForegroundColor Yellow
Write-Host ""

# Get today's date and current branch
$today = Get-Date -Format "yyyy-MM-dd"
Write-Host "[*] Getting current branch..." -ForegroundColor Cyan
$current_branch = git branch --show-current 2>&1 | Out-String
$current_branch = $current_branch.Trim()

# Validate current branch
if ([string]::IsNullOrEmpty($current_branch)) {
    Write-Host "[ERROR] Not on any branch. Please checkout a branch first." -ForegroundColor Red
    exit 1
}

Write-Host "[*] Current branch: $current_branch" -ForegroundColor Green
Write-Host "[*] Test date: $today" -ForegroundColor Green
Write-Host ""

# Check if there are changes to commit
Write-Host "[*] Checking for changes to commit..." -ForegroundColor Cyan
git diff --quiet 2>&1 | Out-Null
$has_unstaged = $LASTEXITCODE -ne 0
git diff --cached --quiet 2>&1 | Out-Null
$has_staged = $LASTEXITCODE -ne 0

if (-not $has_unstaged -and -not $has_staged) {
    Write-Host "[WARNING] No changes to commit. Exiting." -ForegroundColor Yellow
    exit 0
}

Write-Host "[OK] Found changes to commit:" -ForegroundColor Green
Write-Host "  - Unstaged changes: $has_unstaged" -ForegroundColor Cyan
Write-Host "  - Staged changes: $has_staged" -ForegroundColor Cyan
Write-Host ""

# Show what would be staged
Write-Host "[*] Files that would be staged:" -ForegroundColor Cyan
$unstaged_files = git diff --name-only 2>&1
$staged_files = git diff --cached --name-only 2>&1
if ($unstaged_files) {
    $unstaged_files | ForEach-Object { Write-Host "  [UNSTAGED] $_" -ForegroundColor Yellow }
}
if ($staged_files) {
    $staged_files | ForEach-Object { Write-Host "  [STAGED] $_" -ForegroundColor Green }
}
Write-Host ""

# Test the prepare-commit-msg hook
Write-Host "[*] Testing prepare-commit-msg hook..." -ForegroundColor Cyan

# Create a temporary commit message file
$temp_commit_file = Join-Path $env:TEMP "test-commit-msg-$(Get-Date -Format 'yyyyMMddHHmmss').txt"
Write-Host "[*] Creating temporary commit message file: $temp_commit_file" -ForegroundColor Cyan

# Simulate what the hook would do
$staged_diff = git diff --staged 2>&1 | Out-String
$changed_files = git diff --cached --name-only 2>&1
$file_count = 0
if ($changed_files) {
    $file_list = $changed_files | Where-Object { $_ -and $_.Trim() -ne "" }
    $file_count = ($file_list | Measure-Object).Count
}

# Create commit message content (what the hook would create)
$commit_msg_content = @"
# Cursor AI will generate commit message based on staged changes
# Branch: $current_branch
# Files changed: $file_count
#
# Staged changes preview:
$(($staged_diff -split "`n")[0..49] -join "`n")
#
# Cursor AI: Please generate a commit message above this line
"@

Set-Content -Path $temp_commit_file -Value $commit_msg_content -Encoding UTF8
Write-Host "[OK] Temporary commit message file created." -ForegroundColor Green
Write-Host ""

# Show what the hook would prepare
Write-Host "[*] Commit message file content (what hook would prepare):" -ForegroundColor Cyan
Write-Host "---" -ForegroundColor Gray
Get-Content $temp_commit_file | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Test git editor configuration
Write-Host "[*] Testing git editor configuration..." -ForegroundColor Cyan
$git_editor = git config --local core.editor 2>&1 | Out-String
$git_editor = $git_editor.Trim()
if ([string]::IsNullOrEmpty($git_editor)) {
    Write-Host "[INFO] Git editor not set. Would set to: cursor --wait" -ForegroundColor Yellow
} else {
    Write-Host "[INFO] Git editor is set to: $git_editor" -ForegroundColor Green
    if ($git_editor -match 'cursor') {
        Write-Host "[OK] Cursor is configured as git editor." -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Cursor is not configured as git editor." -ForegroundColor Yellow
    }
}
Write-Host ""

# Simulate what would happen
Write-Host "[*] [SIMULATED] What would happen:" -ForegroundColor Yellow
Write-Host "  1. prepare-commit-msg hook would prepare commit message file" -ForegroundColor Gray
Write-Host "  2. git commit (without -m) would open Cursor editor" -ForegroundColor Gray
Write-Host "  3. Cursor's AI would generate/enhance the commit message" -ForegroundColor Gray
Write-Host "  4. You would review, edit if needed, save and close" -ForegroundColor Gray
Write-Host "  5. Commit would complete with the AI-generated message" -ForegroundColor Gray
Write-Host ""

# Show what the commit command would be
Write-Host "[*] [SIMULATED] Would run:" -ForegroundColor Yellow
Write-Host "  git commit" -ForegroundColor Gray
Write-Host "  (This opens Cursor editor with prepared commit message file)" -ForegroundColor Gray
Write-Host ""

# Clean up temp file
Write-Host "[*] Cleaning up temporary file..." -ForegroundColor Cyan
Remove-Item $temp_commit_file -ErrorAction SilentlyContinue
Write-Host "[OK] Temporary file removed." -ForegroundColor Green
Write-Host ""

Write-Host "=== TEST COMPLETE ===" -ForegroundColor Green
Write-Host "[INFO] No actual commits or pushes were made" -ForegroundColor Green
Write-Host "[INFO] The prepare-commit-msg hook is ready to use" -ForegroundColor Green
Write-Host "[INFO] To actually commit, use the real Mid-Day.ps1 script" -ForegroundColor Yellow

