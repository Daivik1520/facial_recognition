# 📦 Installation Guide

This guide provides detailed installation instructions for the Face Recognition & Attendance System.

## 🎯 Prerequisites

### System Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **RAM**: 8GB+ recommended (4GB minimum)
- **Storage**: 2GB free space for models and dependencies
- **Webcam**: Required for live recognition
- **Internet**: Required for initial setup (model download)

### Software Requirements
- **Python 3.11+** with pip
- **Node.js 18+** with npm
- **Poetry** (Python dependency manager)
- **Git** (for cloning the repository)

## 🛠️ Installation Methods

### Method 1: Automated Setup (Recommended)

#### Linux/macOS
```bash
# Clone the repository
git clone <your-repo-url>
cd student-surveillance

# Make setup script executable
chmod +x scripts/setup.sh

# Run automated setup
./scripts/setup.sh
```

#### Windows
```cmd
# Clone the repository
git clone <your-repo-url>
cd student-surveillance

# Run automated setup
scripts\setup.bat
```

### Method 2: Manual Setup

#### Step 1: Clone Repository
```bash
git clone <your-repo-url>
cd student-surveillance
```

#### Step 2: Install Python Dependencies

**Install Poetry (if not installed):**
```bash
# Linux/macOS
curl -sSL https://install.python-poetry.org | python3 -

# Windows (PowerShell)
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
```

**Install backend dependencies:**
```bash
cd backend
poetry install
```

#### Step 3: Download AI Models
```bash
cd scripts
python3 download_models.py
cd ..
```

#### Step 4: Install Node.js Dependencies
```bash
cd frontend
npm install
```

#### Step 5: Create Environment Configuration
```bash
cd backend
# Create .env file (copy from .env.example if available)
# Or the setup script will create one automatically
```

## 🔧 Platform-Specific Instructions

### Windows

#### Prerequisites Installation
1. **Python 3.11+**:
   - Download from [python.org](https://python.org)
   - Check "Add Python to PATH" during installation
   - Verify: `python --version`

2. **Node.js 18+**:
   - Download from [nodejs.org](https://nodejs.org)
   - Verify: `node --version`

3. **Git**:
   - Download from [git-scm.com](https://git-scm.com)
   - Verify: `git --version`

#### Running the Setup
```cmd
# Open Command Prompt or PowerShell as Administrator
git clone <your-repo-url>
cd student-surveillance
scripts\setup.bat
```

### macOS

#### Prerequisites Installation
1. **Install Homebrew** (if not installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. **Install Python and Node.js**:
```bash
brew install python@3.11 node
```

3. **Install Poetry**:
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

#### Running the Setup
```bash
git clone <your-repo-url>
cd student-surveillance
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Linux (Ubuntu/Debian)

#### Prerequisites Installation
```bash
# Update package list
sudo apt update

# Install Python 3.11 and pip
sudo apt install python3.11 python3.11-pip python3.11-venv

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt install git

# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -
```

#### Running the Setup
```bash
git clone <your-repo-url>
cd student-surveillance
chmod +x scripts/setup.sh
./scripts/setup.sh
```

## 🚀 Post-Installation

### Verify Installation
```bash
# Check backend
cd backend
poetry run python -c "import insightface; print('Backend OK')"

# Check frontend
cd frontend
npm run build
```

### Start the System
```bash
# Option 1: Run both services
python3 run_dev.py

# Option 2: Run individually
# Terminal 1: Backend
cd backend && poetry run python run_backend.py

# Terminal 2: Frontend
cd frontend && npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔧 Troubleshooting

### Common Issues

#### 1. Python Version Issues
```bash
# Check Python version
python3 --version

# If wrong version, install Python 3.11+
# Ubuntu/Debian
sudo apt install python3.11

# macOS
brew install python@3.11

# Windows: Download from python.org
```

#### 2. Poetry Installation Issues
```bash
# Linux/macOS: Add to PATH
export PATH="$HOME/.local/bin:$PATH"

# Windows: Add to system PATH
# Add %USERPROFILE%\AppData\Roaming\Python\Scripts to PATH
```

#### 3. Node.js Version Issues
```bash
# Check Node version
node --version

# Install Node.js 18+ if needed
# Use nvm for version management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### 4. Model Download Issues
```bash
# Manual model download
cd scripts
python3 download_models.py

# Check internet connection
curl -I https://github.com

# Check disk space
df -h  # Linux/macOS
dir    # Windows
```

#### 5. Port Already in Use
```bash
# Find processes using ports
lsof -i :3000  # Linux/macOS
lsof -i :8000

# Kill processes
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

#### 6. Permission Issues
```bash
# Linux/macOS: Make scripts executable
chmod +x scripts/*.sh
chmod +x scripts/*.py

# Windows: Run as Administrator
```

### Getting Help

1. **Check logs**: Look in `backend/logs/` for error messages
2. **Verify setup**: Run the setup script again
3. **Check dependencies**: Ensure all prerequisites are installed
4. **API documentation**: Visit http://localhost:8000/docs
5. **Open an issue**: Report problems on GitHub

## 📋 System Requirements Details

### Minimum Requirements
- **CPU**: 2 cores, 2.0 GHz
- **RAM**: 4GB
- **Storage**: 1GB free space
- **OS**: Windows 10, macOS 10.15, Ubuntu 18.04

### Recommended Requirements
- **CPU**: 4+ cores, 3.0+ GHz
- **RAM**: 8GB+
- **Storage**: 5GB+ free space
- **GPU**: Optional (CUDA-compatible for faster processing)

### AI Model Requirements
- **InsightFace Buffalo_L**: ~200MB download
- **Processing**: CPU-based (GPU optional)
- **Memory**: 2GB+ RAM for model loading

## 🔄 Updates and Maintenance

### Updating the System
```bash
# Pull latest changes
git pull origin main

# Update dependencies
cd backend && poetry update
cd frontend && npm update

# Re-run setup if needed
./scripts/setup.sh
```

### Backup Important Data
```bash
# Backup enrollment data
cp backend/data/processed/face_embeddings.json backup/
cp backend/data/processed/attendance.csv backup/
```

### Uninstalling
```bash
# Remove dependencies
cd backend && poetry env remove python
cd frontend && rm -rf node_modules

# Remove data (optional)
rm -rf backend/data/
rm -rf frontend/.next/
```
