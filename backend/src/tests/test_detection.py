"""Tests for face detection module."""
import numpy as np
import pytest

from src.models.detection import DetectedFace, FaceDetector


@pytest.fixture
def detector():
    """Create detector instance."""
    return FaceDetector(use_gpu=False)  # Use CPU for tests


@pytest.fixture
def sample_image():
    """Create a dummy image (random noise)."""
    return np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)


def test_detector_initialization():
    """Test detector can be initialized."""
    detector = FaceDetector(use_gpu=False)
    assert detector is not None
    assert detector.use_gpu is False


def test_detect_empty_image(detector):
    """Test detection on empty image."""
    empty = np.array([])
    faces = detector.detect(empty)
    assert faces == []


def test_detect_returns_list(detector, sample_image):
    """Test detect returns list."""
    faces = detector.detect(sample_image)
    assert isinstance(faces, list)


def test_detected_face_properties():
    """Test DetectedFace properties."""
    bbox = np.array([10, 20, 110, 120])
    landmarks = np.random.rand(5, 2)
    image = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)

    face = DetectedFace(bbox=bbox, landmarks=landmarks, score=0.95, image=image)

    assert face.width == 100
    assert face.height == 100
    assert face.score == 0.95
    assert "DetectedFace" in repr(face)
