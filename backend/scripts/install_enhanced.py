#!/usr/bin/env python3
"""
Installation script for enhanced face recognition system features.
Installs additional dependencies for analytics, FAISS, and Docker support.
"""
import subprocess
import sys
from pathlib import Path

def run_command(cmd: list, description: str) -> bool:
    """Run a command and return success status."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        if e.stdout:
            print(f"stdout: {e.stdout}")
        if e.stderr:
            print(f"stderr: {e.stderr}")
        return False

def main():
    """Install enhanced features."""
    print("🚀 Installing Enhanced Face Recognition System Features")
    print("=" * 60)
    
    project_root = Path(__file__).parent.parent
    
    # Check if we're in the right directory
    if not (project_root / "pyproject.toml").exists():
        print("❌ Error: pyproject.toml not found. Please run from project root.")
        return 1
    
    print(f"📁 Project root: {project_root}")
    
    # Install enhanced dependencies
    enhanced_packages = [
        "pandas>=2.1.0",
        "plotly>=5.17.0", 
        "faiss-cpu>=1.7.4",
        "scikit-learn>=1.3.0"
    ]
    
    print("\n📦 Installing enhanced dependencies...")
    for package in enhanced_packages:
        if not run_command([
            sys.executable, "-m", "pip", "install", package
        ], f"Installing {package}"):
            print(f"⚠️  Failed to install {package}, continuing...")
    
    # Update poetry dependencies
    print("\n🔄 Updating Poetry dependencies...")
    if run_command([
        "poetry", "add", "pandas", "plotly", "faiss-cpu", "scikit-learn"
    ], "Adding packages to Poetry"):
        print("✅ Poetry dependencies updated")
    else:
        print("⚠️  Poetry update failed, but pip packages should work")
    
    # Test imports
    print("\n🧪 Testing enhanced features...")
    test_imports = [
        ("pandas", "Data analytics"),
        ("plotly", "Visualization"),
        ("faiss", "High-performance similarity search"),
        ("sklearn", "Machine learning utilities")
    ]
    
    for module, description in test_imports:
        try:
            __import__(module)
            print(f"✅ {description} ({module}) - Available")
        except ImportError:
            print(f"⚠️  {description} ({module}) - Not available")
    
    # Create data directories
    print("\n📁 Creating enhanced data directories...")
    directories = [
        "data/analytics",
        "data/exports", 
        "data/faiss",
        "logs/analytics"
    ]
    
    for dir_path in directories:
        full_path = project_root / dir_path
        full_path.mkdir(parents=True, exist_ok=True)
        print(f"✅ Created {dir_path}")
    
    # Test FAISS functionality
    print("\n🔍 Testing FAISS functionality...")
    try:
        import faiss
        import numpy as np
        
        # Create a simple test index
        d = 512  # ArcFace embedding dimension
        index = faiss.IndexFlatIP(d)
        
        # Add some random vectors
        test_vectors = np.random.random((10, d)).astype('float32')
        test_vectors = test_vectors / np.linalg.norm(test_vectors, axis=1, keepdims=True)
        index.add(test_vectors)
        
        # Search
        query = np.random.random((1, d)).astype('float32')
        query = query / np.linalg.norm(query)
        
        distances, indices = index.search(query, 3)
        
        print(f"✅ FAISS test successful - Index with {index.ntotal} vectors")
        print(f"   Search returned {len(indices[0])} results")
        
    except Exception as e:
        print(f"⚠️  FAISS test failed: {e}")
    
    # Test analytics functionality
    print("\n📊 Testing analytics functionality...")
    try:
        import pandas as pd
        
        # Create test data
        test_data = pd.DataFrame({
            'Date': ['2025-01-01', '2025-01-02'],
            'Name': ['Test User', 'Test User'],
            'Confidence': [0.85, 0.92]
        })
        
        # Basic analytics
        daily_stats = test_data.groupby('Date')['Name'].nunique()
        avg_confidence = test_data['Confidence'].mean()
        
        print(f"✅ Analytics test successful")
        print(f"   Daily stats: {len(daily_stats)} days")
        print(f"   Average confidence: {avg_confidence:.3f}")
        
    except Exception as e:
        print(f"⚠️  Analytics test failed: {e}")
    
    print("\n" + "=" * 60)
    print("🎉 Enhanced Features Installation Complete!")
    print("\n🚀 New Features Available:")
    print("   📊 Advanced Analytics Dashboard")
    print("   🔍 FAISS High-Performance Search")
    print("   📈 Attendance Trend Analysis")
    print("   📄 Report Export (JSON/CSV)")
    print("   🐳 Docker Containerization")
    
    print("\n🌐 Access enhanced features at:")
    print("   • Analytics: http://127.0.0.1:8000/analytics/dashboard")
    print("   • System Health: http://127.0.0.1:8000/system/health")
    print("   • Web UI: http://127.0.0.1:8000/ui (click Analytics Dashboard)")
    
    print("\n🐳 Docker Usage:")
    print("   docker-compose up --build")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
