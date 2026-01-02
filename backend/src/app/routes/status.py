"""Status and attendance endpoints."""
from __future__ import annotations

import csv

from fastapi import APIRouter, Depends

from src.app.dependencies import get_face_system
from src.face_system import FaceRecognitionSystem

router = APIRouter(tags=["status"])


@router.get("/")
def root(face_system: FaceRecognitionSystem = Depends(get_face_system)) -> dict[str, object]:
    """Return API metadata and enrollment count."""
    return {
        "message": "Face Recognition API v2.0",
        "enrolled_count": face_system.get_enrolled_count(),
    }


@router.get("/status")
def get_status(face_system: FaceRecognitionSystem = Depends(get_face_system)) -> dict[str, object]:
    """Return current system status and attendance metrics."""
    attendance_stats = face_system.get_attendance_stats()
    return {
        "enrolled_count": face_system.get_enrolled_count(),
        "enrolled_names": face_system.get_enrolled_names(),
        "enrolled_users": face_system.get_all_users_with_metadata(),
        "model": "InsightFace ArcFace",
        "attendance": attendance_stats,
    }


@router.get("/attendance")
def get_attendance(face_system: FaceRecognitionSystem = Depends(get_face_system)) -> dict[str, object]:
    """Return attendance statistics aggregations."""
    return face_system.get_attendance_stats()


@router.get("/attendance/today")
def get_today_attendance(face_system: FaceRecognitionSystem = Depends(get_face_system)) -> dict[str, object]:
    """Return today's attendance list."""
    today_stats = face_system.get_attendance_stats()
    today = today_stats.get("date") or today_stats.get("today_date")
    if today is None:
        # `get_attendance_stats()` does not expose the date; default to enrolled names list
        today = today_stats.get("today_names")
    today_attendance = face_system.get_today_attendance()
    return {
        "date": today,
        "attendees": today_attendance,
        "count": len(today_attendance),
    }


@router.get("/attendance/records")
def get_attendance_records(face_system: FaceRecognitionSystem = Depends(get_face_system)) -> dict[str, object]:
    """Return raw attendance records from the CSV ledger."""
    file_path = face_system.attendance_file
    records: list[dict[str, object]] = []

    if file_path.exists():
        with open(file_path, "r", newline="", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                confidence_value: float | None = None
                confidence_raw = row.get("Confidence")
                if confidence_raw:
                    try:
                        confidence_value = float(confidence_raw)
                    except ValueError:
                        confidence_value = None

                records.append(
                    {
                        "date": row.get("Date", ""),
                        "time": row.get("Time", ""),
                        "name": row.get("Name", ""),
                        "confidence": confidence_value,
                        "status": row.get("Status", ""),
                    }
                )

    return {"records": records}


@router.get("/attendance/absentees")
def get_absentees(
    date: str = None,
    student_class: str = None,
    section: str = None,
    house: str = None,
    face_system: FaceRecognitionSystem = Depends(get_face_system),
) -> dict[str, object]:
    """
    Get list of absentees for a specific date with optional filters.
    
    Args:
        date: Date in YYYY-MM-DD format (defaults to today)
        student_class: Filter by class
        section: Filter by section  
        house: Filter by house
    """
    return face_system.get_absentees_for_date(
        target_date=date,
        student_class=student_class,
        section=section,
        house=house
    )


@router.get("/attendance/filters")
def get_available_filters(
    face_system: FaceRecognitionSystem = Depends(get_face_system),
) -> dict[str, object]:
    """Get available filter options for class, section, and house."""
    return face_system.get_available_filters()