# Face Recognition & Attendance System v2.0

A modern, full-stack face recognition and attendance tracking system built with FastAPI backend and Next.js frontend. Features real-time face detection, multi-angle enrollment, automated attendance logging, and comprehensive analytics dashboard.

## 🚀 Features

### Core Functionality
- **Real-time Face Recognition**: Live webcam feed with instant face detection and identification
- **Multi-angle Enrollment**: Guided 15-photo enrollment process for maximum accuracy (85-95%)
- **Automated Attendance**: Smart attendance logging with duplicate prevention
- **Modern Web Interface**: Responsive Next.js dashboard with real-time updates
- **Analytics Dashboard**: Comprehensive reports, trends, and attendance insights

### Technical Highlights
- **AI-Powered**: InsightFace ArcFace model for state-of-the-art face recognition
- **Data Augmentation**: Advanced face augmentation for improved recognition accuracy
- **FAISS Integration**: High-performance similarity search for large-scale deployments
- **RESTful API**: Well-documented FastAPI backend with automatic OpenAPI docs
- **Real-time Updates**: Live dashboard with WebSocket-like polling for instant updates

## 🏗️ Architecture

### Backend (FastAPI + Python)
```
backend/
├── src/
│   ├── app/                    # FastAPI application
│   │   ├── routes/            # API endpoints (status, recognition, enrollment, analytics)
│   │   ├── schemas.py        # Pydantic models
│   │   └── dependencies.py   # Shared dependencies
│   ├── face_system.py        # Core recognition engine
│   ├── analytics.py          # Analytics and reporting
│   ├── augmentation.py       # Face data augmentation
│   └── models/               # Detection, recognition, and quality modules
├── data/                     # Data storage
│   ├── models/               # AI model files
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

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Poetry (Python dependency management)
- Webcam for live recognition

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
poetry install

# Start the backend server
poetry run python run_backend.py
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

### Quick Start (Both Services)
```bash
# From project root
python3 run_dev.py
```

## 🚀 Running the System

### Development Mode
```bash
# Terminal 1: Backend
cd backend && poetry run python run_backend.py

# Terminal 2: Frontend  
cd frontend && npm run dev
```

### Production Mode
```bash
# Backend
cd backend && poetry run uvicorn src.app.main:app --host 0.0.0.0 --port 8000

# Frontend
cd frontend && npm run build && npm start
```

## 🌐 Access Points

- **Frontend Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Live Recognition**: http://localhost:3001/live
- **Analytics**: http://localhost:3001/analytics

## 🎯 Usage Guide

### 1. Enrolling New People
- Navigate to the Live Feed page
- Click "Guided Enroll (15 Photos - Best Accuracy)"
- Follow the guided process to capture multiple angles
- Provide a name for the person
- System will process and store the face embeddings

### 2. Real-time Recognition
- Go to the Live Feed page
- Click "Start Camera" to begin webcam feed
- Click "Start Recognition" to begin face detection
- System will identify enrolled people and log attendance automatically

### 3. Viewing Analytics
- Visit the Analytics page for comprehensive reports
- View attendance trends, daily statistics, and enrollment data
- Export data in various formats

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

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
The system uses InsightFace Buffalo_L model. Ensure the model files are in:
```
backend/data/models/models/buffalo_l/
├── det_10g.onnx
├── w600k_r50.onnx
├── 1k3d68.onnx
├── 2d106det.onnx
└── genderage.onnx
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
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the API documentation at `/docs`
- Review the test files for usage examples
- Open an issue on GitHub

---

**Built with ❤️ using FastAPI, Next.js, and InsightFace**