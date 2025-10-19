"""Tests for quality filter module."""
import cv2
import numpy as np
import pytest

from src.models.detection import DetectedFace
from src.models.quality_filter import FaceQualityFilter, QualityMetrics


@pytest.fixture
def quality_filter():
    return FaceQualityFilter()


@pytest.fixture
def good_face():
    image = np.ones((150, 150, 3), dtype=np.uint8) * 128
    for i in range(0, 150, 10):
        cv2.line(image, (i, 0), (i, 150), (255, 255, 255), 1)
    bbox = np.array([0, 0, 150, 150])
    landmarks = np.array(
        [
            [45, 60],
            [105, 60],
            [75, 90],
            [50, 120],
            [100, 120],
        ],
        dtype=np.float32,
    )
    return DetectedFace(bbox=bbox, landmarks=landmarks, score=0.95, image=image)


@pytest.fixture
def small_face():
    image = np.ones((50, 50, 3), dtype=np.uint8) * 128
    bbox = np.array([0, 0, 50, 50])
    landmarks = np.random.rand(5, 2).astype(np.float32) * 50
    return DetectedFace(bbox=bbox, landmarks=landmarks, score=0.95, image=image)


@pytest.fixture
def blurry_face():
    image = np.ones((150, 150, 3), dtype=np.uint8) * 128
    image = cv2.GaussianBlur(image, (15, 15), 5)
    bbox = np.array([0, 0, 150, 150])
    landmarks = np.random.rand(5, 2).astype(np.float32) * 150
    return DetectedFace(bbox=bbox, landmarks=landmarks, score=0.95, image=image)


def test_filter_initialization():
    f = FaceQualityFilter(min_face_size=100, blur_threshold=150.0)
    assert f.min_face_size == 100
    assert f.blur_threshold == 150.0


def test_assess_good_face(quality_filter, good_face):
    metrics = quality_filter.assess(good_face)
    assert isinstance(metrics, QualityMetrics)
    assert metrics.size_ok is True
    assert metrics.blur_score > 0


def test_assess_small_face(quality_filter, small_face):
    metrics = quality_filter.assess(small_face)
    assert metrics.size_ok is False
    assert metrics.is_acceptable is False


def test_assess_blurry_face(quality_filter, blurry_face):
    metrics = quality_filter.assess(blurry_face)
    assert metrics.blur_score < 100.0


def test_filter_multiple_faces(quality_filter, good_face, small_face, blurry_face):
    faces = [good_face, small_face, blurry_face]
    filtered = quality_filter.filter(faces)
    assert len(filtered) < len(faces)


def test_brightness_computation():
    filter_obj = FaceQualityFilter()
    dark = np.ones((100, 100, 3), dtype=np.uint8) * 20  # Below min_brightness=40
    brightness_ok = filter_obj._check_brightness(dark)
    assert brightness_ok == False  # Too dark
    
    bright = np.ones((100, 100, 3), dtype=np.uint8) * 100  # Within range
    brightness_ok = filter_obj._check_brightness(bright)
    assert brightness_ok == True  # Good brightness


def test_blur_score_computation():
    filter_obj = FaceQualityFilter()
    sharp = np.zeros((100, 100, 3), dtype=np.uint8)
    sharp[::10, ::10] = 255
    blur_score = filter_obj._compute_blur_score(sharp)
    blurred = cv2.GaussianBlur(sharp, (15, 15), 5)
    blur_score_blurred = filter_obj._compute_blur_score(blurred)
    assert blur_score > blur_score_blurred


def test_quality_metrics_representation():
    metrics = QualityMetrics(
        blur_score=150.5,
        size_ok=True,
        pose_ok=True,
        brightness_ok=True,
        is_acceptable=True,
    )
    repr_str = repr(metrics)
    assert "Quality" in repr_str
    assert "150.5" in repr_str
