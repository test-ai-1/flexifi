// API client for interacting with the backend

// Base URL for API requests
const API_BASE_URL = 'http://localhost:8000';

// Helper function to get the authentication token from localStorage
const getToken = (): string | null => {
  const user = localStorage.getItem('flexifi_user');
  if (user) {
    const userData = JSON.parse(user);
    return userData.access_token || null;
  }
  return null;
};

// Helper function for making authenticated API requests
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An unknown error occurred',
    }));
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Authentication API
export const authApi = {
  // Register a new user
  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: 'An unknown error occurred',
      }));
      throw new Error(error.detail || `Error ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  // Login user and get token
  login: async (credentials: { username: string; password: string }) => {
    const { username, password } = credentials;
    const formData = new URLSearchParams();
    formData.append('username', username); // FastAPI OAuth expects 'username'
    formData.append('password', password);
    
    const response = await fetch(`${API_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Invalid email or password',
      }));
      throw new Error(error.message || 'Login failed');
    }
    
    const data = await response.json();
    
    // Store token in localStorage in the format expected by the app
    const userData = {
      access_token: data.access_token,
      token_type: data.token_type,
    };
    localStorage.setItem('flexifi_user', JSON.stringify(userData));
    
    return data;
  },
  
  // Get current user profile
  getCurrentUser: async () => {
    return await fetchWithAuth('/users/me');
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('user');
  },
};

// Account API
export const accountApi = {
  // Create a new account
  createAccount: async (accountData: {
    account_number: string;
    current_balance: number;
  }) => {
    return await fetchWithAuth('/accounts/', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
  },
  
  // Get all accounts for current user
  getAccounts: async () => {
    return await fetchWithAuth('/accounts/');
  },
  
  // Update account balance
  updateAccountBalance: async (accountId: number, balance: number) => {
    return await fetchWithAuth(`/accounts/${accountId}?balance=${balance}`, {
      method: 'PUT',
    });
  },
};

// Budget API
export const budgetApi = {
  // Create a new budget
  createBudget: async (budgetData: {
    monthly_budget: number;
    start_date: string;
    end_date: string;
  }) => {
    return await fetchWithAuth('/budgets/', {
      method: 'POST',
      body: JSON.stringify(budgetData),
    });
  },
  
  // Get all budgets for current user
  getBudgets: async () => {
    return await fetchWithAuth('/budgets/');
  },
};

// Transaction API
export const transactionApi = {
  // Create a new transaction
  createTransaction: async (transactionData: {
    amount: number;
    category: string;
    description: string;
    date: string;
    payment_method: string;
  }) => {
    return await fetchWithAuth('/transactions/', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  },
  
  // Get all transactions for current user
  getTransactions: async () => {
    return await fetchWithAuth('/transactions/');
  },
};

// Savings Goal API
export const savingsGoalApi = {
  // Create a new savings goal
  createSavingsGoal: async (goalData: {
    goal_name: string;
    target_amount: number;
    current_amount: number;
    deadline: string;
  }) => {
    return await fetchWithAuth('/savings-goals/', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  },
  
  // Get all savings goals for current user
  getSavingsGoals: async () => {
    return await fetchWithAuth('/savings-goals/');
  },
};

// AI Analysis API
export const aiAnalysisApi = {
  // Generate AI analysis
  generateAnalysis: async (analysisType: string = 'general') => {
    return await fetchWithAuth(`/ai-analysis/?analysis_type=${analysisType}`, {
      method: 'POST',
    });
  },
  
  // Get all previous AI analyses
  getAnalyses: async () => {
    return await fetchWithAuth('/ai-analysis/');
  },
};

// Chat API
export const chatApi = {
  // Send a message and get AI response
  sendMessage: async (content: string) => {
    return await fetchWithAuth('/chat/', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
  
  // Get chat history
  getChatHistory: async () => {
    return await fetchWithAuth('/chat/');
  },
};

// Export all APIs
export const api = {
  auth: authApi,
  account: accountApi,
  budget: budgetApi,
  transaction: transactionApi,
  savingsGoal: savingsGoalApi,
  aiAnalysis: aiAnalysisApi,
  chat: chatApi,
};

export default api;