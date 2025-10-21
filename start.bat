@echo off
REM One-command startup script for Face Recognition System (Windows)

echo 🚀 Face Recognition System - Quick Start
echo ========================================

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.11+
    pause
    exit /b 1
)

REM Check if we're in the right directory
if not exist "start.py" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

REM Run the Python startup script
python start.py
pause
