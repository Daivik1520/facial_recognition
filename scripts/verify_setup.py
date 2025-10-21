#!/usr/bin/env python3
"""
Verification script for Face Recognition System setup
Checks if all components are properly installed and configured
"""
import os
import sys
import subprocess
from pathlib import Path
import json

def run_command(cmd, cwd=None):
    """Run a command and return success status."""
    try:
        result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, shell=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_python():
    """Check Python installation."""
    print("🐍 Checking Python...")
    success, stdout, stderr = run_command("python3 --version")
    if success:
        version = stdout.strip()
        print(f"✅ Python found: {version}")
        return True
    else:
        print("❌ Python not found")
        return False

def check_node():
    """Check Node.js installation."""
    print("📦 Checking Node.js...")
    success, stdout, stderr = run_command("node --version")
    if success:
        version = stdout.strip()
        print(f"✅ Node.js found: {version}")
        return True
    else:
        print("❌ Node.js not found")
        return False

def check_poetry():
    """Check Poetry installation."""
    print("📚 Checking Poetry...")
    success, stdout, stderr = run_command("poetry --version")
    if success:
        version = stdout.strip()
        print(f"✅ Poetry found: {version}")
        return True
    else:
        print("❌ Poetry not found")
        return False

def check_backend_dependencies():
    """Check backend dependencies."""
    print("🔧 Checking backend dependencies...")
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False
    
    # Check if poetry.lock exists
    if not (backend_dir / "poetry.lock").exists():
        print("❌ poetry.lock not found - run 'poetry install' in backend directory")
        return False
    
    # Check if virtual environment exists
    success, stdout, stderr = run_command("poetry env info", cwd=backend_dir)
    if not success:
        print("❌ Poetry environment not set up - run 'poetry install' in backend directory")
        return False
    
    print("✅ Backend dependencies OK")
    return True

def check_frontend_dependencies():
    """Check frontend dependencies."""
    print("🎨 Checking frontend dependencies...")
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    # Check if node_modules exists
    if not (frontend_dir / "node_modules").exists():
        print("❌ node_modules not found - run 'npm install' in frontend directory")
        return False
    
    # Check if package-lock.json exists
    if not (frontend_dir / "package-lock.json").exists():
        print("⚠️  package-lock.json not found - dependencies may not be locked")
    
    print("✅ Frontend dependencies OK")
    return True

def check_models():
    """Check AI models."""
    print("🤖 Checking AI models...")
    models_dir = Path("backend/data/models/models/buffalo_l")
    if not models_dir.exists():
        print("❌ Models directory not found")
        return False
    
    required_files = [
        "det_10g.onnx",
        "w600k_r50.onnx",
        "1k3d68.onnx",
        "2d106det.onnx",
        "genderage.onnx"
    ]
    
    missing_files = []
    for file in required_files:
        if not (models_dir / file).exists():
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Missing model files: {missing_files}")
        print("Run: cd scripts && python3 download_models.py")
        return False
    
    print("✅ AI models OK")
    return True

def check_environment():
    """Check environment configuration."""
    print("⚙️ Checking environment configuration...")
    env_file = Path("backend/.env")
    if not env_file.exists():
        print("⚠️  .env file not found - will be created on first run")
        return True
    
    print("✅ Environment configuration OK")
    return True

def check_directories():
    """Check required directories."""
    print("📁 Checking directories...")
    required_dirs = [
        "backend/data/processed",
        "backend/data/augmented",
        "backend/logs"
    ]
    
    for dir_path in required_dirs:
        path = Path(dir_path)
        if not path.exists():
            print(f"⚠️  Directory {dir_path} not found - will be created on first run")
    
    print("✅ Directory structure OK")
    return True

def check_git_status():
    """Check git status."""
    print("📋 Checking git status...")
    success, stdout, stderr = run_command("git status --porcelain")
    if success:
        if stdout.strip():
            print("⚠️  Uncommitted changes detected")
            print("Files with changes:")
            for line in stdout.strip().split('\n'):
                print(f"  {line}")
        else:
            print("✅ Git working directory clean")
        return True
    else:
        print("❌ Git not found or not a git repository")
        return False

def main():
    """Main verification function."""
    print("🔍 Face Recognition System - Setup Verification")
    print("=" * 50)
    
    checks = [
        ("Python", check_python),
        ("Node.js", check_node),
        ("Poetry", check_poetry),
        ("Backend Dependencies", check_backend_dependencies),
        ("Frontend Dependencies", check_frontend_dependencies),
        ("AI Models", check_models),
        ("Environment", check_environment),
        ("Directories", check_directories),
        ("Git Status", check_git_status)
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\n{name}:")
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"❌ Error checking {name}: {e}")
            results.append((name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 VERIFICATION SUMMARY")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{name:.<30} {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} checks passed")
    
    if passed == total:
        print("\n🎉 All checks passed! System is ready to use.")
        print("\nNext steps:")
        print("1. Start backend: cd backend && poetry run python run_backend.py")
        print("2. Start frontend: cd frontend && npm run dev")
        print("3. Or run both: python3 run_dev.py")
    else:
        print(f"\n⚠️  {total - passed} checks failed. Please fix the issues above.")
        print("\nCommon fixes:")
        print("- Run setup script: ./scripts/setup.sh")
        print("- Download models: cd scripts && python3 download_models.py")
        print("- Install dependencies: cd backend && poetry install")
        print("- Install frontend: cd frontend && npm install")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
