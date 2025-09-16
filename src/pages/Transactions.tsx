import { useState, useEffect } from "react";
import { ArrowLeft, Search, Filter, Download, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "@/hooks/use-toast";

const Transactions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch transactions from backend
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await api.transaction.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transactions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || 
                       (filterType === "payment" && transaction.amount < 0) ||
                       (filterType === "credit" && transaction.amount > 0);
    return matchesSearch && matchesType;
  });

  const getStatusColor = () => {
    return "text-success"; // All transactions are completed
  };

  const getAmountColor = (amount: number) => {
    return amount > 0 ? "text-success" : "text-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient text-white shadow-header">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/profile")}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold">Transaction History</h1>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={() => navigate("/add-transaction")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-6">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Filters */}
          <div className="finance-card mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <div className="flex gap-3">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="input-field w-40">
                    <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="payment">Payments</SelectItem>
                    <SelectItem value="transfer">Transfers</SelectItem>
                    <SelectItem value="credit">Credits</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="input-field w-40">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading transactions...</p>
              </div>
            ) : filteredTransactions.map((transaction) => (
              <div key={transaction.transaction_id} className="finance-card hover:shadow-card transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.amount > 0 ? 'bg-success/10' : 'bg-muted'
                    }`}>
                      <span className="text-lg">
                        {transaction.category === "Food" ? "🍽️" :
                         transaction.category === "Transport" ? "🚗" :
                         transaction.category === "Shopping" ? "🛍️" :
                         transaction.category === "Transfer" ? "💸" :
                         transaction.category === "Salary" ? "💼" :
                         transaction.category === "Rewards" ? "🎁" : "💳"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{transaction.description}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()} bg-current/10`}>
                          completed
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>Category: {transaction.category}</span>
                        <span>•</span>
                        <span>{transaction.payment_method}</span>
                        <span>•</span>
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getAmountColor(transaction.amount)}`}>
                      {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">ID: {transaction.transaction_id}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="finance-card text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No transactions found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}

          {/* Load More */}
          {filteredTransactions.length > 0 && (
            <div className="text-center mt-8">
              <Button variant="outline" className="btn-secondary">
                Load More Transactions
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Transactions;