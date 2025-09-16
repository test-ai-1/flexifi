import { useState } from "react";
import { ArrowLeft, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api from "../lib/api";

const Cash = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    spentOn: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.amount) newErrors.amount = "Amount is required";
    else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) newErrors.amount = "Enter a valid amount";
    if (!formData.spentOn.trim()) newErrors.spentOn = "Please enter what you spent on";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      // Cash spend is recorded as a negative transaction
      await api.transaction.createTransaction({
        amount: -Math.abs(Number(formData.amount)),
        category: formData.spentOn.trim(),
        description: "Cash expense",
        date: new Date().toISOString(),
        payment_method: "Cash",
      });

      toast({
        title: "Expense Added",
        description: `Recorded ₹${Number(formData.amount).toLocaleString()} for ${formData.spentOn}.`,
      });

      // Reset and offer to view dashboard
      setFormData({ amount: "", spentOn: "" });
    } catch (error: any) {
      toast({ title: "Failed", description: error.message || "Could not add cash expense", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold text-foreground">Cash</span>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="container mx-auto max-w-md px-4">
          <div className="finance-card animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Add Cash Spend</h1>
              <p className="text-muted-foreground">Enter cash spending to keep your budget up to date.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="e.g. 2000"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className={`input-field ${errors.amount ? 'border-destructive' : ''}`}
                  min="1"
                  step="0.01"
                />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="spentOn">Spent On</Label>
                <Input
                  id="spentOn"
                  type="text"
                  placeholder="e.g. Clothes"
                  value={formData.spentOn}
                  onChange={(e) => handleInputChange("spentOn", e.target.value)}
                  className={`input-field ${errors.spentOn ? 'border-destructive' : ''}`}
                />
                {errors.spentOn && <p className="text-sm text-destructive">{errors.spentOn}</p>}
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="btn-primary flex-1" disabled={loading}>
                  {loading ? "Adding..." : "Add Cash Spend"}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cash;


