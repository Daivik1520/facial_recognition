"""Shared dependency utilities for FastAPI routers."""
from __future__ import annotations

from functools import lru_cache

from src.face_system import FaceRecognitionSystem


@lru_cache(maxsize=1)
def get_face_system() -> FaceRecognitionSystem:
    """Return a singleton instance of the face recognition system."""
    return FaceRecognitionSystem()
