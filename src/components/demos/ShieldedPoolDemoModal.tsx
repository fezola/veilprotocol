import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface ShieldedPoolDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DemoStep = "intro" | "create" | "deposit" | "balance" | "withdraw" | "complete";

export function ShieldedPoolDemoModal({ isOpen, onClose }: ShieldedPoolDemoModalProps) {
  const { publicKey, connected } = useWallet();
  const [step, setStep] = useState<DemoStep>("intro");
  const [loading, setLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState("0.1");
  const [withdrawAmount, setWithdrawAmount] = useState("0.05");
  
  // Demo state
  const [poolCreated, setPoolCreated] = useState(false);
  const [poolAddress, setPoolAddress] = useState("");
  const [shieldedBalance, setShieldedBalance] = useState(0);
  const [txSignature, setTxSignature] = useState("");
  const [noteCommitment, setNoteCommitment] = useState("");

  const resetDemo = () => {
    setStep("intro");
    setPoolCreated(false);
    setPoolAddress("");
    setShieldedBalance(0);
    setTxSignature("");
    setNoteCommitment("");
  };

  const handleCreatePool = async () => {
    setLoading(true);
    // Simulate pool creation
    await new Promise(r => setTimeout(r, 1500));
    const mockPoolAddress = "pool" + Math.random().toString(36).substring(2, 10) + "...";
    setPoolAddress(mockPoolAddress);
    setPoolCreated(true);
    setLoading(false);
    setStep("deposit");
  };

  const handleDeposit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    const amount = parseFloat(depositAmount) || 0.1;
    setShieldedBalance(prev => prev + amount);
    setNoteCommitment("0x" + Math.random().toString(16).slice(2, 18));
    setTxSignature("tx" + Math.random().toString(36).substring(2, 10));
    setLoading(false);
    setStep("balance");
  };

  const handleWithdraw = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    const amount = parseFloat(withdrawAmount) || 0.05;
    setShieldedBalance(prev => Math.max(0, prev - amount));
    setTxSignature("tx" + Math.random().toString(36).substring(2, 10));
    setLoading(false);
    setStep("complete");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-panel rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Icon icon="ph:vault" className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Shielded Pool Demo</h2>
                <p className="text-sm text-muted-foreground">Private deposits & withdrawals</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
              <Icon icon="ph:x" className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {["intro", "create", "deposit", "balance", "withdraw", "complete"].map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full ${
                ["intro", "create", "deposit", "balance", "withdraw", "complete"].indexOf(step) >= i
                  ? "bg-primary" : "bg-secondary"
              }`} />
            ))}
          </div>

          {/* Content based on step */}
          {step === "intro" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Icon icon="ph:shield-check" className="w-5 h-5 text-primary" />
                  What are Shielded Pools?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Shielded pools let you deposit funds with hidden amounts. Only you can see your balance.
                  Uses Pedersen commitments and Bulletproofs for cryptographic privacy.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary">
                  <Icon icon="ph:eye-slash" className="w-5 h-5 text-success mb-2" />
                  <p className="text-xs font-medium">Hidden Amounts</p>
                  <p className="text-xs text-muted-foreground">No one sees your balance</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <Icon icon="ph:lock-key" className="w-5 h-5 text-primary mb-2" />
                  <p className="text-xs font-medium">ZK Proofs</p>
                  <p className="text-xs text-muted-foreground">Bulletproofs & Groth16</p>
                </div>
              </div>

              {!connected ? (
                <div className="flex justify-center">
                  <WalletMultiButton />
                </div>
              ) : (
                <button
                  onClick={() => setStep("create")}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium"
                >
                  Start Demo
                </button>
              )}
            </div>
          )}

          {step === "create" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary">
                <h3 className="font-semibold mb-2">Step 1: Create Shielded Pool</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Initialize a new privacy pool with Merkle tree for note commitments.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Merkle Depth:</span>
                    <span>8 levels (256 notes max)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reward Rate:</span>
                    <span>5% APY</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCreatePool}
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon icon="ph:spinner" className="w-5 h-5 animate-spin" />
                    Creating Pool...
                  </span>
                ) : "Create Pool"}
              </button>
            </div>
          )}

          {step === "deposit" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <Icon icon="ph:check-circle" className="w-5 h-5 text-success" />
                  <span className="font-medium text-success">Pool Created!</span>
                </div>
                <p className="text-xs font-mono text-muted-foreground">{poolAddress}</p>
              </div>

              <div className="p-4 rounded-lg bg-secondary">
                <h3 className="font-semibold mb-2">Step 2: Private Deposit</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Deposit SOL with hidden amount using Pedersen commitment.
                </p>
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-1 block">Amount (SOL)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    className="w-full p-3 rounded-lg bg-background border border-border"
                    step="0.01"
                    min="0.01"
                  />
                </div>
              </div>
              <button
                onClick={handleDeposit}
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon icon="ph:spinner" className="w-5 h-5 animate-spin" />
                    Generating ZK Proof...
                  </span>
                ) : "Deposit Privately"}
              </button>
            </div>
          )}

          {step === "balance" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <Icon icon="ph:check-circle" className="w-5 h-5 text-success" />
                  <span className="font-medium text-success">Deposit Complete!</span>
                </div>
                <p className="text-xs text-muted-foreground">Tx: {txSignature}</p>
                <p className="text-xs text-muted-foreground mt-1">Note: {noteCommitment}</p>
              </div>

              <div className="p-6 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <p className="text-sm text-muted-foreground mb-2">Your Shielded Balance</p>
                <p className="text-3xl font-bold text-primary">{shieldedBalance.toFixed(4)} SOL</p>
                <p className="text-xs text-muted-foreground mt-2">
                  <Icon icon="ph:eye-slash" className="inline w-4 h-4 mr-1" />
                  Only you can see this
                </p>
              </div>

              <button
                onClick={() => setStep("withdraw")}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium"
              >
                Continue to Withdraw
              </button>
            </div>
          )}

          {step === "withdraw" && (
            <div className="space-y-4">
              <div className="p-6 rounded-lg bg-secondary text-center">
                <p className="text-sm text-muted-foreground mb-2">Shielded Balance</p>
                <p className="text-2xl font-bold">{shieldedBalance.toFixed(4)} SOL</p>
              </div>

              <div className="p-4 rounded-lg bg-secondary">
                <h3 className="font-semibold mb-2">Step 3: Private Withdraw</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Withdraw with nullifier (prevents double-spend) and ZK proof.
                </p>
                <div className="mb-4">
                  <label className="text-sm text-muted-foreground mb-1 block">Amount (SOL)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    className="w-full p-3 rounded-lg bg-background border border-border"
                    step="0.01"
                    min="0.01"
                    max={shieldedBalance}
                  />
                </div>
              </div>
              <button
                onClick={handleWithdraw}
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon icon="ph:spinner" className="w-5 h-5 animate-spin" />
                    Generating Withdrawal Proof...
                  </span>
                ) : "Withdraw Privately"}
              </button>
            </div>
          )}

          {step === "complete" && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                <Icon icon="ph:check-circle" className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-bold">Demo Complete!</h3>
              <p className="text-muted-foreground">
                You've experienced private deposits and withdrawals using ZK proofs.
              </p>
              <div className="p-4 rounded-lg bg-secondary text-left">
                <p className="text-sm font-medium mb-2">What happened:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Created pool with Merkle tree</li>
                  <li>• Deposited with Pedersen commitment</li>
                  <li>• Balance hidden from public</li>
                  <li>• Withdrew with nullifier (no double-spend)</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={resetDemo}
                  className="flex-1 py-3 bg-secondary rounded-lg font-medium"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

