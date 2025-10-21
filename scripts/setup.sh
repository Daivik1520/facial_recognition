#!/bin/bash
# Setup script for Face Recognition System
# This script sets up the complete development environment

set -e  # Exit on any error

echo "🚀 Face Recognition System - Setup Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running from project root
if [ ! -f "pyproject.toml" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check system requirements
print_status "Checking system requirements..."

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
print_success "Python $PYTHON_VERSION found"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is required but not installed"
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js $NODE_VERSION found"

# Check Poetry
if ! command -v poetry &> /dev/null; then
    print_warning "Poetry not found. Installing Poetry..."
    curl -sSL https://install.python-poetry.org | python3 -
    export PATH="$HOME/.local/bin:$PATH"
fi

POETRY_VERSION=$(poetry --version)
print_success "Poetry found: $POETRY_VERSION"

# Setup backend
print_status "Setting up backend..."

cd backend

# Install Python dependencies
print_status "Installing Python dependencies..."
poetry install

# Download AI models
print_status "Downloading AI models..."
cd ../scripts
python3 download_models.py

cd ../backend

# Create necessary directories
print_status "Creating data directories..."
mkdir -p data/processed
mkdir -p data/augmented
mkdir -p logs

print_success "Backend setup complete!"

# Setup frontend
print_status "Setting up frontend..."

cd ../frontend

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install

print_success "Frontend setup complete!"

# Create environment file
print_status "Creating environment configuration..."

cd ../backend
if [ ! -f ".env" ]; then
    cat > .env << EOF
# Face Recognition System Configuration
# Recognition Settings
SIMILARITY_THRESHOLD=0.65
MIN_FACE_SIZE=60
BLUR_THRESHOLD=100.0

# Data Storage
DATA_DIR=./data
EMBEDDINGS_FILE=./data/processed/face_embeddings.json
ATTENDANCE_FILE=./data/processed/attendance.csv

# API Settings
API_HOST=0.0.0.0
API_PORT=8000

# Model Settings
DETECTION_MODEL=antelopev2
RECOGNITION_MODEL=antelopev2
DET_SIZE_WIDTH=640
DET_SIZE_HEIGHT=640
DET_THRESH=0.5
SIMILARITY_THRESHOLD=0.72
BATCH_SIZE=8
MAX_FACE_SIZE=640
MIN_FACE_SIZE=60
BLUR_THRESHOLD=100.0
MAX_YAW=45.0
MAX_PITCH=30.0
MIN_BRIGHTNESS=40
MAX_BRIGHTNESS=220

# Logging
LOG_LEVEL=INFO
EOF
    print_success "Created .env file"
else
    print_warning ".env file already exists, skipping creation"
fi

cd ..

# Final setup
print_status "Final setup..."

# Make scripts executable
chmod +x scripts/*.py
chmod +x scripts/*.sh

print_success "Setup complete! 🎉"
echo ""
echo "📋 Next steps:"
echo "1. Start the backend: cd backend && poetry run python run_backend.py"
echo "2. Start the frontend: cd frontend && npm run dev"
echo "3. Or run both: python3 run_dev.py"
echo ""
echo "🌐 Access points:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- API Docs: http://localhost:8000/docs"
echo ""
echo "📚 For more information, see README.md"
