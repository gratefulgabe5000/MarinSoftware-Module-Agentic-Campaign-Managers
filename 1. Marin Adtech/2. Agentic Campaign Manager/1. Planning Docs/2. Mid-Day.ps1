# PowerShell script for mid-day commit and push routine
# NOTE: This script requires interactive confirmation for push only
# Don't stop on errors - we'll check exit codes manually
$ErrorActionPreference = "Continue"

Write-Host "Mid-Day / End-of-Phase" -ForegroundColor Cyan

# Get repository root and change to it (git hooks need to be run from repo root)
$repo_root = git rev-parse --show-toplevel 2>&1 | Out-String
$repo_root = $repo_root.Trim()
if ([string]::IsNullOrEmpty($repo_root)) {
    Write-Host "[ERROR] Not in a git repository. Please run from within a git repository." -ForegroundColor Red
    exit 1
}
Set-Location $repo_root
Write-Host "[*] Changed to repository root: $repo_root" -ForegroundColor Cyan

# Get today's date and current branch
$today = Get-Date -Format "yyyy-MM-dd"
Write-Host "[*] Getting current branch..." -ForegroundColor Cyan
$current_branch = git branch --show-current 2>&1 | Out-String
$current_branch = $current_branch.Trim()
$status_file = "$today-STATUS.md"
$status_dir = "3. Status"

# Validate current branch
if ([string]::IsNullOrEmpty($current_branch)) {
    Write-Host "[ERROR] Not on any branch. Please checkout a branch first." -ForegroundColor Red
    exit 1
}

Write-Host "[*] Mid-day commit and push routine for $today" -ForegroundColor Cyan

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

# Stage all changes
Write-Host "[*] Staging all changes..." -ForegroundColor Cyan
$add_output = git add . 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to stage changes." -ForegroundColor Red
    Write-Host "Output: $add_output" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Changes staged." -ForegroundColor Green

# Use Cursor's AI commit message generator via git commit editor
Write-Host "[*] Preparing commit message file for Cursor AI..." -ForegroundColor Cyan
Write-Host "[INFO] Cursor's AI will generate the commit message based on your staged changes." -ForegroundColor Cyan

# Manually prepare the commit message file (like the hook would do)
$stagedDiff = git diff --staged 2>&1 | Out-String
$branchName = git branch --show-current 2>&1 | Out-String
$branchName = $branchName.Trim()

$changedFiles = git diff --cached --name-only 2>&1
$fileCount = 0
if ($changedFiles) {
    $fileList = $changedFiles | Where-Object { $_ -and $_.Trim() -ne "" }
    $fileCount = ($fileList | Measure-Object).Count
}

# Create temporary commit message file
$temp_commit_msg_file = Join-Path $env:TEMP "git-commit-msg-$(Get-Date -Format 'yyyyMMddHHmmss').txt"
$commitMsgContent = @"
# Cursor AI will generate commit message based on staged changes
# Branch: $branchName
# Files changed: $fileCount
#
# Staged changes preview:
$(($stagedDiff -split "`n")[0..49] -join "`n")
#
# Cursor AI: Please generate a commit message above this line
"@

Set-Content -Path $temp_commit_msg_file -Value $commitMsgContent -Encoding UTF8
Write-Host "[OK] Commit message file prepared: $temp_commit_msg_file" -ForegroundColor Green

# Set git editor to Cursor if not already set
$git_editor = git config --local core.editor 2>&1 | Out-String
$git_editor = $git_editor.Trim()
if ([string]::IsNullOrEmpty($git_editor) -or $git_editor -notmatch 'cursor') {
    Write-Host "[*] Setting git editor to Cursor..." -ForegroundColor Cyan
    git config --local core.editor "cursor --wait" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARNING] Failed to set git editor to Cursor. Using default editor." -ForegroundColor Yellow
    } else {
        Write-Host "[OK] Git editor set to Cursor." -ForegroundColor Green
    }
}

# Temporarily disable the hook by renaming it (git on Windows has issues with --no-verify for prepare-commit-msg)
$hook_path = Join-Path $repo_root ".git\hooks\prepare-commit-msg"
$hook_backup_path = Join-Path $repo_root ".git\hooks\prepare-commit-msg.bak"
if (Test-Path $hook_path) {
    Move-Item $hook_path $hook_backup_path -Force -ErrorAction SilentlyContinue
    Write-Host "[*] Temporarily disabled prepare-commit-msg hook" -ForegroundColor Cyan
}

