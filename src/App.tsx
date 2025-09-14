import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import BankDetails from "./pages/BankDetails";
import Profile from "./pages/Profile";
import Transactions from "./pages/Transactions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/bank-details" element={<BankDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analysis" element={<div className="p-8 text-center">Analysis Page - Coming Soon!</div>} />
          <Route path="/pay" element={<div className="p-8 text-center">Pay Page - Coming Soon!</div>} />
          <Route path="/vouchers" element={<div className="p-8 text-center">Vouchers Page - Coming Soon!</div>} />
          <Route path="/wallet" element={<div className="p-8 text-center">Wallet Page - Coming Soon!</div>} />
          <Route path="/cash" element={<div className="p-8 text-center">Cash Page - Coming Soon!</div>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
