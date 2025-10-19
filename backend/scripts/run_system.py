#!/usr/bin/env python3
"""
Simple script to run the face recognition system.
This is the main entry point for the application.
"""
import subprocess
import sys
import socket
from pathlib import Path

def is_port_in_use(port: int) -> bool:
    """Check if a port is already in use."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def kill_process_on_port(port: int) -> bool:
    """Kill any process using the specified port."""
    try:
        # Find and kill process using the port
        result = subprocess.run(['lsof', '-ti', f':{port}'], 
                              capture_output=True, text=True)
        if result.stdout.strip():
            pids = result.stdout.strip().split('\n')
            for pid in pids:
                subprocess.run(['kill', '-9', pid], check=True)
            print(f"🔄 Killed existing process on port {port}")
            return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    return False

def main():
    """Run the face recognition API server."""
    project_root = Path(__file__).parent.parent
    port = 8000
    
    print("🚀 Starting Face Recognition System...")
    print(f"📁 Project root: {project_root}")
    
    # Check if port is in use and kill existing process
    if is_port_in_use(port):
        print(f"⚠️  Port {port} is already in use")
        if kill_process_on_port(port):
            print("✅ Port cleared successfully")
        else:
            print(f"❌ Could not clear port {port}. Please manually stop the existing server.")
            return 1
    
    print(f"🌐 API will be available at: http://127.0.0.1:{port}")
    print(f"🎥 Web UI will be available at: http://127.0.0.1:{port}/ui")
    print("\n⚡ Starting server...")
    
    try:
        # Run the uvicorn server
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "src.api:app", 
            "--host", "0.0.0.0", 
            "--port", str(port),
            "--reload"
        ], cwd=project_root, check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting server: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
