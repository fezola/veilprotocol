import { Header } from "@/components/layout/Header";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { CodeBlock } from "@/components/ui/CodeBlock";

// Code examples for Private Voting
const votingCodeExamples = [
  {
    language: "typescript",
    label: "TypeScript",
    icon: "logos:typescript-icon",
    code: `import { PrivateVotingClient, VoteChoice } from '@veil/sdk/voting';

const voting = new PrivateVotingClient(connection, encryptionKey);

// PHASE 1: Create encrypted vote commitment
const { commitment, secret } = await voting.createVote(
  proposalId,
  VoteChoice.YES,  // ← Your choice - HIDDEN on-chain!
  signTransaction
);
// On-chain: Only commitment hash visible (not YES/NO)

// PHASE 2: After voting ends, reveal your vote
await voting.revealVote(proposalId, secret, signTransaction);

// Results: Tally visible, individual votes still hidden
const results = await voting.getProposalResults(proposalId);
console.log('Yes:', results.yes, 'No:', results.no);`
  },
  {
    language: "rust",
    label: "Rust",
    icon: "logos:rust",
    code: `use veil_protocol::voting::{PrivateVotingClient, VoteChoice};

let voting = PrivateVotingClient::new(&connection, &encryption_key);

// Create encrypted vote
let (commitment, secret) = voting.create_vote(
    &proposal_id,
    VoteChoice::Yes,  // Hidden on-chain
    &signer,
).await?;

// Reveal phase
voting.reveal_vote(&proposal_id, &secret, &signer).await?;

// Get results (individual votes hidden)
let results = voting.get_proposal_results(&proposal_id).await?;`
  }
];

// Code examples for Private Staking
const stakingCodeExamples = [
  {
    language: "typescript",
    label: "TypeScript",
    icon: "logos:typescript-icon",
    code: `import { PrivateStakingClient } from '@veil/sdk/staking';

const staking = new PrivateStakingClient(connection, encryptionKey);

// Create private stake (amount HIDDEN on-chain)
const { commitment, secret } = await staking.stake(
  validatorPubkey,
  100,  // SOL amount - encrypted with Pedersen commitment!
  signTransaction
);
// On-chain: Only commitment hash visible (not 100 SOL)

// Check rewards (only you can decrypt)
const rewards = await staking.getRewards(commitment, secret);
console.log('Rewards:', rewards.amount, 'SOL');

// Withdraw with ZK proof (proves ownership without revealing stake)
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
    100,  // Hidden on-chain
    &signer,
).await?;

// Check rewards (only owner can see)
let rewards = staking.get_rewards(&commitment, &secret).await?;

// Withdraw with ZK proof
staking.withdraw(&commitment, &secret, &signer).await?;`
  }
];

// Code examples for Stealth Multisig
const multisigCodeExamples = [
  {
    language: "typescript",
    label: "TypeScript",
    icon: "logos:typescript-icon",
    code: `import { PrivateMultisig } from '@veil/sdk/multisig';

const multisig = new PrivateMultisig(connection, encryptionKey);

// Create stealth multisig (3-of-5, signers HIDDEN)
const { vaultAddress, signerCommitments } = await multisig.create({
  threshold: 3,
  signerPubkeys: [signer1, signer2, signer3, signer4, signer5],
  // ↑ Signers encrypted - only commitment hashes on-chain
});

// Sign without revealing identity
await multisig.stealthSign(
  vaultAddress,
  transactionToApprove,
  myPrivateSignerKey  // ← Never exposed on-chain!
);

// Execute when threshold reached (3 signatures)
// No one knows WHICH 3 signers approved
await multisig.execute(vaultAddress, transactionToApprove);`
  },
  {
    language: "rust",
    label: "Rust",
    icon: "logos:rust",
    code: `use veil_protocol::multisig::PrivateMultisig;

let multisig = PrivateMultisig::new(&connection, &encryption_key);

// Create stealth multisig (3-of-5, signers hidden)
let (vault_address, signer_commitments) = multisig.create(
    3,  // threshold
    &[signer1, signer2, signer3, signer4, signer5],
).await?;

// Sign without revealing identity
multisig.stealth_sign(
    &vault_address,
    &transaction_to_approve,
    &my_private_signer_key,
).await?;

// Execute when threshold reached
multisig.execute(&vault_address, &transaction_to_approve).await?;`
  }
];

