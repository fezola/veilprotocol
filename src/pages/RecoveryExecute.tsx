import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  getRecoveryKey,
  getShamirShares,
  verifyRecoveryKey,
  shamirReconstruct,
  type ShamirShare,
} from "@/lib/recovery";
import { useToast } from "@/hooks/use-toast";

type RecoveryStep = "initiate" | "shamir-collect" | "pending" | "countdown" | "complete" | "failed";
type RecoveryMethod = "direct" | "shamir" | null;

export default function RecoveryExecute() {
  const { veilWallet, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<RecoveryStep>("initiate");
  const [method, setMethod] = useState<RecoveryMethod>(null);
  const [recoveryKeyInput, setRecoveryKeyInput] = useState("");
  const [shamirShareInputs, setShamirShareInputs] = useState<string[]>(["", "", ""]);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const handleDirectRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryKeyInput || !veilWallet) return;

    setStep("pending");

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      // Get stored recovery key
      const storedRecovery = getRecoveryKey(veilWallet);

      if (!storedRecovery) {
        setVerificationResult({
          valid: false,
          message: "No recovery key found for this wallet. Please set up recovery first.",
        });
        setStep("failed");
        return;
      }

      // Remove prefix and decode the input
      const cleanInput = recoveryKeyInput
        .replace(/^veil_rec_(tl|sh)_/, "")
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      // Verify the recovery key
      const isValid = verifyRecoveryKey(cleanInput, storedRecovery.commitment);

      if (isValid) {
        setVerificationResult({
          valid: true,
          message: "Recovery key verified successfully!",
        });

        // Simulate time-lock countdown
        setStep("countdown");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Re-authenticate with the recovered wallet
        login(veilWallet, storedRecovery.commitment);

        setStep("complete");

        toast({
          title: "Recovery Successful",
          description: "Wallet access has been restored",
        });
      } else {
        setVerificationResult({
          valid: false,
          message: "Invalid recovery key. Please check and try again.",
        });
        setStep("failed");
      }
    } catch (error) {
      console.error("Recovery error:", error);
      setVerificationResult({
        valid: false,
        message: "Recovery verification failed. Please try again.",
      });
      setStep("failed");
    }
  };

  const handleShamirRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!veilWallet) return;

    // Filter out empty share inputs
    const nonEmptyShares = shamirShareInputs.filter((s) => s.trim() !== "");

    if (nonEmptyShares.length < 2) {
      toast({
        title: "Insufficient Shares",
        description: "Please enter at least 2 shares",
        variant: "destructive",
      });
      return;
    }

    setStep("pending");

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      // Get stored Shamir shares (for demo purposes)
      const storedShares = getShamirShares(veilWallet);

      if (!storedShares || storedShares.length === 0) {
        setVerificationResult({
          valid: false,
          message: "No Shamir shares found for this wallet. Please set up Shamir recovery first.",
        });
        setStep("failed");
        return;
      }

      // Parse input shares
      const parsedShares: ShamirShare[] = [];
      for (let i = 0; i < nonEmptyShares.length; i++) {
        const share = storedShares[i]; // For demo, use stored shares
        if (share) {
          parsedShares.push(share);
        }
      }

      if (parsedShares.length < storedShares[0].threshold) {
        setVerificationResult({
          valid: false,
          message: `Need at least ${storedShares[0].threshold} shares to recover`,
        });
        setStep("failed");
        return;
      }

      // Reconstruct the recovery key
      const reconstructedKey = shamirReconstruct(parsedShares);

      // Get stored recovery key to verify
      const storedRecovery = getRecoveryKey(veilWallet);

      if (!storedRecovery) {
        setVerificationResult({
          valid: false,
          message: "No recovery configuration found",
        });
        setStep("failed");
        return;
      }

      // Verify reconstructed key
      const isValid = verifyRecoveryKey(reconstructedKey, storedRecovery.commitment);

      if (isValid) {
        setVerificationResult({
          valid: true,
          message: "Shares verified and secret reconstructed successfully!",
        });

        setStep("countdown");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Re-authenticate
        login(veilWallet, storedRecovery.commitment);

        setStep("complete");

        toast({
          title: "Shamir Recovery Successful",
          description: "Wallet access restored using threshold shares",
        });
      } else {
        setVerificationResult({
          valid: false,
          message: "Share reconstruction failed verification",
        });
        setStep("failed");
      }
    } catch (error) {
      console.error("Shamir recovery error:", error);
      setVerificationResult({
        valid: false,
        message: "Failed to reconstruct secret from shares",
      });
      setStep("failed");
    }
  };

  const handleReset = () => {
    setStep("initiate");
    setMethod(null);
    setRecoveryKeyInput("");
    setShamirShareInputs(["", "", ""]);
    setVerificationResult(null);
  };

  return (
    <PageLayout>
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate('/dashboard')}
              className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon icon="ph:arrow-left" className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </motion.button>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
                <Icon icon="ph:key-fill" className="w-8 h-8 text-warning" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Recovery Execution</h1>
              <p className="text-muted-foreground">
                {step === "initiate" && "Choose your recovery method."}
                {step === "shamir-collect" && "Enter threshold shares to recover."}
                {step === "pending" && "Verifying recovery credentials..."}
                {step === "countdown" && "Recovery time-lock period (simulated)."}
                {step === "complete" && "Wallet access restored successfully."}
                {step === "failed" && "Recovery verification failed."}
              </p>
            </motion.div>

            {/* Method Selection */}
            {step === "initiate" && !method && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <button
                  onClick={() => setMethod("direct")}
                  className="w-full glass-panel rounded-xl p-6 text-left hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon icon="ph:key" className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Direct Recovery Key</h3>
                      <p className="text-muted-foreground text-sm">
                        Enter your time-locked recovery key directly
                      </p>
                    </div>
                    <Icon icon="ph:caret-right" className="w-5 h-5 text-muted-foreground" />
                  </div>
                </button>

                <button
                  onClick={() => {
                    setMethod("shamir");
                    setStep("shamir-collect");
                  }}
                  className="w-full glass-panel rounded-xl p-6 text-left hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <Icon icon="ph:puzzle-piece" className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Shamir Shares</h3>
                      <p className="text-muted-foreground text-sm">
                        Reconstruct from threshold guardian shares
                      </p>
                    </div>
                    <Icon icon="ph:caret-right" className="w-5 h-5 text-muted-foreground" />
                  </div>
                </button>
              </motion.div>
            )}

            {/* Direct Recovery Form */}
            {step === "initiate" && method === "direct" && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleDirectRecovery}
                className="glass-panel rounded-xl p-6"
              >
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Recovery Key</label>
                  <input
                    type="text"
                    value={recoveryKeyInput}
                    onChange={(e) => setRecoveryKeyInput(e.target.value)}
                    placeholder="veil_rec_tl_..."
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-mono text-sm"
                  />
                </div>

                <div className="p-4 rounded-lg bg-warning/5 border border-warning/10 mb-6">
                  <div className="flex items-start gap-3">
                    <Icon icon="ph:warning" className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-warning font-medium mb-1">Important</p>
                      <p className="text-muted-foreground">
                        This will initiate a recovery period. You can cancel within the timelock window
                        if this wasn't you.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-warning text-warning-foreground font-medium rounded-lg hover:bg-warning/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon icon="ph:key" className="w-5 h-5" />
                    Initiate Recovery
                  </button>
                </div>
              </motion.form>
            )}

            {/* Shamir Collection Form */}
            {step === "shamir-collect" && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleShamirRecovery}
                className="glass-panel rounded-xl p-6"
              >
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Enter Shares (Minimum 3)</label>
                  <div className="space-y-3">
                    {shamirShareInputs.map((share, index) => (
                      <div key={index}>
                        <label className="block text-xs text-muted-foreground mb-1">
                          Share {index + 1}
                        </label>
                        <input
                          type="text"
                          value={share}
                          onChange={(e) => {
                            const newShares = [...shamirShareInputs];
                            newShares[index] = e.target.value;
                            setShamirShareInputs(newShares);
                          }}
                          placeholder={`Paste share ${index + 1}...`}
                          className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-mono text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShamirShareInputs([...shamirShareInputs, ""])}
                    className="mt-3 text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <Icon icon="ph:plus" className="w-4 h-4" />
                    Add another share
                  </button>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 mb-6">
                  <div className="flex items-start gap-3">
                    <Icon icon="ph:info" className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Demo Note</p>
                      <p>
                        For this demo, the shares are automatically loaded from storage. In production,
                        you would paste actual shares from guardians.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-warning text-warning-foreground font-medium rounded-lg hover:bg-warning/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon icon="ph:puzzle-piece" className="w-5 h-5" />
                    Reconstruct & Recover
                  </button>
                </div>
              </motion.form>
            )}

            {/* Pending */}
            {step === "pending" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-xl p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full border-2 border-warning border-t-transparent animate-spin mx-auto mb-6" />
                <h2 className="font-semibold text-lg mb-2">Verifying Recovery</h2>
                <p className="text-muted-foreground text-sm">
                  {method === "direct"
                    ? "Verifying recovery key against on-chain commitment..."
                    : "Reconstructing secret from Shamir shares..."}
                </p>
              </motion.div>
            )}

            {/* Countdown */}
            {step === "countdown" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-xl p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
                  <Icon icon="ph:clock" className="w-8 h-8 text-warning animate-pulse" />
                </div>
                <h2 className="font-semibold text-lg mb-2">Recovery Time-Lock Active</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  In production, this would be a {getRecoveryKey(veilWallet || "")?.metadata?.timelockDays || 7}-day
                  waiting period. You could cancel during this time if unauthorized.
                </p>
                <div className="text-3xl font-bold text-warning mb-2">Simulated</div>
                <p className="text-xs text-muted-foreground">
                  For demo purposes, proceeding immediately...
                </p>
              </motion.div>
            )}

            {/* Complete */}
            {step === "complete" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel rounded-xl p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 success-glow">
                  <Icon icon="ph:check-circle-fill" className="w-8 h-8 text-success" />
                </div>
                <h2 className="font-semibold text-xl mb-2">Recovery Successful</h2>
                <p className="text-muted-foreground mb-6">
                  Wallet access has been restored. You can now use your wallet normally.
                </p>

                {verificationResult && verificationResult.valid && (
                  <div className="bg-success/5 border border-success/20 rounded-lg p-4 mb-6">
                    <p className="text-sm text-success">
                      ✓ {verificationResult.message}
                    </p>
                  </div>
                )}

                {/* Recovery Threat Model */}
                <div className="glass-panel rounded-lg p-6 mb-6 text-left border-primary/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon icon="ph:shield-check" className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-sm">What Attackers Cannot See</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon icon="ph:x-circle" className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Who helped recover:</strong> Guardian identities never appear on-chain
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon icon="ph:x-circle" className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">When recovery started:</strong> No timestamps linking you to recovery attempts
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon icon="ph:x-circle" className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">How many shares used:</strong> Threshold remains private
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon icon="ph:x-circle" className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Link to identity:</strong> No connection between recovery and real-world you
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      <Icon icon="ph:info" className="w-3 h-3 inline mr-1" />
                      Even with full blockchain access, adversaries learn nothing about your recovery process.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/dashboard"
                    className="flex-1 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon icon="ph:layout" className="w-5 h-5" />
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 border border-border font-medium rounded-lg hover:bg-secondary transition-colors"
                  >
                    Test Again
                  </button>
                </div>
              </motion.div>
            )}

            {/* Failed */}
            {step === "failed" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel rounded-xl p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                  <Icon icon="ph:x-circle-fill" className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="font-semibold text-xl mb-2">Recovery Failed</h2>
                <p className="text-muted-foreground mb-6">
                  {verificationResult?.message || "Unable to verify recovery credentials"}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Try Again
                  </button>
                  <Link
                    to="/recovery-setup"
                    className="flex-1 py-3 border border-border font-medium rounded-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon icon="ph:key" className="w-5 h-5" />
                    Setup Recovery
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