# Commit using the prepared message file
Write-Host "[*] Committing changes (Cursor editor will open)..." -ForegroundColor Cyan
Write-Host "[INFO] Cursor's AI commit message generator will be available in the editor." -ForegroundColor Cyan
Write-Host "[INFO] Review the AI-generated message, edit if needed, then save and close to complete the commit." -ForegroundColor Cyan

# Use git commit -F to use the prepared message file
$commit_output = git commit -F $temp_commit_msg_file 2>&1 | Out-String
$commit_exit_code = $LASTEXITCODE

# Restore the hook
if (Test-Path $hook_backup_path) {
    Move-Item $hook_backup_path $hook_path -Force -ErrorAction SilentlyContinue
    Write-Host "[*] Restored prepare-commit-msg hook" -ForegroundColor Cyan
}

if ($commit_exit_code -ne 0) {
    Write-Host "[ERROR] Failed to commit changes." -ForegroundColor Red
    Write-Host "Output: $commit_output" -ForegroundColor Yellow
    Remove-Item $temp_commit_msg_file -ErrorAction SilentlyContinue
    exit 1
}

# Clean up temp file
Remove-Item $temp_commit_msg_file -ErrorAction SilentlyContinue

# Get the commit message that was used
$commit_msg = git log -1 --pretty=format:"%s" 2>&1 | Out-String
$commit_msg = $commit_msg.Trim()
Write-Host "[OK] Changes committed with message: $commit_msg" -ForegroundColor Green

# Confirm before pushing
$confirm_push = Read-Host "[*] Push changes to origin/$current_branch? (y/N)"
if ($confirm_push -match '^[Yy]$') {
    Write-Host "[*] Pushing changes to origin/$current_branch..." -ForegroundColor Cyan
    $push_output = git push origin $current_branch 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to push to origin/$current_branch" -ForegroundColor Red
        Write-Host "Output: $push_output" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "[OK] Changes pushed to $current_branch" -ForegroundColor Green
} else {
    Write-Host "[*] Push skipped. Changes remain local." -ForegroundColor Yellow
}

# Create status directory if it doesn't exist
if (-not (Test-Path $status_dir)) {
    New-Item -ItemType Directory -Path $status_dir -Force | Out-Null
}

# Generate status file
Write-Host "[*] Generating status file..." -ForegroundColor Cyan
$status_path = Join-Path $status_dir $status_file

$status_content = @"
# Mid-Day Status: $today

## Branch: $current_branch

## Commit Message:
$commit_msg

## Recent Commits:
"@

$recent_commits = git log -n 5 --oneline 2>&1 | Out-String
$status_content += "`n$recent_commits`n"

$status_content += @"
## Current Status:
"@

$git_status = git status 2>&1 | Out-String
$status_content += "`n$git_status`n"

Set-Content -Path $status_path -Value $status_content -Encoding UTF8
Write-Host "[OK] Status file created: $status_path" -ForegroundColor Green

# Update README with link to status file (if README exists)
if (Test-Path "README.md") {
    $readme_content = Get-Content "README.md" -Raw
    if ($readme_content -notmatch [regex]::Escape($status_file)) {
        $link = "- [$today Mid-Day Status](./$status_path)"
        Add-Content -Path "README.md" -Value $link
        Write-Host "[OK] README updated with mid-day status." -ForegroundColor Green
    } else {
        Write-Host "[INFO] README already contains today's status link." -ForegroundColor Cyan
    }
} else {
    Write-Host "[WARNING] README.md not found, skipping README update." -ForegroundColor Yellow
}

# Update CHANGELOG (if it exists)
if (Test-Path "CHANGELOG.md") {
    Add-Content -Path "CHANGELOG.md" -Value "`n## [$today] - $commit_msg`n"
    $recent_commits = git log -n 5 --oneline 2>&1 | Out-String
    Add-Content -Path "CHANGELOG.md" -Value $recent_commits
    Add-Content -Path "CHANGELOG.md" -Value "`n"
    Write-Host "[OK] CHANGELOG.md updated." -ForegroundColor Green
} else {
    Write-Host "[WARNING] CHANGELOG.md not found, skipping CHANGELOG update." -ForegroundColor Yellow
}

Write-Host "[OK] Mid-day routine complete." -ForegroundColor Green
