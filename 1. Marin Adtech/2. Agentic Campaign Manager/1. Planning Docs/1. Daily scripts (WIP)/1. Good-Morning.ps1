# PowerShell script for daily morning sync routine
# Don't stop on errors - we'll check exit codes manually
$ErrorActionPreference = "Continue"

# Fix encoding issues - set UTF-8 encoding for output and file operations
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Good morning!" -ForegroundColor Green
Write-Host "[*] Good morning! Starting daily sync routine..." -ForegroundColor Cyan

# Get today's date
$today = Get-Date -Format "yyyy-MM-dd"
# Ensure we are on our most recent working branch (feat- or BUG-)
Write-Host "[*] Checking current branch..." -ForegroundColor Cyan
$current_branch = git branch --show-current 2>&1 | Out-String
$current_branch = $current_branch.Trim()

# Validate current branch
if ([string]::IsNullOrEmpty($current_branch)) {
    Write-Host "[ERROR] Not on any branch. Please checkout a branch first." -ForegroundColor Red
    exit 1
}

if ($current_branch -eq "develop") {
    Write-Host "[WARNING] Already on develop branch. Switching to most recent feature/bug branch..." -ForegroundColor Yellow
    # Try to find most recent feat- or BUG- branch
    $branch_list = git branch --list 'feat-*', 'BUG-*' --sort=-committerdate 2>&1 | Out-String
    $recent_branch = $branch_list -split "`n" | Where-Object { $_ -match 'feat-|BUG-' } | Select-Object -First 1
    if ($recent_branch) {
        $recent_branch = $recent_branch.Trim() -replace '^\*\s*', ''
        $current_branch = $recent_branch
        Write-Host "[*] Switching to $current_branch..." -ForegroundColor Cyan
        git checkout $current_branch 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] Failed to checkout $current_branch" -ForegroundColor Red
            exit 1
        }
        Write-Host "[OK] Switched to $current_branch" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] No feat- or BUG- branch found. Please create one first." -ForegroundColor Red
        exit 1
    }
}

Write-Host "[*] Current branch: $current_branch" -ForegroundColor Cyan

# Check if there are uncommitted changes
Write-Host "[*] Checking for uncommitted changes..." -ForegroundColor Cyan
git diff --quiet 2>&1 | Out-Null
$has_unstaged = $LASTEXITCODE -ne 0
git diff --cached --quiet 2>&1 | Out-Null
$has_staged = $LASTEXITCODE -ne 0

if ($has_unstaged -or $has_staged) {
    Write-Host "[*] Stashing local changes..." -ForegroundColor Yellow
    git stash push -m "$today-Daily-Sync-Stash" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $has_stash = $true
        Write-Host "[OK] Changes stashed." -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Failed to stash changes, continuing anyway..." -ForegroundColor Yellow
        $has_stash = $false
    }
} else {
    Write-Host "[OK] No local changes to stash." -ForegroundColor Green
    $has_stash = $false
}

# Fetch and update develop branch
Write-Host "[*] Fetching latest changes from origin..." -ForegroundColor Cyan
$fetch_output = git fetch origin 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to fetch from origin." -ForegroundColor Red
    Write-Host "Output: $fetch_output" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Fetch complete." -ForegroundColor Green

Write-Host "[*] Updating develop branch..." -ForegroundColor Cyan
$checkout_output = git checkout develop 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to checkout develop branch." -ForegroundColor Red
    Write-Host "Output: $checkout_output" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Switched to develop branch." -ForegroundColor Green

Write-Host "[*] Pulling latest changes..." -ForegroundColor Cyan
$pull_output = git pull origin develop 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to pull develop branch." -ForegroundColor Red
    Write-Host "Output: $pull_output" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Pull complete." -ForegroundColor Green

# Merge develop into working branch
Write-Host "[*] Merging develop into $current_branch..." -ForegroundColor Cyan
$checkout_output = git checkout $current_branch 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to checkout $current_branch." -ForegroundColor Red
    Write-Host "Output: $checkout_output" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Switched back to $current_branch." -ForegroundColor Green

Write-Host "[*] Merging develop..." -ForegroundColor Cyan
$merge_output = git merge develop --no-edit 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Merge conflicts detected! Please resolve conflicts manually." -ForegroundColor Yellow
    Write-Host "Output: $merge_output" -ForegroundColor Yellow
    Write-Host "[TIP] After resolving, run: git add . ; git commit" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Merge complete." -ForegroundColor Green

# Restore stashed changes if any
if ($has_stash) {
    Write-Host "[*] Restoring stashed changes..." -ForegroundColor Cyan
    $stash_list = git stash list 2>&1 | Out-String
    if ($stash_list -match [regex]::Escape("$today-Daily-Sync-Stash")) {
        $stash_output = git stash pop 2>&1 | Out-String
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Stashed changes restored." -ForegroundColor Green
        } else {
            Write-Host "[WARNING] Failed to restore stash. Output: $stash_output" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[WARNING] Expected stash not found." -ForegroundColor Yellow
    }
}

Write-Host "[OK] Daily sync complete!" -ForegroundColor Green

# Note: After running this script, evaluate status files and plan next steps
# Per feature workflow:
# 1. Create new branch: feat- or BUG-
# 2. Build
# 3. Test
# 4. Push only when confirmed
# 5. Create PR & merge with /develop
