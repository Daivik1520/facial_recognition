"""Recognition endpoints."""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from src.app.dependencies import get_face_system
from src.app.schemas import FaceResult, RecognitionResponse
from src.app.utils import decode_image
from src.face_system import FaceRecognitionSystem

router = APIRouter(prefix="/recognize", tags=["recognition"])


@router.post("", response_model=RecognitionResponse)
async def recognize_faces(
    file: UploadFile = File(...),
    threshold: float = 0.5,
    face_system: FaceRecognitionSystem = Depends(get_face_system),
) -> RecognitionResponse:
    """Recognize faces in the uploaded image."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image = decode_image(await file.read())
    results = face_system.recognize_face(image, threshold)

    attendance_logged: List[str] = []
    faces: List[FaceResult] = []

    for result in results:
        if result["matched"] and result["name"]:
            logged = face_system.log_attendance(result["name"], result["confidence"])
            if logged:
                attendance_logged.append(result["name"])

        faces.append(
            FaceResult(
                bbox=result["bbox"],
                matched=result["matched"],
                name=result["name"],
                confidence=result["confidence"],
                det_score=result["det_score"],
            )
        )

    response = RecognitionResponse(count=len(faces), faces=faces)
    if attendance_logged:
        response.attendance_logged = attendance_logged
    return response
