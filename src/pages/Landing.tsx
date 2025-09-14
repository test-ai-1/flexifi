import { useState } from "react";
import { ArrowRight, Shield, TrendingUp, Wallet, PieChart, Smartphone, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Predictive Analysis",
      description: "AI-powered insights to predict your spending patterns and optimize your budget"
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      title: "Smart Payments",
      description: "UPI, Wallet, USSD payments all in one secure platform"
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      title: "Budget Tracking",
      description: "Real-time expense tracking with detailed category breakdowns"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Bank-Level Security",
      description: "Your financial data is protected with enterprise-grade encryption"
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "₹50Cr+", label: "Transactions" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.8★", label: "User Rating" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold text-foreground">FlexiFi</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/signin")}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate("/signup")}
              className="btn-primary"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto max-w-6xl px-4 text-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Smarter Spending.<br />
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Smarter Saving.
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Take control of your finances with AI-powered budgeting, seamless payments, 
                and predictive insights that help you make better financial decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/signup")}
                  className="btn-primary text-lg px-8 py-4 group"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 surface-gradient">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Everything you need to manage your money
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From budgeting to payments, FlexiFi provides all the tools you need 
                to take control of your financial future.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className={`finance-card cursor-pointer transition-all duration-300 ${
                      activeFeature === index ? 'border-primary shadow-card' : 'hover:border-border/60'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${
                        activeFeature === index ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                      } transition-colors`}>
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="finance-card bg-gradient-surface p-8">
                  <div className="w-full h-64 bg-muted rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Smartphone className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-muted-foreground">Interactive Demo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 surface-gradient">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                  Why thousands choose FlexiFi
                </h2>
                <div className="space-y-4">
                  {[
                    "AI-powered predictive insights",
                    "Bank-level security & encryption",
                    "Multiple payment methods (UPI, Wallet, USSD)",
                    "Real-time expense tracking",
                    "Smart voucher management",
                    "Comprehensive financial analysis"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="finance-card">
                <div className="text-center p-8">
                  <Users className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-foreground mb-4">Join the Community</h3>
                  <p className="text-muted-foreground mb-6">
                    Connect with like-minded individuals on their financial journey
                  </p>
                  <Button className="btn-primary w-full">
                    Get Started Today
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <div className="finance-card bg-gradient-primary text-white">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Ready to transform your finances?
              </h2>
              <p className="text-lg mb-8 text-white/90">
                Join thousands who are already making smarter financial decisions with FlexiFi
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => navigate("/signup")}
                  className="bg-white text-primary hover:bg-gray-100 font-medium px-8 py-4"
                >
                  Start Free Today
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white/10 px-8 py-4"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-bold text-foreground">FlexiFi</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
            <div className="text-muted-foreground text-sm">
              © 2024 FlexiFi. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;