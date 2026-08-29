@echo off
echo ========================================
echo   PUSH TO GITHUB - FITZONE GYM
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed!
    echo.
    echo Please install Git from: https://git-scm.com/downloads
    echo.
    pause
    exit /b 1
)

echo Step 1: Checking Git status...
git status
echo.

echo Step 2: Adding all files...
git add .
echo.

echo Step 3: Ready to commit!
echo.
set /p commit_message="Enter commit message (or press Enter for default): "

if "%commit_message%"=="" (
    set commit_message=Update FitZone Gym Attendance System
)

echo.
echo Committing with message: %commit_message%
git commit -m "%commit_message%"

echo.
echo Step 4: Pushing to GitHub...
echo.

REM Check if remote exists
git remote -v | findstr origin >nul
if %errorlevel% neq 0 (
    echo.
    echo No remote repository configured!
    echo.
    echo To add a remote repository, run:
    echo git remote add origin https://github.com/YOUR_USERNAME/fitzone-gym-attendance.git
    echo.
    pause
    exit /b 1
)

git push

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCCESS! Code pushed to GitHub!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo   PUSH FAILED!
    echo   Check error messages above
    echo ========================================
)

echo.
pause
