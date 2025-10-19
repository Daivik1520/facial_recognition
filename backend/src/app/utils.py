"""Utility helpers for the FastAPI layer."""
from __future__ import annotations

import cv2
import numpy as np
from fastapi import HTTPException


def decode_image(file_data: bytes) -> np.ndarray:
    """Decode uploaded image bytes into a BGR numpy array."""
    nparr = np.frombuffer(file_data, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image format")
    return image
