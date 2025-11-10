# PowerShell script for end-of-day routine
# Don't stop on errors - we'll check exit codes manually
$ErrorActionPreference = "Continue"

Write-Host "Good night!" -ForegroundColor Magenta

# Get today's date
$today = Get-Date -Format "yyyy-MM-dd"
$status_file = "$today-STATUS.md"
$status_dir = "3. Status"

Write-Host "[*] Wrapping up for $today..." -ForegroundColor Magenta

# Commit staged changes if any
Write-Host "[*] Checking for staged changes..." -ForegroundColor Cyan
git diff --cached --quiet 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] No staged changes to commit." -ForegroundColor Green
} else {
    Write-Host "[*] Committing staged changes..." -ForegroundColor Yellow
    $commit_output = git commit -m "End-of-day commit for $today" 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Staged changes committed." -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Failed to commit staged changes. Output: $commit_output" -ForegroundColor Yellow
    }
}

# Stash uncommitted changes
Write-Host "[*] Checking for uncommitted changes..." -ForegroundColor Cyan
git diff --quiet 2>&1 | Out-Null
$has_unstaged = $LASTEXITCODE -ne 0
git diff --cached --quiet 2>&1 | Out-Null
$has_staged = $LASTEXITCODE -ne 0

if (-not $has_unstaged -and -not $has_staged) {
    Write-Host "[OK] No local changes to stash." -ForegroundColor Green
} else {
    Write-Host "[*] Stashing local changes..." -ForegroundColor Yellow
    $stash_output = git stash push -m "$today End-of-day stash" 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Local changes stashed." -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Failed to stash changes. Output: $stash_output" -ForegroundColor Yellow
    }
}

# Create status directory if it doesn't exist
if (-not (Test-Path $status_dir)) {
    New-Item -ItemType Directory -Path $status_dir -Force | Out-Null
}

# Generate STATUS markdown file
$status_path = Join-Path $status_dir $status_file
Write-Host "[*] Getting current branch..." -ForegroundColor Cyan
$current_branch = git branch --show-current 2>&1 | Out-String
$current_branch = $current_branch.Trim()

$status_content = @"
# Daily Status: $today

## Branch: $current_branch

## Commits Today:
"@

# Get commits today
Write-Host "[*] Generating status file..." -ForegroundColor Cyan
$commits = git log --since=midnight --oneline 2>&1 | Out-String
if ($commits -and $commits.Trim()) {
    $status_content += "`n$commits`n"
} else {
    $status_content += "`nNo commits today`n"
}

$status_content += @"

## Uncommitted Changes:
"@

$git_status = git status 2>&1 | Out-String
$status_content += "`n$git_status`n"

Set-Content -Path $status_path -Value $status_content -Encoding UTF8
Write-Host "[OK] Status file created: $status_path" -ForegroundColor Green

# Update README with link to status file (if README exists)
if (Test-Path "README.md") {
    $readme_content = Get-Content "README.md" -Raw
    if ($readme_content -notmatch [regex]::Escape($status_file)) {
        $link = "- [$today Status](./$status_path)"
        Add-Content -Path "README.md" -Value $link
        Write-Host "[OK] README updated with today's status." -ForegroundColor Green
    } else {
        Write-Host "[INFO] README already contains today's status link." -ForegroundColor Cyan
    }
} else {
    Write-Host "[WARNING] README.md not found, skipping README update." -ForegroundColor Yellow
}

# Update CHANGELOG if it exists
if (Test-Path "CHANGELOG.md") {
    Add-Content -Path "CHANGELOG.md" -Value "`n## [$today] - End of day`n"
    $commits = git log --since=midnight --oneline 2>&1 | Out-String
    if ($commits -and $commits.Trim()) {
        Add-Content -Path "CHANGELOG.md" -Value $commits
    } else {
        Add-Content -Path "CHANGELOG.md" -Value "- No commits today"
    }
    Add-Content -Path "CHANGELOG.md" -Value "`n"
    Write-Host "[OK] CHANGELOG.md updated." -ForegroundColor Green
}

Write-Host "[OK] End-of-day routine complete." -ForegroundColor Green
