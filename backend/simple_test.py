#!/usr/bin/env python3
"""
Simple test to debug the login issue
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_login():
    print("Testing login endpoint...")
    
    # Test 1: Register a user first
    print("\n1. Registering user...")
    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/users/", json=user_data)
        print(f"Registration status: {response.status_code}")
        if response.status_code == 200:
            print("✅ User registered successfully")
        else:
            print(f"Registration response: {response.text}")
    except Exception as e:
        print(f"Registration error: {e}")
    
    # Test 2: Try to login
    print("\n2. Testing login...")
    login_data = {
        "username": "test@example.com",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/token", data=login_data)
        print(f"Login status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        print(f"Response text: {response.text}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"Parsed JSON: {data}")
                print(f"Type: {type(data)}")
                if isinstance(data, dict):
                    print(f"Keys: {data.keys()}")
            except Exception as e:
                print(f"JSON parse error: {e}")
        else:
            print(f"Login failed: {response.text}")
            
    except Exception as e:
        print(f"Login error: {e}")

if __name__ == "__main__":
    test_login()
