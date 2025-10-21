#!/usr/bin/env python3
"""
One-command startup script for Face Recognition System.
Starts both backend and frontend with dependency checking.
"""
import subprocess
import sys
import time
import signal
import os
import shutil
from pathlib import Path

def check_command(command, install_hint=None):
    """Check if a command exists in PATH."""
    if shutil.which(command):
        return True
    else:
        if install_hint:
            print(f"❌ {command} not found. {install_hint}")
        return False

def run_command(cmd, cwd=None, shell=False, capture_output=False):
    """Run a command and return the process."""
    if capture_output:
        return subprocess.Popen(
            cmd,
            cwd=cwd,
            shell=shell,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
    else:
        return subprocess.Popen(
            cmd,
            cwd=cwd,
            shell=shell,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )

def check_dependencies():
    """Check if all required dependencies are available."""
    print("🔍 Checking dependencies...")
    
    # Check Python
    if not check_command("python3", "Please install Python 3.11+"):
        return False
    
    # Check Poetry
    if not check_command("poetry", "Please install Poetry: curl -sSL https://install.python-poetry.org | python3 -"):
        return False
    
    # Check Node.js
    if not check_command("node", "Please install Node.js 18+: https://nodejs.org/"):
        return False
    
    # Check npm
    if not check_command("npm", "npm should come with Node.js"):
        return False
    
    print("✅ All dependencies found!")
    return True

def install_backend_dependencies():
    """Install backend dependencies using Poetry."""
    print("📦 Installing backend dependencies...")
    try:
        result = run_command(["poetry", "install"], cwd="backend", capture_output=True)
        result.wait()
        if result.returncode == 0:
            print("✅ Backend dependencies installed!")
            return True
        else:
            print("❌ Failed to install backend dependencies")
            return False
    except Exception as e:
        print(f"❌ Error installing backend dependencies: {e}")
        return False

def install_frontend_dependencies():
    """Install frontend dependencies using npm."""
    print("📦 Installing frontend dependencies...")
    try:
        result = run_command(["npm", "install"], cwd="frontend", capture_output=True)
        result.wait()
        if result.returncode == 0:
            print("✅ Frontend dependencies installed!")
            return True
        else:
            print("❌ Failed to install frontend dependencies")
            return False
    except Exception as e:
        print(f"❌ Error installing frontend dependencies: {e}")
        return False

def check_ports():
    """Check if required ports are available."""
    import socket
    
    def is_port_in_use(port):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(('localhost', port)) == 0
    
    if is_port_in_use(8000):
        print("⚠️  Port 8000 is in use. Backend might already be running.")
    
    if is_port_in_use(3000):
        print("⚠️  Port 3000 is in use. Frontend might use port 3001 instead.")

def main():
    """Main function to start the development environment."""
    project_root = Path(__file__).parent
    backend_dir = project_root / "backend"
    frontend_dir = project_root / "frontend"
    
    print("🚀 Face Recognition System - One-Command Startup")
    print("=" * 60)
    
    # Check if directories exist
    if not backend_dir.exists():
        print("❌ Backend directory not found!")
        return 1
    
    if not frontend_dir.exists():
        print("❌ Frontend directory not found!")
        return 1
    
    # Check dependencies
    if not check_dependencies():
        return 1
    
    # Check ports
    check_ports()
    
    # Install dependencies if needed
    print("\n🔧 Setting up dependencies...")
    
    # Check if backend dependencies are installed
    if not (backend_dir / "poetry.lock").exists():
        if not install_backend_dependencies():
            return 1
    
    # Check if frontend dependencies are installed
    if not (frontend_dir / "node_modules").exists():
        if not install_frontend_dependencies():
            return 1
    
    processes = []
    
    try:
        print("\n🚀 Starting services...")
        
        # Start backend
        print("🔄 Starting FastAPI backend on port 8001...")
        backend_process = run_command([
            "poetry", "run", "python", "run_backend.py"
        ], cwd=backend_dir)
        processes.append(("Backend", backend_process))
        
        # Wait for backend to start
        print("⏳ Waiting for backend to initialize...")
        time.sleep(5)
        
        # Start frontend
        print("🔄 Starting Next.js frontend...")
        frontend_process = run_command([
            "npm", "run", "dev"
        ], cwd=frontend_dir)
        processes.append(("Frontend", frontend_process))
        
        # Wait for frontend to start
        time.sleep(3)
        
        print("\n" + "="*60)
        print("✅ Face Recognition System is now running!")
        print("="*60)
        print("🌐 Frontend UI: http://localhost:3001 (or 3000)")
        print("🔧 Backend API: http://localhost:8001")
        print("📚 API Documentation: http://localhost:8001/docs")
        print("📊 Analytics: http://localhost:3001/analytics")
        print("👥 Attendance: http://localhost:3001/attendance")
        print("📹 Live Feed: http://localhost:3001/live")
        print("\n💡 Tips:")
        print("   • Use Ctrl+C to stop all services")
        print("   • Check the terminal for any error messages")
        print("   • The system will auto-reload on file changes")
        print("="*60)
        
        # Monitor processes
        while True:
            for name, process in processes:
                if process.poll() is not None:
                    print(f"\n❌ {name} process exited unexpectedly!")
                    print("Check the logs above for error details.")
                    return 1
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down services...")
        
        # Terminate all processes
        for name, process in processes:
            print(f"🔄 Stopping {name}...")
            try:
                process.terminate()
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
            except Exception as e:
                print(f"⚠️  Error stopping {name}: {e}")
        
        print("✅ All services stopped.")
        return 0
    
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
