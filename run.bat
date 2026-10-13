@echo off
title CineWood Launcher
color 0C
echo ===================================================
echo               CINEWOOD STREAMING APP
echo ===================================================
echo.

:: 1. Check & Start MySQL
echo [1/3] Checking MySQL on port 3306...
netstat -ano | findstr ":3306 " | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo       [OK] MySQL is already running on port 3306.
) else (
    echo       Starting MySQL service...
    net start MySQL80 >nul 2>&1
    if errorlevel 1 (
        if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" (
            start "CineWood - MySQL Database" cmd /k ""C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --port=3306 --console"
            timeout /t 3 /nobreak >nul
        )
    )
)

:: 2. Start Spring Boot Backend
echo.
echo [2/3] Starting Spring Boot Backend on port 8080...
start "CineWood - Spring Boot Backend" cmd /k "cd /d "%~dp0backend" && mvnw.cmd spring-boot:run"

:: Wait 4 seconds
timeout /t 4 /nobreak >nul

:: 3. Start Frontend Dev Server
echo.
echo [3/3] Starting Frontend on http://localhost:5173...
start "CineWood - Vite Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ===================================================
echo All services launched!
echo Open your browser at: http://localhost:5173
echo.
echo Demo Accounts:
echo   - Admin: admin@cinewood.com / admin123
echo   - User:  user@cinewood.com / user123
echo ===================================================
echo.
pause
