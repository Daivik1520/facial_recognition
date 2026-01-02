"""Utility helpers for the FastAPI layer."""
from __future__ import annotations

import cv2
import numpy as np
from fastapi import HTTPException
from io import BytesIO
from PIL import Image, ImageOps


def decode_image(file_data: bytes) -> np.ndarray:
    """Decode uploaded image bytes into a BGR numpy array."""
    try:
        pil_img = Image.open(BytesIO(file_data))
        pil_img = ImageOps.exif_transpose(pil_img)
        pil_img = pil_img.convert('RGB')
        rgb = np.array(pil_img)
        bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
        return bgr
    except Exception:
        nparr = np.frombuffer(file_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        return image
