import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBudgetSet: () => void;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, onBudgetSet }) => {
  const [budgetType, setBudgetType] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid budget amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Calculate budget based on type and set dates
      const budgetAmount = parseFloat(amount);
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (budgetType) {
        case 'weekly':
          startDate = new Date(now);
          endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
          break;
        case 'yearly':
          startDate = new Date(now.getFullYear(), 0, 1); // First day of current year
          endDate = new Date(now.getFullYear(), 11, 31); // Last day of current year
          break;
        default:
          startDate = now;
          endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days
      }

      // Create/replace budget in backend (simply create a new record; dashboard will pick latest)
      const budgetData = await api.budget.createBudget({
        monthly_budget: budgetAmount,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

      if (budgetData) {
        toast({
          title: "Budget Set Successfully!",
          description: `Your ${budgetType} budget of ₹${amount} has been set.`,
        });
        
        onBudgetSet(); // triggers dashboard refresh
        onClose();
        setAmount('');
      }
    } catch (error: any) {
      toast({
        title: "Error Setting Budget",
        description: error.message || "Failed to set budget. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBudgetDescription = () => {
    switch (budgetType) {
      case 'weekly':
        return 'Set your weekly spending limit';
      case 'monthly':
        return 'Set your monthly spending limit';
      case 'yearly':
        return 'Set your yearly spending limit';
      default:
        return 'Set your spending limit';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Your Budget</DialogTitle>
          <DialogDescription>
            {getBudgetDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="budgetType">Budget Period</Label>
            <Select value={budgetType} onValueChange={(value: 'weekly' | 'monthly' | 'yearly') => setBudgetType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select budget period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter budget amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Setting Budget..." : "Set Budget"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetModal;
