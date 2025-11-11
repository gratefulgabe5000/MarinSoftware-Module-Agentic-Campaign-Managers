# PowerShell script to verify Phase 4 and Phase 5 completion
# Run all tests and check deliverables

Write-Host "=== Phase 4 & 5 Verification Script ===" -ForegroundColor Cyan
Write-Host ""

# Build first
Write-Host "[*] Building TypeScript..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Build successful" -ForegroundColor Green
Write-Host ""

# Phase 4 Tests - GABE
Write-Host "=== Phase 4: GABE's Tests ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "[*] Running Test 4.1.1: Connection Tests..." -ForegroundColor Yellow
node test-phase4.1.1-connection.js
Write-Host ""

Write-Host "[*] Running Test 4.2.1: Campaign Lifecycle Tests..." -ForegroundColor Yellow
node test-phase4.2.1-campaign-lifecycle.js
Write-Host ""

Write-Host "[*] Running Test 4.4.1: Batch Job Creation Tests..." -ForegroundColor Yellow
node test-phase4.4.1-batch-creation.js
Write-Host ""

Write-Host "[*] Running Test 4.4.2: Batch Job Operations Tests..." -ForegroundColor Yellow
node test-phase4.4.2-batch-operations.js
Write-Host ""

Write-Host "[*] Running Test 4.4.3: Bulk Campaign Creation Tests..." -ForegroundColor Yellow
node test-phase4.4.3-bulk-creation.js
Write-Host ""

# Check for VANES Phase 4 test files
Write-Host "=== Phase 4: VANES's Tests ===" -ForegroundColor Cyan
Write-Host ""

$vanesTests = @(
    "test-phase4.1.2-environment.js",
    "test-phase4.2.2-campaign-query.js",
    "test-phase4.3.1-ad-group.js",
    "test-phase4.3.2-ad.js",
    "test-phase4.3.3-keyword.js",
    "test-phase4.5.1-rest-api.js",
    "test-phase4.5.2-end-to-end.js"
)

foreach ($test in $vanesTests) {
    if (Test-Path $test) {
        Write-Host "[OK] Found: $test" -ForegroundColor Green
        Write-Host "[*] Running $test..." -ForegroundColor Yellow
        node $test
        Write-Host ""
    } else {
        Write-Host "[MISSING] $test" -ForegroundColor Red
    }
}

# Phase 5 Verification
Write-Host "=== Phase 5: Documentation & Cleanup ===" -ForegroundColor Cyan
Write-Host ""

# Check for API documentation
Write-Host "[*] Checking for API documentation..." -ForegroundColor Yellow
if (Test-Path "docs\marin-dispatcher-integration.md") {
    Write-Host "[OK] API documentation found" -ForegroundColor Green
} else {
    Write-Host "[MISSING] docs\marin-dispatcher-integration.md" -ForegroundColor Red
}

# Check for console.log statements
Write-Host "[*] Checking for console.log statements..." -ForegroundColor Yellow
$consoleLogs = Select-String -Path "src\services\*.ts" -Pattern "console\.log" | Measure-Object
if ($consoleLogs.Count -gt 0) {
    Write-Host "[WARNING] Found $($consoleLogs.Count) console.log statements" -ForegroundColor Yellow
    Write-Host "  These should be removed or replaced with proper logging" -ForegroundColor Yellow
} else {
    Write-Host "[OK] No console.log statements found" -ForegroundColor Green
}

# Check JSDoc coverage
Write-Host "[*] Checking JSDoc coverage..." -ForegroundColor Yellow
$jsdocCount = Select-String -Path "src\services\marinDispatcherService.ts", "src\services\marinBatchJobService.ts" -Pattern "/\*\*" | Measure-Object
Write-Host "  Found $($jsdocCount.Count) JSDoc comment blocks" -ForegroundColor Cyan

# Run final test suite
Write-Host ""
Write-Host "=== Final Test Suite ===" -ForegroundColor Cyan
Write-Host "[*] Running npm test..." -ForegroundColor Yellow
npm test
Write-Host ""

Write-Host "=== Verification Complete ===" -ForegroundColor Cyan

