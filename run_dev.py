#!/usr/bin/env python3
"""
Development script to run both frontend and backend.
"""
import subprocess
import sys
import time
import signal
import os
from pathlib import Path

def run_command(cmd, cwd=None, shell=False):
    """Run a command and return the process."""
    return subprocess.Popen(
        cmd,
        cwd=cwd,
        shell=shell,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

def main():
    """Run both frontend and backend."""
    project_root = Path(__file__).parent
    backend_dir = project_root / "backend"
    frontend_dir = project_root / "frontend"
    
    print("🚀 Starting Face Recognition System Development Environment")
    print("=" * 60)
    
    # Check if directories exist
    if not backend_dir.exists():
        print("❌ Backend directory not found!")
        return 1
    
    if not frontend_dir.exists():
        print("❌ Frontend directory not found!")
        return 1
    
    processes = []
    
    try:
        # Start backend
        print("🔄 Starting FastAPI backend on port 8000...")
        backend_process = run_command([
            "python3", "run_backend.py"
        ], cwd=backend_dir)
        processes.append(("Backend", backend_process))
        
        # Wait a moment for backend to start
        time.sleep(3)
        
        # Start frontend
        print("🔄 Starting Next.js frontend on port 3000...")
        frontend_process = run_command([
            "npm", "run", "dev"
        ], cwd=frontend_dir)
        processes.append(("Frontend", frontend_process))
        
        print("\n✅ Both services started!")
        print("🌐 Backend API: http://127.0.0.1:8000")
        print("🎨 Frontend UI: http://127.0.0.1:3000")
        print("📚 API Docs: http://127.0.0.1:8000/docs")
        print("\nPress Ctrl+C to stop both services...")
        
        # Monitor processes
        while True:
            for name, process in processes:
                if process.poll() is not None:
                    print(f"❌ {name} process exited unexpectedly!")
                    return 1
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Shutting down services...")
        
        # Terminate all processes
        for name, process in processes:
            print(f"🔄 Stopping {name}...")
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
        
        print("✅ All services stopped.")
        return 0
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
