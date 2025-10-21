@echo off
REM Setup script for Face Recognition System (Windows)
REM This script sets up the complete development environment

echo 🚀 Face Recognition System - Setup Script (Windows)
echo ==================================================

REM Check if running from project root
if not exist "pyproject.toml" (
    echo ❌ Please run this script from the project root directory
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Frontend directory not found
    exit /b 1
)

if not exist "backend" (
    echo ❌ Backend directory not found
    exit /b 1
)

echo ✅ Project structure verified

REM Check system requirements
echo 📋 Checking system requirements...

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not installed
    echo Please install Python 3.11+ from https://python.org
    exit /b 1
)

echo ✅ Python found

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not installed
    echo Please install Node.js from https://nodejs.org
    exit /b 1
)

echo ✅ Node.js found

REM Check Poetry
poetry --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Poetry not found. Installing Poetry...
    powershell -Command "(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -"
    if errorlevel 1 (
        echo ❌ Failed to install Poetry
        echo Please install Poetry manually: https://python-poetry.org/docs/#installation
        exit /b 1
    )
)

echo ✅ Poetry found

REM Setup backend
echo 🔧 Setting up backend...

cd backend

REM Install Python dependencies
echo 📦 Installing Python dependencies...
poetry install
if errorlevel 1 (
    echo ❌ Failed to install Python dependencies
    exit /b 1
)

REM Download AI models
echo 🤖 Downloading AI models...
cd ..\scripts
python download_models.py
if errorlevel 1 (
    echo ❌ Failed to download models
    exit /b 1
)

cd ..\backend

REM Create necessary directories
echo 📁 Creating data directories...
if not exist "data\processed" mkdir data\processed
if not exist "data\augmented" mkdir data\augmented
if not exist "logs" mkdir logs

echo ✅ Backend setup complete!

REM Setup frontend
echo 🎨 Setting up frontend...

cd ..\frontend

REM Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
npm install
if errorlevel 1 (
    echo ❌ Failed to install Node.js dependencies
    exit /b 1
)

echo ✅ Frontend setup complete!

REM Create environment file
echo ⚙️ Creating environment configuration...

cd ..\backend
if not exist ".env" (
    echo # Face Recognition System Configuration > .env
    echo # Recognition Settings >> .env
    echo SIMILARITY_THRESHOLD=0.65 >> .env
    echo MIN_FACE_SIZE=60 >> .env
    echo BLUR_THRESHOLD=100.0 >> .env
    echo. >> .env
    echo # Data Storage >> .env
    echo DATA_DIR=./data >> .env
    echo EMBEDDINGS_FILE=./data/processed/face_embeddings.json >> .env
    echo ATTENDANCE_FILE=./data/processed/attendance.csv >> .env
    echo. >> .env
    echo # API Settings >> .env
    echo API_HOST=0.0.0.0 >> .env
    echo API_PORT=8000 >> .env
    echo. >> .env
    echo # Model Settings >> .env
    echo DETECTION_MODEL=antelopev2 >> .env
    echo RECOGNITION_MODEL=antelopev2 >> .env
    echo DET_SIZE_WIDTH=640 >> .env
    echo DET_SIZE_HEIGHT=640 >> .env
    echo DET_THRESH=0.5 >> .env
    echo SIMILARITY_THRESHOLD=0.72 >> .env
    echo BATCH_SIZE=8 >> .env
    echo MAX_FACE_SIZE=640 >> .env
    echo MIN_FACE_SIZE=60 >> .env
    echo BLUR_THRESHOLD=100.0 >> .env
    echo MAX_YAW=45.0 >> .env
    echo MAX_PITCH=30.0 >> .env
    echo MIN_BRIGHTNESS=40 >> .env
    echo MAX_BRIGHTNESS=220 >> .env
    echo. >> .env
    echo # Logging >> .env
    echo LOG_LEVEL=INFO >> .env
    
    echo ✅ Created .env file
) else (
    echo ⚠️ .env file already exists, skipping creation
)

cd ..

echo.
echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo 1. Start the backend: cd backend ^&^& poetry run python run_backend.py
echo 2. Start the frontend: cd frontend ^&^& npm run dev
echo 3. Or run both: python run_dev.py
echo.
echo 🌐 Access points:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000
echo - API Docs: http://localhost:8000/docs
echo.
echo 📚 For more information, see README.md

pause
