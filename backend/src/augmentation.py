"""
Facial data augmentation module for enrollment phase.
Generates multiple augmented versions of face images to improve model robustness
under various lighting conditions, angles, and quality scenarios.
"""
import cv2
import numpy as np
from typing import List, Dict, Optional, Tuple
from pathlib import Path
import random


class FaceAugmentation:
    """
    Generates augmented face images for training robust face recognition models.
    """
    
    def __init__(self, save_augmented: bool = False, output_dir: Optional[str] = None):
        """
        Initialize the augmentation system.
        
        Args:
            save_augmented: Whether to save augmented images to disk
            output_dir: Directory to save augmented images (if save_augmented=True)
        """
        self.save_augmented = save_augmented
        self.output_dir = Path(output_dir) if output_dir else Path("data/augmented")
        
        if self.save_augmented:
            self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def augment_for_enrollment(
        self,
        image: np.ndarray,
        person_name: str,
        num_lighting: int = 4,
        num_crops: int = 3,
        num_rotations: int = 3,
        add_blur: bool = True,
        add_noise: bool = True
    ) -> List[np.ndarray]:
        """
        Generate comprehensive augmented dataset for a person during enrollment.
        
        Args:
            image: Original face image (BGR format)
            person_name: Name of the person being enrolled
            num_lighting: Number of lighting variations to generate
            num_crops: Number of crop/scale variations to generate
            num_rotations: Number of rotation variations to generate
            add_blur: Whether to add blur variations
            add_noise: Whether to add noise variations
            
        Returns:
            List of augmented images including the original
        """
        augmented_images = []
        
        # Always include the original image first
        augmented_images.append(image.copy())
        
        # 1. Lighting Variations
        lighting_images = self._generate_lighting_variations(image, num_lighting)
        augmented_images.extend(lighting_images)
        
        # 2. Cropping and Scaling
        crop_images = self._generate_crop_variations(image, num_crops)
        augmented_images.extend(crop_images)
        
        # 3. Rotation and Orientation
        rotation_images = self._generate_rotation_variations(image, num_rotations)
        augmented_images.extend(rotation_images)
        
        # 4. Blur Variations (optional)
        if add_blur:
            blur_images = self._generate_blur_variations(image, count=2)
            augmented_images.extend(blur_images)
        
        # 5. Noise Variations (optional)
        if add_noise:
            noise_images = self._generate_noise_variations(image, count=2)
            augmented_images.extend(noise_images)
        
        # Save augmented images if enabled
        if self.save_augmented:
            self._save_augmented_images(augmented_images, person_name)
        
        return augmented_images
    
    def _generate_lighting_variations(self, image: np.ndarray, count: int) -> List[np.ndarray]:
        """
        Generate images with different lighting conditions.
        Simulates: dim light, bright light, high contrast, low contrast
        """
        variations = []
        
        # Brightness levels: darker, brighter
        brightness_factors = [0.6, 0.8, 1.3, 1.5][:count]
        
        for i, factor in enumerate(brightness_factors):
            # Adjust brightness
            adjusted = cv2.convertScaleAbs(image, alpha=factor, beta=0)
            variations.append(adjusted)
            
            # Also create contrast variation
            if i < count // 2:
                # High contrast
                contrast_adjusted = self._adjust_contrast(image, factor=1.3)
                variations.append(contrast_adjusted)
            else:
                # Low contrast
                contrast_adjusted = self._adjust_contrast(image, factor=0.7)
                variations.append(contrast_adjusted)
        
        return variations[:count]
    
    def _adjust_contrast(self, image: np.ndarray, factor: float) -> np.ndarray:
        """Adjust image contrast."""
        # Convert to float
        img_float = image.astype(np.float32)
        
        # Calculate mean
        mean = np.mean(img_float, axis=(0, 1), keepdims=True)
        
        # Apply contrast adjustment
        adjusted = mean + factor * (img_float - mean)
        
        # Clip and convert back
        adjusted = np.clip(adjusted, 0, 255).astype(np.uint8)
        return adjusted
    
    def _generate_crop_variations(self, image: np.ndarray, count: int) -> List[np.ndarray]:
        """
        Generate cropped and scaled variations.
        Simulates faces at different distances and partially in frame.
        """
        variations = []
        h, w = image.shape[:2]
        
        # Different crop/zoom levels
        crop_factors = [0.85, 0.90, 0.95, 1.1, 1.15]  # <1 = zoom in, >1 = zoom out
        
        for factor in crop_factors[:count]:
            if factor < 1.0:
                # Zoom in (crop center)
                new_h, new_w = int(h * factor), int(w * factor)
                start_y = (h - new_h) // 2
                start_x = (w - new_w) // 2
                cropped = image[start_y:start_y+new_h, start_x:start_x+new_w]
                # Resize back to original size
                resized = cv2.resize(cropped, (w, h), interpolation=cv2.INTER_LINEAR)
                variations.append(resized)
            else:
                # Zoom out (add padding)
                new_h, new_w = int(h / factor), int(w / factor)
                resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
                
                # Create canvas and center the resized image
                canvas = np.zeros((h, w, 3), dtype=np.uint8)
                start_y = (h - new_h) // 2
                start_x = (w - new_w) // 2
                canvas[start_y:start_y+new_h, start_x:start_x+new_w] = resized
                variations.append(canvas)
        
        # Add slight off-center crops
        if count > 2:
            # Slightly off-center crop
            offset_x = int(w * 0.05)
            offset_y = int(h * 0.05)
            crop_size = int(min(h, w) * 0.9)
            
            # Top-left shifted
            cropped = image[offset_y:offset_y+crop_size, offset_x:offset_x+crop_size]
            if cropped.size > 0:
                resized = cv2.resize(cropped, (w, h), interpolation=cv2.INTER_LINEAR)
                variations.append(resized)
        
        return variations[:count]
    
    def _generate_rotation_variations(self, image: np.ndarray, count: int) -> List[np.ndarray]:
        """
        Generate rotated and flipped variations.
        Simulates head tilts and orientation changes.
        """
        variations = []
        h, w = image.shape[:2]
        center = (w // 2, h // 2)
        
        # Small rotation angles (realistic head tilts)
        angles = [-15, -8, -3, 3, 8, 15]
        
        for angle in angles[:count]:
            # Get rotation matrix
            rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
            
            # Perform rotation
            rotated = cv2.warpAffine(
                image,
                rotation_matrix,
                (w, h),
                flags=cv2.INTER_LINEAR,
                borderMode=cv2.BORDER_REFLECT
            )
            variations.append(rotated)
        
        # Add horizontal flip (mirror image)
        if count > 2:
            flipped = cv2.flip(image, 1)
            variations.append(flipped)
        
        return variations[:count]
    
    def _generate_blur_variations(self, image: np.ndarray, count: int = 2) -> List[np.ndarray]:
        """
        Generate slightly blurred variations.
        Simulates lower-quality camera conditions or motion blur.
        """
        variations = []
        
        # Gaussian blur with different kernel sizes
        kernel_sizes = [(3, 3), (5, 5)]
        
        for kernel_size in kernel_sizes[:count]:
            blurred = cv2.GaussianBlur(image, kernel_size, 0)
            variations.append(blurred)
        
        # Motion blur
        if count > 1:
            # Create motion blur kernel
            kernel_size = 5
            kernel_motion = np.zeros((kernel_size, kernel_size))
            kernel_motion[int((kernel_size-1)/2), :] = np.ones(kernel_size)
            kernel_motion = kernel_motion / kernel_size
            
            motion_blurred = cv2.filter2D(image, -1, kernel_motion)
            variations.append(motion_blurred)
        
        return variations[:count]
    
    def _generate_noise_variations(self, image: np.ndarray, count: int = 2) -> List[np.ndarray]:
        """
        Generate variations with added noise.
        Simulates sensor noise in low-light conditions.
        """
        variations = []
        
        # Gaussian noise with different intensities
        noise_levels = [10, 20]
        
        for noise_level in noise_levels[:count]:
            noisy = self._add_gaussian_noise(image, noise_level)
            variations.append(noisy)
        
        return variations[:count]
    
    def _add_gaussian_noise(self, image: np.ndarray, noise_level: int) -> np.ndarray:
        """Add Gaussian noise to image."""
        noise = np.random.normal(0, noise_level, image.shape).astype(np.float32)
        noisy_image = image.astype(np.float32) + noise
        noisy_image = np.clip(noisy_image, 0, 255).astype(np.uint8)
        return noisy_image
    
    def _save_augmented_images(self, images: List[np.ndarray], person_name: str):
        """Save augmented images to disk for inspection/debugging."""
        person_dir = self.output_dir / person_name
        person_dir.mkdir(parents=True, exist_ok=True)
        
        # Clear existing augmented images for this person
        for existing_file in person_dir.glob("aug_*.jpg"):
            existing_file.unlink()
        
        # Save new augmented images
        for idx, img in enumerate(images):
            filename = person_dir / f"aug_{idx:03d}.jpg"
            cv2.imwrite(str(filename), img)
    
    def augment_batch(
        self,
        images: List[np.ndarray],
        person_name: str,
        augment_per_image: int = 5
    ) -> List[np.ndarray]:
        """
        Augment multiple images with a controlled number of augmentations per image.
        
        Args:
            images: List of original images
            person_name: Name of the person
            augment_per_image: Number of augmentations to generate per original image
            
        Returns:
            List of all augmented images
        """
        all_augmented = []
        
        for idx, image in enumerate(images):
            # Generate fewer augmentations per image when multiple images provided
            augmented = self.augment_for_enrollment(
                image,
                f"{person_name}_{idx}",
                num_lighting=max(1, augment_per_image // 3),
                num_crops=max(1, augment_per_image // 3),
                num_rotations=max(1, augment_per_image // 3),
                add_blur=augment_per_image > 3,
                add_noise=augment_per_image > 3
            )
            all_augmented.extend(augmented)
        
        return all_augmented


class AugmentationConfig:
    """Configuration for augmentation parameters."""
    
    # Preset configurations
    PRESETS = {
        "minimal": {
            "num_lighting": 2,
            "num_crops": 2,
            "num_rotations": 2,
            "add_blur": False,
            "add_noise": False,
        },
        "balanced": {
            "num_lighting": 4,
            "num_crops": 3,
            "num_rotations": 3,
            "add_blur": True,
            "add_noise": True,
        },
        "aggressive": {
            "num_lighting": 6,
            "num_crops": 5,
            "num_rotations": 5,
            "add_blur": True,
            "add_noise": True,
        },
    }
    
    @classmethod
    def get_preset(cls, preset_name: str = "balanced") -> Dict:
        """Get augmentation parameters for a preset."""
        if preset_name not in cls.PRESETS:
            raise ValueError(f"Unknown preset: {preset_name}. Available: {list(cls.PRESETS.keys())}")
        return cls.PRESETS[preset_name].copy()
