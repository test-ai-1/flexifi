from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.sql import func
from database import Base
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, date

# SQLAlchemy Models
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

class Account(Base):
    __tablename__ = "accounts"

    account_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    account_number = Column(String, nullable=False)
    current_balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=func.now())

class Budget(Base):
    __tablename__ = "budgets"

    budget_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    monthly_budget = Column(Float, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=func.now())

class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    description = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    payment_method = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now())

class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    goal_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    goal_name = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    deadline = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=func.now())

class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    analysis_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    analysis_type = Column(String, nullable=False)
    result = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now())

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    message_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    is_user = Column(Integer, default=1)  # 1 for user message, 0 for AI response
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now())

# Pydantic Models for Request/Response

# User models
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    user_id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Account models
class AccountBase(BaseModel):
    account_number: str
    current_balance: float

class AccountCreate(AccountBase):
    pass

class AccountResponse(AccountBase):
    account_id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Budget models
class BudgetBase(BaseModel):
    monthly_budget: float
    start_date: datetime
    end_date: datetime

class BudgetCreate(BudgetBase):
    pass

class BudgetResponse(BudgetBase):
    budget_id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Transaction models
class TransactionBase(BaseModel):
    amount: float
    category: str
    description: str
    date: datetime
    payment_method: str

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    transaction_id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# SavingsGoal models
class SavingsGoalBase(BaseModel):
    goal_name: str
    target_amount: float
    current_amount: float
    deadline: datetime

class SavingsGoalCreate(SavingsGoalBase):
    pass

class SavingsGoalResponse(SavingsGoalBase):
    goal_id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# AIAnalysis models
class AIAnalysisBase(BaseModel):
    analysis_type: str
    result: str

class AIAnalysisCreate(AIAnalysisBase):
    pass

class AIAnalysisResponse(AIAnalysisBase):
    analysis_id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# ChatMessage models
class ChatMessageBase(BaseModel):
    content: str
    is_user: int = 1

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    message_id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Token models for JWT authentication
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None