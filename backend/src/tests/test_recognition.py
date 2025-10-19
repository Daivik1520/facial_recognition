"""Tests for face recognition module."""
import numpy as np
import pytest

from src.models.detection import DetectedFace
from src.models.recognition import EmbeddingExtractor, FaceRecognizer, StudentMatch


@pytest.fixture
def extractor():
    return EmbeddingExtractor(use_gpu=False)


@pytest.fixture
def recognizer():
    return FaceRecognizer(similarity_threshold=0.65)


@pytest.fixture
def sample_face_image():
    return np.random.randint(0, 255, (112, 112, 3), dtype=np.uint8)


@pytest.fixture
def detected_face(sample_face_image):
    bbox = np.array([0, 0, 112, 112])
    landmarks = np.random.rand(5, 2)
    return DetectedFace(bbox=bbox, landmarks=landmarks, score=0.95, image=sample_face_image)


def test_extractor_initialization():
    extractor = EmbeddingExtractor(use_gpu=False)
    assert extractor is not None
    assert extractor.embedding_dim == 512


def test_extractor_empty_image(extractor):
    empty = np.array([])
    embedding = extractor.extract(empty)
    assert embedding is None


def test_recognizer_initialization():
    r = FaceRecognizer(similarity_threshold=0.7)
    assert r.similarity_threshold == 0.7
    assert r.get_enrolled_count() == 0


def test_enrollment(recognizer, sample_face_image):
    result = recognizer.enroll("student_001", sample_face_image)
    if result:
        assert recognizer.get_enrolled_count() == 1


def test_clear_enrollments(recognizer):
    recognizer.enrolled_embeddings["test"] = np.random.rand(512).astype(np.float32)
    assert recognizer.get_enrolled_count() == 1
    recognizer.clear_enrollments()
    assert recognizer.get_enrolled_count() == 0


def test_student_match_representation():
    embedding = np.random.rand(512).astype(np.float32)
    match = StudentMatch(
        student_id="student_001", confidence=0.85, embedding=embedding, is_match=True
    )
    assert "Match" in repr(match)
    assert "student_001" in repr(match)
    no_match = StudentMatch(student_id=None, confidence=0.45, embedding=embedding, is_match=False)
    assert "NoMatch" in repr(no_match)


def test_cosine_similarity():
    vec1 = np.array([1.0, 0.0, 0.0])
    vec1 = vec1 / np.linalg.norm(vec1)
    vec2 = np.array([1.0, 0.0, 0.0])
    vec2 = vec2 / np.linalg.norm(vec2)
    similarity = FaceRecognizer._cosine_similarity(vec1, vec2)
    assert abs(similarity - 1.0) < 0.01
