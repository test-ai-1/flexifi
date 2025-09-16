# FlexiFi Budget Backend API

This is the backend API for the FlexiFi Budget application. It provides endpoints for user authentication, budget management, transaction tracking, savings goals, and AI-powered financial insights.

## Features

- **User Management**: Registration, authentication, and profile management
- **Budget Management**: Create and track monthly budgets
- **Transaction Tracking**: Record and categorize financial transactions
- **Savings Goals**: Set and track progress towards financial goals
- **AI Analysis**: Get AI-powered insights on spending patterns and financial habits using Google's Gemini API

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLite**: Lightweight database for data storage
- **SQLAlchemy**: SQL toolkit and ORM
- **Pydantic**: Data validation and settings management
- **Google Generative AI**: For AI-powered financial insights

## Setup Instructions

### Prerequisites

- Python 3.8+
- pip (Python package installer)

### Installation

1. Clone the repository (if not already done)

2. Navigate to the backend directory:
   ```
   cd flexi-wise-budget/backend
   ```

3. Create a virtual environment:
   ```
   python -m venv venv
   ```

4. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

5. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

6. Create a `.env` file based on `.env.example` and fill in your configuration:
   ```
   cp .env.example .env
   ```
   - Update the `GEMINI_API_KEY` with your Google Generative AI API key
   - Update the `SECRET_KEY` for JWT token encryption

7. Create sample data (optional):
   ```
   python sample_data.py
   ```

8. Start the server:
   ```
   uvicorn main:app --reload
   ```

9. Access the API documentation at `http://localhost:8000/docs`

## API Endpoints

### Authentication

- `POST /token`: Get authentication token

### Users

- `POST /users/`: Create a new user
- `GET /users/me`: Get current user information

### Budgets

- `POST /budgets/`: Create a new budget
- `GET /budgets/`: Get all budgets for current user

### Transactions

- `POST /transactions/`: Create a new transaction
- `GET /transactions/`: Get all transactions for current user

### Savings Goals

- `POST /savings-goals/`: Create a new savings goal
- `GET /savings-goals/`: Get all savings goals for current user

### AI Analysis

- `POST /ai-analysis/`: Generate AI analysis based on financial data
- `GET /ai-analysis/`: Get all previous AI analyses for current user

## Testing

### Sample cURL Commands

1. Create a new user:
   ```bash
   curl -X 'POST' \
     'http://localhost:8000/users/' \
     -H 'accept: application/json' \
     -H 'Content-Type: application/json' \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

2. Get authentication token:
   ```bash
   curl -X 'POST' \
     'http://localhost:8000/token' \
     -H 'accept: application/json' \
     -H 'Content-Type: application/x-www-form-urlencoded' \
     -d 'username=test%40example.com&password=password123'
   ```

3. Create a new transaction (with token):
   ```bash
   curl -X 'POST' \
     'http://localhost:8000/transactions/' \
     -H 'accept: application/json' \
     -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
     -H 'Content-Type: application/json' \
     -d '{
       "amount": -500,
       "category": "Food",
       "description": "Grocery shopping",
       "date": "2023-07-15T00:00:00",
       "payment_method": "Credit Card"
     }'
   ```

4. Generate AI analysis (with token):
   ```bash
   curl -X 'POST' \
     'http://localhost:8000/ai-analysis/?analysis_type=general' \
     -H 'accept: application/json' \
     -H 'Authorization: Bearer YOUR_TOKEN_HERE'
   ```

## Integration with Frontend

To integrate this backend with the FlexiFi Budget frontend:

1. Update the API base URL in the frontend code to point to this backend server
2. Replace localStorage-based authentication with token-based authentication
3. Update data fetching functions to use the API endpoints

## Security Considerations

- The API uses token-based authentication
- Input validation is performed using Pydantic models
- Database queries use SQLAlchemy ORM to prevent SQL injection
- In a production environment, consider adding HTTPS, rate limiting, and more robust authentication