# Face Recognition & Attendance System

Production-ready face recognition and attendance tracking built with FastAPI and InsightFace. The platform delivers real-time identification, automatic attendance logging, and rich analytics in a modular, extensible codebase.

## 📚 Project Overview

- **Real-time recognition** powered by InsightFace ArcFace with guided multi-angle enrollment for 85–95% accuracy.
- **Automated attendance**: deduplicated CSV logging, on-demand exports, and live dashboards.
- **Modular design**: FastAPI app routers in `src/app/`, recognition logic in `src/face_system.py`, and detection/quality/FAISS components in `src/models/`.
- **Integrated UI** at `/ui` featuring webcam feed, analytics modal, report export, and file-upload workflows.
- **Extensibility**: optional FAISS acceleration, analytics pipeline (`src/analytics.py`), Docker support, and plans for DB/Redis integrations.

## 📊 Feature Highlights

- **Core**: live webcam recognition, multi-image enrollment, REST API, responsive UI, duplicate-safe attendance logging.
- **Enhanced**: analytics dashboards, trend reports, FAISS similarity search, system health metrics, Docker deployment.
- **Observability**: exportable JSON/CSV reports, confidence analysis, and `/system/health` diagnostics.

## 🧱 Repository Layout

```
student-surveillance/
├── src/
│   ├── app/                 # FastAPI app factory, routers, schemas, utils
│   ├── face_system.py       # Enrollment, recognition, attendance engine
│   ├── analytics.py         # Attendance analytics & reporting
│   ├── core/config.py       # Pydantic settings & filesystem bootstrap
│   ├── models/              # Detection, recognition, quality, FAISS modules
│   └── tests/               # Pytest suites (detection/quality/recognition)
├── data/
│   ├── models/              # InsightFace model cache (ignored in Git)
│   └── processed/           # Attendance CSV, embeddings JSON, reports
├── scripts/
│   ├── run_system.py        # Uvicorn launcher with port checks
│   └── install_enhanced.py  # Installs analytics & FAISS extras
├── Dockerfile & docker-compose.yml
└── pyproject.toml / poetry.lock
```

## ⚙️ API Surface

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | System heartbeat and enrollment count |
| `/ui` | GET | Built-in web interface |
| `/enroll` | POST | Enroll faces (multi-image aware) |
| `/recognize` | POST | Recognize faces & log attendance |
| `/attendance` | GET | Aggregate attendance metrics |
| `/delete/{name}` | DELETE | Remove an enrollee |
| `/analytics/dashboard` | GET | 30-day analytics report |
| `/analytics/trends` | GET | Trend slope calculations |
| `/analytics/export` | GET | Export analytics to file |
| `/system/health` | GET | Health metrics & recent activity |

## 🧰 Configuration

Adjust thresholds and storage paths in `.env` (copy from `.env.example`):

```env
SIMILARITY_THRESHOLD=0.65
MIN_FACE_SIZE=60
BLUR_THRESHOLD=100.0
```

## 🧪 Testing

```bash
PYTHONPATH=. poetry run pytest src/tests/ -v
```

## 🛠️ Setup & Installation

- **Prerequisites**
  - Python 3.11+
  - Poetry 1.8+
  - Webcam for live recognition
  - InsightFace `buffalo_l` model pack placed under `data/models/models/`

- **Clone + install dependencies**

  ```bash
  git clone https://github.com/preethamwork29/student-surveillance.git
  cd student-surveillance
  poetry install
  ```

- **Bootstrap environment**

  ```bash
  cp .env.example .env
  # edit .env to change thresholds, storage locations, or service URLs
  ```

- **Install enhanced tooling (optional)**

  ```bash
  poetry run python scripts/install_enhanced.py
  ```

## 🚀 Running the Project

- **Local development server**

  ```bash
  poetry run uvicorn src.app.main:app --host 0.0.0.0 --port 8000 --reload
  ```

- **Scripted launcher**

  ```bash
  poetry run python scripts/run_system.py
  ```

- **Docker orchestration**

  ```bash
  docker-compose up --build
  ```

- **Access points**
  - Web UI: http://127.0.0.1:8000/ui
  - API Docs (Swagger): http://127.0.0.1:8000/docs

## 🎯 Usage Tips

- **Enrollment**: provide a subject name, use guided 15-shot capture for high-quality embeddings, and ensure consistent lighting.
- **Recognition**: start live recognition from the UI or POST images to `/recognize`; attendance entries deduplicate per day.
- **Analytics**: after installing pandas/plotly/FAISS, explore dashboards via the UI modal or call `/analytics/*` endpoints directly.

## 🛣️ Roadmap & Extensions

- Database integrations (PostgreSQL) and ORM migrations
- Redis/RabbitMQ for caching and messaging
- Multi-camera ingestion and load balancing
- Expanded API/analytics test coverage and CI automation

## 📄 License

MIT License
# face_recognition
