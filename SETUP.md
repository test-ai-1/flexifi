# FlexiFi Budget App - Setup Instructions

## Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd flexi-wise-budget/backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create a .env file in the backend directory with the following content:**
   ```env
   # Gemini API Key - Get your API key from https://makersuite.google.com/app/apikey
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # JWT Secret Key - Change this in production
   SECRET_KEY=your-super-secret-jwt-key-change-in-production
   
   # Database URL
   DATABASE_URL=sqlite:///./flexifi.db
   ```

6. **Get your Gemini API key:**
   - Go to https://makersuite.google.com/app/apikey
   - Create a new API key
   - Copy the key and replace `your_gemini_api_key_here` in the .env file

7. **Run the backend server:**
   
   **Option 1: Using the run script (Recommended):**
   ```bash
   python run_server.py
   ```
   
   **Option 2: Using uvicorn directly:**
   ```bash
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   **Option 3: Using the batch/shell script:**
   - Windows: Double-click `start_server.bat` or run `start_server.bat` in command prompt
   - Linux/Mac: Run `./start_server.sh` in terminal

## Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd flexi-wise-budget
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Database

The app uses SQLite database which will be created automatically when you first run the backend. The database file will be created as `flexifi.db` in the backend directory.

## Features

### ✅ Completed Features

1. **User Authentication System**
   - User registration with email and password
   - Secure login with JWT tokens
   - Password hashing with bcrypt
   - Session management

2. **Database Schema**
   - Users table with authentication
   - Accounts table for bank account management
   - Budgets table for monthly budget tracking
   - Transactions table for income/expense tracking
   - AI_Analysis table for storing AI insights
   - Chat_Messages table for AI chatbot conversations

3. **User Data Flow**
   - Registration stores user in database
   - Login generates JWT token
   - Account balance management
   - Budget setting and tracking
   - Transaction recording and retrieval

4. **AI Analysis System**
   - Fetches user's financial data from database
   - Sends data to Gemini API for analysis
   - Returns personalized insights
   - Stores analysis results in database

5. **AI Chatbot System**
   - Processes user questions with financial context
   - Uses Gemini API for intelligent responses
   - Stores conversation history
   - Provides personalized financial advice

6. **Frontend Integration**
   - All components connected to backend APIs
   - Real-time data updates
   - Error handling and loading states
   - Responsive design

7. **Security Features**
   - Password hashing
   - JWT token authentication
   - Input validation
   - SQL injection prevention
   - Secure error messages

## API Endpoints

### Authentication
- `POST /users/` - Register new user
- `POST /token` - Login user
- `GET /users/me` - Get current user profile

### Accounts
- `POST /accounts/` - Create new account
- `GET /accounts/` - Get user accounts
- `PUT /accounts/{account_id}` - Update account balance

### Budgets
- `POST /budgets/` - Create new budget
- `GET /budgets/` - Get user budgets

### Transactions
- `POST /transactions/` - Create new transaction
- `GET /transactions/` - Get user transactions

### Savings Goals
- `POST /savings-goals/` - Create savings goal
- `GET /savings-goals/` - Get user savings goals

### AI Analysis
- `POST /ai-analysis/` - Generate AI analysis
- `GET /ai-analysis/` - Get analysis history

### Chat
- `POST /chat/` - Send message to AI
- `GET /chat/` - Get chat history

## Testing the Application

1. **Start both backend and frontend servers**
2. **Open http://localhost:5173 in your browser**
3. **Register a new account**
4. **Set up your bank account details**
5. **Add some transactions**
6. **Set a monthly budget**
7. **Try the AI analysis feature**
8. **Chat with the AI assistant**

## Sample User Journey

1. Register with email and password
2. Set up bank account details
3. Add transactions (income and expenses)
4. Set monthly budget
5. View dashboard with real-time data
6. Get AI analysis of spending patterns
7. Chat with AI for financial advice

## Troubleshooting

- **Backend not starting**: Check if port 8000 is available
- **Frontend not connecting**: Ensure backend is running on port 8000
- **AI features not working**: Verify Gemini API key is correctly set
- **Database errors**: Check if SQLite file permissions are correct

## Production Deployment

For production deployment:

1. Change the JWT secret key
2. Use a production database (PostgreSQL recommended)
3. Set up proper CORS origins
4. Use environment variables for all secrets
5. Set up proper logging and monitoring
6. Use HTTPS for all communications
