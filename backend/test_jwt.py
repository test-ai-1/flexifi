#!/usr/bin/env python3
"""
Test JWT token creation and verification
"""

from auth import create_access_token, verify_token
from datetime import timedelta

def test_jwt():
    print("Testing JWT token creation and verification...")
    
    # Test data
    user_id = 123
    test_data = {"sub": str(user_id)}
    
    # Create token
    print(f"Creating token for user_id: {user_id}")
    token = create_access_token(test_data)
    print(f"Generated token: {token[:50]}...")
    
    # Verify token
    print("Verifying token...")
    try:
        credentials_exception = Exception("Invalid token")
        verified_user_id = verify_token(token, credentials_exception)
        print(f"Verified user_id: {verified_user_id}")
        print(f"Type: {type(verified_user_id)}")
        
        if verified_user_id == user_id:
            print("✅ JWT test successful!")
        else:
            print(f"❌ JWT test failed: expected {user_id}, got {verified_user_id}")
    except Exception as e:
        print(f"❌ JWT verification failed: {e}")

if __name__ == "__main__":
    test_jwt()
