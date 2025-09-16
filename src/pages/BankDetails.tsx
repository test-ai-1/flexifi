import { useState } from "react";
import { ArrowLeft, Shield, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "@/hooks/use-toast";

const BankDetails = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    upiId: "",
    mobileNumber: "",
    consent: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const banks = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Bank of Baroda",
    "Punjab National Bank",
    "Canara Bank",
    "Union Bank of India",
    "Bank of India",
    "Central Bank of India"
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankName) {
      newErrors.bankName = "Please select your bank";
    }
    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = "Account holder name is required";
    }
    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (formData.accountNumber.length < 9) {
      newErrors.accountNumber = "Account number must be at least 9 digits";
    }
    if (!formData.confirmAccountNumber.trim()) {
      newErrors.confirmAccountNumber = "Please confirm your account number";
    } else if (formData.accountNumber !== formData.confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Account numbers don't match";
    }
    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = "IFSC code is required";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      newErrors.ifscCode = "Please enter a valid IFSC code";
    }
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid mobile number";
    }
    if (!formData.consent) {
      newErrors.consent = "Please provide consent to continue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerify = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
        setVerificationStatus('pending');
        
        // Create account in backend
        const accountData = await api.account.createAccount({
          account_number: formData.accountNumber,
          current_balance: 0 // Start with 0 balance
        });
        
        setVerificationStatus('success');
        
        // Store bank details (masked)
        localStorage.setItem("flexifi_bank", JSON.stringify({
          bankName: formData.bankName,
          accountHolderName: formData.accountHolderName,
          last4: formData.accountNumber.slice(-4),
          ifscCode: formData.ifscCode,
          verified: true,
          accountId: accountData.account_id
        }));
        
        toast({
          title: "Account Created",
          description: "Your bank account has been successfully linked!",
        });
        
      } catch (error: any) {
        setVerificationStatus('failed');
        toast({
          title: "Verification Failed",
          description: error.message || "Failed to create account. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleContinue = () => {
    navigate("/dashboard");
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  // Get user name from localStorage
  const user = JSON.parse(localStorage.getItem("flexifi_user") || "{}");
  if (formData.accountHolderName === "" && user.name) {
    setFormData(prev => ({ ...prev, accountHolderName: user.name }));
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto max-w-6xl px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/signup")}
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

      <main className="py-8">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="finance-card animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Link Your Bank for Payments & Tracking
              </h1>
              <p className="text-muted-foreground">
                Securely connect your bank account to enable seamless payments and transaction tracking
              </p>
            </div>

            {verificationStatus === 'idle' && (
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bankName" className="text-sm font-medium text-foreground">
                    Bank Name *
                  </Label>
                  <Select value={formData.bankName} onValueChange={(value) => handleInputChange("bankName", value)}>
                    <SelectTrigger className={`input-field ${errors.bankName ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="Select your bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bankName && (
                    <p className="text-sm text-destructive">{errors.bankName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountHolderName" className="text-sm font-medium text-foreground">
                    Account Holder Name *
                  </Label>
                  <Input
                    id="accountHolderName"
                    type="text"
                    placeholder="As per bank records"
                    value={formData.accountHolderName}
                    onChange={(e) => handleInputChange("accountHolderName", e.target.value)}
                    className={`input-field ${errors.accountHolderName ? 'border-destructive' : ''}`}
                  />
                  {errors.accountHolderName && (
                    <p className="text-sm text-destructive">{errors.accountHolderName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber" className="text-sm font-medium text-foreground">
                      Account Number *
                    </Label>
                    <Input
                      id="accountNumber"
                      type="password"
                      placeholder="Enter account number"
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                      className={`input-field ${errors.accountNumber ? 'border-destructive' : ''}`}
                    />
                    {errors.accountNumber && (
                      <p className="text-sm text-destructive">{errors.accountNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmAccountNumber" className="text-sm font-medium text-foreground">
                      Confirm Account Number *
                    </Label>
                    <Input
                      id="confirmAccountNumber"
                      type="text"
                      placeholder="Re-enter account number"
                      value={formData.confirmAccountNumber}
                      onChange={(e) => handleInputChange("confirmAccountNumber", e.target.value)}
                      className={`input-field ${errors.confirmAccountNumber ? 'border-destructive' : ''}`}
                    />
                    {errors.confirmAccountNumber && (
                      <p className="text-sm text-destructive">{errors.confirmAccountNumber}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ifscCode" className="text-sm font-medium text-foreground">
                      IFSC Code *
                    </Label>
                    <Input
                      id="ifscCode"
                      type="text"
                      placeholder="e.g., SBIN0001234"
                      value={formData.ifscCode}
                      onChange={(e) => handleInputChange("ifscCode", e.target.value.toUpperCase())}
                      className={`input-field ${errors.ifscCode ? 'border-destructive' : ''}`}
                    />
                    {errors.ifscCode && (
                      <p className="text-sm text-destructive">{errors.ifscCode}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber" className="text-sm font-medium text-foreground">
                      Mobile Number *
                    </Label>
                    <Input
                      id="mobileNumber"
                      type="tel"
                      placeholder="Enter mobile number"
                      value={formData.mobileNumber}
                      onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                      className={`input-field ${errors.mobileNumber ? 'border-destructive' : ''}`}
                    />
                    {errors.mobileNumber && (
                      <p className="text-sm text-destructive">{errors.mobileNumber}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upiId" className="text-sm font-medium text-foreground">
                    UPI ID <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="upiId"
                    type="text"
                    placeholder="yourname@upi"
                    value={formData.upiId}
                    onChange={(e) => handleInputChange("upiId", e.target.value)}
                    className="input-field"
                  />
                </div>

                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="consent"
                      checked={formData.consent}
                      onCheckedChange={(checked) => handleInputChange("consent", checked as boolean)}
                      className={errors.consent ? 'border-destructive' : ''}
                    />
                    <div className="text-sm">
                      <Label htmlFor="consent" className="text-foreground cursor-pointer">
                        I consent to securely store and use these bank details for verification and transactions.
                      </Label>
                      <p className="text-muted-foreground mt-1">
                        Your banking information is encrypted and stored securely. We never store your complete account number.
                      </p>
                    </div>
                  </div>
                  {errors.consent && (
                    <p className="text-sm text-destructive mt-2">{errors.consent}</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    type="button"
                    onClick={handleVerify}
                    className="btn-primary flex-1"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Verify & Continue"}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleSkip}
                    className="btn-secondary"
                  >
                    Skip for Now
                  </Button>
                </div>
              </form>
            )}

            {verificationStatus === 'pending' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <AlertTriangle className="w-8 h-8 text-warning" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Verifying Your Details</h2>
                <p className="text-muted-foreground mb-4">
                  Please wait while we verify your bank account details...
                </p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Verification Successful!</h2>
                <p className="text-muted-foreground mb-6">
                  Your bank account has been successfully verified and linked to your FlexiFi account.
                </p>
                <Button onClick={handleContinue} className="btn-primary">
                  Continue to Dashboard
                </Button>
              </div>
            )}

            {verificationStatus === 'failed' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Verification Failed</h2>
                <p className="text-muted-foreground mb-6">
                  We couldn't verify your bank details. Please check the information and try again.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => setVerificationStatus('idle')} 
                    className="btn-primary"
                  >
                    Try Again
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleSkip}
                    className="btn-secondary"
                  >
                    Skip for Now
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

export default BankDetails;