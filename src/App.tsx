import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import WhyPrivacy from "./pages/WhyPrivacy";
import Login from "./pages/Login";
import WalletCreated from "./pages/WalletCreated";
import Dashboard from "./pages/Dashboard";
import RecoverySetup from "./pages/RecoverySetup";
import RecoveryExecute from "./pages/RecoveryExecute";
import Guarantees from "./pages/Guarantees";
import Docs from "./pages/Docs";
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
          <Route path="/why-privacy" element={<WhyPrivacy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/wallet-created" element={<WalletCreated />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/recovery-setup" element={<RecoverySetup />} />
          <Route path="/recovery-execute" element={<RecoveryExecute />} />
          <Route path="/guarantees" element={<Guarantees />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
