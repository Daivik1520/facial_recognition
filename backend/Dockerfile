# Face Recognition System - Production Docker Image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libgl1-mesa-dri \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgthread-2.0-0 \
    libgtk-3-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry (>=1.8) with export plugin
RUN pip install --no-cache-dir "poetry==1.8.3" "poetry-plugin-export>=1.6.0"

# Set work directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml poetry.lock ./

# Export dependencies and install with pip
ENV POETRY_VIRTUALENVS_CREATE=false \
    POETRY_CACHE_DIR=/tmp/poetry-cache
RUN poetry export --without-hashes -f requirements.txt -o requirements.txt \
    && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directories
RUN mkdir -p data/models data/processed logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Run the application
CMD ["python", "-m", "uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]
