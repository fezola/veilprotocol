import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./components/WalletProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import About from "./pages/About";
import WhyPrivacy from "./pages/WhyPrivacy";
import Demo from "./pages/Demo";
import Login from "./pages/Login";
import WalletCreated from "./pages/WalletCreated";
import Dashboard from "./pages/Dashboard";
import RecoverySetup from "./pages/RecoverySetup";
import RecoveryExecute from "./pages/RecoveryExecute";
import Guarantees from "./pages/Guarantees";
import Docs from "./pages/Docs";
import ShadowPayExplained from "./pages/ShadowPayExplained";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/why-privacy" element={<WhyPrivacy />} />
              <Route path="/demo" element={<Demo />} />
              <Route
                path="/login"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallet-created"
                element={
                  <ProtectedRoute requireAuth={true}>
                    <WalletCreated />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireAuth={true}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recovery-setup"
                element={
                  <ProtectedRoute requireAuth={true}>
                    <RecoverySetup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recovery-execute"
                element={
                  <ProtectedRoute requireAuth={true}>
                    <RecoveryExecute />
                  </ProtectedRoute>
                }
              />
              <Route path="/guarantees" element={<Guarantees />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/shadowpay-explained" element={<ShadowPayExplained />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
