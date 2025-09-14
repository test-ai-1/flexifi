import { useState } from "react";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    // Mock password reset
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/signin")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold text-foreground">FlexiFi</span>
          </div>
        </div>
      </header>

      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] py-8">
        <div className="w-full max-w-md mx-4">
          <div className="finance-card animate-fade-in">
            {!isSubmitted ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">Forgot Password?</h1>
                  <p className="text-muted-foreground">
                    Enter your email address and we'll send you a link to reset your password
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      className={`input-field ${error ? 'border-destructive' : ''}`}
                    />
                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}
                  </div>

                  <Button type="submit" className="btn-primary w-full">
                    Send Reset Link
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Remember your password?{" "}
                    <button
                      onClick={() => navigate("/signin")}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h1>
                <p className="text-muted-foreground mb-6">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate("/signin")}
                    className="btn-primary w-full"
                  >
                    Back to Sign In
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                    className="btn-secondary w-full"
                  >
                    Try Different Email
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;