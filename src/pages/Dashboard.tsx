import { useState, useEffect } from "react";
import { ArrowLeft, ArrowUp, ArrowDown, DollarSign, PiggyBank, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import api from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import BudgetModal from "@/components/BudgetModal";

// Mock data for the dashboard
const mockFinancialData = {
  income: 45000,
  expenses: 32450,
  budget: 40000,
  savings: 12550,
  savingsGoal: 20000,
  expenseCategories: [
    { name: "Housing", amount: 12000 },
    { name: "Food", amount: 8000 },
    { name: "Transport", amount: 5000 },
    { name: "Entertainment", amount: 4000 },
    { name: "Shopping", amount: 3450 }
  ],
  monthlyTransactions: [
    { month: "Jan", income: 42000, expenses: 30000 },
    { month: "Feb", income: 44000, expenses: 31000 },
    { month: "Mar", income: 43000, expenses: 32000 },
    { month: "Apr", income: 45000, expenses: 32450 }
  ]
};

// Colors for charts
const COLORS = [
  "hsl(210, 98%, 48%)", // primary
  "hsl(0, 84%, 60%)", // destructive
  "hsl(142, 76%, 36%)", // success
  "hsl(38, 92%, 50%)", // warning
  "hsl(215, 13%, 47%)", // muted-foreground
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  const [financialData, setFinancialData] = useState(mockFinancialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem("flexifi_user");
    if (!userData) {
      navigate("/signin");
    } else {
      setUser(JSON.parse(userData));
      fetchFinancialData();
    }
  }, [navigate]);

  // Fetch financial data from backend
  const fetchFinancialData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel
      const [accountsData, budgetsData, transactionsData, savingsGoalsData] = await Promise.all([
        api.account.getAccounts(),
        api.budget.getBudgets(),
        api.transaction.getTransactions(),
        api.savingsGoal.getSavingsGoals()
      ]);

      setAccounts(accountsData);
      setBudgets(budgetsData);
      setTransactions(transactionsData);
      setSavingsGoals(savingsGoalsData);

      // Calculate financial data from real data
      // Income includes positive transactions; if no transactions present yet, seed from accounts current balance
      let totalIncome = transactionsData
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      if (totalIncome === 0 && accountsData && accountsData.length > 0) {
        // Use the first account's balance as starting income snapshot
        totalIncome = accountsData.reduce((sum: number, a: any) => sum + (a.current_balance || 0), 0);
      }
      
      const totalExpenses = Math.abs(transactionsData
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0));
      
      // Use the most recently created/active budget instead of summing or the first item
      let currentBudget = 0;
      if (budgetsData && budgetsData.length > 0) {
        const sortedByCreated = [...budgetsData].sort((a: any, b: any) => {
          const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bd - ad; // newest first
        });
        currentBudget = sortedByCreated[0]?.monthly_budget || 0;
      }
      const totalSavings = savingsGoalsData
        .reduce((sum, goal) => sum + goal.current_amount, 0);
      const totalSavingsGoal = savingsGoalsData
        .reduce((sum, goal) => sum + goal.target_amount, 0);

      // Calculate expense categories
      const expenseCategories = transactionsData
        .filter(t => t.amount < 0)
        .reduce((acc, t) => {
          const category = t.category;
          if (!acc[category]) {
            acc[category] = 0;
          }
          acc[category] += Math.abs(t.amount);
          return acc;
        }, {} as Record<string, number>);

      const expenseCategoriesArray = Object.entries(expenseCategories)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount);

      setFinancialData({
        income: totalIncome,
        expenses: totalExpenses,
        budget: currentBudget,
        savings: totalSavings,
        savingsGoal: totalSavingsGoal || 20000, // Default goal if none set
        expenseCategories: expenseCategoriesArray,
        monthlyTransactions: [] // Could be calculated from transactions by month
      });

    } catch (error) {
      console.error("Error fetching financial data:", error);
      toast({
        title: "Error",
        description: "Failed to load financial data. Using demo data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBudgetSet = () => {
    // Refresh financial data after budget is set
    fetchFinancialData();
    // Generate budget analysis
    generateBudgetAnalysis();
  };

  const generateBudgetAnalysis = async () => {
    try {
      // Generate AI analysis for budget
      const analysis = await api.aiAnalysis.generateAnalysis({
        analysis_type: 'budget'
      });
      
      if (analysis) {
        toast({
          title: "Budget Analysis Generated",
          description: "Your budget analysis has been updated with new insights.",
        });
      }
    } catch (error: any) {
      console.error('Error generating budget analysis:', error);
      // Don't show error toast for AI analysis as it might not be configured
    }
  };

  // Calculate budget progress
  const budgetProgress = Math.min(Math.round((financialData.expenses / financialData.budget) * 100), 100);
  
  // Calculate savings progress (kept for future use), but we will show budget progress in the tracker
  const savingsProgress = Math.round((financialData.savings / Math.max(financialData.savingsGoal || 1, 1)) * 100);

  // Warn user when budget usage crosses 90%
  useEffect(() => {
    if (!isNaN(budgetProgress) && budgetProgress >= 90) {
      toast({
        title: "Budget Warning",
        description: `You've used ${budgetProgress}% of your budget. Consider reducing spending.`,
        variant: "destructive",
      });
      // Browser notification (if permitted)
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Budget Warning', {
            body: `You've used ${budgetProgress}% of your budget.`,
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
              new Notification('Budget Warning', {
                body: `You've used ${budgetProgress}% of your budget.`,
              });
            }
          });
        }
      }
    }
  }, [budgetProgress, toast]);

  // Prepare data for Income vs Expenses donut chart
  const incomeVsExpensesData = [
    { name: "Income", value: financialData.income },
    { name: "Expenses", value: financialData.expenses }
  ];

  // Sort expense categories by amount (descending) and take top 5
  const topExpenseCategories = [...financialData.expenseCategories]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient text-white shadow-header">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/profile")}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Financial Dashboard</h1>
                <p className="text-white/80">Your financial overview at a glance</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Summary Cards */}
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="finance-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Income</p>
                    <h3 className="text-2xl font-bold text-foreground">₹{financialData.income.toLocaleString()}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowUp className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
              
              <div className="finance-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                    <h3 className="text-2xl font-bold text-foreground">₹{financialData.expenses.toLocaleString()}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <ArrowDown className="w-5 h-5 text-destructive" />
                  </div>
                </div>
              </div>
              
              <div className="finance-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Budget</p>
                    <h3 className="text-2xl font-bold text-foreground">₹{financialData.budget.toLocaleString()}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-warning" />
                  </div>
                </div>
              </div>
              
              <div className="finance-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Savings</p>
                    <h3 className="text-2xl font-bold text-foreground">₹{financialData.savings.toLocaleString()}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <PiggyBank className="w-5 h-5 text-success" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Income vs Expenses Chart */}
              <section className="finance-card">
                <h2 className="text-lg font-semibold mb-4">Income vs Expenses</h2>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      income: { color: COLORS[2] },
                      expenses: { color: COLORS[1] },
                    }}
                  >
                    <PieChart>
                      <Pie
                        data={incomeVsExpensesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                      >
                        {incomeVsExpensesData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? COLORS[2] : COLORS[1]} 
                          />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="font-medium">{data.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  ₹{data.value.toLocaleString()}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ChartContainer>
                </div>
              </section>

              {/* Top 5 Expense Categories */}
              <section className="finance-card">
                <h2 className="text-lg font-semibold mb-4">Top 5 Expense Categories</h2>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      expenses: { color: COLORS[0] },
                    }}
                  >
                    <BarChart data={topExpenseCategories}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="font-medium">{data.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  ₹{data.amount.toLocaleString()}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="amount" fill={COLORS[0]} />
                    </BarChart>
                  </ChartContainer>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Monthly Budget Progress */}
              <section className="finance-card">
                <h2 className="text-lg font-semibold mb-4">Monthly Budget Progress</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Spent: ₹{financialData.expenses.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">Budget: ₹{financialData.budget.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={budgetProgress} 
                      className="h-2"
                      indicatorClassName={cn(
                        budgetProgress > 90 ? "bg-destructive" : 
                        budgetProgress > 75 ? "bg-warning" : 
                        "bg-primary"
                      )}
                    />
                    <div className="mt-2 text-sm text-right">
                      <span className={cn(
                        "font-medium",
                        budgetProgress > 90 ? "text-destructive" : 
                        budgetProgress > 75 ? "text-warning" : 
                        "text-primary"
                      )}>
                        {budgetProgress}% used
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">
                      {budgetProgress > 90 
                        ? "You've almost reached your budget limit!" 
                        : budgetProgress > 75 
                        ? "You're approaching your budget limit." 
                        : "You're managing your budget well."}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate("/transactions")}
                    >
                      View Transactions
                    </Button>
                  </div>
                </div>
              </section>

              {/* Budget Usage Tracker (repurposed from Savings Goal) */}
              <section className="finance-card">
                <h2 className="text-lg font-semibold mb-4">Budget Usage Tracker</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Spent: ₹{financialData.expenses.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">Budget: ₹{financialData.budget.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={budgetProgress} 
                      className="h-2"
                      indicatorClassName={cn(
                        budgetProgress > 90 ? "bg-destructive" : 
                        budgetProgress > 75 ? "bg-warning" : 
                        "bg-success"
                      )}
                    />
                    <div className="mt-2 text-sm text-right">
                      <span className={cn(
                        "font-medium",
                        budgetProgress > 90 ? "text-destructive" : 
                        budgetProgress > 75 ? "text-warning" : 
                        "text-success"
                      )}>{budgetProgress}% used</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">
                      {budgetProgress > 100 
                        ? "You've exceeded your budget! Please adjust spending immediately." 
                        : budgetProgress > 90 
                        ? "Warning: You've used over 90% of your budget." 
                        : budgetProgress > 75 
                        ? "You're approaching your budget limit." 
                        : "You're managing your budget well."}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setIsBudgetModalOpen(true)}
                    >
                      Adjust Budget
                    </Button>
                  </div>
                </div>
              </section>

              {/* Budget Analysis */}
              {financialData.budget > 0 && (
                <section className="finance-card">
                  <h2 className="text-lg font-semibold mb-4">Budget Analysis</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">₹{financialData.budget.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Budget Set</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-destructive">₹{financialData.expenses.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Spent</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Budget Progress</span>
                        <span className="font-medium">{budgetProgress}%</span>
                      </div>
                      <Progress 
                        value={budgetProgress} 
                        className="h-2"
                        indicatorClassName={budgetProgress > 80 ? "bg-destructive" : budgetProgress > 60 ? "bg-warning" : "bg-success"}
                      />
                    </div>
                    
                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Remaining Budget</span>
                        <span className={`font-medium ${(financialData.budget - financialData.expenses) < 0 ? 'text-destructive' : 'text-success'}`}>
                          ₹{(financialData.budget - financialData.expenses).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {budgetProgress > 100 
                          ? "⚠️ You've exceeded your budget by ₹" + (financialData.expenses - financialData.budget).toLocaleString()
                          : budgetProgress > 80 
                          ? "⚠️ You're close to your budget limit"
                          : budgetProgress > 60 
                          ? "💡 You're on track with your budget"
                          : "✅ You're well within your budget"}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Recent Activity Preview */}
              <section className="finance-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Recent Activity</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate("/transactions")}
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {[
                    { type: "Payment", description: "Grocery Store", amount: "-₹850", time: "2 hours ago" },
                    { type: "Transfer", description: "From Savings", amount: "+₹2,000", time: "1 day ago" },
                    { type: "Payment", description: "Electricity Bill", amount: "-₹1,200", time: "2 days ago" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <div className="font-medium text-foreground">{activity.description}</div>
                        <div className="text-xs text-muted-foreground">{activity.type} • {activity.time}</div>
                      </div>
                      <div className={`font-semibold ${activity.amount.startsWith('+') ? 'text-success' : 'text-foreground'}`}>
                        {activity.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Budget Modal */}
      <BudgetModal 
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onBudgetSet={handleBudgetSet}
      />
    </div>
  );
};

export default Dashboard;