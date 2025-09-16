#!/usr/bin/env python3
"""
Test script to test the complete signup process
"""

import requests
import json
import time

def test_complete_signup():
    print("🧪 Testing Complete Signup Process")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    # Generate unique email for testing
    timestamp = int(time.time())
    test_email = f"test{timestamp}@example.com"
    
    print(f"📧 Using test email: {test_email}")
    
    try:
        # Step 1: Register user
        print("\n1. Registering user...")
        user_data = {
            "name": "Test User",
            "email": test_email,
            "password": "testpassword123"
        }
        
        response = requests.post(f"{base_url}/users/", json=user_data)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            user = response.json()
            print(f"   ✅ User created: {user['name']} (ID: {user['user_id']})")
        else:
            print(f"   ❌ User creation failed: {response.text}")
            return False
        
        # Step 2: Login
        print("\n2. Logging in...")
        login_data = {
            "username": test_email,
            "password": "testpassword123"
        }
        
        response = requests.post(f"{base_url}/token", data=login_data)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data['access_token']
            print(f"   ✅ Login successful, token: {access_token[:20]}...")
        else:
            print(f"   ❌ Login failed: {response.text}")
            return False
        
        # Step 3: Get user profile
        print("\n3. Getting user profile...")
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(f"{base_url}/users/me", headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            profile = response.json()
            print(f"   ✅ Profile retrieved: {profile['name']}")
        else:
            print(f"   ❌ Profile retrieval failed: {response.text}")
            return False
        
        # Step 4: Create account
        print("\n4. Creating bank account...")
        account_data = {
            "account_number": "1234567890",
            "current_balance": 20000.0
        }
        
        response = requests.post(f"{base_url}/accounts/", json=account_data, headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            account = response.json()
            print(f"   ✅ Account created: {account['account_number']} (Balance: ₹{account['current_balance']})")
        else:
            print(f"   ❌ Account creation failed: {response.text}")
            return False
        
        print("\n🎉 Complete signup process successful!")
        return True
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        return False

if __name__ == "__main__":
    test_complete_signup()
