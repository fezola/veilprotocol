import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";

type RecoveryMethod = "timelock" | "shamir" | null;
type SetupStep = "method" | "configure" | "confirm" | "complete";

export default function RecoverySetup() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<RecoveryMethod>(null);
  const [step, setStep] = useState<SetupStep>("method");
  const [timelockDays, setTimelockDays] = useState(7);

  const handleSetup = async () => {
    setStep("confirm");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStep("complete");
  };

  return (
    <PageLayout>
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon icon="ph:key-fill" className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Recovery Setup</h1>
              <p className="text-muted-foreground">
                {step === "method" && "Choose how you want to recover your wallet if you lose access."}
                {step === "configure" && "Configure your recovery settings."}
                {step === "confirm" && "Setting up your recovery method..."}
                {step === "complete" && "Your recovery is now configured."}
              </p>
            </motion.div>

            {/* Method Selection */}
            {step === "method" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <button
                  onClick={() => {
                    setMethod("timelock");
                    setStep("configure");
                  }}
                  className="w-full glass-panel rounded-xl p-6 text-left hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon icon="ph:clock" className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Time-Locked Recovery</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Generate a recovery key that only becomes active after a waiting period.
                        If you don't cancel, access is restored automatically.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="privacy-badge">
                          <Icon icon="ph:shield-check" className="w-3.5 h-3.5" />
                          No guardians exposed
                        </span>
                        <span className="privacy-badge">
                          <Icon icon="ph:user" className="w-3.5 h-3.5" />
                          Solo recovery
                        </span>
                      </div>
                    </div>
                    <Icon icon="ph:caret-right" className="w-5 h-5 text-muted-foreground" />
                  </div>
                </button>

                <button
                  onClick={() => {
                    setMethod("shamir");
                    setStep("configure");
                  }}
                  className="w-full glass-panel rounded-xl p-6 text-left hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <Icon icon="ph:puzzle-piece" className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Shamir Secret Sharing</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Split your recovery key into multiple shares. Reconstruct with a threshold 
                        without revealing who holds shares.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="privacy-badge">
                          <Icon icon="ph:shield-check" className="w-3.5 h-3.5" />
                          Private share distribution
                        </span>
                        <span className="privacy-badge">
                          <Icon icon="ph:users" className="w-3.5 h-3.5" />
                          Distributed trust
                        </span>
                      </div>
                    </div>
                    <Icon icon="ph:caret-right" className="w-5 h-5 text-muted-foreground" />
                  </div>
                </button>

                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <Icon icon="ph:info" className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        <span className="text-primary font-medium">Privacy Guarantee:</span> Unlike traditional social recovery, 
                        Veil never exposes who your guardians are or that a recovery relationship exists.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Configuration */}
            {step === "configure" && method === "timelock" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-xl p-6"
              >
                <h2 className="font-semibold text-lg mb-6">Configure Time-Lock</h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Waiting Period</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[3, 7, 14, 30].map((days) => (
                      <button
                        key={days}
                        onClick={() => setTimelockDays(days)}
                        className={`py-3 rounded-lg border text-sm font-medium transition-colors ${
                          timelockDays === days
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        {days} days
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    You'll have {timelockDays} days to cancel a recovery attempt before it succeeds.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-secondary mb-6">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Icon icon="ph:info" className="w-4 h-4 text-primary" />
                    How It Works
                  </h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0">1</span>
                      A recovery key is generated locally
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0">2</span>
                      Store it securely (we never see it)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0">3</span>
                      If used, a {timelockDays}-day countdown begins
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0">4</span>
                      You can cancel during this period
                    </li>
                  </ol>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setStep("method");
                      setMethod(null);
                    }}
                    className="px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSetup}
                    className="flex-1 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    Generate Recovery Key
                    <Icon icon="ph:key" className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === "configure" && method === "shamir" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-xl p-6"
              >
                <h2 className="font-semibold text-lg mb-6">Configure Shamir Shares</h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Total Shares</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[3, 5, 7].map((shares) => (
                      <button
                        key={shares}
                        className="py-3 rounded-lg border border-border hover:border-primary/30 text-sm font-medium transition-colors"
                      >
                        {shares} shares
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Recovery Threshold</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[2, 3, 4].map((threshold) => (
                      <button
                        key={threshold}
                        className="py-3 rounded-lg border border-border hover:border-primary/30 text-sm font-medium transition-colors"
                      >
                        {threshold} of 5
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    This many shares are needed to recover your wallet.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setStep("method");
                      setMethod(null);
                    }}
                    className="px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSetup}
                    className="flex-1 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    Generate Shares
                    <Icon icon="ph:puzzle-piece" className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Confirming */}
            {step === "confirm" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-xl p-8 text-center"
              >
                <div className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-6" />
                <h2 className="font-semibold text-lg mb-2">Generating Recovery</h2>
                <p className="text-muted-foreground text-sm">
                  Creating cryptographic commitments locally...
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
                <h2 className="font-semibold text-xl mb-2">Recovery Configured</h2>
                <p className="text-muted-foreground mb-6">
                  Your recovery method is now active. Store your recovery key securely.
                </p>

                <div className="bg-secondary rounded-lg p-4 mb-6">
                  <p className="text-xs text-muted-foreground mb-2">Recovery Key (demo)</p>
                  <p className="font-mono text-sm break-all">
                    veil_rec_k1_8xNmPqRsTuVwXyZ2aB3cD4eF5gH6iJ7kL0
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/recovery-execute"
                    className="flex-1 py-3 border border-border font-medium rounded-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon icon="ph:play" className="w-5 h-5" />
                    Test Recovery
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex-1 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon icon="ph:layout" className="w-5 h-5" />
                    Go to Dashboard
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
