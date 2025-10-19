"""FastAPI application assembly."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.app.routes import analytics, enrollment, recognition, status

def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="Face Recognition API", 
        version="2.0.0",
        description="Face recognition and attendance tracking API"
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    api_prefix = "/api"

    app.include_router(status.router, prefix=api_prefix)
    app.include_router(enrollment.router, prefix=api_prefix)
    app.include_router(recognition.router, prefix=api_prefix)
    app.include_router(analytics.router, prefix=api_prefix)

    return app


app = create_app()


__all__ = ["app", "create_app"]