import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";
import { StatusCard } from "@/components/ui/StatusCard";

export default function Dashboard() {
  const [isTransacting, setIsTransacting] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);

  const handleTransaction = async () => {
    setIsTransacting(true);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setIsTransacting(false);
    setTransactionComplete(true);
  };

  return (
    <PageLayout>
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <h1 className="text-3xl font-bold mb-2">Privacy Dashboard</h1>
                <p className="text-muted-foreground">
                  Monitor what's hidden and what's visible on-chain.
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
                <span className="status-indicator status-indicator-active" />
                <span className="text-sm font-medium text-success">Session Active</span>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Privacy Status */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon icon="ph:eye-slash" className="w-5 h-5 text-primary" />
                  What's Hidden
                </h2>
                <div className="space-y-3">
                  <StatusCard
                    icon="ph:user"
                    label="Real Identity"
                    value="Never collected"
                    status="hidden"
                  />
                  <StatusCard
                    icon="ph:envelope"
                    label="Email/Auth Method"
                    value="Only commitment stored"
                    status="hidden"
                  />
                  <StatusCard
                    icon="ph:link"
                    label="Other Wallets"
                    value="No linkage possible"
                    status="hidden"
                  />
                  <StatusCard
                    icon="ph:users-three"
                    label="Recovery Guardians"
                    value="Private (if set up)"
                    status="hidden"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon icon="ph:eye" className="w-5 h-5 text-warning" />
                  What's Public
                </h2>
                <div className="space-y-3">
                  <StatusCard
                    icon="ph:wallet"
                    label="Wallet Address"
                    value="Vei1Hk9m...x7Kp"
                    status="public"
                  />
                  <StatusCard
                    icon="ph:arrow-up-right"
                    label="Transactions"
                    value="Visible on-chain"
                    status="public"
                  />
                </div>
              </motion.div>

              {/* Perform Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon icon="ph:lightning" className="w-5 h-5 text-primary" />
                  Perform Private Action
                </h2>
                
                {!transactionComplete ? (
                  <div>
                    <p className="text-muted-foreground text-sm mb-6">
                      Execute a test transaction to see privacy in action. This proves you control the wallet 
                      without revealing your identity.
                    </p>
                    
                    <button
                      onClick={handleTransaction}
                      disabled={isTransacting}
                      className="w-full py-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isTransacting ? (
                        <>
                          <Icon icon="ph:circle-notch" className="w-5 h-5 animate-spin" />
                          Generating ZK Proof...
                        </>
                      ) : (
                        <>
                          <Icon icon="ph:paper-plane-tilt" className="w-5 h-5" />
                          Execute Private Transaction
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 success-glow">
                      <Icon icon="ph:check-circle-fill" className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="font-semibold mb-2">Transaction Complete</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your transaction was executed with zero-knowledge proof. No identity leaked.
                    </p>
                    <div className="bg-secondary rounded-lg p-3 font-mono text-xs text-muted-foreground">
                      TX: 5KxN...m8Qs
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-panel rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link
                    to="/recovery-setup"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon icon="ph:key" className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Recovery Setup</p>
                      <p className="text-xs text-muted-foreground">Configure private recovery</p>
                    </div>
                    <Icon icon="ph:caret-right" className="w-4 h-4 text-muted-foreground" />
                  </Link>

                  <Link
                    to="/guarantees"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Icon icon="ph:shield-check" className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Privacy Guarantees</p>
                      <p className="text-xs text-muted-foreground">View technical details</p>
                    </div>
                    <Icon icon="ph:caret-right" className="w-4 h-4 text-muted-foreground" />
                  </Link>

                  <Link
                    to="/docs"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Icon icon="ph:book-open" className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Documentation</p>
                      <p className="text-xs text-muted-foreground">Learn the protocol</p>
                    </div>
                    <Icon icon="ph:caret-right" className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-panel rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold mb-4">Security Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Recovery</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning">Not Set</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Session</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Privacy Level</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">Maximum</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
