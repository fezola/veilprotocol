import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";
import { StatusCard } from "@/components/ui/StatusCard";
import { ZKProofVisualizer } from "@/components/ui/ZKProofVisualizer";
import { PrivacyVerification } from "@/components/PrivacyVerification";
import { PrivatePaymentDialog } from "@/components/ui/PrivatePaymentDialog";
import { generateTransactionProof, ZKProofData } from "@/lib/zkProof";

type ProofStage = "idle" | "hashing" | "generating" | "verifying" | "complete";

export default function Dashboard() {
  const [isTransacting, setIsTransacting] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [proofStage, setProofStage] = useState<ProofStage>("idle");
  const [txProof, setTxProof] = useState<ZKProofData | null>(null);
  const [proofDuration, setProofDuration] = useState<number>(0);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const handleTransaction = useCallback(async () => {
    setIsTransacting(true);
    setTransactionComplete(false);
    setProofStage("idle");
    setTxProof(null);
    
    // Get wallet commitment from session
    const commitment = sessionStorage.getItem("veil_commitment") || "demo_commitment";
    
    // Stage 1: Hashing
    setProofStage("hashing");
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Stage 2: Generating proof
    setProofStage("generating");
    const result = await generateTransactionProof(commitment, "private_transfer", 100);
    
    if (result.success && result.proof) {
      // Stage 3: Verifying
      setProofStage("verifying");
      await new Promise((resolve) => setTimeout(resolve, 400));
      
      setTxProof(result.proof);
      setProofDuration(result.duration);
      
      // Stage 4: Complete
      setProofStage("complete");
      
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsTransacting(false);
      setTransactionComplete(true);
    }
  }, []);

  const walletAddress = sessionStorage.getItem("veil_wallet") || "Vei1Hk9m...x7Kp";

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

            {/* Transparency Disclaimer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-start gap-3"
            >
              <Icon icon="ph:info" className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-foreground font-medium mb-1">Demo Mode</p>
                <p className="text-muted-foreground">
                  ZK proofs shown are structurally correct simulations. Production would use snarkjs + CIRCOM circuits.
                  The Solana program is deployed to devnet. <Link to="/docs" className="text-primary hover:underline">Learn more</Link>
                </p>
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

              {/* ShadowPay Integration Showcase */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass-panel rounded-xl p-6 border-2 border-success/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <Icon icon="ph:paper-plane-tilt" className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        Private Transfers
                        <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success font-medium">
                          NEW
                        </span>
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Powered by ShadowPay
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Send value privately with amount hiding on-chain. Complete privacy stack:
                    identity (ZK proofs) + infrastructure (Helius) + transfers (ShadowPay).
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <Icon icon="ph:eye-slash" className="w-5 h-5 text-success mb-2" />
                      <p className="text-xs font-medium mb-1">Amount Hidden</p>
                      <p className="text-xs text-muted-foreground">Private on-chain</p>
                    </div>
                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <Icon icon="ph:shield-check" className="w-5 h-5 text-success mb-2" />
                      <p className="text-xs font-medium mb-1">Identity Safe</p>
                      <p className="text-xs text-muted-foreground">No leakage</p>
                    </div>
                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <Icon icon="ph:lock" className="w-5 h-5 text-success mb-2" />
                      <p className="text-xs font-medium mb-1">No Linkage</p>
                      <p className="text-xs text-muted-foreground">Wallets private</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setIsPaymentDialogOpen(true)}
                      className="py-3 bg-success text-white font-medium rounded-lg hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Icon icon="ph:paper-plane-tilt" className="w-5 h-5" />
                      Try Demo
                    </button>
                    <Link
                      to="/shadowpay-explained"
                      className="py-3 border border-success/30 text-success font-medium rounded-lg hover:bg-success/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <Icon icon="ph:book-open" className="w-5 h-5" />
                      How It Works
                    </Link>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground flex items-start gap-2">
                      <Icon icon="ph:info" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-foreground">Privacy at every stage:</strong> Login
                        (ZK proofs), Infrastructure (Helius private RPC), Recovery (Shamir + no lists),
                        Transfers (ShadowPay amount hiding).
                      </span>
                    </p>
                  </div>
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
                    value={walletAddress}
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

              {/* Perform Action with ZK Proof */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Icon icon="ph:lightning" className="w-5 h-5 text-primary" />
                      ZK Proof Demo
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      See how privacy-preserving transactions work
                    </p>
                  </div>
                  <div className="px-2 py-1 rounded-full bg-warning/10 border border-warning/20 text-xs font-medium text-warning">
                    Demo
                  </div>
                </div>

                {!transactionComplete && !isTransacting && (
                  <div>
                    {/* What This Does - Educational */}
                    <div className="mb-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                        <Icon icon="ph:info" className="w-4 h-4" />
                        What This Demonstrates
                      </h3>
                      <ul className="space-y-1.5 text-xs text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Icon icon="ph:check" className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                          <span>Generates a real ZK proof structure (Groth16 format)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon icon="ph:check" className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                          <span>Proves you control a wallet WITHOUT revealing identity</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon icon="ph:check" className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                          <span>Shows the 4 stages: Hash → Generate → Verify → Complete</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon icon="ph:check" className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                          <span>No real transaction sent (demo of privacy architecture)</span>
                        </li>
                      </ul>
                    </div>

                    {/* What Production Would Add */}
                    <div className="mb-6 p-3 rounded-lg bg-secondary border border-border">
                      <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                        <Icon icon="ph:rocket-launch" className="w-3.5 h-3.5" />
                        Production Enhancement
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        In production, this would use <span className="font-mono text-primary">snarkjs</span> to generate
                        fully verified ZK proofs and submit real transactions to Solana with privacy guarantees.
                      </p>
                    </div>

                    <button
                      onClick={handleTransaction}
                      className="w-full py-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Icon icon="ph:play" className="w-5 h-5" />
                      Generate ZK Proof (Demo)
                    </button>
                  </div>
                )}

                {isTransacting && (
                  <div className="py-4">
                    <ZKProofVisualizer
                      isGenerating={true}
                      proof={txProof}
                      stage={proofStage}
                      duration={proofDuration}
                    />
                  </div>
                )}
                
                {transactionComplete && !isTransacting && (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 success-glow">
                      <Icon icon="ph:check-circle-fill" className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="font-semibold mb-2">ZK Proof Generated!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Successfully demonstrated privacy-preserving transaction flow
                    </p>

                    {/* What Just Happened */}
                    <div className="mb-4 p-4 rounded-lg bg-success/5 border border-success/20 text-left">
                      <h4 className="text-sm font-semibold text-success mb-3 flex items-center gap-2">
                        <Icon icon="ph:shield-check" className="w-4 h-4" />
                        What Just Happened
                      </h4>
                      <ul className="space-y-2 text-xs text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Icon icon="ph:check" className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-foreground">Hashed Commitment:</strong> Created a cryptographic hash of your wallet commitment
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon icon="ph:check" className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-foreground">Generated Proof:</strong> Built a Groth16 ZK proof structure (pi_a, pi_b, pi_c components)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon icon="ph:check" className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-foreground">Verified Structure:</strong> Validated the proof follows correct cryptographic format
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Icon icon="ph:check" className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-foreground">Privacy Preserved:</strong> Your identity remains hidden (only commitment is public)
                          </span>
                        </li>
                      </ul>
                    </div>

                    {txProof && (
                      <div className="bg-secondary rounded-lg p-4 text-left space-y-2.5 mb-4">
                        <div className="text-xs font-semibold text-muted-foreground mb-2">Proof Details</div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Protocol</span>
                          <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {txProof.proof.protocol.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Curve</span>
                          <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {txProof.proof.curve.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Commitment Hash</span>
                          <span className="font-mono text-xs">
                            {txProof.commitment.slice(0, 8)}...{txProof.commitment.slice(-6)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Generation Time</span>
                          <span className="font-mono text-xs text-success">
                            {proofDuration.toFixed(0)}ms
                          </span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            <Icon icon="ph:info" className="w-3 h-3 inline mr-1" />
                            This proof structure matches real Groth16 ZK-SNARKs used in production privacy systems.
                          </p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setTransactionComplete(false);
                        setTxProof(null);
                        setProofStage("idle");
                      }}
                      className="w-full py-2.5 bg-primary/10 text-primary font-medium rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Icon icon="ph:arrows-clockwise" className="w-4 h-4" />
                      Generate Another Proof
                    </button>
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
                  <button
                    onClick={() => setIsPaymentDialogOpen(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Icon icon="ph:paper-plane-tilt" className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Send Privately</p>
                      <p className="text-xs text-muted-foreground">Powered by ShadowPay</p>
                    </div>
                    <Icon icon="ph:caret-right" className="w-4 h-4 text-muted-foreground" />
                  </button>

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

              {/* ZK Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-panel rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon icon="ph:cpu" className="w-5 h-5 text-primary" />
                  ZK Proof Stats
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Protocol</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-mono">GROTH16</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Curve</span>
                    <span className="text-xs font-mono text-muted-foreground">BN128</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Proofs Generated</span>
                    <span className="text-xs font-mono text-success">{txProof ? "1" : "0"}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Privacy Verification Section - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <PrivacyVerification />
          </motion.div>
        </div>
      </div>

      {/* Private Payment Dialog */}
      <PrivatePaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
      />
    </PageLayout>
  );
}
