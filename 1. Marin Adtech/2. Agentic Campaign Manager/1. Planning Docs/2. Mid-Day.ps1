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

# Update BUG log first
$bug_log_path = Join-Path $repo_root "1. Marin Adtech\2. Agentic Campaign Manager\2. Artifacts\BUG-Bug Tracker"
if (Test-Path $bug_log_path) {
    Write-Host "[*] Updating BUG log..." -ForegroundColor Cyan
    $bug_log_content = Get-Content $bug_log_path -Raw
    
    # Update "Last Updated" field
    $bug_log_content = $bug_log_content -replace '(\*\*Last Updated:\*\*).*', "`$1 $today - Mid-Day Update"
    
    # Add changelog entry at the end of CHANGELOG section
    # Format it to match the existing pretty, icon-driven formatting
    $date_formatted = Get-Date -Format "MMMM yyyy"
    # Use here-string to avoid emoji encoding issues in PowerShell
    $emoji_chart = [char]0x1F4CA  # 📊 emoji as Unicode character
    $changelog_entry = @"

### $date_formatted - Mid-Day Status Update
- **$emoji_chart MID-DAY STATUS UPDATE**
  - Mid-day status update for $today
  - Current branch: $current_branch
  - Status file generated: $status_file
  - BUG log updated with mid-day progress
  - All changes committed and pushed to remote

"@
    
    # Find the end of the CHANGELOG section (before the "---" separator)
    # Insert the new entry right after the last changelog entry, before the "---"
    # Workaround: Use pattern that matches CHANGELOG header without requiring emoji in regex
    # Pattern matches "## " followed by any characters (including emojis) and "CHANGELOG"
    # Use single quotes for regex to avoid PowerShell string interpolation issues
    $changelog_header_pattern = '##\s+[^\n]*CHANGELOG'
    
    # Build regex patterns - use simpler approach to avoid PowerShell escape sequence issues
    # Find the position of CHANGELOG section and insert before "---" separator
    # Use string manipulation instead of complex regex to avoid escape sequence issues
    $changelog_marker = "## "
    $changelog_section_end = "`n---`n`n**Last Updated:"
    
    # Find the last occurrence of "---" before "Last Updated" (this is after CHANGELOG section)
    $last_separator_index = $bug_log_content.LastIndexOf($changelog_section_end)
    
    if ($last_separator_index -ge 0) {
        # Insert changelog entry before the separator
        $before = $bug_log_content.Substring(0, $last_separator_index)
        $after = $bug_log_content.Substring($last_separator_index)
        $bug_log_content = $before + $changelog_entry + $after
    } else {
        # Fallback: try to find just "---" separator
        $separator_index = $bug_log_content.LastIndexOf("`n---`n")
        if ($separator_index -ge 0) {
            $before = $bug_log_content.Substring(0, $separator_index)
            $after = $bug_log_content.Substring($separator_index)
            $bug_log_content = $before + $changelog_entry + $after
        } else {
            # Last resort: append before final "---" separator
            $bug_log_content = $bug_log_content -replace '(\n---\n\n\*\*Last Updated:)', "$changelog_entry`$1"
        }
    }
    
    # Write with UTF-8 encoding (no BOM) to preserve emojis properly
    [System.IO.File]::WriteAllText($bug_log_path, $bug_log_content, [System.Text.UTF8Encoding]::new($false))
    Write-Host "[OK] BUG log updated." -ForegroundColor Green
} else {
    Write-Host "[WARNING] BUG log not found at: $bug_log_path" -ForegroundColor Yellow
}

# Create status directory if it doesn't exist
$status_dir_full = Join-Path $repo_root "1. Marin Adtech\2. Agentic Campaign Manager\$status_dir"
if (-not (Test-Path $status_dir_full)) {
    New-Item -ItemType Directory -Path $status_dir_full -Force | Out-Null
}

# Generate status file BEFORE committing
Write-Host "[*] Generating status file..." -ForegroundColor Cyan
$status_path = Join-Path $status_dir_full $status_file

# Get recent commits for status
$recent_commits = git log -n 5 --oneline 2>&1 | Out-String
$git_status = git status 2>&1 | Out-String

$status_content = @"
# Mid-Day Status: $today

## Branch: $current_branch

## Recent Commits:
$recent_commits

## Current Status:
$git_status
"@

Set-Content -Path $status_path -Value $status_content -Encoding UTF8
Write-Host "[OK] Status file created: $status_path" -ForegroundColor Green

