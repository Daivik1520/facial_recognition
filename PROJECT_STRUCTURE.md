# Project Structure

## 📁 Clean Project Organization

```
student-surveillance/
├── README.md                    # Project documentation
├── start.py                     # One-command startup script
├── start.sh                     # Unix startup script
├── start.bat                    # Windows startup script
│
├── backend/                     # FastAPI Backend
│   ├── src/                     # Source code
│   │   ├── app/                 # FastAPI application
│   │   │   ├── main.py          # App assembly
│   │   │   ├── routes/          # API endpoints
│   │   │   │   ├── status.py    # System status
│   │   │   │   ├── recognition.py # Face recognition
│   │   │   │   ├── enrollment.py # Person enrollment
│   │   │   │   └── analytics.py # Analytics & reporting
│   │   │   ├── schemas.py       # Pydantic models
│   │   │   ├── dependencies.py  # Shared dependencies
│   │   │   └── utils.py         # Utility functions
│   │   ├── face_system.py       # Core recognition engine
│   │   ├── analytics.py         # Advanced analytics
│   │   ├── augmentation.py     # Face data augmentation
│   │   ├── models/              # AI model components
│   │   │   ├── detection.py     # Face detection
│   │   │   └── recognition.py   # Face recognition
│   │   ├── core/                # Core configuration
│   │   │   └── config.py        # Settings
│   │   └── tests/               # Test files
│   │       ├── test_detection.py
│   │       └── test_recognition.py
│   ├── data/                    # Data storage
│   │   ├── models/              # AI model files
│   │   └── processed/           # Attendance & embeddings
│   ├── pyproject.toml          # Python dependencies
│   ├── poetry.lock             # Lock file
│   ├── run_backend.py          # Backend launcher
│   ├── Dockerfile              # Docker configuration
│   └── docker-compose.yml      # Docker Compose
│
└── frontend/                    # Next.js Frontend
    ├── src/                     # Source code
    │   ├── app/                 # Next.js app router
    │   │   ├── page.tsx         # Dashboard
    │   │   ├── live/            # Live recognition
    │   │   ├── attendance/       # Attendance management
    │   │   ├── analytics/       # Analytics dashboard
    │   │   └── settings/        # Settings page
    │   ├── components/          # React components
    │   │   ├── dashboard/       # Dashboard components
    │   │   ├── recognition/     # Live feed components
    │   │   ├── enrollment/      # Enrollment workflows
    │   │   ├── attendance/      # Attendance components
    │   │   ├── layout/         # Layout components
    │   │   └── ui/             # Reusable UI components
    │   ├── lib/                # Utilities and API client
    │   ├── store/              # Zustand state management
    │   └── types/              # TypeScript definitions
    ├── public/                 # Static assets
    ├── package.json           # Node.js dependencies
    ├── next.config.ts         # Next.js configuration
    ├── tailwind.config.ts      # Tailwind CSS config
    └── tsconfig.json          # TypeScript config
```

## 🧹 Cleanup Summary

### ✅ Removed Files:
- **Documentation**: Removed duplicate and outdated docs
- **Demo Files**: Removed demo images and test scripts
- **Duplicate Code**: Removed duplicate source directories
- **Unused Modules**: Removed unused FAISS, quality filter, preprocessing
- **Unused Assets**: Removed unused SVG icons
- **Debug Pages**: Removed debug page from frontend

### ✅ Kept Essential Files:
- **Core Backend**: FastAPI app with all routes
- **Core Frontend**: Next.js app with all pages
- **AI Models**: InsightFace model files
- **Data Storage**: Attendance and embedding files
- **Startup Scripts**: All platform startup scripts
- **Configuration**: All necessary config files

## 🚀 Quick Start

```bash
# One command to start everything
python3 start.py
```

The system will automatically:
- Install dependencies
- Start backend on port 8000
- Start frontend on port 3000/3001
- Display access points
