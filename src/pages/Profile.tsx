import { useState, useEffect } from "react";
import { User, Settings, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("flexifi_user");
    if (!userData) {
      navigate("/signin");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const menuItems = [
    {
      icon: "📊",
      title: "Transaction History",
      description: "View all your transactions",
      path: "/transactions"
    },
    {
      icon: "📈",
      title: "Analysis",
      description: "Financial insights & predictions",
      path: "/analysis"
    },
    {
      icon: "💳",
      title: "Pay",
      description: "Make payments & transfers",
      path: "/pay"
    },
    {
      icon: "🎫",
      title: "My Vouchers",
      description: "Manage your vouchers",
      path: "/vouchers"
    },
    {
      icon: "💰",
      title: "Wallet",
      description: "Digital wallet & balance",
      path: "/wallet"
    },
    {
      icon: "💵",
      title: "Cash",
      description: "Track cash expenses",
      path: "/cash"
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem("flexifi_user");
    localStorage.removeItem("flexifi_bank");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-gradient text-white shadow-header">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Welcome, {user.name?.split(' ')[0] || 'User'}</h1>
                <p className="text-white/80">Let's manage your finances smartly</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Quick Stats */}
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="finance-card text-center">
                <div className="text-2xl font-bold text-primary mb-1">₹12,450</div>
                <div className="text-sm text-muted-foreground">This Month's Spending</div>
              </div>
              <div className="finance-card text-center">
                <div className="text-2xl font-bold text-success mb-1">₹3,200</div>
                <div className="text-sm text-muted-foreground">Money Saved</div>
              </div>
              <div className="finance-card text-center">
                <div className="text-2xl font-bold text-warning mb-1">₹8,750</div>
                <div className="text-sm text-muted-foreground">Budget Remaining</div>
              </div>
            </div>
          </section>

          {/* Menu Items */}
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-6">Manage Your Finances</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => navigate(item.path)}
                  className="finance-card cursor-pointer hover:shadow-card hover:border-primary/20 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{item.icon}</div>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-foreground mb-6">Recent Activity</h2>
            <div className="finance-card">
              <div className="space-y-4">
                {[
                  { type: "Payment", description: "Grocery Store", amount: "-₹850", time: "2 hours ago" },
                  { type: "Transfer", description: "From Savings", amount: "+₹2,000", time: "1 day ago" },
                  { type: "Payment", description: "Electricity Bill", amount: "-₹1,200", time: "2 days ago" },
                  { type: "Cashback", description: "UPI Reward", amount: "+₹25", time: "3 days ago" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <div className="font-medium text-foreground">{activity.description}</div>
                      <div className="text-sm text-muted-foreground">{activity.type} • {activity.time}</div>
                    </div>
                    <div className={`font-semibold ${activity.amount.startsWith('+') ? 'text-success' : 'text-foreground'}`}>
                      {activity.amount}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  className="btn-secondary w-full"
                  onClick={() => navigate("/transactions")}
                >
                  View All Transactions
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;