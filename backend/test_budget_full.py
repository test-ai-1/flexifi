#!/usr/bin/env python3
"""
Test script to test complete budget creation flow
"""

import requests
import json
from datetime import datetime, timedelta
import time

def test_complete_budget_flow():
    print("🧪 Testing Complete Budget Creation Flow")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    try:
        # Generate unique email for testing
        timestamp = int(time.time())
        test_email = f"budgettest{timestamp}@example.com"
        
        print(f"📧 Using test email: {test_email}")
        
        # Step 1: Register user
        print("\n1. Registering user...")
        user_data = {
            "name": "Budget Test User",
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
        
        # Step 3: Create budget
        print("\n3. Creating budget...")
        headers = {"Authorization": f"Bearer {access_token}"}
        
        now = datetime.now()
        start_date = now.replace(day=1)
        end_date = (start_date + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        monthly_budget = {
            "monthly_budget": 15000.0,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
        
        print(f"   Budget data: {monthly_budget}")
        
        response = requests.post(f"{base_url}/budgets/", json=monthly_budget, headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            budget = response.json()
            print(f"   ✅ Budget created: ₹{budget['monthly_budget']} (ID: {budget['budget_id']})")
        else:
            print(f"   ❌ Budget creation failed: {response.text}")
            return False
        
        # Step 4: Get budgets
        print("\n4. Getting budgets...")
        response = requests.get(f"{base_url}/budgets/", headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            budgets = response.json()
            print(f"   ✅ Retrieved {len(budgets)} budgets")
            for budget in budgets:
                print(f"      - Budget ID {budget['budget_id']}: ₹{budget['monthly_budget']}")
        else:
            print(f"   ❌ Failed to get budgets: {response.text}")
            return False
        
        print("\n🎉 Complete budget flow successful!")
        return True
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        return False

if __name__ == "__main__":
    test_complete_budget_flow()
