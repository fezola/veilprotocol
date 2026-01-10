import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";

type AuthMethod = "passkey" | "email" | null;
type AuthStep = "method" | "email-input" | "verifying" | "creating";

export default function Login() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<AuthMethod>(null);
  const [step, setStep] = useState<AuthStep>("method");
  const [email, setEmail] = useState("");

  const handlePasskeyAuth = async () => {
    setMethod("passkey");
    setStep("verifying");
    
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStep("creating");
    
    // Simulate wallet creation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    navigate("/wallet-created");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStep("verifying");
    
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStep("creating");
    
    // Simulate wallet creation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    navigate("/wallet-created");
  };

  return (
    <PageLayout hideFooter>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="glass-panel rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon icon="ph:shield-check-fill" className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {step === "method" && "Private Authentication"}
                {step === "email-input" && "Enter Your Email"}
                {step === "verifying" && "Verifying Identity"}
                {step === "creating" && "Creating Your Wallet"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {step === "method" && "No passwords stored. No identity revealed."}
                {step === "email-input" && "We'll derive your wallet from a zero-knowledge proof of your email."}
                {step === "verifying" && "Generating zero-knowledge proof..."}
                {step === "creating" && "Deriving your private wallet address..."}
              </p>
            </div>

            {/* Method Selection */}
            {step === "method" && (
              <div className="space-y-4">
                <button
                  onClick={handlePasskeyAuth}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon icon="ph:fingerprint" className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Passkey Authentication</p>
                    <p className="text-sm text-muted-foreground">Use biometrics or security key</p>
                  </div>
                  <Icon icon="ph:arrow-right" className="w-5 h-5 text-muted-foreground ml-auto" />
                </button>

                <button
                  onClick={() => {
                    setMethod("email");
                    setStep("email-input");
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon icon="ph:envelope-simple" className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Email-Based Login</p>
                    <p className="text-sm text-muted-foreground">zkLogin with your email</p>
                  </div>
                  <Icon icon="ph:arrow-right" className="w-5 h-5 text-muted-foreground ml-auto" />
                </button>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <Icon icon="ph:info" className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      <span className="text-primary font-medium">Privacy Note:</span> Your authentication method is never stored. 
                      We only store a cryptographic commitment that cannot reveal your identity.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Input */}
            {step === "email-input" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    required
                  />
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/10">
                  <Icon icon="ph:shield-check" className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Your email is used to generate a zero-knowledge proof. We never see or store your email address.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  Continue
                  <Icon icon="ph:arrow-right" className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("method");
                    setMethod(null);
                  }}
                  className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  Back to options
                </button>
              </form>
            )}

            {/* Loading States */}
            {(step === "verifying" || step === "creating") && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-6" />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 justify-center">
                    <Icon 
                      icon={step === "verifying" ? "ph:circle-notch" : "ph:check-circle"} 
                      className={`w-5 h-5 ${step === "verifying" ? "text-primary animate-spin" : "text-success"}`} 
                    />
                    <span className={step === "verifying" ? "text-foreground" : "text-muted-foreground"}>
                      Generating ZK proof
                    </span>
                  </div>
                  <div className="flex items-center gap-3 justify-center">
                    <Icon 
                      icon={step === "creating" ? "ph:circle-notch" : "ph:circle-dashed"} 
                      className={`w-5 h-5 ${step === "creating" ? "text-primary animate-spin" : "text-muted-foreground"}`} 
                    />
                    <span className={step === "creating" ? "text-foreground" : "text-muted-foreground"}>
                      Deriving wallet
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-6">
                  All operations happen locally on your device
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            New to Veil?{" "}
            <Link to="/why-privacy" className="text-primary hover:underline">
              Learn how it works
            </Link>
          </p>
        </motion.div>
      </div>
    </PageLayout>
  );
}
