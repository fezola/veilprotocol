import { Header } from "@/components/layout/Header";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { StakingDemoModal } from "@/components/demos/StakingDemoModal";

const codeExamples = [
  {
    language: "typescript",
    label: "TypeScript",
    icon: "logos:typescript-icon",
    code: `import { PrivateStakingClient } from '@veil-protocol/sdk/staking';

const staking = new PrivateStakingClient(connection, encryptionKey);

// Create private stake (amount hidden)
const { commitment, secret } = await staking.stake(
  validatorPubkey,
  100,  // SOL amount - encrypted!
  signTransaction
);

// Check rewards (only you can see)
const rewards = await staking.getRewards(commitment, secret);
console.log('Rewards:', rewards.amount, 'SOL');

// Withdraw with ZK proof
await staking.withdraw(commitment, secret, signTransaction);`
  },
  {
    language: "rust",
    label: "Rust",
    icon: "logos:rust",
    code: `use veil_protocol::staking::PrivateStakingClient;

let staking = PrivateStakingClient::new(&connection, &encryption_key);

// Create private stake (amount hidden)
let (commitment, secret) = staking.stake(
    &validator_pubkey,
    100,  // SOL amount - encrypted!
    &signer,
).await?;

// Check rewards (only you can see)
let rewards = staking.get_rewards(&commitment, &secret).await?;
println!("Rewards: {} SOL", rewards.amount);

// Withdraw with ZK proof
staking.withdraw(&commitment, &secret, &signer).await?;`
  },
  {
    language: "python",
    label: "Python",
    icon: "logos:python",
    code: `from veil_protocol.staking import PrivateStakingClient

staking = PrivateStakingClient(connection, encryption_key)

# Create private stake (amount hidden)
commitment, secret = await staking.stake(
    validator_pubkey,
    100,  # SOL amount - encrypted!
    sign_transaction
)

# Check rewards (only you can see)
rewards = await staking.get_rewards(commitment, secret)
print(f"Rewards: {rewards.amount} SOL")

# Withdraw with ZK proof
await staking.withdraw(commitment, secret, sign_transaction)`
  }
];

export default function FeatureStaking() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Icon icon="ph:coins" className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Private Staking</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stake your SOL and earn rewards without revealing your stake amount or earnings.
            </p>
          </motion.div>

          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Why Private Staking Matters</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Icon icon="ph:warning" className="w-5 h-5 text-destructive mt-1" />
                  <div>
                    <h3 className="font-medium text-destructive">The Problem</h3>
                    <p className="text-sm text-muted-foreground">Public staking exposes your holdings. Whales become targets for social engineering, phishing, and even physical threats.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Icon icon="ph:shield-check" className="w-5 h-5 text-success mt-1" />
                  <div>
                    <h3 className="font-medium text-success">The Solution</h3>
                    <p className="text-sm text-muted-foreground">Pedersen commitments hide your stake amount. Only you can see your balance and rewards.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <div className="space-y-6">
              {[
                { step: "1", title: "Create Commitment", desc: "Your stake amount is encrypted using Pedersen commitments. Only a hash goes on-chain." },
                { step: "2", title: "Deposit to Pool", desc: "Funds are deposited to a staking pool vault. Validators can't see individual stake amounts." },
                { step: "3", title: "Accrue Rewards", desc: "Rewards accumulate privately. Your earnings are hidden from public view." },
                { step: "4", title: "Withdraw Privately", desc: "Use a ZK proof to withdraw. Proves ownership without revealing stake history." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">SDK Usage</h2>
            <CodeBlock examples={codeExamples} title="Private Staking" />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: "ph:eye-slash", title: "Hidden Amounts", desc: "Stake size is encrypted" },
              { icon: "ph:chart-line-up", title: "Private Rewards", desc: "Earnings stay hidden" },
              { icon: "ph:shield-check", title: "ZK Withdrawals", desc: "Prove ownership privately" },
            ].map((item, i) => (
              <div key={i} className="glass-panel rounded-xl p-6 text-center">
                <Icon icon={item.icon} className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowDemo(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
            >
              Try Private Staking Demo <Icon icon="ph:play" />
            </button>
          </div>
        </div>
      </main>

      <StakingDemoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />
    </div>
  );
}

