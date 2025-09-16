#!/usr/bin/env python3
"""
Clean start script - Deletes database files and starts server
"""

import os
import subprocess
import sys
import time

def clean_start():
    print("🧹 Cleaning database files...")
    
    # List of database files to remove
    db_files = ["flexifi.db", "flexifi.db-journal", "flexifi.db-wal", "flexifi.db-shm"]
    
    for db_file in db_files:
        if os.path.exists(db_file):
            try:
                os.remove(db_file)
                print(f"✅ Removed {db_file}")
            except Exception as e:
                print(f"⚠️  Could not remove {db_file}: {e}")
                print("   This is normal if the file is in use")
    
    print("\n🚀 Starting server...")
    
    # Start the server
    try:
        subprocess.run([sys.executable, "run_server.py"], check=True)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    clean_start()
