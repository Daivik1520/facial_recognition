# 🎯 Face Recognition & Attendance System

A modern, full-stack face recognition and attendance tracking system built with FastAPI backend and Next.js frontend. Features real-time face detection, multi-angle enrollment, automated attendance logging, and comprehensive analytics dashboard.

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.5+-black.svg)](https://nextjs.org)
[![InsightFace](https://img.shields.io/badge/InsightFace-0.7+-orange.svg)](https://github.com/deepinsight/insightface)

## ✨ Features

### 🎯 Core Functionality
- **Real-time Face Recognition**: Live webcam feed with instant face detection and identification
- **Multi-angle Enrollment**: Guided 15-photo enrollment process for maximum accuracy (85-95%)
- **Automated Attendance**: Smart attendance logging with duplicate prevention
- **Modern Web Interface**: Responsive Next.js dashboard with real-time updates
- **Analytics Dashboard**: Comprehensive reports, trends, and attendance insights

### 🚀 Technical Highlights
- **AI-Powered**: InsightFace ArcFace model for state-of-the-art face recognition
- **Data Augmentation**: Advanced face augmentation for improved recognition accuracy
- **FAISS Integration**: High-performance similarity search for large-scale deployments
- **RESTful API**: Well-documented FastAPI backend with automatic OpenAPI docs
- **Real-time Updates**: Live dashboard with WebSocket-like polling for instant updates

## 🏗️ Architecture

```
student-surveillance/
├── backend/                 # FastAPI Backend
│   ├── src/                # Source code
│   │   ├── app/            # FastAPI application
│   │   ├── models/         # AI model interfaces
│   │   ├── face_system.py  # Core recognition engine
│   │   └── analytics.py    # Analytics and reporting
│   ├── data/               # Data storage (models excluded from git)
│   └── run_backend.py      # Backend launcher
├── frontend/               # Next.js Frontend
│   ├── src/                # Source code
│   │   ├── app/            # Next.js app router
│   │   ├── components/     # React components
│   │   └── lib/            # Utilities and API client
│   └── package.json        # Dependencies
├── scripts/                # Setup and utility scripts
│   ├── setup.sh           # Linux/Mac setup
│   ├── setup.bat          # Windows setup
│   └── download_models.py  # AI model downloader
└── run_dev.py             # Development launcher
```

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+** with Poetry
- **Node.js 18+** with npm
- **Webcam** for live recognition
- **8GB+ RAM** recommended for AI models

### 🛠️ Installation

#### Option 1: Automated Setup (Recommended)

**Linux/Mac:**
```bash
git clone <your-repo-url>
cd student-surveillance
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Windows:**
```cmd
git clone <your-repo-url>
cd student-surveillance
scripts\setup.bat
```

#### Option 2: Manual Setup

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd student-surveillance
```

2. **Download AI Models:**
```bash
cd scripts
python3 download_models.py
cd ..
```

3. **Setup Backend:**
```bash
cd backend
poetry install
poetry run python run_backend.py
```

4. **Setup Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 🎯 Running the System

#### Development Mode (Both Services)
```bash
# From project root
python3 run_dev.py
```

#### Individual Services
```bash
# Terminal 1: Backend
cd backend && poetry run python run_backend.py

# Terminal 2: Frontend  
cd frontend && npm run dev
```

### 🌐 Access Points
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Live Recognition**: http://localhost:3000/live
- **Analytics**: http://localhost:3000/analytics

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/status` | GET | System status and enrollment count |
| `/api/attendance` | GET | Attendance statistics |
| `/api/attendance/today` | GET | Today's attendance records |
| `/api/attendance/records` | GET | All attendance records |
| `/api/recognize` | POST | Recognize faces in image |
| `/api/enroll` | POST | Enroll new person |
| `/api/delete/{name}` | DELETE | Remove enrolled person |
| `/api/analytics/dashboard` | GET | Analytics dashboard data |
| `/api/analytics/trends` | GET | Attendance trends |
| `/api/analytics/export` | GET | Export analytics data |

## 🎯 Usage Guide

### 1. Enrolling New People
1. Navigate to the Live Feed page
2. Click "Guided Enroll (15 Photos - Best Accuracy)"
3. Follow the guided process to capture multiple angles
4. Provide a name for the person
5. System will process and store the face embeddings

### 2. Real-time Recognition
1. Go to the Live Feed page
2. Click "Start Camera" to begin webcam feed
3. Click "Start Recognition" to begin face detection
4. System will identify enrolled people and log attendance automatically

### 3. Viewing Analytics
1. Visit the Analytics page for comprehensive reports
2. View attendance trends, daily statistics, and enrollment data
3. Export data in various formats

## ⚙️ Configuration

### Environment Variables
The system uses environment variables for configuration. A `.env` file is created automatically during setup:

```env
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
```

### Model Configuration
The system uses InsightFace Buffalo_L model. The setup script automatically downloads and configures:
```
backend/data/models/models/buffalo_l/
├── det_10g.onnx          # Face detection
├── w600k_r50.onnx       # Face recognition
├── 1k3d68.onnx          # Landmark detection
├── 2d106det.onnx        # Additional detection
└── genderage.onnx       # Gender/age estimation
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
poetry run pytest src/tests/ -v
```

### API Testing
```bash
# Test system status
curl http://localhost:8000/api/status

# Test recognition (with image file)
curl -X POST -F "file=@test_image.jpg" http://localhost:8000/api/recognize
```

## 📈 Performance & Accuracy

- **Recognition Accuracy**: 85-95% with proper enrollment
- **Processing Speed**: Real-time detection at 30 FPS
- **Scalability**: Supports hundreds of enrolled individuals
- **Data Augmentation**: 15x augmented training data for improved accuracy

## 🛡️ Security & Privacy

- **Local Processing**: All face recognition happens locally
- **No Cloud Dependencies**: Complete offline operation
- **Data Encryption**: Face embeddings stored securely
- **Privacy-First**: No external data transmission

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Production Considerations
- Use HTTPS in production
- Configure proper CORS settings
- Set up database for persistent storage
- Implement proper logging and monitoring

## 📁 Project Structure

### Backend (FastAPI + Python)
```
backend/
├── src/
│   ├── app/                    # FastAPI application
│   │   ├── routes/            # API endpoints
│   │   ├── schemas.py        # Pydantic models
│   │   └── dependencies.py   # Shared dependencies
│   ├── face_system.py        # Core recognition engine
│   ├── analytics.py          # Analytics and reporting
│   ├── augmentation.py       # Face data augmentation
│   └── models/               # Detection, recognition, and quality modules
├── data/                     # Data storage (models auto-downloaded)
│   ├── models/               # AI model files (excluded from git)
│   ├── processed/            # Attendance records and embeddings
│   └── augmented/            # Augmented training data
└── run_backend.py           # Backend launcher
```

### Frontend (Next.js + TypeScript)
```
frontend/
├── src/
│   ├── app/                   # Next.js app router
│   │   ├── page.tsx          # Dashboard
│   │   ├── live/             # Live recognition feed
│   │   ├── attendance/       # Attendance management
│   │   └── analytics/        # Analytics dashboard
│   ├── components/           # React components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── recognition/      # Live feed components
│   │   ├── enrollment/      # Enrollment workflows
│   │   └── ui/              # Reusable UI components
│   ├── lib/                  # Utilities and API client
│   └── store/               # Zustand state management
└── package.json             # Dependencies
```

## 🔧 Troubleshooting

### Common Issues

**1. Model Download Fails**
```bash
# Manual model download
cd scripts
python3 download_models.py
```

**2. Permission Errors**
```bash
# Make scripts executable
chmod +x scripts/*.sh
chmod +x scripts/*.py
```

**3. Port Already in Use**
```bash
# Kill processes on ports 3000 and 8000
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

**4. Python/Node Version Issues**
- Ensure Python 3.11+ and Node.js 18+
- Use `python3 --version` and `node --version` to check

### Getting Help

1. **Check the logs**: Look in `backend/logs/` for error messages
2. **Verify setup**: Run `./scripts/setup.sh` again
3. **API documentation**: Visit http://localhost:8000/docs
4. **Open an issue**: Report bugs on GitHub

## 🔮 Roadmap

- [ ] Multi-camera support
- [ ] Database integration (PostgreSQL)
- [ ] Redis caching for performance
- [ ] Mobile app companion
- [ ] Advanced analytics and ML insights
- [ ] Multi-tenant support

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📞 Support

For issues and questions:
- Check the API documentation at `/docs`
- Review the test files for usage examples
- Open an issue on GitHub

---

**Built with ❤️ using FastAPI, Next.js, and InsightFace**

## 🎯 Quick Commands Reference

```bash
# Setup everything
./scripts/setup.sh                    # Linux/Mac
scripts\setup.bat                     # Windows

# Run development environment
python3 run_dev.py                    # Both services

# Individual services
cd backend && poetry run python run_backend.py
cd frontend && npm run dev

# Download models manually
cd scripts && python3 download_models.py

# Run tests
cd backend && poetry run pytest
```