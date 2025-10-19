#!/usr/bin/env python3
"""
Run the FastAPI backend server.
"""
import uvicorn
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    uvicorn.run(
        "src.api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(backend_dir / "src")]
    )
