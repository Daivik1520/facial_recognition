"""Enrollment endpoints."""
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from src.app.dependencies import get_face_system
from src.app.utils import decode_image
from src.face_system import FaceRecognitionSystem

router = APIRouter(tags=["enrollment"])


@router.post("/enroll")
async def enroll_person(
    name: str = Form(...),
    files: List[UploadFile] = File(...),
    use_augmentation: bool = Form(True),
    augmentation_preset: str = Form("balanced"),
    student_class: Optional[str] = Form(None),
    section: Optional[str] = Form(None),
    house: Optional[str] = Form(None),
    face_system: FaceRecognitionSystem = Depends(get_face_system),
) -> dict[str, object]:
    """
    Enroll a person with one or more face images.
    
    Args:
        name: Person's name
        files: Image files to enroll
        use_augmentation: Whether to use data augmentation (default: True)
        augmentation_preset: Augmentation preset - 'minimal', 'balanced', or 'aggressive' (default: 'balanced')
        student_class: Optional class/grade (e.g., "10", "12")
        section: Optional section (e.g., "A", "B")
        house: Optional house name (e.g., "Red", "Blue")
    
    Returns:
        Enrollment result with statistics
    """
    if not files:
        raise HTTPException(status_code=400, detail="At least one image file required")

    images = []
    for file in files:
        if not file.content_type.startswith("image/"):
            continue

        file_data = await file.read()
        try:
            image = decode_image(file_data)
        except HTTPException:
            continue
        images.append(image)

    if not images:
        raise HTTPException(status_code=400, detail="No valid images provided")

    # Use augmentation if enabled
    if use_augmentation and face_system.enable_augmentation:
        if len(images) == 1:
            result = face_system.enroll_with_augmentation(name, images[0])
        else:
            result = face_system.enroll_multiple_with_augmentation(name, images)
        
        if not result["success"]:
            raise HTTPException(status_code=422, detail={
                "error": "No faces detected",
                "images_processed": len(images)
            })
        
        # Save user metadata if provided
        if student_class or section or house:
            face_system.user_metadata[name] = {
                'student_class': student_class or '',
                'section': section or '',
                'house': house or ''
            }
            face_system.save_user_metadata()
        
        return {
            "message": f"Successfully enrolled {name} with augmentation",
            "total_enrolled": face_system.get_enrolled_count(),
            "images_processed": len(images),
            "successful_enrollments": result["enrolled_count"],
            "total_embeddings": result["total_embeddings"],
            "augmented_count": result["augmented_count"],
            "original_count": result["original_count"],
            "avg_quality": round(result["avg_quality"], 3),
            "augmentation_used": True,
            "augmentation_preset": augmentation_preset,
            "student_class": student_class or '',
            "section": section or '',
            "house": house or '',
        }
    else:
        # Standard enrollment without augmentation
        if len(images) == 1:
            success = face_system.enroll_person(
                name, images[0],
                student_class=student_class,
                section=section,
                house=house
            )
            if not success:
                raise HTTPException(status_code=422, detail={
                    "error": "No face detected in image",
                    "images_processed": 1
                })

            return {
                "message": f"Successfully enrolled {name}",
                "total_enrolled": face_system.get_enrolled_count(),
                "images_processed": 1,
                "augmentation_used": False,
                "student_class": student_class or '',
                "section": section or '',
                "house": house or '',
            }

        result = face_system.enroll_multiple_images(name, images)
        if not result["success"]:
            raise HTTPException(status_code=422, detail={
                "error": "No faces detected in any images",
                "images_processed": len(images)
            })
        
        # Save user metadata for multiple images enrollment
        if student_class or section or house:
            face_system.user_metadata[name] = {
                'student_class': student_class or '',
                'section': section or '',
                'house': house or ''
            }
            face_system.save_user_metadata()

        return {
            "message": f"Successfully enrolled {name} with {result['enrolled_count']} images",
            "total_enrolled": face_system.get_enrolled_count(),
            "images_processed": len(images),
            "successful_enrollments": result["enrolled_count"],
            "total_embeddings": result["total_embeddings"],
            "avg_quality": round(result["avg_quality"], 3),
            "augmentation_used": False,
            "student_class": student_class or '',
            "section": section or '',
            "house": house or '',
        }


@router.delete("/delete/{name}")
def delete_person(
    name: str,
    face_system: FaceRecognitionSystem = Depends(get_face_system),
) -> dict[str, object]:
    """Delete a specific person's enrollment data."""
    success = face_system.delete_person(name)
    if success:
        return {
            "message": f"Successfully deleted {name}",
            "remaining_count": face_system.get_enrolled_count(),
        }

    raise HTTPException(status_code=404, detail=f"Person '{name}' not found")


@router.delete("/clear")
def clear_all_data(
    face_system: FaceRecognitionSystem = Depends(get_face_system),
) -> dict[str, object]:
    """Clear all enrollment data."""
    face_system.clear_all_data()
    return {
        "message": "All enrollment data cleared",
        "enrolled_count": face_system.get_enrolled_count(),
    }
