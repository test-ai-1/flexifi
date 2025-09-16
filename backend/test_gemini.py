#!/usr/bin/env python3
"""
Test script to verify Gemini API is working
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_gemini_api():
    print("🔍 Testing Gemini API Configuration")
    print("=" * 50)
    
    # Check if API key is set
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ GEMINI_API_KEY not found in environment variables")
        print("Please create a .env file with your Gemini API key:")
        print("GEMINI_API_KEY=your_gemini_api_key_here")
        return False
    
    if api_key == "your_gemini_api_key_here":
        print("❌ GEMINI_API_KEY is still set to placeholder value")
        print("Please replace 'your_gemini_api_key_here' with your actual API key")
        return False
    
    print(f"✅ GEMINI_API_KEY found: {api_key[:10]}...")
    
    # Test Gemini API import
    try:
        import google.generativeai as genai
        print("✅ google.generativeai imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import google.generativeai: {e}")
        print("Please install: pip install google-generativeai")
        return False
    
    # Configure Gemini
    try:
        genai.configure(api_key=api_key)
        print("✅ Gemini API configured successfully")
    except Exception as e:
        print(f"❌ Failed to configure Gemini API: {e}")
        return False
    
    # Test API call
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Hello, can you respond with 'API test successful'?")
        print(f"✅ API call successful: {response.text}")
        return True
    except Exception as e:
        print(f"❌ API call failed: {e}")
        if "API key" in str(e) or "authentication" in str(e).lower():
            print("The API key appears to be invalid or expired")
        elif "quota" in str(e).lower() or "rate limit" in str(e).lower():
            print("API quota exceeded or rate limited")
        else:
            print("Unknown error occurred")
        return False

if __name__ == "__main__":
    success = test_gemini_api()
    if success:
        print("\n🎉 Gemini API is working correctly!")
    else:
        print("\n❌ Gemini API test failed. Please check your configuration.")
        sys.exit(1)
