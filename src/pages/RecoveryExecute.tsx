import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";

type RecoveryStep = "initiate" | "pending" | "countdown" | "complete";

export default function RecoveryExecute() {
  const [step, setStep] = useState<RecoveryStep>("initiate");
  const [recoveryKey, setRecoveryKey] = useState("");

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryKey) return;
    
    setStep("pending");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStep("countdown");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setStep("complete");
  };

  return (
    <PageLayout>
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
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
                {step === "initiate" && "Enter your recovery key to begin the recovery process."}
                {step === "pending" && "Verifying your recovery key..."}
                {step === "countdown" && "Recovery period active (simulated)."}
                {step === "complete" && "Wallet access restored successfully."}
              </p>
            </motion.div>

            {/* Initiate */}
            {step === "initiate" && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleInitiate}
                className="glass-panel rounded-xl p-6"
              >
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Recovery Key</label>
                  <input
                    type="text"
                    value={recoveryKey}
                    onChange={(e) => setRecoveryKey(e.target.value)}
                    placeholder="veil_rec_k1_..."
                    className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-mono text-sm"
                  />
                </div>

                <div className="p-4 rounded-lg bg-warning/5 border border-warning/10 mb-6">
                  <div className="flex items-start gap-3">
                    <Icon icon="ph:warning" className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-warning font-medium">Important</p>
                      <p className="text-muted-foreground">
                        This will initiate a recovery period. You can cancel within the timelock window 
                        if this wasn't you.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-warning text-warning-foreground font-medium rounded-lg hover:bg-warning/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon icon="ph:key" className="w-5 h-5" />
                  Initiate Recovery
                </button>
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
                <h2 className="font-semibold text-lg mb-2">Verifying Recovery Key</h2>
                <p className="text-muted-foreground text-sm">
                  Checking cryptographic proof on-chain...
                </p>
              </motion.div>
            )}

            {/* Countdown */}
            {step === "countdown" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-xl p-8"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                    <Icon icon="ph:clock" className="w-8 h-8 text-warning" />
                  </div>
                  <h2 className="font-semibold text-xl mb-2">Recovery Period Active</h2>
                  <p className="text-muted-foreground text-sm">
                    Timelock countdown in progress (simulated)
                  </p>
                </div>

                <div className="bg-secondary rounded-lg p-6 text-center mb-6">
                  <p className="text-xs text-muted-foreground mb-2">Time Remaining</p>
                  <p className="text-4xl font-bold font-mono text-warning">6d 23h 59m</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                      <Icon icon="ph:check" className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Recovery key verified</p>
                      <p className="text-xs text-muted-foreground">Cryptographic proof valid</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                      <Icon icon="ph:clock" className="w-4 h-4 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Timelock active</p>
                      <p className="text-xs text-muted-foreground">Waiting period in progress</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Icon icon="ph:circle-dashed" className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Access restoration</p>
                      <p className="text-xs text-muted-foreground">Pending timelock completion</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <Icon icon="ph:shield-check" className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      <span className="text-primary font-medium">Privacy Note:</span> No one can see that a 
                      recovery is in progress. The timelock runs on-chain without revealing your identity.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Complete */}
            {step === "complete" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel rounded-xl p-8 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 success-glow">
                  <Icon icon="ph:check-circle-fill" className="w-10 h-10 text-success" />
                </div>
                <h2 className="font-semibold text-2xl mb-2">Recovery Complete</h2>
                <p className="text-muted-foreground mb-8">
                  Your wallet access has been restored. No identity was exposed during this process.
                </p>

                <div className="glass-panel rounded-lg p-4 mb-8 text-left">
                  <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Icon icon="ph:shield-check" className="w-4 h-4 text-success" />
                    What Remained Private
                  </h3>
                  <ul className="space-y-2">
                    {[
                      "Your real identity",
                      "Your recovery key holders",
                      "That a recovery occurred",
                      "Your social graph",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon icon="ph:check-circle" className="w-4 h-4 text-success" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/guarantees"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Icon icon="ph:check-circle" className="w-5 h-5" />
                  View Privacy Guarantees
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
