#!/usr/bin/env python3
"""
Database migration script - Creates fresh database with correct schema
"""

import os
import sqlite3
import sqlalchemy
from database import engine, Base
import models

def migrate_database():
    print("🔄 Migrating database...")
    
    # Remove any existing database files
    db_files = ["flexifi.db", "flexifi_new.db", "flexifi.db-journal", "flexifi.db-wal", "flexifi.db-shm"]
    
    for db_file in db_files:
        if os.path.exists(db_file):
            try:
                os.remove(db_file)
                print(f"✅ Removed {db_file}")
            except Exception as e:
                print(f"⚠️  Could not remove {db_file}: {e}")
    
    # Create new database with correct schema
    try:
        print("📋 Creating database tables...")
        
        # Drop all tables first (in case they exist)
        Base.metadata.drop_all(bind=engine)
        print("✅ Dropped existing tables")
        
        # Create all tables with current schema
        Base.metadata.create_all(bind=engine)
        print("✅ Created new tables")
        
        # Verify the schema
        with engine.connect() as conn:
            # Check users table schema
            result = conn.execute(sqlalchemy.text("PRAGMA table_info(users);"))
            columns = result.fetchall()
            print(f"📋 Users table columns: {[col[1] for col in columns]}")
            
            # Check if is_active column exists
            has_is_active = any(col[1] == 'is_active' for col in columns)
            if has_is_active:
                print("✅ is_active column found in users table")
            else:
                print("❌ is_active column missing in users table")
                
            # List all tables
            result = conn.execute(sqlalchemy.text("SELECT name FROM sqlite_master WHERE type='table';"))
            tables = result.fetchall()
            print(f"📋 Created tables: {[table[0] for table in tables]}")
        
        print("🎉 Database migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        return False

if __name__ == "__main__":
    migrate_database()