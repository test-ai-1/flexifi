import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "@/hooks/use-toast";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Step 2: Bank Details
    bankAccountNumber: "",
    ifscCode: "",
    mobileNumber: "",
    aadharNumber: "",
    initialAmount: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankAccountNumber.trim()) {
      newErrors.bankAccountNumber = "Bank account number is required";
    } else if (formData.bankAccountNumber.length < 9) {
      newErrors.bankAccountNumber = "Please enter a valid account number";
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = "IFSC code is required";
    } else if (formData.ifscCode.length !== 11) {
      newErrors.ifscCode = "IFSC code must be 11 characters";
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
    }

    if (!formData.aadharNumber.trim()) {
      newErrors.aadharNumber = "Aadhar number is required";
    } else if (!/^\d{12}$/.test(formData.aadharNumber)) {
      newErrors.aadharNumber = "Please enter a valid 12-digit Aadhar number";
    }

    if (!formData.initialAmount.trim()) {
      newErrors.initialAmount = "Initial amount is required";
    } else if (parseFloat(formData.initialAmount) < 0) {
      newErrors.initialAmount = "Initial amount cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      try {
        setLoading(true);
        
        // Step 1: Create user account
        const userData = await api.auth.register({
        name: formData.name,
        email: formData.email,
          password: formData.password
        });

        if (userData) {
          // Step 2: Login to get token
          const loginResponse = await api.auth.login({
            username: formData.email,
            password: formData.password
          });

          if (loginResponse) {
            // Step 3: Get user profile with token
            const userProfile = await api.auth.getCurrentUser();
            
            if (userProfile) {
              // Step 4: Create bank account
              const accountResponse = await api.account.createAccount({
                account_number: formData.bankAccountNumber,
                current_balance: parseFloat(formData.initialAmount)
              });

              if (accountResponse) {
                // Store complete user details
                const userDataWithBank = {
                  ...userProfile,
                  access_token: loginResponse.access_token,
                  token_type: loginResponse.token_type,
                  bankDetails: {
                    accountNumber: formData.bankAccountNumber,
                    ifscCode: formData.ifscCode,
                    mobileNumber: formData.mobileNumber,
                    aadharNumber: formData.aadharNumber
                  }
                };
                
                localStorage.setItem('flexifi_user', JSON.stringify(userDataWithBank));
                
                toast({
                  title: "Account Created Successfully!",
                  description: "Welcome to FlexiFi! Your account is ready.",
                });
                
                navigate("/dashboard");
              }
            }
          }
        }
      } catch (error: any) {
        toast({
          title: "Registration Failed",
          description: error.message || "Failed to create account. Please try again.",
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
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
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
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {currentStep === 1 ? 'Create Your Account' : 'Bank Details'}
              </h1>
              <p className="text-muted-foreground">
                {currentStep === 1 
                  ? 'Join thousands who are making smarter financial decisions'
                  : 'Add your bank account information to get started'
                }
              </p>
              
              {/* Progress Indicator */}
              <div className="flex justify-center space-x-2 mt-4">
                <div className={`w-3 h-3 rounded-full ${currentStep === 1 ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className={`w-3 h-3 rounded-full ${currentStep === 2 ? 'bg-primary' : 'bg-muted'}`}></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 ? (
                <>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`input-field ${errors.name ? 'border-destructive' : ''}`}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`input-field ${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password (min 6 characters)"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`input-field pr-12 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`input-field pr-12 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

                  <Button type="button" onClick={handleNext} className="btn-primary w-full">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber" className="text-sm font-medium text-foreground">
                      Bank Account Number
                    </Label>
                    <Input
                      id="bankAccountNumber"
                      type="text"
                      placeholder="Enter your bank account number"
                      value={formData.bankAccountNumber}
                      onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)}
                      className={`input-field ${errors.bankAccountNumber ? 'border-destructive' : ''}`}
                    />
                    {errors.bankAccountNumber && (
                      <p className="text-sm text-destructive">{errors.bankAccountNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ifscCode" className="text-sm font-medium text-foreground">
                      IFSC Code
                    </Label>
                    <Input
                      id="ifscCode"
                      type="text"
                      placeholder="Enter IFSC code (e.g., SBIN0001234)"
                      value={formData.ifscCode}
                      onChange={(e) => handleInputChange("ifscCode", e.target.value.toUpperCase())}
                      className={`input-field ${errors.ifscCode ? 'border-destructive' : ''}`}
                      maxLength={11}
                    />
                    {errors.ifscCode && (
                      <p className="text-sm text-destructive">{errors.ifscCode}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber" className="text-sm font-medium text-foreground">
                      Mobile Number
                    </Label>
                    <Input
                      id="mobileNumber"
                      type="tel"
                      placeholder="Enter your 10-digit mobile number"
                      value={formData.mobileNumber}
                      onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                      className={`input-field ${errors.mobileNumber ? 'border-destructive' : ''}`}
                      maxLength={10}
                    />
                    {errors.mobileNumber && (
                      <p className="text-sm text-destructive">{errors.mobileNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aadharNumber" className="text-sm font-medium text-foreground">
                      Aadhar Number
                    </Label>
                    <Input
                      id="aadharNumber"
                      type="text"
                      placeholder="Enter your 12-digit Aadhar number"
                      value={formData.aadharNumber}
                      onChange={(e) => handleInputChange("aadharNumber", e.target.value)}
                      className={`input-field ${errors.aadharNumber ? 'border-destructive' : ''}`}
                      maxLength={12}
                    />
                    {errors.aadharNumber && (
                      <p className="text-sm text-destructive">{errors.aadharNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="initialAmount" className="text-sm font-medium text-foreground">
                      Initial Amount (₹)
                    </Label>
                    <Input
                      id="initialAmount"
                      type="number"
                      placeholder="Enter initial amount"
                      value={formData.initialAmount}
                      onChange={(e) => handleInputChange("initialAmount", e.target.value)}
                      className={`input-field ${errors.initialAmount ? 'border-destructive' : ''}`}
                      min="0"
                      step="0.01"
                    />
                    {errors.initialAmount && (
                      <p className="text-sm text-destructive">{errors.initialAmount}</p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button type="button" onClick={handleBack} variant="outline" className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? "Creating Account..." : "Create Account"}
              </Button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/signin")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign In
                </button>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUp;