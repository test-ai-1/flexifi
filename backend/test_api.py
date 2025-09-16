#!/usr/bin/env python3
"""
Test script for FlexiFi Budget API
Run this script to test all API endpoints
"""

import requests
import json
from datetime import datetime, timedelta

# API base URL
BASE_URL = "http://localhost:8000"

def test_api():
    print("🚀 Testing FlexiFi Budget API")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return
    
    # Test 2: Register a new user
    print("\n2. Testing user registration...")
    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/users/", json=user_data)
        if response.status_code == 200:
            print("✅ User registration successful")
            user = response.json()
            print(f"   User ID: {user['user_id']}")
        else:
            print(f"❌ User registration failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ User registration error: {e}")
    
    # Test 3: Login
    print("\n3. Testing user login...")
    login_data = {
        "username": "test@example.com",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/token", data=login_data)
        print(f"   Response status: {response.status_code}")
        print(f"   Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Login successful")
            try:
                token_data = response.json()
                print(f"   Response data: {token_data}")
                
                # Handle different response formats
                if isinstance(token_data, dict) and 'access_token' in token_data:
                    access_token = token_data['access_token']
                    print(f"   Token: {access_token[:20]}...")
                elif isinstance(token_data, str):
                    # If the response is just a string (user_id), use it as token
                    access_token = token_data
                    print(f"   Token (user_id): {access_token}")
                else:
                    print(f"❌ Unexpected response format: {type(token_data)} - {token_data}")
                    return
            except json.JSONDecodeError as e:
                print(f"❌ JSON decode error: {e}")
                print(f"   Raw response: {response.text}")
                return
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    # Set up headers for authenticated requests
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Test 4: Get current user
    print("\n4. Testing get current user...")
    try:
        response = requests.get(f"{BASE_URL}/users/me", headers=headers)
        if response.status_code == 200:
            print("✅ Get current user successful")
            user = response.json()
            print(f"   User: {user['name']} ({user['email']})")
        else:
            print(f"❌ Get current user failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Get current user error: {e}")
    
    # Test 5: Create account
    print("\n5. Testing create account...")
    account_data = {
        "account_number": "1234567890",
        "current_balance": 10000.0
    }
    
    try:
        response = requests.post(f"{BASE_URL}/accounts/", json=account_data, headers=headers)
        if response.status_code == 200:
            print("✅ Create account successful")
            account = response.json()
            print(f"   Account ID: {account['account_id']}")
            print(f"   Balance: ₹{account['current_balance']}")
        else:
            print(f"❌ Create account failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Create account error: {e}")
    
    # Test 6: Create budget
    print("\n6. Testing create budget...")
    budget_data = {
        "monthly_budget": 50000.0,
        "start_date": datetime.now().isoformat(),
        "end_date": (datetime.now() + timedelta(days=30)).isoformat()
    }
    
    try:
        response = requests.post(f"{BASE_URL}/budgets/", json=budget_data, headers=headers)
        if response.status_code == 200:
            print("✅ Create budget successful")
            budget = response.json()
            print(f"   Budget ID: {budget['budget_id']}")
            print(f"   Monthly Budget: ₹{budget['monthly_budget']}")
        else:
            print(f"❌ Create budget failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Create budget error: {e}")
    
    # Test 7: Create transactions
    print("\n7. Testing create transactions...")
    transactions = [
        {
            "amount": 50000.0,
            "category": "Salary",
            "description": "Monthly salary",
            "date": datetime.now().isoformat(),
            "payment_method": "Bank Transfer"
        },
        {
            "amount": -5000.0,
            "category": "Food",
            "description": "Grocery shopping",
            "date": datetime.now().isoformat(),
            "payment_method": "UPI"
        },
        {
            "amount": -2000.0,
            "category": "Transport",
            "description": "Fuel and transport",
            "date": datetime.now().isoformat(),
            "payment_method": "Credit Card"
        }
    ]
    
    for i, transaction_data in enumerate(transactions, 1):
        try:
            response = requests.post(f"{BASE_URL}/transactions/", json=transaction_data, headers=headers)
            if response.status_code == 200:
                print(f"✅ Transaction {i} created successfully")
                transaction = response.json()
                print(f"   Amount: ₹{transaction['amount']} - {transaction['description']}")
            else:
                print(f"❌ Transaction {i} failed: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"❌ Transaction {i} error: {e}")
    
    # Test 8: Get transactions
    print("\n8. Testing get transactions...")
    try:
        response = requests.get(f"{BASE_URL}/transactions/", headers=headers)
        if response.status_code == 200:
            transactions = response.json()
            print(f"✅ Retrieved {len(transactions)} transactions")
            for transaction in transactions:
                print(f"   ₹{transaction['amount']} - {transaction['description']}")
        else:
            print(f"❌ Get transactions failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Get transactions error: {e}")
    
    # Test 9: Create savings goal
    print("\n9. Testing create savings goal...")
    savings_goal_data = {
        "goal_name": "Emergency Fund",
        "target_amount": 100000.0,
        "current_amount": 25000.0,
        "deadline": (datetime.now() + timedelta(days=365)).isoformat()
    }
    
    try:
        response = requests.post(f"{BASE_URL}/savings-goals/", json=savings_goal_data, headers=headers)
        if response.status_code == 200:
            print("✅ Create savings goal successful")
            goal = response.json()
            print(f"   Goal: {goal['goal_name']} - ₹{goal['current_amount']}/{goal['target_amount']}")
        else:
            print(f"❌ Create savings goal failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Create savings goal error: {e}")
    
    # Test 10: AI Analysis (if API key is configured)
    print("\n10. Testing AI analysis...")
    try:
        response = requests.post(f"{BASE_URL}/ai-analysis/?analysis_type=general", headers=headers)
        if response.status_code == 200:
            analysis = response.json()
            print("✅ AI analysis successful")
            print(f"   Analysis type: {analysis['analysis_type']}")
            print(f"   Result preview: {analysis['result'][:100]}...")
        else:
            print(f"❌ AI analysis failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ AI analysis error: {e}")
    
    # Test 11: Chat (if API key is configured)
    print("\n11. Testing AI chat...")
    try:
        chat_data = {"content": "How am I doing with my budget?"}
        response = requests.post(f"{BASE_URL}/chat/", json=chat_data, headers=headers)
        if response.status_code == 200:
            message = response.json()
            print("✅ AI chat successful")
            print(f"   Response: {message['content'][:100]}...")
        else:
            print(f"❌ AI chat failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ AI chat error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 API testing completed!")
    print("\nNote: AI features require a valid Gemini API key in the .env file")

if __name__ == "__main__":
    test_api()