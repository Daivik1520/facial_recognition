"""Pydantic schemas used by the FastAPI application."""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel


class FaceResult(BaseModel):
    bbox: List[int]
    matched: bool
    name: Optional[str]
    confidence: float
    det_score: float


class RecognitionResponse(BaseModel):
    count: int
    faces: List[FaceResult]
    attendance_logged: Optional[List[str]] = []
