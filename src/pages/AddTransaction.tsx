import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "@/hooks/use-toast";

const AddTransaction = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    payment_method: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    "Food", "Transport", "Shopping", "Entertainment", 
    "Bills", "Healthcare", "Education", "Salary", 
    "Investment", "Transfer", "Other"
  ];

  const paymentMethods = [
    "Cash", "Credit Card", "Debit Card", "UPI", 
    "Bank Transfer", "Wallet", "Cheque", "Other"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) === 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.payment_method) {
      newErrors.payment_method = "Payment method is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        
        await api.transaction.createTransaction({
          amount: Number(formData.amount),
          category: formData.category,
          description: formData.description,
          payment_method: formData.payment_method,
          date: new Date(formData.date).toISOString()
        });
        
        toast({
          title: "Transaction Added",
          description: "Your transaction has been recorded successfully!",
        });
        
        navigate("/transactions");
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to add transaction. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
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
                onClick={() => navigate("/transactions")}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-bold">Add Transaction</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="finance-card animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Record New Transaction
              </h2>
              <p className="text-muted-foreground">
                Add a new income or expense to track your finances
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium text-foreground">
                  Amount *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount (use negative for expenses)"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className={`input-field ${errors.amount ? 'border-destructive' : ''}`}
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Use positive numbers for income, negative for expenses
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-foreground">
                  Category *
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className={`input-field ${errors.category ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-foreground">
                  Description *
                </Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Enter transaction description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className={`input-field ${errors.description ? 'border-destructive' : ''}`}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method" className="text-sm font-medium text-foreground">
                  Payment Method *
                </Label>
                <Select value={formData.payment_method} onValueChange={(value) => handleInputChange("payment_method", value)}>
                  <SelectTrigger className={`input-field ${errors.payment_method ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.payment_method && (
                  <p className="text-sm text-destructive">{errors.payment_method}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-foreground">
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className={`input-field ${errors.date ? 'border-destructive' : ''}`}
                />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  type="submit" 
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? "Adding Transaction..." : "Add Transaction"}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/transactions")}
                  className="btn-secondary"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddTransaction;
