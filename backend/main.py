from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from typing import List, Optional
import uvicorn
import os
from datetime import timedelta, datetime

from dotenv import load_dotenv
load_dotenv() 

# Import local modules
from database import get_db, engine
import models
from models import User, Account, Budget, Transaction, SavingsGoal, AIAnalysis, ChatMessage
from ai_service import generate_financial_insights, process_chat_message
from auth import (
    authenticate_user, 
    create_access_token, 
    get_current_active_user, 
    get_password_hash,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

# Create database tables with error handling
def create_tables():
    try:
        models.Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        print("This might be due to database locking. Please try again.")

# Create tables on startup
create_tables()

# Initialize FastAPI app
app = FastAPI(title="FlexiFi Budget API", description="Backend API for FlexiFi Budget App")

# Set up CORS middleware to allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# No need for oauth2_scheme here as it's defined in auth.py

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to FlexiFi Budget API"}

# Authentication endpoints
@app.post("/token", response_model=models.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.user_id)}, expires_delta=access_token_expires
    )
    
    # Debug logging
    print(f"Login successful for user {user.user_id}")
    print(f"Generated token: {access_token[:20]}...")
    
    return {"access_token": access_token, "token_type": "bearer"}

# User endpoints
@app.post("/users/", response_model=models.UserResponse)
async def create_user(user: models.UserCreate, db = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/users/me", response_model=models.UserResponse)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# Account endpoints
@app.post("/accounts/", response_model=models.AccountResponse)
async def create_account(account: models.AccountCreate, current_user: User = Depends(get_current_active_user), db = Depends(get_db)):
    new_account = Account(
        user_id=current_user.user_id,
        account_number=account.account_number,
        current_balance=account.current_balance
    )
    db.add(new_account)
    db.commit()
    db.refresh(new_account)

    # Record initial balance as an income transaction to seed analytics/AI
    try:
        if account.current_balance and account.current_balance > 0:
            initial_tx = Transaction(
                user_id=current_user.user_id,
                amount=account.current_balance,
                category="Income",
                description="Initial balance",
                date=datetime.utcnow(),
                payment_method="Bank"
            )
            db.add(initial_tx)
            db.commit()
    except Exception:
        # Do not block account creation if this auxiliary step fails
        db.rollback()
    return new_account

@app.get("/accounts/", response_model=List[models.AccountResponse])
async def read_accounts(current_user: User = Depends(get_current_active_user), db = Depends(get_db)):
    accounts = db.query(Account).filter(Account.user_id == current_user.user_id).all()
    return accounts

@app.put("/accounts/{account_id}", response_model=models.AccountResponse)
async def update_account_balance(account_id: int, balance: float, current_user: User = Depends(get_current_active_user), db = Depends(get_db)):
    account = db.query(Account).filter(Account.account_id == account_id, Account.user_id == current_user.user_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    account.current_balance = balance
    db.commit()
    db.refresh(account)
    return account

# Budget endpoints
@app.post("/budgets/", response_model=models.BudgetResponse)
async def create_budget(budget: models.BudgetCreate, current_user: User = Depends(get_current_active_user), db = Depends(get_db)):
    new_budget = Budget(
        user_id=current_user.user_id,
        monthly_budget=budget.monthly_budget,
        start_date=budget.start_date,
        end_date=budget.end_date
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return new_budget

@app.get("/budgets/", response_model=List[models.BudgetResponse])
async def read_budgets(current_user: User = Depends(get_current_active_user), db = Depends(get_db)):
    budgets = db.query(Budget).filter(Budget.user_id == current_user.user_id).all()
    return budgets

# Transaction endpoints
@app.post("/transactions/", response_model=models.TransactionResponse)
async def create_transaction(transaction: models.TransactionCreate, current_user: User = Depends(get_current_active_user), db = Depends(get_db)):
    new_transaction = Transaction(
        user_id=current_user.user_id,
        amount=transaction.amount,
        category=transaction.category,
        description=transaction.description,
        date=transaction.date,
        payment_method=transaction.payment_method
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return new_transaction

@app.get("/transactions/", response_model=List[models.TransactionResponse])
async def read_transactions(current_user: User = Depends(get_current_active_user), db = Depends(get_db)):
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.user_id).all()
    return transactions

# Savings Goal endpoints
@app.post("/savings-goals/", response_model=models.SavingsGoalResponse)
async def create_savings_goal(savings_goal: models.SavingsGoalCreate, current_user: User = Depends(get_current_active_user), db = Depends(get_db)):
    new_savings_goal = SavingsGoal(
        user_id=current_user.user_id,
        goal_name=savings_goal.goal_name,
        target_amount=savings_goal.target_amount,
        current_amount=savings_goal.current_amount,
        deadline=savings_goal.deadline
    )
    db.add(new_savings_goal)
    db.commit()
    db.refresh(new_savings_goal)
    return new_savings_goal

@app.get("/savings-goals/", response_model=List[models.SavingsGoalResponse])
async def read_savings_goals(current_user: User = Depends(get_current_active_user), db = Depends(get_db)):
    savings_goals = db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.user_id).all()
    return savings_goals

# AI Analysis endpoints
@app.post("/ai-analysis/", response_model=models.AIAnalysisResponse)
async def create_ai_analysis(analysis_type: str, current_user: User = Depends(get_current_active_user), db = Depends(get_db)):
    # Get user's transactions
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.user_id).all()
    
    # Get user's budget
    budget = db.query(Budget).filter(Budget.user_id == current_user.user_id).first()
    
    # Get user's savings goals
    savings_goals = db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.user_id).all()
    
    # Generate insights using Gemini API
    insights = generate_financial_insights(
        transactions=transactions,
        budget=budget,
        savings_goals=savings_goals,
        analysis_type=analysis_type
    )
    
    # Save analysis to database
    new_analysis = AIAnalysis(
        user_id=current_user.user_id,
        analysis_type=analysis_type,
        result=insights
    )
    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)
    
    return new_analysis

@app.get("/ai-analysis/", response_model=List[models.AIAnalysisResponse])
async def read_ai_analyses(current_user: User = Depends(get_current_active_user), db = Depends(get_db)):
    analyses = db.query(AIAnalysis).filter(AIAnalysis.user_id == current_user.user_id).all()
    return analyses

# Chat endpoints
@app.post("/chat/", response_model=models.ChatMessageResponse)
async def create_chat_message(message: models.ChatMessageCreate, current_user: User = Depends(get_current_active_user), db = Depends(get_db)):
    # Save user message
    user_message = ChatMessage(
        user_id=current_user.user_id,
        is_user=1,
        content=message.content
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    # Get user's transactions, budget, and savings goals for context
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.user_id).all()
    budget = db.query(Budget).filter(Budget.user_id == current_user.user_id).first()
    savings_goals = db.query(SavingsGoal).filter(SavingsGoal.user_id == current_user.user_id).all()
    
    # Generate AI response
    ai_response_text = process_chat_message(
        user_message=message.content,
        transactions=transactions,
        budget=budget,
        savings_goals=savings_goals
    )
    
    # Save AI response
    ai_message = ChatMessage(
        user_id=current_user.user_id,
        is_user=0,
        content=ai_response_text
    )
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)
    
    # Return the AI response
    return ai_message

@app.get("/chat/", response_model=List[models.ChatMessageResponse])
async def read_chat_messages(current_user: User = Depends(get_current_active_user), db = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.user_id).order_by(ChatMessage.created_at).all()
    return messages

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)