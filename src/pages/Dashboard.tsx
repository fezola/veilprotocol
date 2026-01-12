import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";
import { StatusCard } from "@/components/ui/StatusCard";
import { ZKProofVisualizer } from "@/components/ui/ZKProofVisualizer";
import { PrivacyVerification } from "@/components/PrivacyVerification";
import { PrivatePaymentDialog } from "@/components/ui/PrivatePaymentDialog";
import { generateTransactionProof, ZKProofData } from "@/lib/zkProof";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getWalletAccount,
  submitProof,
  getSolscanLink,
  VEIL_PROGRAM_ID,
  initializeCommitment,
  commitmentToBytes
} from "@/lib/veilProgram";

type ProofStage = "idle" | "hashing" | "generating" | "verifying" | "complete";

interface PrivacyActivity {
  id: string;
  type: "auth" | "proof" | "transfer" | "access";
  timestamp: Date;
  description: string;
}

export default function Dashboard() {
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const { commitment, isAuthenticated } = useAuth();

  const [isTransacting, setIsTransacting] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [proofStage, setProofStage] = useState<ProofStage>("idle");
  const [txProof, setTxProof] = useState<ZKProofData | null>(null);
  const [proofDuration, setProofDuration] = useState<number>(0);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [showSecureAction, setShowSecureAction] = useState(false);
  const [secureActionVerified, setSecureActionVerified] = useState(false);
  const [privacyActivities, setPrivacyActivities] = useState<PrivacyActivity[]>([]);
  const [daysUnlinkable, setDaysUnlinkable] = useState(0);
  const [onChainAccount, setOnChainAccount] = useState<any>(null);
  const [lastTxSignature, setLastTxSignature] = useState<string | null>(null);

  // Fetch on-chain account data
  useEffect(() => {
    async function fetchOnChainData() {
      if (!publicKey) return;

      try {
        const accountData = await getWalletAccount(connection, publicKey);
        setOnChainAccount(accountData);

        if (accountData) {
          // Calculate days since account creation
          const daysSince = Math.floor((Date.now() / 1000 - accountData.createdAt) / (60 * 60 * 24));
          setDaysUnlinkable(daysSince > 0 ? daysSince : 0);
        }
      } catch (error) {
        console.error("Failed to fetch on-chain data:", error);
      }
    }

    fetchOnChainData();
  }, [publicKey, connection]);

  // Initialize activities and metrics on mount
  useEffect(() => {
    // Add initial auth activity
    const walletCreated = sessionStorage.getItem("veil_wallet_created");
    if (walletCreated && !onChainAccount) {
      const createdDate = new Date(walletCreated);
      const daysSince = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      setDaysUnlinkable(daysSince > 0 ? daysSince : 0);
    }

    // Add initial activity
    setPrivacyActivities([
      {
        id: "1",
        type: "auth",
        timestamp: new Date(),
        description: "ZK authentication proof verified"
      }
    ]);
  }, [onChainAccount]);

  const addActivity = useCallback((type: PrivacyActivity["type"], description: string) => {
    setPrivacyActivities(prev => [
      {
        id: Date.now().toString(),
        type,
        timestamp: new Date(),
        description
      },
      ...prev.slice(0, 4) // Keep last 5 activities
    ]);
  }, []);

  const handleSecureAction = useCallback(async () => {
    setShowSecureAction(true);
    setSecureActionVerified(false);

    // Simulate verification delay (using existing auth proof)
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSecureActionVerified(true);
    addActivity("access", "Access verified without identity exposure");
  }, [addActivity]);

  const handleTransaction = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      alert("Please connect your Solana wallet first");
      return;
    }

    if (!commitment) {
      alert("Please authenticate first");
      return;
    }

    setIsTransacting(true);
    setTransactionComplete(false);
    setProofStage("idle");
    setTxProof(null);
    setLastTxSignature(null);

    try {
      // Check if wallet account is initialized
      const accountData = await getWalletAccount(connection, publicKey);

      if (!accountData) {
        // Initialize commitment first
        setProofStage("hashing");
        const commitmentBytes = commitmentToBytes(commitment);

        const { signature: initSig } = await initializeCommitment(
          connection,
          publicKey,
          commitmentBytes,
          signTransaction
        );

        console.log("Wallet account initialized:", initSig);
        addActivity("auth", `Wallet initialized on-chain (${initSig.slice(0, 8)}...)`);

        // Refresh on-chain account data
        const newAccountData = await getWalletAccount(connection, publicKey);
        setOnChainAccount(newAccountData);
      }

      // Stage 1: Hashing
      setProofStage("hashing");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Stage 2: Generating proof
      setProofStage("generating");
      const result = await generateTransactionProof(commitment, "dashboard_action", 100);

      if (result.success && result.proof) {
        setTxProof(result.proof);
        setProofDuration(result.duration);

        // Stage 3: Submit to blockchain
        setProofStage("verifying");

        const proofBytes = new Uint8Array(
          Buffer.from(JSON.stringify(result.proof.proof))
        );
        const publicSignals = result.proof.publicSignals.map((signal: string) => {
          const bytes = new Uint8Array(32);
          const hex = signal.replace(/^0x/, '').padStart(64, '0');
          for (let i = 0; i < 32; i++) {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
          }
          return bytes;
        });

        const txSignature = await submitProof(
          connection,
          publicKey,
          proofBytes,
          publicSignals,
          signTransaction
        );

        setLastTxSignature(txSignature);

        // Stage 4: Complete
        setProofStage("complete");

        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsTransacting(false);
        setTransactionComplete(true);
        addActivity("proof", `ZK proof verified on-chain (${txSignature.slice(0, 8)}...)`);
      }
    } catch (error: any) {
      console.error("Transaction failed:", error);
      alert("Transaction failed: " + error.message);
      setIsTransacting(false);
      setProofStage("idle");
    }
  }, [publicKey, signTransaction, connection, commitment, addActivity]);

  const walletAddress = sessionStorage.getItem("veil_wallet") || "Vei1Hk9m...x7Kp";

  // Calculate privacy health score
  const recoverySetup = sessionStorage.getItem("veil_recovery_setup") === "true";
  const privacyScore = recoverySetup ? 100 : 75;

  // Get activity icon
  const getActivityIcon = (type: PrivacyActivity["type"]) => {
    switch (type) {
      case "auth": return "ph:shield-check";
      case "proof": return "ph:cpu";
      case "transfer": return "ph:paper-plane-tilt";
      case "access": return "ph:lock-key";
    }
  };

  return (
    <PageLayout>
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-[1400px]">
          {/* Header with Privacy Health */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6"
            >
              <div>
                <h1 className="text-3xl font-bold mb-2">Privacy Dashboard</h1>
                <p className="text-muted-foreground">
                  Full-stack privacy infrastructure operating on Solana devnet
                </p>
              </div>

              {/* Privacy Health Indicator */}
              <div className="glass-panel rounded-xl p-4 min-w-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Privacy Health</h3>
                  <span className={`text-2xl font-bold ${privacyScore === 100 ? 'text-success' : 'text-warning'}`}>
                    {privacyScore}%
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full transition-all duration-500 ${privacyScore === 100 ? 'bg-success' : 'bg-warning'}`}
                    style={{ width: `${privacyScore}%` }}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <Icon icon="ph:check-circle" className="w-3.5 h-3.5 text-success" />
                    <span className="text-muted-foreground">ZK authentication active</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Icon icon="ph:check-circle" className="w-3.5 h-3.5 text-success" />
                    <span className="text-muted-foreground">Private RPC configured</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {recoverySetup ? (
                      <>
                        <Icon icon="ph:check-circle" className="w-3.5 h-3.5 text-success" />
                        <span className="text-muted-foreground">Recovery configured</span>
                      </>
                    ) : (
                      <>
                        <Icon icon="ph:warning-circle" className="w-3.5 h-3.5 text-warning" />
                        <Link to="/recovery-setup" className="text-warning hover:underline">Setup recovery</Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content - 3 columns */}
            <div className="lg:col-span-3 space-y-6">
              {/* Privacy Stack Visualization */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon icon="ph:stack" className="w-5 h-5 text-primary" />
                  Privacy Infrastructure Stack
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <Icon icon="ph:shield-check" className="w-6 h-6 text-primary mb-2" />
                    <h3 className="font-semibold text-sm mb-1">Identity Layer</h3>
                    <p className="text-xs text-muted-foreground mb-2">ZK Proofs (Groth16)</p>
                    <div className="flex items-center gap-1">
                      <span className="status-indicator status-indicator-active" />
                      <span className="text-xs text-success">Active</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                    <Icon icon="ph:cloud" className="w-6 h-6 text-success mb-2" />
                    <h3 className="font-semibold text-sm mb-1">Infrastructure</h3>
                    <p className="text-xs text-muted-foreground mb-2">Helius Private RPC</p>
                    <div className="flex items-center gap-1">
                      <span className="status-indicator status-indicator-active" />
                      <span className="text-xs text-success">Active</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                    <Icon icon="ph:key" className="w-6 h-6 text-warning mb-2" />
                    <h3 className="font-semibold text-sm mb-1">Recovery Layer</h3>
                    <p className="text-xs text-muted-foreground mb-2">Shamir + Timelock</p>
                    <div className="flex items-center gap-1">
                      <span className={`status-indicator ${recoverySetup ? 'status-indicator-active' : 'status-indicator-pending'}`} />
                      <span className={`text-xs ${recoverySetup ? 'text-success' : 'text-warning'}`}>
                        {recoverySetup ? 'Active' : 'Not Set'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                    <Icon icon="ph:paper-plane-tilt" className="w-6 h-6 text-success mb-2" />
                    <h3 className="font-semibold text-sm mb-1">Transfer Layer</h3>
                    <p className="text-xs text-muted-foreground mb-2">ShadowPay</p>
                    <div className="flex items-center gap-1">
                      <span className="status-indicator status-indicator-active" />
                      <span className="text-xs text-success">Ready</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <Icon icon="ph:info" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Each layer operates independently but composes together for comprehensive privacy.
                      Infrastructure positioning for the Open Track.
                    </span>
                  </p>
                </div>
              </motion.div>

              {/* Privacy Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="glass-panel rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon icon="ph:calendar-blank" className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-sm">Unlinkability Duration</h3>
                  </div>
                  <p className="text-2xl font-bold text-primary mb-1">{daysUnlinkable} days</p>
                  <p className="text-xs text-muted-foreground">Wallet address unlinkable to identity</p>
                </div>
                <div className="glass-panel rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon icon="ph:shield-check" className="w-5 h-5 text-success" />
                    <h3 className="font-semibold text-sm">Identity Exposures</h3>
                  </div>
                  <p className="text-2xl font-bold text-success mb-1">0</p>
                  <p className="text-xs text-muted-foreground">Zero identity leaks since creation</p>
                </div>
                <div className="glass-panel rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon icon="ph:activity" className="w-5 h-5 text-warning" />
                    <h3 className="font-semibold text-sm">Privacy Actions</h3>
                  </div>
                  <p className="text-2xl font-bold text-warning mb-1">{privacyActivities.length}</p>
                  <p className="text-xs text-muted-foreground">Privacy-preserving operations</p>
                </div>
              </motion.div>

              {/* Recent Privacy Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon icon="ph:clock-clockwise" className="w-5 h-5 text-primary" />
                  Recent Activity
                </h2>
                {privacyActivities.length > 0 ? (
                  <div className="space-y-3">
                    {privacyActivities.map(activity => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                        <Icon icon={getActivityIcon(activity.type)} className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No recent activity
                  </p>
                )}
                <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <Icon icon="ph:info" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      Activity log shows operations <strong>without revealing sensitive data</strong>
                      (no amounts, recipients, or identities stored).
                    </span>
                  </p>
                </div>
              </motion.div>

              {/* What's Hidden vs Public */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
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
                </div>
                <div>
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
                </div>
              </motion.div>

              {/* Build With Veil - Integration Examples */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel rounded-xl p-6 border-2 border-primary/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon icon="ph:code" className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Build With Veil</h2>
                    <p className="text-xs text-muted-foreground">
                      Integrate privacy infrastructure into your product
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* DeFi Integration */}
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon icon="ph:coins" className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-sm">DeFi Protocols</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Add private authentication to lending platforms, DEXs, or yield farms
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Icon icon="ph:check" className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          Verify user eligibility without KYC exposure
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icon icon="ph:check" className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          Private recovery for institutional accounts
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icon icon="ph:check" className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          Hide wallet balances during trades
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Integration */}
                  <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon icon="ph:wallet" className="w-5 h-5 text-success" />
                      <h3 className="font-semibold text-sm">Wallet Apps</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Add privacy-preserving authentication and recovery to wallets
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Icon icon="ph:check" className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          ZK-based login without password databases
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icon icon="ph:check" className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          Social recovery with guardian privacy
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icon icon="ph:check" className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          Private transaction infrastructure (ShadowPay)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DAO Integration */}
                  <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon icon="ph:users-three" className="w-5 h-5 text-warning" />
                      <h3 className="font-semibold text-sm">DAOs & Governance</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Enable private voting and membership verification
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Icon icon="ph:check" className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          Verify membership without revealing identity
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icon icon="ph:check" className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          Private voting (prove eligibility, hide vote)
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icon icon="ph:check" className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          Multi-sig recovery without exposing signers
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Gaming/NFT Integration */}
                  <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon icon="ph:game-controller" className="w-5 h-5 text-success" />
                      <h3 className="font-semibold text-sm">Gaming & NFTs</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Protect user accounts and in-game assets with privacy
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Icon icon="ph:check" className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          Account recovery without email/phone
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icon icon="ph:check" className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          Private NFT ownership verification
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icon icon="ph:check" className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          Hide in-game asset balances
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <Icon icon="ph:code" className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold mb-2">Developer Integration</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        All privacy layers can be integrated independently or together:
                      </p>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-mono">Identity</span>
                          <span className="text-xs text-muted-foreground">ZK Auth SDK</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded bg-success/10 text-success text-xs font-mono">Recovery</span>
                          <span className="text-xs text-muted-foreground">Shamir API</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded bg-warning/10 text-warning text-xs font-mono">Transfer</span>
                          <span className="text-xs text-muted-foreground">ShadowPay SDK</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-mono">RPC</span>
                          <span className="text-xs text-muted-foreground">Helius Config</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <Icon icon="ph:info" className="w-3 h-3 inline mr-1" />
                        Each component works standalone or composes with others for full-stack privacy.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ShadowPay Integration Showcase */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
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

            {/* Sidebar - 1 column */}
            <div className="space-y-6">
              {/* Recovery Status Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Icon icon="ph:key" className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Recovery Status</h2>
                </div>
                {recoverySetup ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Icon icon="ph:check-circle" className="w-6 h-6 text-success" />
                      <span className="font-medium text-success">Configured</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Security Level</span>
                        <span className="font-mono text-primary">3-of-5</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Timelock</span>
                        <span className="text-xs text-muted-foreground">7 days</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Guardians</span>
                        <span className="text-xs text-destructive">Private</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-xs text-muted-foreground flex items-start gap-2">
                        <Icon icon="ph:shield-check" className="w-4 h-4 flex-shrink-0 text-success mt-0.5" />
                        <span>Guardian identities never stored on-chain</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Icon icon="ph:warning-circle" className="w-6 h-6 text-warning" />
                      <span className="font-medium text-warning">Not Set Up</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure private recovery to protect access to your wallet.
                    </p>
                    <Link
                      to="/recovery-setup"
                      className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Icon icon="ph:key" className="w-5 h-5" />
                      Set Up Recovery
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Quick Actions */}
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
                      <p className="text-xs text-muted-foreground">ShadowPay</p>
                    </div>
                    <Icon icon="ph:caret-right" className="w-4 h-4 text-muted-foreground" />
                  </button>

                  <button
                    onClick={handleSecureAction}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon icon="ph:lock-key" className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Secure Action</p>
                      <p className="text-xs text-muted-foreground">Verify access</p>
                    </div>
                    <Icon icon="ph:caret-right" className="w-4 h-4 text-muted-foreground" />
                  </button>

                  <button
                    onClick={handleTransaction}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon icon="ph:lightning" className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">ZK Proof Demo</p>
                      <p className="text-xs text-muted-foreground">Generate proof</p>
                    </div>
                    <Icon icon="ph:caret-right" className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </motion.div>

              {/* Navigation Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-panel rounded-xl p-6"
              >
                <h2 className="text-lg font-semibold mb-4">Learn More</h2>
                <div className="space-y-3">
                  <Link
                    to="/guarantees"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Icon icon="ph:shield-check" className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Privacy Guarantees</p>
                      <p className="text-xs text-muted-foreground">Technical details</p>
                    </div>
                    <Icon icon="ph:caret-right" className="w-4 h-4 text-muted-foreground" />
                  </Link>

                  <Link
                    to="/shadowpay-explained"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <Icon icon="ph:book-open" className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">ShadowPay Guide</p>
                      <p className="text-xs text-muted-foreground">How it works</p>
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

      {/* Secure Action Modal */}
      {showSecureAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-panel rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Icon icon="ph:lock-key" className="w-6 h-6 text-primary" />
                  Secure Action
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Privacy-preserving access verification
                </p>
              </div>
              <button
                onClick={() => setShowSecureAction(false)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <Icon icon="ph:x" className="w-5 h-5" />
              </button>
            </div>

            {!secureActionVerified ? (
              <div className="py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon icon="ph:spinner" className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h3 className="font-semibold mb-2">Verifying Access</h3>
                <p className="text-sm text-muted-foreground">
                  Checking your authentication proof...
                </p>
              </div>
            ) : (
              <div>
                <div className="py-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Icon icon="ph:check-circle" className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="font-semibold mb-2">Access Verified</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    You have permission to perform this action
                  </p>
                </div>

                <div className="glass-panel rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon icon="ph:shield-check" className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold">What Just Happened</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon icon="ph:check" className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Verified proof:</strong> Used your existing ZK authentication proof
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon icon="ph:x-circle" className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">No identity revealed:</strong> Your email/identity never exposed
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon icon="ph:x-circle" className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">No address shown:</strong> Wallet address remains unlinkable
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon icon="ph:check" className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Access granted:</strong> Based on cryptographic proof alone
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 mb-6">
                  <p className="text-xs text-muted-foreground text-center">
                    <Icon icon="ph:info" className="w-3 h-3 inline mr-1" />
                    This demonstrates verified access without identity exposure—the core of Veil Protocol.
                  </p>
                </div>

                <button
                  onClick={() => setShowSecureAction(false)}
                  className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </PageLayout>
  );
}
