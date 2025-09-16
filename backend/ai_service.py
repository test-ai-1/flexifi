import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import List, Optional
import json
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables. AI analysis will not work.")
else:
    genai.configure(api_key=GEMINI_API_KEY)

def prepare_transaction_data(transactions):
    """Convert transaction objects to a format suitable for Gemini API"""
    transaction_data = []
    for tx in transactions:
        transaction_data.append({
            "amount": tx.amount,
            "category": tx.category,
            "description": tx.description,
            "date": tx.date.strftime("%Y-%m-%d"),
            "payment_method": tx.payment_method
        })
    return transaction_data

def prepare_budget_data(budget):
    """Convert budget object to a format suitable for Gemini API"""
    if not budget:
        return None
    
    return {
        "monthly_budget": budget.monthly_budget,
        "start_date": budget.start_date.strftime("%Y-%m-%d"),
        "end_date": budget.end_date.strftime("%Y-%m-%d")
    }

def prepare_savings_goals_data(savings_goals):
    """Convert savings goals objects to a format suitable for Gemini API"""
    goals_data = []
    for goal in savings_goals:
        goals_data.append({
            "goal_name": goal.goal_name,
            "target_amount": goal.target_amount,
            "current_amount": goal.current_amount,
            "deadline": goal.deadline.strftime("%Y-%m-%d"),
            "progress_percentage": (goal.current_amount / goal.target_amount) * 100 if goal.target_amount > 0 else 0
        })
    return goals_data

def generate_financial_insights(transactions, budget, savings_goals, analysis_type="general"):
    """Generate financial insights using Gemini API"""
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        print("Error: GEMINI_API_KEY not found or invalid. AI analysis will not work.")
        return "AI analysis unavailable: The API key may be invalid or missing. Please contact support."
    
    # Prepare data for Gemini API
    tx_data = prepare_transaction_data(transactions)
    budget_data = prepare_budget_data(budget)
    goals_data = prepare_savings_goals_data(savings_goals)
    
    # Calculate some basic statistics
    total_spent = sum(tx["amount"] for tx in tx_data if tx["amount"] < 0)
    total_income = sum(tx["amount"] for tx in tx_data if tx["amount"] > 0)
    categories = {}
    for tx in tx_data:
        cat = tx["category"]
        if cat not in categories:
            categories[cat] = 0
        categories[cat] += tx["amount"]
    
    # Create prompt based on analysis type
    prompts = {
        "general": f"""Analyze this financial data and provide 3-5 actionable insights:
        
Transactions: {json.dumps(tx_data)}
Budget: {json.dumps(budget_data)}
Savings Goals: {json.dumps(goals_data)}

Total spent: {total_spent}
Total income: {total_income}
Spending by category: {json.dumps(categories)}

Provide specific, personalized financial advice in this format:
1. [Insight about spending patterns]
2. [Recommendation about budget]
3. [Observation about savings goals]
4. [Specific action item with amount]
5. [Long-term financial advice]

Make sure insights are specific with actual numbers and percentages.""",
        
        "budget": f"""Analyze this budget data and provide 3-5 actionable insights about budget management:
        
Transactions: {json.dumps(tx_data)}
Budget: {json.dumps(budget_data)}

Total spent: {total_spent}
Total income: {total_income}
Spending by category: {json.dumps(categories)}

Provide specific budget advice in this format:
1. [Budget insight with specific numbers]
2. [Category where user is overspending]
3. [Suggestion to reallocate budget with specific amounts]
4. [Specific saving opportunity with amount]

Make insights specific with actual rupee amounts.""",
        
        "savings": f"""Analyze these savings goals and provide 3-5 actionable insights:
        
Savings Goals: {json.dumps(goals_data)}
Transactions: {json.dumps(tx_data)}

Total spent: {total_spent}
Total income: {total_income}

Provide specific savings advice in this format:
1. [Progress assessment for each goal]
2. [Specific strategy to accelerate savings with amount]
3. [Recommendation about goal feasibility]
4. [Suggestion about new potential savings goal]

Make insights specific with actual rupee amounts and timeframes.""",
    }
    
    # Select prompt based on analysis type
    prompt = prompts.get(analysis_type, prompts["general"])
    
    try:
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Generate response
        response = model.generate_content(prompt)
        
        return response.text
    except Exception as e:
        error_message = str(e)
        print(f"Error generating insights: {error_message}")
        
        if "API key" in error_message or "authentication" in error_message.lower():
            return "AI analysis unavailable: API key invalid or expired. Please contact support."
        elif "quota" in error_message.lower() or "rate limit" in error_message.lower():
            return "AI analysis unavailable: API quota exceeded. Please try again later or contact support."
        else:
            return f"Error generating insights: {error_message}. Please try again later."

