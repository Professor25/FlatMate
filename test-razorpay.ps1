# Razorpay Payment Integration Test Script
# Run this script to verify your Razorpay integration is working correctly

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   Razorpay Integration Test Suite" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
Write-Host "1. Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "   ✓ .env file found" -ForegroundColor Green
    
    # Check for required variables
    $envContent = Get-Content .env -Raw
    $required = @('RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'VITE_RAZORPAY_KEY_ID')
    $missing = @()
    
    foreach ($var in $required) {
        if ($envContent -match "$var=\w+") {
            Write-Host "   ✓ $var is set" -ForegroundColor Green
        } else {
            Write-Host "   ✗ $var is missing or empty" -ForegroundColor Red
            $missing += $var
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Host ""
        Write-Host "   ⚠ Missing variables. Please update your .env file." -ForegroundColor Yellow
        Write-Host "   See QUICKSTART.md for setup instructions." -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✗ .env file not found" -ForegroundColor Red
    Write-Host "   Please create .env file. See QUICKSTART.md" -ForegroundColor Yellow
}

Write-Host ""

# Check if node_modules exists
Write-Host "2. Checking dependencies..." -ForegroundColor Yellow
if (Test-Path node_modules) {
    Write-Host "   ✓ node_modules found" -ForegroundColor Green
    
    # Check for Razorpay package
    if (Test-Path node_modules/razorpay) {
        Write-Host "   ✓ Razorpay package installed" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Razorpay package not found" -ForegroundColor Red
        Write-Host "   Run: npm install" -ForegroundColor Yellow
    }
    
    # Check for Express
    if (Test-Path node_modules/express) {
        Write-Host "   ✓ Express installed" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Express not found" -ForegroundColor Red
        Write-Host "   Run: npm install" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✗ Dependencies not installed" -ForegroundColor Red
    Write-Host "   Run: npm install" -ForegroundColor Yellow
}

Write-Host ""

# Check server file
Write-Host "3. Checking server files..." -ForegroundColor Yellow
if (Test-Path server/index.js) {
    Write-Host "   ✓ Backend server file found" -ForegroundColor Green
} else {
    Write-Host "   ✗ server/index.js not found" -ForegroundColor Red
}

if (Test-Path src/utils/razorpay.js) {
    Write-Host "   ✓ Razorpay utilities found" -ForegroundColor Green
} else {
    Write-Host "   ✗ src/utils/razorpay.js not found" -ForegroundColor Red
}

Write-Host ""

# Test backend server (if running)
Write-Host "4. Testing backend server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ Backend server is running" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Message: $($data.message)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ✗ Backend server not responding" -ForegroundColor Yellow
    Write-Host "   Start it with: npm run server" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   Test Summary" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Ensure all checks pass (✓)" -ForegroundColor White
Write-Host "  2. Start the app: npm run dev:full" -ForegroundColor White
Write-Host "  3. Test payment with test credentials" -ForegroundColor White
Write-Host ""
Write-Host "For detailed setup instructions, see:" -ForegroundColor White
Write-Host "  - QUICKSTART.md (quick setup)" -ForegroundColor Cyan
Write-Host "  - RAZORPAY_SETUP.md (detailed guide)" -ForegroundColor Cyan
Write-Host ""
