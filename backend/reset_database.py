#!/usr/bin/env python3
"""
Database reset script - Use this if you encounter database locking issues
"""

import os
import sqlite3
from database import engine, Base
import models

def reset_database():
    print("🔄 Resetting database...")
    
    # Remove existing database files
    db_files = ["flexifi.db", "flexifi.db-journal", "flexifi.db-wal", "flexifi.db-shm"]
    
    for db_file in db_files:
        if os.path.exists(db_file):
            try:
                os.remove(db_file)
                print(f"✅ Removed {db_file}")
            except Exception as e:
                print(f"❌ Could not remove {db_file}: {e}")
    
    # Create new database
    try:
        # Create all tables
        models.Base.metadata.create_all(bind=engine)
        print("✅ Database created successfully")
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = result.fetchall()
            print(f"✅ Created tables: {[table[0] for table in tables]}")
        
        print("🎉 Database reset completed successfully!")
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False
    
    return True

if __name__ == "__main__":
    reset_database()