# Example of data structure sent to Gemini API
SAMPLE_DATA_STRUCTURE = {
    "transactions": [
        {
            "amount": -500.0,
            "category": "Food",
            "description": "Grocery shopping",
            "date": "2023-07-15",
            "payment_method": "Credit Card"
        },
        {
            "amount": -200.0,
            "category": "Entertainment",
            "description": "Movie tickets",
            "date": "2023-07-16",
            "payment_method": "UPI"
        },
        {
            "amount": 5000.0,
            "category": "Income",
            "description": "Salary",
            "date": "2023-07-01",
            "payment_method": "Bank Transfer"
        }
    ],
    "budget": {
        "monthly_budget": 10000.0,
        "start_date": "2023-07-01",
        "end_date": "2023-07-31"
    },
    "savings_goals": [
        {
            "goal_name": "Vacation",
            "target_amount": 20000.0,
            "current_amount": 15000.0,
            "deadline": "2023-12-31",
            "progress_percentage": 75.0
        }
    ]
}

# Example prompts for different analysis types
EXAMPLE_PROMPTS = {
    "general": "Analyze this financial data and provide 3-5 actionable insights...",
    "budget": "Analyze this budget data and provide 3-5 actionable insights about budget management...",
    "savings": "Analyze these savings goals and provide 3-5 actionable insights..."
}

def process_chat_message(user_message: str, transactions, budget, savings_goals):
    """Process a chat message from the user and generate a response using Gemini API"""
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        print("Error: GEMINI_API_KEY not found or invalid. Chat functionality will not work.")
        return "AI chatbot unavailable: The API key may be invalid or missing. Please contact support."
    
    # Prepare data for Gemini API
    tx_data = prepare_transaction_data(transactions)
    budget_data = prepare_budget_data(budget)
    goals_data = prepare_savings_goals_data(savings_goals)
    
    # Calculate some basic statistics
    total_spent = sum(tx["amount"] for tx in tx_data if tx["amount"] < 0)
    total_income = sum(tx["amount"] for tx in tx_data if tx["amount"] > 0)
    categories = {}
    for tx in tx_data:
        cat = tx["category"]
        if cat not in categories:
            categories[cat] = 0
        categories[cat] += tx["amount"]
    
    # Days left logic for budget period (assume month if dates exist)
    days_left = None
    daily_budget_suggestion = None
    if budget_data and budget_data.get("start_date") and budget_data.get("end_date") and budget_data.get("monthly_budget"):
        try:
            start_d = datetime.strptime(budget_data["start_date"], "%Y-%m-%d")
            end_d = datetime.strptime(budget_data["end_date"], "%Y-%m-%d")
            today = datetime.utcnow().date()
            if today <= end_d.date():
                days_left = (end_d.date() - today).days + 1
                # Compute remaining budget
                remaining = float(budget_data["monthly_budget"]) + total_income + total_spent  # total_spent is negative
                if days_left > 0:
                    daily_budget_suggestion = remaining / days_left
        except Exception:
            pass

    # Create prompt for chat with smarter guidance
    prompt = f"""You are a senior financial planner inside the FlexiFi Budget App.
    Always use the user's data below to answer with clear, numeric guidance.

    DATA
    - Transactions: {json.dumps(tx_data)}
    - Budget: {json.dumps(budget_data)}
    - Savings Goals: {json.dumps(goals_data)}
    - Total spent (negative): {total_spent}
    - Total income (positive): {total_income}
    - Spending by category: {json.dumps(categories)}
    - Days left in current budget period (if available): {days_left}
    - Suggested daily spend to stay on track (if computed): {daily_budget_suggestion}

    TASKS
    1) If the user asks "how much can I spend today?" or similar:
       - If daily_budget_suggestion is available, reply with that rupee value and briefly explain remaining budget and days left.
       - If not, estimate a daily amount using (remaining this month / days left) if dates exist; else ask the user to set a budget.

    2) If the user asks "should I buy X for ₹Y?":
       - Compare Y with remaining budget and days left.
       - If the purchase makes the per-day allowance too tight, caution and provide a safer amount.
       - If affordable, approve with reasoning and updated per-day allowance.

    3) For general questions, provide 2-3 short, specific recommendations with amounts/percentages.

    Respond concisely (3-6 sentences) and include rupee symbols and exact numbers where relevant.

    USER QUESTION: {user_message}
    """
    
    try:
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Generate response
        response = model.generate_content(prompt)
        
        return response.text
    except Exception as e:
        error_message = str(e)
        print(f"Error processing chat message: {error_message}")
        
        if "API key" in error_message or "authentication" in error_message.lower():
            return "AI chatbot unavailable: API key invalid or expired. Please contact support."
        elif "quota" in error_message.lower() or "rate limit" in error_message.lower():
            return "AI chatbot unavailable: API quota exceeded. Please try again later or contact support."
        else:
            return f"I'm sorry, I couldn't process your question. Please try again later or contact support."