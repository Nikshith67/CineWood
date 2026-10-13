# CineWood Launcher for PowerShell
Write-Host "===================================================" -ForegroundColor Red
Write-Host "              CINEWOOD STREAMING APP" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Red
Write-Host ""

# 1. Check MySQL
Write-Host "[1/3] Checking MySQL on port 3306..." -ForegroundColor Cyan
$mysqlConnection = Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue
if ($mysqlConnection) {
    Write-Host "      [OK] MySQL is already running on port 3306." -ForegroundColor Green
} else {
    Write-Host "      Starting MySQL80 service..." -ForegroundColor Yellow
    Start-Service -Name MySQL80 -ErrorAction SilentlyContinue
}

# 2. Start Backend
Write-Host "`n[2/3] Starting Spring Boot Backend on port 8080..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .\mvnw.cmd spring-boot:run"

Start-Sleep -Seconds 4

# 3. Start Frontend
Write-Host "`n[3/3] Starting Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host "All services launched!" -ForegroundColor Green
Write-Host "Open your browser at: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Demo Accounts:" -ForegroundColor White
Write-Host "  - Admin: admin@cinewood.com / admin123" -ForegroundColor White
Write-Host "  - User:  user@cinewood.com / user123" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Green


OR SIMPLY RUN IN TERMINAL, IN CURRENT TERMINAL IN THE PROJECT ROOT

.\run.ps1   or  .\run.bat