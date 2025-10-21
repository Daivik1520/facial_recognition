#!/usr/bin/env python3
"""
Model Download Script for Face Recognition System
Downloads the required InsightFace Buffalo_L model files.
"""
import os
import sys
import requests
import zipfile
from pathlib import Path
from tqdm import tqdm
import hashlib

# Model URLs and checksums
MODEL_INFO = {
    "buffalo_l": {
        "url": "https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_l.zip",
        "filename": "buffalo_l.zip",
        "expected_size": 200 * 1024 * 1024,  # ~200MB
        "extract_to": "backend/data/models/models/"
    }
}

def download_file(url: str, filepath: Path, expected_size: int = None) -> bool:
    """Download a file with progress bar."""
    try:
        print(f"📥 Downloading {filepath.name}...")
        
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        if expected_size and total_size < expected_size * 0.8:  # Allow 20% variance
            print(f"⚠️  Warning: File size ({total_size}) seems smaller than expected ({expected_size})")
        
        with open(filepath, 'wb') as f:
            with tqdm(total=total_size, unit='B', unit_scale=True, desc=filepath.name) as pbar:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        pbar.update(len(chunk))
        
        print(f"✅ Downloaded {filepath.name} ({filepath.stat().st_size / 1024 / 1024:.1f} MB)")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to download {url}: {e}")
        return False
    except Exception as e:
        print(f"❌ Error downloading {filepath.name}: {e}")
        return False

def extract_zip(zip_path: Path, extract_to: Path) -> bool:
    """Extract zip file to specified directory."""
    try:
        print(f"📦 Extracting {zip_path.name} to {extract_to}...")
        
        extract_to.mkdir(parents=True, exist_ok=True)
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            # Get list of files to extract
            file_list = zip_ref.namelist()
            
            # Extract with progress bar
            with tqdm(total=len(file_list), desc="Extracting") as pbar:
                for file in file_list:
                    zip_ref.extract(file, extract_to)
                    pbar.update(1)
        
        print(f"✅ Extracted to {extract_to}")
        return True
        
    except zipfile.BadZipFile:
        print(f"❌ Invalid zip file: {zip_path}")
        return False
    except Exception as e:
        print(f"❌ Error extracting {zip_path.name}: {e}")
        return False

def verify_model_files(model_dir: Path) -> bool:
    """Verify that required model files exist."""
    required_files = [
        "det_10g.onnx",
        "w600k_r50.onnx", 
        "1k3d68.onnx",
        "2d106det.onnx",
        "genderage.onnx"
    ]
    
    print("🔍 Verifying model files...")
    missing_files = []
    
    for file in required_files:
        file_path = model_dir / file
        if not file_path.exists():
            missing_files.append(file)
        else:
            print(f"✅ Found {file}")
    
    if missing_files:
        print(f"❌ Missing files: {missing_files}")
        return False
    
    print("✅ All required model files found!")
    return True

def main():
    """Main download function."""
    print("🚀 Face Recognition System - Model Downloader")
    print("=" * 50)
    
    # Get project root
    project_root = Path(__file__).parent.parent
    backend_dir = project_root / "backend"
    
    if not backend_dir.exists():
        print("❌ Backend directory not found! Run this script from the project root.")
        sys.exit(1)
    
    # Download Buffalo_L model
    model_info = MODEL_INFO["buffalo_l"]
    download_dir = backend_dir / "data" / "models"
    download_dir.mkdir(parents=True, exist_ok=True)
    
    zip_path = download_dir / model_info["filename"]
    extract_path = Path(model_info["extract_to"])
    
    # Check if already downloaded
    if zip_path.exists() and zip_path.stat().st_size > model_info["expected_size"] * 0.8:
        print(f"📁 Model already downloaded: {zip_path}")
    else:
        if not download_file(model_info["url"], zip_path, model_info["expected_size"]):
            print("❌ Failed to download model")
            sys.exit(1)
    
    # Extract model
    if not extract_zip(zip_path, extract_path):
        print("❌ Failed to extract model")
        sys.exit(1)
    
    # Verify extracted files
    model_dir = extract_path / "buffalo_l"
    if not verify_model_files(model_dir):
        print("❌ Model verification failed")
        sys.exit(1)
    
    # Clean up zip file
    try:
        zip_path.unlink()
        print(f"🗑️  Cleaned up {zip_path.name}")
    except:
        pass
    
    print("\n🎉 Model setup complete!")
    print(f"📁 Models installed in: {model_dir}")
    print("\nNext steps:")
    print("1. Install Python dependencies: cd backend && poetry install")
    print("2. Start the backend: cd backend && poetry run python run_backend.py")
    print("3. Start the frontend: cd frontend && npm run dev")

if __name__ == "__main__":
    main()