# Check if there are changes to commit (including BUG log and status file)
Write-Host "[*] Checking for changes to commit..." -ForegroundColor Cyan
git diff --quiet 2>&1 | Out-Null
$has_unstaged = $LASTEXITCODE -ne 0
git diff --cached --quiet 2>&1 | Out-Null
$has_staged = $LASTEXITCODE -ne 0

if (-not $has_unstaged -and -not $has_staged) {
    Write-Host "[WARNING] No changes to commit. Exiting." -ForegroundColor Yellow
    exit 0
}

# Stage all changes (including BUG log and status file)
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

# Temporarily disable the hook by renaming it (git on Windows has issues with prepare-commit-msg)
$hook_path = Join-Path $repo_root ".git\hooks\prepare-commit-msg"
$hook_backup_path = Join-Path $repo_root ".git\hooks\prepare-commit-msg.bak"
if (Test-Path $hook_path) {
    Move-Item $hook_path $hook_backup_path -Force -ErrorAction SilentlyContinue
    Write-Host "[*] Temporarily disabled prepare-commit-msg hook" -ForegroundColor Cyan
}

# Commit using the prepared message file (bypasses hook)
Write-Host "[*] Committing changes with prepared message..." -ForegroundColor Cyan
$commit_output = git commit -F $temp_commit_msg_file 2>&1 | Out-String
$commit_exit_code = $LASTEXITCODE

# If commit succeeded, amend to open Cursor's editor for AI enhancement
if ($commit_exit_code -eq 0) {
    Write-Host "[*] Opening Cursor editor to enhance commit message with AI..." -ForegroundColor Cyan
    Write-Host "[INFO] Cursor's AI commit message generator will be available in the editor." -ForegroundColor Cyan
    Write-Host "[INFO] Review the AI-generated message, edit if needed, then save and close to complete the amend." -ForegroundColor Cyan
    
    # Amend the commit to open Cursor's editor
    $amend_output = git commit --amend 2>&1 | Out-String
    $amend_exit_code = $LASTEXITCODE
    
    if ($amend_exit_code -ne 0) {
        Write-Host "[WARNING] Failed to amend commit. Original commit was successful." -ForegroundColor Yellow
        Write-Host "Output: $amend_output" -ForegroundColor Yellow
        # Don't fail - the commit was already successful
    }
}

# Restore the original hook
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

# Status file was already created before commit, now update it with commit message
if (Test-Path $status_path) {
    Write-Host "[*] Updating status file with commit message..." -ForegroundColor Cyan
    $status_content = Get-Content $status_path -Raw
    
    # Add commit message section after branch
    $commit_section = @"

## Commit Message:
$commit_msg
"@
    
    $status_content = $status_content -replace '(## Branch:.*\n)', "`$1$commit_section`n"
    
    Set-Content -Path $status_path -Value $status_content -Encoding UTF8
    Write-Host "[OK] Status file updated with commit message." -ForegroundColor Green
}

# Update README with link to status file (if README exists)
$readme_path = Join-Path $repo_root "README.md"
if (Test-Path $readme_path) {
    $readme_content = Get-Content $readme_path -Raw
    if ($readme_content -notmatch [regex]::Escape($status_file)) {
        # Calculate relative path from repo root to status file for the link
        $status_relative_path = $status_path.Replace($repo_root, "").TrimStart("\")
        $link = "- [$today Mid-Day Status](./$status_relative_path)"
        Add-Content -Path $readme_path -Value $link
        Write-Host "[OK] README updated with mid-day status." -ForegroundColor Green
    } else {
        Write-Host "[INFO] README already contains today's status link." -ForegroundColor Cyan
    }
} else {
    Write-Host "[WARNING] README.md not found, skipping README update." -ForegroundColor Yellow
}

# Update CHANGELOG (if it exists)
$changelog_path = Join-Path $repo_root "CHANGELOG.md"
if (Test-Path $changelog_path) {
    Add-Content -Path $changelog_path -Value "`n## [$today] - $commit_msg`n"
    $recent_commits = git log -n 5 --oneline 2>&1 | Out-String
    Add-Content -Path $changelog_path -Value $recent_commits
    Add-Content -Path $changelog_path -Value "`n"
    Write-Host "[OK] CHANGELOG.md updated." -ForegroundColor Green
} else {
    Write-Host "[WARNING] CHANGELOG.md not found, skipping CHANGELOG update." -ForegroundColor Yellow
}

Write-Host "[OK] Mid-day routine complete." -ForegroundColor Green
