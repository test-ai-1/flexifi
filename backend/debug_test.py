#!/usr/bin/env python3
"""
Debug test to identify the exact issue
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_step_by_step():
    print("🔍 Debug Test - Step by Step Analysis")
    print("=" * 50)
    
    # Step 1: Check if server is running
    print("\n1. Checking if server is running...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Server is running: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"❌ Server not running: {e}")
        print("   Please start the server with: python -m uvicorn main:app --reload")
        return
    
    # Step 2: Test user registration
    print("\n2. Testing user registration...")
    user_data = {
        "name": "Debug User",
        "email": "debug@example.com",
        "password": "debugpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/users/", json=user_data)
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            user = response.json()
            print(f"✅ User created: ID={user.get('user_id')}, Name={user.get('name')}")
        else:
            print(f"❌ User creation failed")
            return
            
    except Exception as e:
        print(f"❌ User creation error: {e}")
        return
    
    # Step 3: Test login
    print("\n3. Testing login...")
    login_data = {
        "username": "debug@example.com",
        "password": "debugpass123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/token", data=login_data)
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        print(f"   Raw response: {response.text}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"   Parsed JSON: {data}")
                print(f"   Type: {type(data)}")
                
                if isinstance(data, dict):
                    print(f"   Keys: {list(data.keys())}")
                    if 'access_token' in data:
                        token = data['access_token']
                        print(f"   Token length: {len(token)}")
                        print(f"   Token preview: {token[:30]}...")
                        
                        # Test the token
                        print("\n4. Testing token with authenticated request...")
                        headers = {
                            "Authorization": f"Bearer {token}",
                            "Content-Type": "application/json"
                        }
                        
                        test_response = requests.get(f"{BASE_URL}/users/me", headers=headers)
                        print(f"   Authenticated request status: {test_response.status_code}")
                        print(f"   Response: {test_response.text}")
                        
                        if test_response.status_code == 200:
                            print("✅ Authentication working correctly!")
                        else:
                            print("❌ Authentication failed")
                    else:
                        print("❌ No access_token in response")
                else:
                    print(f"❌ Response is not a dictionary: {type(data)}")
                    
            except json.JSONDecodeError as e:
                print(f"❌ JSON decode error: {e}")
                print(f"   Raw response: {response.text}")
        else:
            print(f"❌ Login failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_step_by_step()
