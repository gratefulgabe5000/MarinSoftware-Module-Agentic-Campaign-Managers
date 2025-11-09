# PowerShell script for TESTING mid-day commit routine (DRY RUN - NO ACTUAL COMMITS)
# This script simulates the commit process without actually committing or pushing
# Don't stop on errors - we'll check exit codes manually
$ErrorActionPreference = "Continue"

Write-Host "=== MID-DAY SCRIPT TEST (DRY RUN) ===" -ForegroundColor Yellow
Write-Host "This is a TEST - no commits or pushes will be made" -ForegroundColor Yellow
Write-Host ""

# Get today's date and current branch
$today = Get-Date -Format "yyyy-MM-dd"
Write-Host "[*] Getting current branch..." -ForegroundColor Cyan
$current_branch = git branch --show-current 2>&1 | Out-String
$current_branch = $current_branch.Trim()
$status_file = "$today-STATUS-TEST.md"
$status_dir = "3. Status"

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

# Show what would be staged (without actually staging)
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

# Get staged diff for commit message generation
Write-Host "[*] Getting staged diff for commit message generation..." -ForegroundColor Cyan
$staged_diff = git diff --staged 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to get staged diff." -ForegroundColor Red
    exit 1
}

# Show diff preview (first 20 lines)
Write-Host "[*] Staged diff preview (first 20 lines):" -ForegroundColor Cyan
$staged_diff_lines = $staged_diff -split "`n"
$staged_diff_lines[0..19] | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
if ($staged_diff_lines.Count -gt 20) {
    Write-Host "  ... ($($staged_diff_lines.Count - 20) more lines)" -ForegroundColor Gray
}
Write-Host ""

# Test Cursor AI commit message generation
Write-Host "[*] Testing Cursor AI commit message generation..." -ForegroundColor Cyan
Write-Host "[*] Attempting to generate commit message using Cursor AI..." -ForegroundColor Cyan

# Try to use Cursor's AI to generate commit message
$commit_msg = ""
$cursor_ai_worked = $false

try {
    # Test if cursor generate-commit-message works
    $test_result = $staged_diff | cursor generate-commit-message 2>&1 | Out-String
    $test_result = $test_result.Trim()
    
    if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrEmpty($test_result)) {
        $commit_msg = $test_result
        $cursor_ai_worked = $true
        Write-Host "[OK] Cursor AI generated commit message successfully!" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Cursor AI command returned empty or failed (exit code: $LASTEXITCODE)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[WARNING] Cursor AI command failed: $_" -ForegroundColor Yellow
}

# Fallback if Cursor AI generation fails or returns empty
if (-not $cursor_ai_worked -or [string]::IsNullOrEmpty($commit_msg)) {
    Write-Host "[*] Using fallback commit message generation..." -ForegroundColor Yellow
    
    # Fallback: Generate basic commit message from branch name
    if ($current_branch -match '^fix/(.+)$') {
        $bug_id = $matches[1]
        $commit_msg = "fix($bug_id): Mid-day commit - $today"
    } elseif ($current_branch -match '^feat/(.+)$') {
        $feature_name = $matches[1]
        $commit_msg = "feat($feature_name): Mid-day commit - $today"
    } elseif ($current_branch -match '^BUG-(.+)$') {
        $bug_id = $matches[1]
        $commit_msg = "fix(BUG-$bug_id): Mid-day commit - $today"
    } else {
        $commit_msg = "chore: Mid-day commit - $today"
    }
    
    # Add file count
    $changed_files = git diff --cached --name-only 2>&1
    if ($LASTEXITCODE -eq 0 -and $changed_files) {
        $file_list = $changed_files | Where-Object { $_ -and $_.Trim() -ne "" }
        $file_count = ($file_list | Measure-Object).Count
        if ($file_count -gt 0) {
            $commit_msg += " ($file_count file(s) changed)"
        }
    }
    
    Write-Host "[INFO] Using fallback commit message (branch-name based)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== GENERATED COMMIT MESSAGE ===" -ForegroundColor Cyan
Write-Host $commit_msg -ForegroundColor White
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Simulate commit (show what would happen)
Write-Host "[*] [SIMULATED] Would commit with message:" -ForegroundColor Yellow
Write-Host "  git commit -m `"$commit_msg`"" -ForegroundColor Gray
Write-Host ""

# Simulate push (show what would happen)
Write-Host "[*] [SIMULATED] Would push to:" -ForegroundColor Yellow
Write-Host "  git push origin $current_branch" -ForegroundColor Gray
Write-Host ""

# Show what status file would contain
Write-Host "[*] Status file that would be created:" -ForegroundColor Cyan
Write-Host "  Path: $status_dir\$status_file" -ForegroundColor Gray
Write-Host "  Content preview:" -ForegroundColor Gray
Write-Host "    - Date: $today" -ForegroundColor Gray
Write-Host "    - Branch: $current_branch" -ForegroundColor Gray
Write-Host "    - Commit Message: $commit_msg" -ForegroundColor Gray
Write-Host ""

# Show what README/CHANGELOG updates would happen
Write-Host "[*] Files that would be updated:" -ForegroundColor Cyan
if (Test-Path "README.md") {
    Write-Host "  [WOULD UPDATE] README.md" -ForegroundColor Yellow
} else {
    Write-Host "  [SKIP] README.md (not found)" -ForegroundColor Gray
}
if (Test-Path "CHANGELOG.md") {
    Write-Host "  [WOULD UPDATE] CHANGELOG.md" -ForegroundColor Yellow
} else {
    Write-Host "  [SKIP] CHANGELOG.md (not found)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "=== TEST COMPLETE ===" -ForegroundColor Green
Write-Host "[INFO] No actual commits or pushes were made" -ForegroundColor Green
Write-Host "[INFO] To actually commit, use the real Mid-Day.ps1 script" -ForegroundColor Yellow