export default function ShadowWire() {
  const [activeTab, setActiveTab] = useState<"voting" | "multisig" | "staking">("voting");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            {/* Clear Layer Distinction */}
            <div className="flex justify-center gap-4 mb-8">
              <div className="glass-panel rounded-xl px-4 py-3 border-2 border-primary">
                <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Privacy Layer</div>
                <div className="font-bold">Veil Protocol</div>
                <div className="text-xs text-muted-foreground">Identity, Voting, Multisig</div>
              </div>
              <div className="flex items-center">
                <Icon icon="ph:arrow-right" className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="glass-panel rounded-xl px-4 py-3 border-2 border-purple-500">
                <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">Transfer Layer</div>
                <div className="font-bold">ShadowWire</div>
                <div className="text-xs text-muted-foreground">Private Transfers</div>
              </div>
            </div>

            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
              <Icon icon="ph:lightning" className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Veil <span className="text-primary">+</span> ShadowWire
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              <strong className="text-primary">Veil</strong> provides privacy primitives (identity, voting, multisig).
              <strong className="text-purple-400"> ShadowWire</strong> handles private transfers.
              Together, they form a complete privacy stack.
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <a
                href="https://github.com/Radrdotfun/ShadowWire"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-purple-400 hover:underline"
              >
                <Icon icon="mdi:github" className="w-5 h-5" />
                ShadowWire (by Radr)
              </a>
              <span className="text-muted-foreground">•</span>
              <a
                href="https://www.npmjs.com/package/@veil-protocol/sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <Icon icon="simple-icons:npm" className="w-5 h-5" />
                @veil-protocol/sdk
              </a>
              <span className="text-muted-foreground">•</span>
              <Link to="/demo" className="inline-flex items-center gap-2 text-primary hover:underline">
                <Icon icon="ph:play" className="w-5 h-5" />
                Try Live Demo
              </Link>
            </div>
          </motion.div>

          {/* The Distinction */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* ShadowWire - External */}
            <div className="glass-panel rounded-2xl p-6 border-2 border-purple-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Icon icon="ph:paper-plane-tilt" className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">External Protocol</div>
                  <h3 className="text-xl font-bold">ShadowWire</h3>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Built by <strong>Radr</strong>. Provides the <strong>transfer layer</strong> for private SOL/token movements.
                We <em>integrate</em> it — we didn't build it.
              </p>
              <div className="space-y-2">
                {[
                  { icon: "ph:paper-plane-tilt", text: "Private SOL/Token Transfers" },
                  { icon: "ph:eye-slash", text: "Sender Anonymity" },
                  { icon: "ph:lock-key", text: "Encrypted Amounts" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Icon icon={item.icon} className="w-4 h-4 text-purple-400" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-mono bg-purple-500/10 px-3 py-1.5 rounded-lg">
                <Icon icon="simple-icons:npm" className="w-4 h-4 text-red-500" />
                @radr/shadowwire
              </div>
            </div>

            {/* Veil - Your Project */}
            <div className="glass-panel rounded-2xl p-6 border-2 border-primary/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon icon="ph:shield-check" className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-primary uppercase tracking-wider">Our Project</div>
                  <h3 className="text-xl font-bold">Veil Protocol</h3>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Built by <strong>us</strong>. Provides the <strong>privacy layer</strong> — everything <em>except</em> transfers.
                This is what we're submitting for the hackathon.
              </p>
              <div className="space-y-2">
                {[
                  { icon: "ph:fingerprint", text: "ZK Identity (email → wallet)" },
                  { icon: "ph:check-square", text: "Private Voting (commit-reveal)" },
                  { icon: "ph:users-three", text: "Stealth Multisig (hidden signers)" },
                  { icon: "ph:coin", text: "Private Staking (hidden amounts)" },
                  { icon: "ph:key", text: "Social Recovery (Shamir shares)" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Icon icon={item.icon} className="w-4 h-4 text-primary" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 inline-flex items-center gap-2 text-xs font-mono bg-primary/10 px-3 py-1.5 rounded-lg">
                <Icon icon="simple-icons:npm" className="w-4 h-4 text-red-500" />
                @veil-protocol/sdk
              </div>
            </div>
          </div>

          {/* What Veil Builds ON TOP of ShadowWire */}
          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Icon icon="ph:code" className="text-primary" /> What Veil Adds (Our Extensions)
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  title: "Private Voting",
                  desc: "Anonymous commit-reveal voting for DAOs",
                  icon: "ph:check-square",
                  color: "text-success",
                  tab: "voting" as const
                },
                {
                  title: "Stealth Multisig",
                  desc: "M-of-N signing with hidden identities",
                  icon: "ph:users-three",
                  color: "text-primary",
                  tab: "multisig" as const
                },
                {
                  title: "Private Staking",
                  desc: "Stake with hidden amounts & validators",
                  icon: "ph:coin",
                  color: "text-warning",
                  tab: "staking" as const
                },
              ].map((item, i) => (
                <div key={i} className="border border-border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => setActiveTab(item.tab)}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center`}>
                      <Icon icon={item.icon} className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deep Dive Tabs */}
          <div className="glass-panel rounded-2xl p-8 mb-8">
            <div className="flex gap-4 mb-6 border-b border-border pb-4">
              <button
                onClick={() => setActiveTab("voting")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "voting" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon icon="ph:check-square" className="inline w-4 h-4 mr-2" />
                Private Voting
              </button>
              <button
                onClick={() => setActiveTab("multisig")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "multisig" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon icon="ph:users-three" className="inline w-4 h-4 mr-2" />
                Stealth Multisig
              </button>
              <button
                onClick={() => setActiveTab("staking")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "staking" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon icon="ph:coin" className="inline w-4 h-4 mr-2" />
                Private Staking
              </button>
            </div>

            {activeTab === "voting" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Icon icon="ph:check-square" className="text-success" />
                    Private Voting: How It Works
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Traditional on-chain voting exposes your vote choice to everyone. Our extension uses ShadowWire's
                    commitment schemes to enable <strong>commit-reveal voting</strong> where your vote remains hidden
                    until the reveal phase.
                  </p>
                </div>

                {/* Voting Flow Diagram */}
                <div className="bg-secondary/50 rounded-xl p-4 overflow-x-auto border border-border">
                  <pre className="text-sm text-foreground font-mono">
{`┌─────────────────────────────────────────────────────────────────────────┐
│                        PRIVATE VOTING FLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PHASE 1: COMMIT                          PHASE 2: REVEAL               │
│  ─────────────────                        ───────────────               │
│                                                                          │
│  User chooses: YES ──┐                    User reveals: secret ──┐      │
│                      │                                           │      │
│  ┌───────────────────▼──────────────┐    ┌──────────────────────▼────┐ │
│  │  commitment = hash(vote + secret) │    │  Verify: hash(vote+secret) │ │
│  │                                   │    │  matches stored commitment │ │
│  │  ShadowWire Poseidon Hash         │    │                            │ │
│  └───────────────────┬──────────────┘    └──────────────────────┬────┘ │
│                      │                                           │      │
│                      ▼                                           ▼      │
│  ┌────────────────────────────────┐    ┌─────────────────────────────┐ │
│  │  ON-CHAIN: Only commitment     │    │  ON-CHAIN: Vote counted     │ │
│  │  stored (vote is HIDDEN)       │    │  Individual votes HIDDEN    │ │
│  └────────────────────────────────┘    └─────────────────────────────┘ │
│                                                                          │
│  PRIVACY GUARANTEES:                                                     │
│  ✓ Vote choice hidden during voting period (no influence)               │
│  ✓ Cannot change vote after committing (binding)                        │
│  ✓ Final tally visible, individual votes hidden                         │
│  ✓ No vote buying possible (can't prove your vote)                      │
└─────────────────────────────────────────────────────────────────────────┘`}
                  </pre>
                </div>

                {/* How We Use ShadowWire */}
                <div className="border border-border rounded-xl p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon icon="ph:puzzle-piece" className="text-primary" />
                    ShadowWire Primitives Used
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground uppercase mb-1">Poseidon Hash</div>
                      <p className="text-sm">ZK-friendly hash for creating vote commitments</p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground uppercase mb-1">Commitment Scheme</div>
                      <p className="text-sm">Binding commitment that can't be changed after submission</p>
                    </div>
                  </div>
                </div>

                {/* Code Example */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon icon="ph:code" className="text-primary" />
                    SDK Usage
                  </h4>
                  <CodeBlock examples={votingCodeExamples} title="Private Voting" />
                </div>
              </div>
            )}

            {activeTab === "multisig" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Icon icon="ph:users-three" className="text-primary" />
                    Stealth Multisig: How It Works
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Traditional multisigs expose all signer addresses on-chain - making them targets for social engineering.
                    Our extension uses ShadowWire's key derivation to create <strong>stealth signatures</strong> where
                    signer identities are never exposed.
                  </p>
                </div>

                {/* Multisig Flow Diagram */}
                <div className="bg-secondary/50 rounded-xl p-4 overflow-x-auto border border-border">
                  <pre className="text-sm text-foreground font-mono">
{`┌─────────────────────────────────────────────────────────────────────────┐
│                       STEALTH MULTISIG FLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  TRADITIONAL MULTISIG (EXPOSED):          VEIL STEALTH MULTISIG:        │
│  ────────────────────────────────          ─────────────────────        │
│                                                                          │
│  ┌─────────────────────────────┐          ┌────────────────────────────┐│
│  │  Vault: 3-of-5 Multisig     │          │  Vault: 3-of-5 Multisig    ││
│  │                             │          │                            ││
│  │  Signers (PUBLIC):          │          │  Signers (HIDDEN):         ││
│  │  • Alice.sol  ← TARGET!     │          │  • commitment_1 (hash)     ││
│  │  • Bob.sol    ← TARGET!     │          │  • commitment_2 (hash)     ││
│  │  • Carol.sol  ← TARGET!     │          │  • commitment_3 (hash)     ││
│  │  • Dave.sol   ← TARGET!     │          │  • commitment_4 (hash)     ││
│  │  • Eve.sol    ← TARGET!     │          │  • commitment_5 (hash)     ││
│  └─────────────────────────────┘          └────────────────────────────┘│
│                                                                          │
│  SIGNING PROCESS:                                                        │
│  ────────────────                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  1. Signer creates ZK proof: "I am an authorized signer"            ││
│  │     └── Proves knowledge of private key matching a commitment       ││
│  │     └── Does NOT reveal which commitment or identity                ││
│  │                                                                      ││
│  │  2. Signature submitted with proof (identity hidden)                ││
│  │                                                                      ││
│  │  3. When threshold reached (3-of-5), transaction executes           ││
│  │     └── No one knows WHICH 3 signers approved                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  PRIVACY GUARANTEES:                                                     │
│  ✓ Signer addresses never exposed on-chain                              │
│  ✓ Can't target individual signers for social engineering               │
│  ✓ Even co-signers don't know each other's identities                   │
│  ✓ Transaction history doesn't link to signers                          │
└─────────────────────────────────────────────────────────────────────────┘`}
                  </pre>
                </div>

                {/* How We Use ShadowWire */}
                <div className="border border-border rounded-xl p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon icon="ph:puzzle-piece" className="text-primary" />
                    ShadowWire Primitives Used
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground uppercase mb-1">Key Derivation</div>
                      <p className="text-sm">Deterministic commitment from signer keys</p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground uppercase mb-1">Stealth Addresses</div>
                      <p className="text-sm">One-time addresses for each signature</p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground uppercase mb-1">ZK Proofs</div>
                      <p className="text-sm">Prove authorization without revealing identity</p>
                    </div>
                  </div>
                </div>

                {/* Code Example */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon icon="ph:code" className="text-primary" />
                    SDK Usage
                  </h4>
                  <CodeBlock examples={multisigCodeExamples} title="Stealth Multisig" />
                </div>
              </div>
            )}

            {activeTab === "staking" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Icon icon="ph:coin" className="text-warning" />
                    Private Staking: How It Works
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Traditional staking reveals your stake amount and validator choice to everyone. Our extension uses
                    ShadowWire's <strong>Pedersen commitments</strong> and <strong>range proofs</strong> to enable staking
                    where your stake amount remains hidden while still earning rewards.
                  </p>
                </div>

                {/* Flow Diagram */}
                <div className="bg-secondary/30 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-muted-foreground whitespace-pre">
{`┌─────────────────────────────────────────────────────────────────────────┐
│                        PRIVATE STAKING FLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. STAKE (Hidden Amount)                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  User Input: stake(validator, 100 SOL)                              ││
│  │                        ↓                                            ││
│  │  SDK generates: Pedersen commitment = g^amount * h^blinding         ││
│  │                        ↓                                            ││
│  │  On-chain: Only commitment hash stored (not "100 SOL")              ││
│  │            Range proof proves: 0 < amount < MAX_STAKE               ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  2. REWARDS (Proportional but Hidden)                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  Validator distributes rewards proportionally                       ││
│  │  BUT only commitment holders can decrypt their share                ││
│  │  └── Your rewards are visible only to you                           ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  3. WITHDRAW (ZK Proof of Ownership)                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  ZK proof proves: "I know the secret behind this commitment"        ││
│  │  └── Funds released without revealing original stake amount         ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  PRIVACY GUARANTEES:                                                     │
│  ✓ Stake amounts hidden (competitors can't see your position)          │
│  ✓ Validator choice can be hidden (optional stealth delegation)        │
│  ✓ Reward amounts only visible to you                                  │
│  ✓ Withdrawal doesn't link to original stake                           │
└─────────────────────────────────────────────────────────────────────────┘`}
                  </pre>
                </div>

                {/* How We Use ShadowWire */}
                <div className="border border-border rounded-xl p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon icon="ph:puzzle-piece" className="text-warning" />
                    ShadowWire Primitives Used
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground uppercase mb-1">Pedersen Commitments</div>
                      <p className="text-sm">Hide stake amount while allowing arithmetic</p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground uppercase mb-1">Bulletproofs</div>
                      <p className="text-sm">Prove stake is within valid range</p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground uppercase mb-1">ZK Proofs</div>
                      <p className="text-sm">Prove ownership for withdrawals</p>
                    </div>
                  </div>
                </div>

                {/* Code Example */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon icon="ph:code" className="text-warning" />
                    SDK Usage
                  </h4>
                  <CodeBlock examples={stakingCodeExamples} title="Private Staking" />
                </div>
              </div>
            )}
          </div>

          {/* Comparison: What We Added */}
          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Icon icon="ph:scales" className="text-primary" /> ShadowWire vs Veil Extension
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-left py-3 px-4">ShadowWire (Base)</th>
                    <th className="text-left py-3 px-4">Veil Extension</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium">Voting</td>
                    <td className="py-3 px-4 text-muted-foreground">Commitment schemes only</td>
                    <td className="py-3 px-4 text-success">Full commit-reveal voting with ZK verification</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium">Multisig</td>
                    <td className="py-3 px-4 text-muted-foreground">Key derivation primitives</td>
                    <td className="py-3 px-4 text-success">M-of-N stealth signing with hidden identities</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium">Staking</td>
                    <td className="py-3 px-4 text-muted-foreground">N/A (not supported)</td>
                    <td className="py-3 px-4 text-success">Hidden stake amounts with Pedersen commitments</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium">Identity</td>
                    <td className="py-3 px-4 text-muted-foreground">Basic encryption</td>
                    <td className="py-3 px-4 text-success">ZK auth with email/social → wallet derivation</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium">Transfers</td>
                    <td className="py-3 px-4 text-muted-foreground">Encrypted messaging</td>
                    <td className="py-3 px-4 text-success">Pedersen commitments for hidden amounts</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Recovery</td>
                    <td className="py-3 px-4 text-muted-foreground">N/A</td>
                    <td className="py-3 px-4 text-success">Shamir shares + timelock guardians</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Technical Architecture */}
          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Icon icon="ph:tree-structure" className="text-primary" /> Technical Architecture
            </h2>
            <div className="bg-secondary/50 rounded-xl p-4 overflow-x-auto border border-border">
              <pre className="text-sm text-foreground font-mono">
{`┌───────────────────────────────────────────────────────────────────────────────────┐
│                                 VEIL PROTOCOL                                      │
├───────────────────────────────────────────────────────────────────────────────────┤
│                                                                                    │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐             │
│ │  PRIVATE  │ │  STEALTH  │ │ SHIELDED  │ │  PRIVATE  │ │    ZK     │             │
│ │  VOTING   │ │  MULTISIG │ │ TRANSFERS │ │  STAKING  │ │ IDENTITY  │             │
│ │           │ │           │ │           │ │           │ │           │             │
│ │Commit-rev.│ │Hidden sign│ │Hidden amt │ │Hidden stkd│ │Email→Wallet│            │
│ │ZK verified│ │M-of-N prf │ │Pedersen   │ │Bulletprfs │ │No seedphr │             │
│ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘             │
│       │             │             │             │             │                    │
│       └─────────────┴─────────────┴─────────────┴─────────────┘                    │
│                                    │                                               │
│  ┌─────────────────────────────────┴───────────────────────────────────────────┐  │
│  │                            VEIL SDK LAYER                                    │  │
│  │    @veil/sdk - identity, voting, multisig, transfer, staking, recovery       │  │
│  └─────────────────────────────────┬───────────────────────────────────────────┘  │
│                                    │                                               │
├────────────────────────────────────┼───────────────────────────────────────────────┤
│                                    │                                               │
│  ┌─────────────────────────────────┴───────────────────────────────────────────┐  │
│  │                         SHADOWWIRE SDK (RADR)                                │  │
│  │                                                                              │  │
│  │  • Poseidon Hash (ZK-friendly)    • Stealth Addresses    • Bulletproofs     │  │
│  │  • Commitment Schemes             • Encrypted Messaging  • Range Proofs     │  │
│  │  • Key Derivation                 • ZK Primitives                           │  │
│  └─────────────────────────────────┬───────────────────────────────────────────┘  │
│                                    │                                               │
├────────────────────────────────────┼───────────────────────────────────────────────┤
│                                    │                                               │
│  ┌─────────────────────────────────┴───────────────────────────────────────────┐  │
│  │                          SOLANA BLOCKCHAIN                                   │  │
│  │                      (Devnet → Mainnet ready)                                │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────┘`}
              </pre>
            </div>
          </div>

          {/* Try It */}
          <div className="glass-panel rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Try Our Extensions</h2>
            <p className="text-muted-foreground mb-6">
              See these privacy features in action with real devnet transactions
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Icon icon="ph:play" className="w-5 h-5" />
                Launch Demo
              </Link>
              <Link
                to="/sdk"
                className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <Icon icon="ph:code" className="w-5 h-5" />
                View SDK Docs
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

