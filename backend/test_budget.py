#!/usr/bin/env python3
"""
Test script to test budget creation
"""

import requests
import json
from datetime import datetime, timedelta

def test_budget_creation():
    print("🧪 Testing Budget Creation")
    print("=" * 50)
    
    base_url = "http://localhost:8000"
    
    try:
        # First, login to get a token
        print("1. Logging in...")
        login_data = {
            "username": "test@example.com",
            "password": "testpassword123"
        }
        
        response = requests.post(f"{base_url}/token", data=login_data)
        print(f"   Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"   ❌ Login failed: {response.text}")
            return False
        
        token_data = response.json()
        access_token = token_data['access_token']
        print(f"   ✅ Login successful, token: {access_token[:20]}...")
        
        # Now test budget creation
        print("\n2. Creating budget...")
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Test different budget types
        now = datetime.now()
        
        # Monthly budget
        monthly_budget = {
            "monthly_budget": 15000.0,
            "start_date": now.replace(day=1).isoformat(),
            "end_date": (now.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1).isoformat()
        }
        
        print(f"   Monthly budget data: {monthly_budget}")
        
        response = requests.post(f"{base_url}/budgets/", json=monthly_budget, headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            budget = response.json()
            print(f"   ✅ Budget created: ₹{budget['monthly_budget']} (ID: {budget['budget_id']})")
            return True
        else:
            print(f"   ❌ Budget creation failed: {response.text}")
            return False
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        return False

if __name__ == "__main__":
    test_budget_creation()
