from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from datetime import datetime, timedelta
import random

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Sample data
def create_sample_data():
    db = SessionLocal()
    try:
        # Check if data already exists
        if db.query(models.User).count() > 0:
            print("Sample data already exists. Skipping...")
            return
        
        # Create sample users
        users = [
            models.User(name="John Doe", email="john@example.com"),
            models.User(name="Jane Smith", email="jane@example.com"),
        ]
        db.add_all(users)
        db.commit()
        
        # Refresh to get user_ids
        for user in users:
            db.refresh(user)
        
        # Create sample budgets
        today = datetime.now()
        month_start = datetime(today.year, today.month, 1)
        next_month = month_start + timedelta(days=32)
        next_month_start = datetime(next_month.year, next_month.month, 1)
        
        budgets = [
            models.Budget(
                user_id=users[0].user_id,
                monthly_budget=50000.0,
                start_date=month_start,
                end_date=next_month_start - timedelta(days=1)
            ),
            models.Budget(
                user_id=users[1].user_id,
                monthly_budget=75000.0,
                start_date=month_start,
                end_date=next_month_start - timedelta(days=1)
            ),
        ]
        db.add_all(budgets)
        db.commit()
        
        # Create sample transactions
        categories = ["Food", "Transportation", "Entertainment", "Shopping", "Utilities", "Rent", "Income"]
        payment_methods = ["Credit Card", "Debit Card", "UPI", "Cash", "Bank Transfer"]
        
        transactions = []
        
        # Transactions for user 1
        for i in range(30):
            date = month_start + timedelta(days=i)
            # Income transaction on 1st of month
            if i == 0:
                transactions.append(
                    models.Transaction(
                        user_id=users[0].user_id,
                        amount=60000.0,
                        category="Income",
                        description="Salary",
                        date=date,
                        payment_method="Bank Transfer"
                    )
                )
            else:
                # Regular expenses
                for _ in range(random.randint(1, 3)):
                    category = random.choice(categories[:-1])  # Exclude Income
                    amount = -random.randint(100, 2000)
                    
                    # Adjust amount based on category
                    if category == "Rent":
                        amount = -15000.0
                    elif category == "Utilities":
                        amount = -random.randint(1000, 3000)
                    
                    transactions.append(
                        models.Transaction(
                            user_id=users[0].user_id,
                            amount=amount,
                            category=category,
                            description=f"{category} expense",
                            date=date,
                            payment_method=random.choice(payment_methods)
                        )
                    )
        
        # Transactions for user 2
        for i in range(30):
            date = month_start + timedelta(days=i)
            # Income transaction on 1st of month
            if i == 0:
                transactions.append(
                    models.Transaction(
                        user_id=users[1].user_id,
                        amount=80000.0,
                        category="Income",
                        description="Salary",
                        date=date,
                        payment_method="Bank Transfer"
                    )
                )
            else:
                # Regular expenses
                for _ in range(random.randint(1, 4)):
                    category = random.choice(categories[:-1])  # Exclude Income
                    amount = -random.randint(200, 3000)
                    
                    # Adjust amount based on category
                    if category == "Rent":
                        amount = -20000.0
                    elif category == "Utilities":
                        amount = -random.randint(2000, 4000)
                    
                    transactions.append(
                        models.Transaction(
                            user_id=users[1].user_id,
                            amount=amount,
                            category=category,
                            description=f"{category} expense",
                            date=date,
                            payment_method=random.choice(payment_methods)
                        )
                    )
        
        db.add_all(transactions)
        db.commit()
        
        # Create sample savings goals
        savings_goals = [
            models.SavingsGoal(
                user_id=users[0].user_id,
                goal_name="Vacation",
                target_amount=100000.0,
                current_amount=75000.0,
                deadline=datetime.now() + timedelta(days=90)
            ),
            models.SavingsGoal(
                user_id=users[0].user_id,
                goal_name="New Laptop",
                target_amount=80000.0,
                current_amount=20000.0,
                deadline=datetime.now() + timedelta(days=60)
            ),
            models.SavingsGoal(
                user_id=users[1].user_id,
                goal_name="Car Down Payment",
                target_amount=200000.0,
                current_amount=150000.0,
                deadline=datetime.now() + timedelta(days=180)
            ),
        ]
        db.add_all(savings_goals)
        db.commit()
        
        # Create sample AI analyses
        analyses = [
            models.AIAnalysis(
                user_id=users[0].user_id,
                analysis_type="general",
                result="""1. You spent 40% more on food this month. Consider meal prepping to save ₹2000.
2. Your savings goal is 75% complete. Keep going!
3. You're spending ₹500/day on weekends. Try limiting to ₹300.
4. Reduce entertainment expenses by ₹1500 to meet your budget.
5. At current rate, you'll reach your vacation goal 2 weeks early."""
            ),
            models.AIAnalysis(
                user_id=users[1].user_id,
                analysis_type="budget",
                result="""1. You're under budget by ₹5000 this month. Consider adding this to your savings.
2. Your highest expense category is Shopping at ₹15000 (20% of budget).
3. Reduce dining out by ₹3000 to optimize your food budget.
4. You could save ₹2500 monthly by using public transport more often."""
            ),
        ]
        db.add_all(analyses)
        db.commit()
        
        print("Sample data created successfully!")
    
    except Exception as e:
        print(f"Error creating sample data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()