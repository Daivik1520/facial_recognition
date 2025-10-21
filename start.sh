#!/bin/bash
# One-command startup script for Face Recognition System

echo "🚀 Face Recognition System - Quick Start"
echo "========================================"

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.11+"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "start.py" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Make the script executable and run it
chmod +x start.py
python3 start.py
