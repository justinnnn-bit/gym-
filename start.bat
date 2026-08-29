@echo off
echo ========================================
echo   GYM ATTENDANCE SYSTEM
echo   Starting Server...
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Choose the LTS version and install it.
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    echo This may take a few minutes on first run...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo.
echo Starting server...
echo.
echo ========================================
echo   Server will be available at:
echo   http://localhost:3000
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
node server.js

pause
