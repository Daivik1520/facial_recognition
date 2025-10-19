"""
Simple face recognition system using InsightFace ArcFace
"""
import os
import json
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import cv2
from insightface.app import FaceAnalysis
import csv
from datetime import datetime, date
from src.augmentation import FaceAugmentation, AugmentationConfig


class FaceRecognitionSystem:
    def __init__(self, enable_augmentation: bool = True, augmentation_preset: str = "balanced"):
        # Initialize InsightFace with high-quality settings
        self.app = FaceAnalysis(
            providers=['CPUExecutionProvider'],
            allowed_modules=['detection', 'recognition']
        )
        # Higher detection size for better accuracy
        self.app.prepare(ctx_id=0, det_size=(640, 640), det_thresh=0.6)
        
        # Storage for face embeddings with quality scores
        self.embeddings_db: Dict[str, List[Dict]] = {}  # Store embedding + quality
        self.embeddings_file = Path("data/processed/face_embeddings.json")
        self.embeddings_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Attendance tracking
        self.attendance_file = Path("data/processed/attendance.csv")
        self.daily_attendance: Dict[str, set] = {}  # Track who attended today
        self._init_attendance_file()
        self._load_today_attendance()
        
        # Enhanced matching parameters
        self.min_embedding_quality = 0.2  # Minimum face quality for enrollment (lowered)
        self.max_embeddings_per_person = 20  # Store more embeddings for better accuracy
        
        # Augmentation system
        self.enable_augmentation = enable_augmentation
        self.augmentation_preset = augmentation_preset
        self.augmentor = FaceAugmentation(
            save_augmented=True,
            output_dir="data/augmented"
        )
        
        # Load existing embeddings
        self.load_embeddings()
    
    def detect_and_extract(self, image: np.ndarray) -> List[Dict]:
        """
        Detect faces and extract embeddings with quality assessment
        Returns list of face data with bbox, embedding, quality score, etc.
        """
        faces = self.app.get(image)
        results = []
        
        for face in faces:
            # Get bounding box
            bbox = face.bbox.astype(int)
            
            # Get normalized embedding (512-d vector)
            embedding = face.normed_embedding
            
            # Calculate face quality based on multiple factors
            quality_score = self._calculate_face_quality(face, image)
            
            # Get detection confidence
            det_score = face.det_score
            
            results.append({
                'bbox': bbox.tolist(),  # [x1, y1, x2, y2]
                'embedding': embedding,
                'det_score': float(det_score),
                'quality_score': quality_score,
                'landmarks': face.kps.tolist() if hasattr(face, 'kps') else None
            })
        
        return results
    
    def _calculate_face_quality(self, face, image: np.ndarray) -> float:
        """Calculate face quality score based on size, pose, and sharpness"""
        # Face size quality (larger faces are better)
        bbox = face.bbox
        face_area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
        image_area = image.shape[0] * image.shape[1]
        size_ratio = face_area / image_area
        size_score = min(size_ratio * 20, 1.0)  # Normalize to 0-1
        
        # Detection confidence
        det_score = face.det_score
        
        # Pose quality (frontal faces are better)
        if hasattr(face, 'pose') and face.pose is not None:
            pose_score = 1.0 - (abs(face.pose[0]) + abs(face.pose[1]) + abs(face.pose[2])) / 180.0
        else:
            # Estimate pose from landmarks if available
            if hasattr(face, 'kps') and face.kps is not None and len(face.kps) >= 5:
                # Simple pose estimation from eye positions
                left_eye = face.kps[0]
                right_eye = face.kps[1]
                nose = face.kps[2]
                
                # Calculate symmetry (frontal faces have symmetric eyes)
                eye_diff = abs(left_eye[1] - right_eye[1])  # Y difference
                eye_distance = abs(left_eye[0] - right_eye[0])  # X distance
                
                if eye_distance > 0:
                    symmetry = 1.0 - min(eye_diff / eye_distance, 1.0)
                    pose_score = symmetry * 0.9  # Slightly lower than perfect frontal
                else:
                    pose_score = 0.7
            else:
                pose_score = 0.7  # Default if no landmarks
        
        # Face sharpness (extract face region and calculate Laplacian variance)
        x1, y1, x2, y2 = bbox.astype(int)
        face_crop = image[y1:y2, x1:x2]
        if face_crop.size > 0:
            gray = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            sharpness_score = min(laplacian_var / 500.0, 1.0)  # Normalize
        else:
            sharpness_score = 0.0
        
        # Combined quality score
        quality = (size_score * 0.3 + det_score * 0.3 + pose_score * 0.2 + sharpness_score * 0.2)
        return float(quality)
    
    def enroll_person(self, name: str, image: np.ndarray) -> bool:
        """
        Enroll a person by extracting their face embedding with quality filtering
        """
        faces = self.detect_and_extract(image)
        
        if not faces:
            return False
        
        # Filter faces by quality and use the best one
        quality_faces = [f for f in faces if f['quality_score'] >= self.min_embedding_quality]
        if not quality_faces:
            return False
        
        # Use the face with highest combined quality and detection score
        best_face = max(quality_faces, key=lambda x: x['quality_score'] * x['det_score'])
        
        # Store embedding with metadata
        embedding_data = {
            'embedding': best_face['embedding'],
            'quality_score': best_face['quality_score'],
            'det_score': best_face['det_score']
        }
        
        # Initialize or get existing embeddings for this person
        if name not in self.embeddings_db:
            self.embeddings_db[name] = []
        
        # Add new embedding and keep only the best ones
        self.embeddings_db[name].append(embedding_data)
        
        # Sort by quality and keep only the best embeddings
        self.embeddings_db[name].sort(key=lambda x: x['quality_score'] * x['det_score'], reverse=True)
        self.embeddings_db[name] = self.embeddings_db[name][:self.max_embeddings_per_person]
        
        # Save to file
        self.save_embeddings()
        return True
    
    def enroll_multiple_images(self, name: str, images: List[np.ndarray]) -> Dict:
        """
        Enroll person from multiple images for better accuracy
        """
        successful_enrollments = 0
        total_quality = 0.0
        
        for image in images:
            if self.enroll_person(name, image):
                successful_enrollments += 1
                # Get the quality of the last enrolled embedding
                if name in self.embeddings_db and self.embeddings_db[name]:
                    total_quality += self.embeddings_db[name][-1]['quality_score']
        
        avg_quality = total_quality / successful_enrollments if successful_enrollments > 0 else 0.0
        
        return {
            'success': successful_enrollments > 0,
            'enrolled_count': successful_enrollments,
            'total_embeddings': len(self.embeddings_db.get(name, [])),
            'avg_quality': avg_quality
        }
    
    def enroll_with_augmentation(
        self,
        name: str,
        image: np.ndarray,
        augmentation_config: Optional[Dict] = None
    ) -> Dict:
        """
        Enroll a person with augmented images for improved robustness.
        
        This method generates multiple augmented versions of the input image
        (lighting variations, crops, rotations, blur, noise) and trains the
        model on all variations to handle diverse real-world conditions.
        
        Args:
            name: Person's name
            image: Original face image
            augmentation_config: Custom augmentation parameters, or None to use preset
            
        Returns:
            Dictionary with enrollment statistics
        """
        if not self.enable_augmentation:
            # Fall back to standard enrollment
            success = self.enroll_person(name, image)
            return {
                'success': success,
                'enrolled_count': 1 if success else 0,
                'total_embeddings': len(self.embeddings_db.get(name, [])),
                'augmented_count': 0,
                'avg_quality': self.embeddings_db[name][-1]['quality_score'] if success else 0.0
            }
        
        # Get augmentation parameters
        if augmentation_config is None:
            augmentation_config = AugmentationConfig.get_preset(self.augmentation_preset)
        
        # Generate augmented images
        augmented_images = self.augmentor.augment_for_enrollment(
            image,
            name,
            **augmentation_config
        )
        
        # Enroll all augmented images
        successful_enrollments = 0
        total_quality = 0.0
        
        for aug_image in augmented_images:
            if self.enroll_person(name, aug_image):
                successful_enrollments += 1
                # Get the quality of the last enrolled embedding
                if name in self.embeddings_db and self.embeddings_db[name]:
                    total_quality += self.embeddings_db[name][-1]['quality_score']
        
        avg_quality = total_quality / successful_enrollments if successful_enrollments > 0 else 0.0
        
        return {
            'success': successful_enrollments > 0,
            'enrolled_count': successful_enrollments,
            'total_embeddings': len(self.embeddings_db.get(name, [])),
            'augmented_count': len(augmented_images),
            'original_count': 1,
            'avg_quality': avg_quality
        }
    
    def enroll_multiple_with_augmentation(
        self,
        name: str,
        images: List[np.ndarray],
        augmentation_config: Optional[Dict] = None
    ) -> Dict:
        """
        Enroll person from multiple images with augmentation on each.
        
        Args:
            name: Person's name
            images: List of original face images
            augmentation_config: Custom augmentation parameters, or None to use preset
            
        Returns:
            Dictionary with enrollment statistics
        """
        if not self.enable_augmentation:
            # Fall back to standard multi-image enrollment
            return self.enroll_multiple_images(name, images)
        
        # Get augmentation parameters
        if augmentation_config is None:
            augmentation_config = AugmentationConfig.get_preset(self.augmentation_preset)
        
        # Generate augmented images for all input images
        all_augmented = self.augmentor.augment_batch(
            images,
            name,
            augment_per_image=5  # Fewer augmentations per image when multiple images
        )
        
        # Enroll all augmented images
        successful_enrollments = 0
        total_quality = 0.0
        
        for aug_image in all_augmented:
            if self.enroll_person(name, aug_image):
                successful_enrollments += 1
                # Get the quality of the last enrolled embedding
                if name in self.embeddings_db and self.embeddings_db[name]:
                    total_quality += self.embeddings_db[name][-1]['quality_score']
        
        avg_quality = total_quality / successful_enrollments if successful_enrollments > 0 else 0.0
        
        return {
            'success': successful_enrollments > 0,
            'enrolled_count': successful_enrollments,
            'total_embeddings': len(self.embeddings_db.get(name, [])),
            'augmented_count': len(all_augmented),
            'original_count': len(images),
            'avg_quality': avg_quality
        }
    
    def recognize_face(self, image: np.ndarray, threshold: float = 0.4) -> List[Dict]:
        """
        Enhanced face recognition with multiple embedding matching
        Returns list with recognition results
        """
        faces = self.detect_and_extract(image)
        results = []
        
        for face_data in faces:
            query_embedding = face_data['embedding']
            
            # Find best match using multiple embeddings per person
            best_match = None
            best_similarity = 0.0
            match_scores = []
            
            for name, stored_embeddings in self.embeddings_db.items():
                # Calculate similarities with all stored embeddings for this person
                similarities = []
                for emb_data in stored_embeddings:
                    stored_emb = emb_data['embedding']
                    # Cosine similarity (both embeddings are normalized)
                    similarity = float(np.dot(query_embedding, stored_emb))
                    # Weight by embedding quality
                    weighted_similarity = similarity * (0.7 + 0.3 * emb_data['quality_score'])
                    similarities.append(weighted_similarity)
                
                if similarities:
                    # Use average of top 3 similarities for more robust matching
                    top_similarities = sorted(similarities, reverse=True)[:3]
                    avg_similarity = np.mean(top_similarities)
                    
                    if avg_similarity > best_similarity:
                        best_similarity = avg_similarity
                        best_match = name
                        match_scores = similarities
            
            # Enhanced threshold with quality consideration
            quality_adjusted_threshold = threshold * (0.8 + 0.2 * face_data['quality_score'])
            is_match = best_similarity >= quality_adjusted_threshold
            
            results.append({
                'bbox': face_data['bbox'],
                'matched': is_match,
                'name': best_match if is_match else None,
                'confidence': best_similarity,
                'det_score': face_data['det_score'],
                'quality_score': face_data['quality_score']
            })
        
        return results
    
    def save_embeddings(self):
        """Save embeddings to JSON file with metadata"""
        # Convert numpy arrays to lists for JSON serialization
        data = {}
        for name, embeddings in self.embeddings_db.items():
            data[name] = []
            for emb_data in embeddings:
                data[name].append({
                    'embedding': emb_data['embedding'].tolist(),
                    'quality_score': emb_data['quality_score'],
                    'det_score': emb_data['det_score']
                })
        
        with open(self.embeddings_file, 'w') as f:
            json.dump(data, f)
    
    def load_embeddings(self):
        """Load embeddings from JSON file with backward compatibility"""
        if not self.embeddings_file.exists():
            return
        
        try:
            with open(self.embeddings_file, 'r') as f:
                data = json.load(f)
            
            # Handle both old and new formats
            for name, embeddings in data.items():
                self.embeddings_db[name] = []
                
                for emb in embeddings:
                    if isinstance(emb, dict):
                        # New format with metadata
                        self.embeddings_db[name].append({
                            'embedding': np.array(emb['embedding'], dtype=np.float32),
                            'quality_score': emb.get('quality_score', 0.5),
                            'det_score': emb.get('det_score', 0.5)
                        })
                    else:
                        # Old format - just embedding array
                        self.embeddings_db[name].append({
                            'embedding': np.array(emb, dtype=np.float32),
                            'quality_score': 0.5,
                            'det_score': 0.5
                        })
                
        except Exception as e:
            print(f"Error loading embeddings: {e}")
    
    def get_enrolled_count(self) -> int:
        """Get total number of enrolled embeddings"""
        return sum(len(embeddings) for embeddings in self.embeddings_db.values())
    
    def get_enrolled_names(self) -> List[str]:
        """Get list of enrolled person names"""
        return list(self.embeddings_db.keys())
    
    def get_person_stats(self, name: str) -> Dict:
        """Get statistics for a specific person"""
        if name not in self.embeddings_db:
            return {}
        
        embeddings = self.embeddings_db[name]
        qualities = [emb['quality_score'] for emb in embeddings]
        det_scores = [emb['det_score'] for emb in embeddings]
        
        return {
            'embedding_count': len(embeddings),
            'avg_quality': np.mean(qualities),
            'max_quality': np.max(qualities),
            'avg_det_score': np.mean(det_scores)
        }
    
    def delete_person(self, name: str) -> bool:
        """Delete all embeddings for a specific person"""
        if name in self.embeddings_db:
            del self.embeddings_db[name]
            self.save_embeddings()
            return True
        return False
    
    def clear_all_data(self) -> bool:
        """Clear all enrolled data"""
        self.embeddings_db.clear()
        self.save_embeddings()
        return True
    
    def _init_attendance_file(self):
        """Initialize attendance CSV file with headers if it doesn't exist"""
        if not self.attendance_file.exists():
            with open(self.attendance_file, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(['Date', 'Time', 'Name', 'Confidence', 'Status'])
    
    def _load_today_attendance(self):
        """Load today's attendance to prevent duplicates"""
        today = date.today().isoformat()
        self.daily_attendance[today] = set()
        
        if self.attendance_file.exists():
            try:
                with open(self.attendance_file, 'r', newline='') as f:
                    reader = csv.reader(f)
                    next(reader, None)  # Skip header
                    for row in reader:
                        if len(row) >= 3 and row[0] == today:
                            self.daily_attendance[today].add(row[2])  # Add name
            except Exception as e:
                print(f"Error loading today's attendance: {e}")
    
    def log_attendance(self, name: str, confidence: float) -> bool:
        """Log attendance if person hasn't been recorded today"""
        today = date.today().isoformat()
        now = datetime.now()
        
        # Initialize today's set if not exists
        if today not in self.daily_attendance:
            self.daily_attendance[today] = set()
        
        # Check if person already attended today
        if name in self.daily_attendance[today]:
            return False  # Already recorded today
        
        # Log attendance
        try:
            with open(self.attendance_file, 'a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    today,
                    now.strftime('%H:%M:%S'),
                    name,
                    f"{confidence:.3f}",
                    "Present"
                ])
            
            # Add to today's attendance set
            self.daily_attendance[today].add(name)
            return True
            
        except Exception as e:
            print(f"Error logging attendance: {e}")
            return False
    
    def get_today_attendance(self) -> List[str]:
        """Get list of people who attended today"""
        today = date.today().isoformat()
        return list(self.daily_attendance.get(today, set()))
    
    def get_attendance_stats(self) -> Dict:
        """Get attendance statistics"""
        today = date.today().isoformat()
        today_count = len(self.daily_attendance.get(today, set()))
        
        # Count total unique days in CSV
        total_days = set()
        total_records = 0
        
        if self.attendance_file.exists():
            try:
                with open(self.attendance_file, 'r', newline='') as f:
                    reader = csv.reader(f)
                    next(reader, None)  # Skip header
                    for row in reader:
                        if len(row) >= 3:
                            total_days.add(row[0])
                            total_records += 1
            except Exception:
                pass
        
        return {
            'today_attendance': today_count,
            'today_names': self.get_today_attendance(),
            'total_days_recorded': len(total_days),
            'total_attendance_records': total_records
        }
