import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { CodeBlock } from "@/components/ui/CodeBlock";

interface StakingDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const codeExamples = [
  {
    language: "typescript",
    label: "TypeScript",
    icon: "logos:typescript-icon",
    code: `import { PrivateStakingClient } from '@veil-protocol/sdk/staking';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const staking = new PrivateStakingClient(connection, encryptionKey);

// Create stake commitment (amount hidden on-chain)
const { commitment, secret } = await staking.createStake(
  poolId,
  5 * LAMPORTS_PER_SOL,  // 5 SOL - encrypted!
  validatorPubkey,
  signTransaction
);

console.log('Stake commitment:', commitment);
// Output: 0x7b2f...a1c3 (hash - amount hidden)

// Claim rewards (amount also hidden)
await staking.claimRewards(poolId, rewardProof, signTransaction);

// Unstake after lockup (reveal stake details)
await staking.unstake(poolId, secret, signTransaction);`
  },
  {
    language: "rust",
    label: "Rust",
    icon: "logos:rust",
    code: `use veil_protocol::staking::PrivateStakingClient;
use solana_sdk::native_token::LAMPORTS_PER_SOL;

let staking = PrivateStakingClient::new(&connection, &encryption_key);

// Create private stake
let (commitment, secret) = staking.create_stake(
    &pool_id,
    5 * LAMPORTS_PER_SOL,  // Hidden on-chain
    &validator_pubkey,
    &signer,
).await?;

println!("Commitment: {}", commitment);

// Claim rewards
staking.claim_rewards(&pool_id, &reward_proof, &signer).await?;

// Unstake
staking.unstake(&pool_id, &secret, &signer).await?;`
  },
  {
    language: "python",
    label: "Python",
    icon: "logos:python",
    code: `from veil_protocol.staking import PrivateStakingClient
from solana.rpc.api import Client

connection = Client("https://api.devnet.solana.com")
staking = PrivateStakingClient(connection, encryption_key)

# Create private stake
commitment, secret = await staking.create_stake(
    pool_id=pool_id,
    amount=5_000_000_000,  # 5 SOL - encrypted!
    validator=validator_pubkey,
    signer=wallet
)

print(f"Stake commitment: {commitment}")

# Claim rewards
await staking.claim_rewards(pool_id, reward_proof, wallet)

# Unstake
await staking.unstake(pool_id, secret, wallet)`
  }
];

export function StakingDemoModal({ isOpen, onClose }: StakingDemoModalProps) {
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [stakeAmount, setStakeAmount] = useState<number>(1);
  const [commitment, setCommitment] = useState<string | null>(null);
  const [rewards, setRewards] = useState<number>(0);

  const runDemo = async () => {
    if (stakeAmount <= 0) return;
    setIsRunning(true);
    setStep(1);

    // Simulate commitment creation
    await new Promise(r => setTimeout(r, 1000));
    const mockCommitment = "0x" + Array.from({length: 16}, () => 
      Math.floor(Math.random() * 16).toString(16)).join('');
    setCommitment(mockCommitment);
    setStep(2);

    // Simulate staking
    await new Promise(r => setTimeout(r, 1500));
    setStep(3);

    // Simulate rewards accrual
    await new Promise(r => setTimeout(r, 1000));
    setRewards(stakeAmount * 0.05); // 5% APY simulation
    setStep(4);
    setIsRunning(false);
  };

  const reset = () => {
    setStep(0);
    setStakeAmount(1);
    setCommitment(null);
    setRewards(0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Icon icon="ph:coins" className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Private Staking Demo</h2>
                <p className="text-sm text-muted-foreground">Hidden stake amounts & rewards</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
              <Icon icon="ph:x" className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Interactive Demo */}
            <div className="glass-panel rounded-xl p-6">
              <h3 className="font-semibold mb-4">Try It: Stake Privately</h3>

              {step === 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Enter stake amount (will be hidden on-chain):</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground mb-1 block">Amount (SOL)</label>
                      <input
                        type="number"
                        min="0.1"
                        max="100"
                        step="0.1"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(parseFloat(e.target.value) || 0)}
                        className="w-full p-3 rounded-lg bg-secondary border border-border focus:border-primary outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground mb-1 block">Validator</label>
                      <div className="p-3 rounded-lg bg-secondary border border-border text-sm text-muted-foreground">
                        🔒 Hidden (commitment)
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2 text-sm">
                      <Icon icon="ph:shield-check" className="w-4 h-4 text-primary" />
                      <span>Your stake amount will be encrypted. Only you can see it.</span>
                    </div>
                  </div>
                  <button
                    onClick={runDemo}
                    disabled={stakeAmount <= 0}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
                  >
                    Stake Privately
                  </button>
                </div>
              )}

              {step >= 1 && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${step >= 1 ? "bg-success/10 border border-success/20" : "bg-secondary"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon icon={step > 1 ? "ph:check-circle" : "ph:spinner"} className={`w-5 h-5 ${step > 1 ? "text-success" : "text-primary animate-spin"}`} />
                      <span className="font-medium">Creating stake commitment...</span>
                    </div>
                    {commitment && <code className="text-xs text-muted-foreground">Commitment: {commitment}</code>}
                  </div>

                  {step >= 2 && (
                    <div className={`p-4 rounded-lg ${step >= 2 ? "bg-success/10 border border-success/20" : "bg-secondary"}`}>
                      <div className="flex items-center gap-2">
                        <Icon icon={step > 2 ? "ph:check-circle" : "ph:spinner"} className={`w-5 h-5 ${step > 2 ? "text-success" : "text-primary animate-spin"}`} />
                        <span className="font-medium">Depositing to pool vault...</span>
                      </div>
                    </div>
                  )}

                  {step >= 3 && (
                    <div className={`p-4 rounded-lg ${step >= 3 ? "bg-success/10 border border-success/20" : "bg-secondary"}`}>
                      <div className="flex items-center gap-2">
                        <Icon icon={step > 3 ? "ph:check-circle" : "ph:spinner"} className={`w-5 h-5 ${step > 3 ? "text-success" : "text-primary animate-spin"}`} />
                        <span className="font-medium">Accruing rewards...</span>
                      </div>
                    </div>
                  )}

                  {step >= 4 && (
                    <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon icon="ph:shield-check" className="w-5 h-5 text-success" />
                        <span className="font-medium text-success">Stake Active!</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="p-3 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Staked (hidden)</p>
                          <p className="font-mono font-bold">{stakeAmount} SOL</p>
                        </div>
                        <div className="p-3 rounded-lg bg-background/50">
                          <p className="text-xs text-muted-foreground">Rewards (hidden)</p>
                          <p className="font-mono font-bold text-success">+{rewards.toFixed(4)} SOL</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">
                        On-chain observers only see your commitment hash, not your actual stake amount or rewards.
                      </p>
                    </div>
                  )}

                  {step >= 4 && (
                    <button onClick={reset} className="w-full py-2 bg-secondary text-foreground rounded-lg">
                      Try Again
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Code Examples */}
            <div>
              <h3 className="font-semibold mb-4">Integration Code</h3>
              <CodeBlock examples={codeExamples} title="Private Staking" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

