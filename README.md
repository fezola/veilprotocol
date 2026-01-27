# Veil Protocol

**Privacy-preserving wallet infrastructure for Solana**

## Overview

Veil Protocol provides a comprehensive privacy layer for Solana applications, enabling:

- 🔐 **Private Identity** - Zero-knowledge proof-based wallet identity
- 🔄 **Social Recovery** - Time-locked recovery without exposing guardians
- 🗳️ **Private Voting** - Commit-reveal scheme for anonymous governance
- 👥 **Stealth Multisig** - Hidden signer identities with threshold signatures
- 💸 **Shielded Payments** - Private transfers via ShadowWire integration
- 🪙 **Private Staking** - Stake with hidden amounts using Pedersen commitments

## Privacy Capabilities

### What Aegis Shield Protects

> **Full privacy stack** powered by ShadowWire + Light Protocol integration.

- ✅ **Transaction amounts** - Hidden via Pedersen commitments and Bulletproofs range proofs
- ✅ **Wallet balances** - Shielded pools hide your holdings from public view
- ✅ **Identity linkage** - Prevents correlation between actions and real identity
- ✅ **Access flows** - Hides who approved what in multisig/voting
- ✅ **Recovery logic** - Guardians remain anonymous during social recovery
- ✅ **Stake amounts** - Hides how much you've staked (via Pedersen commitments)
- ✅ **Vote choices** - Your governance votes stay private until reveal phase
- ✅ **Token holdings** - Compressed tokens via Light Protocol hide balances

### What Remains Visible

> **Honesty builds trust.** We're clear about what this system is — and isn't.

- ⚠️ **Transaction existence** - Transactions are visible on Solana explorer (but amounts hidden)
- ⚠️ **Program interactions** - Which programs you interact with is visible
- ⚠️ **Wallet addresses** - Your public key is still visible (use stealth addresses for recipient privacy)
- ⚠️ **Compliance** - Identity can be revealed if legally required

### Philosophy

Aegis Shield is **comprehensive privacy infrastructure** for Solana. We protect transaction amounts, wallet balances, and identity metadata — the things that make users vulnerable to front-running, targeted attacks, and surveillance.

## npm Packages

| Package | Version | Description |
|---------|---------|-------------|
| [@veil-protocol/sdk](https://www.npmjs.com/package/@veil-protocol/sdk) | **0.3.0** | Privacy SDK with shielded pools, private deposits/withdrawals, ZK identity |
| [@veil-protocol/cli](https://www.npmjs.com/package/@veil-protocol/cli) | 0.2.1 | CLI for scaffolding privacy-first Solana projects |
| [create-veil-app](https://www.npmjs.com/package/create-veil-app) | 0.3.2 | Quick-start CLI to scaffold privacy-first Solana apps |

```bash
# Install SDK
npm install @veil-protocol/sdk

# Install CLI globally
npm install -g @veil-protocol/cli

# Or use npx for quick start
npx create-veil-app my-app
```

## Program ID

**Devnet:** `5C1VaebPdHZYETnTL18cLJK2RexXmVVhkkYpnYHD5P4h`

[View on Solscan](https://solscan.io/account/5C1VaebPdHZYETnTL18cLJK2RexXmVVhkkYpnYHD5P4h?cluster=devnet)

---

## Network Configuration (Devnet ↔ Mainnet)

Aegis Shield supports both **Solana Devnet** (for development/testing) and **Mainnet-beta** (for production).

### Quick Reference

| Environment | When to Use | SOL Cost | ShadowPay Privacy |
|-------------|-------------|----------|-------------------|
| **Devnet** | Development, testing, hackathons | Free (faucet) | ⚠️ Amounts visible |
| **Mainnet** | Production, real transactions | Real SOL | ✅ Full amount hiding |

> **Important:** ShadowWire's privacy features (Pedersen commitments, amount hiding) only work on **mainnet**. Devnet is for testing the transaction flow - amounts will be visible on Solscan.

### For Developers: Configure Your Network

**Step 1: Set Environment Variables**

```bash
# .env file

# === DEVNET (Development/Testing) ===
VITE_SOLANA_NETWORK=devnet
VITE_HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY

# === MAINNET (Production) ===
# VITE_SOLANA_NETWORK=mainnet-beta
# VITE_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

**Step 2: Get Free Devnet SOL**

```bash
# Using Solana CLI
solana airdrop 2 --url devnet

# Or visit: https://faucet.solana.com
```

**Step 3: Configure Your Wallet**

1. Open Phantom/Solflare wallet
2. Go to Settings → Developer Settings
3. Enable "Testnet Mode" or change network to "Devnet"
4. Your wallet address stays the same, but uses devnet SOL

### Moving from Devnet to Mainnet

When you're ready for production:

```bash
# 1. Update .env
VITE_SOLANA_NETWORK=mainnet-beta
VITE_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# 2. Restart your application
npm run dev

# 3. Switch wallet to Mainnet
# (Phantom: Settings → Developer Settings → Testnet Mode OFF)
```

### CLI: Specify Network During Init

```bash
# Create devnet project (default)
veil init my-app --network=devnet

# Create mainnet project
veil init my-app --network=mainnet-beta
```

### SDK: Network Configuration

```typescript
import { VeilAuth } from '@veil-protocol/sdk';

// Devnet (development)
const veilDev = new VeilAuth({
  network: 'devnet',
  rpcUrl: 'https://devnet.helius-rpc.com/?api-key=YOUR_KEY'
});

// Mainnet (production)
const veilProd = new VeilAuth({
  network: 'mainnet-beta',
  rpcUrl: 'https://mainnet.helius-rpc.com/?api-key=YOUR_KEY'
});
```

### veil.config.ts

```typescript
export default defineVeilConfig({
  project: {
    name: "my-app",
    network: "devnet",  // Change to "mainnet-beta" for production
  },
  // ... rest of config
});
```

### Checklist: Going to Production

- [ ] Update `VITE_SOLANA_NETWORK=mainnet-beta` in `.env`
- [ ] Update Helius RPC to mainnet endpoint
- [ ] Switch wallet from Devnet to Mainnet
- [ ] Fund wallet with real SOL
- [ ] Test all transactions with small amounts first
- [ ] Update any hardcoded program IDs if needed

> ⚠️ **Important:** Devnet and Mainnet are completely separate networks. Devnet SOL has no value and cannot be used on Mainnet.

---

## Features

### 🔐 Private Identity (ZK Auth)

Replace seed phrases with social login while maintaining self-custody.

- **Email/Social → Wallet**: Derive wallet keys from OAuth without exposing identity
- **ZK Proof Authentication**: Prove you own an identity without revealing it
- **Commitment-based**: Store identity commitments on-chain, not plaintext

```typescript
// Initialize private identity
const commitment = await generateIdentityCommitment(email, secret);
await initializeCommitment(wallet, commitment);
```

### 🔄 Social Recovery

Recover your wallet without exposing your guardians.

- **Time-locked**: 24-hour delay prevents instant takeover
- **Anonymous Guardians**: Guardian identities hidden via commitments
- **Threshold-based**: M-of-N guardians required to recover

```typescript
// Initiate recovery (starts 24h timelock)
await initiateRecovery(wallet, identityPDA, newOwnerPubkey);

// After timelock expires
await executeRecovery(wallet, identityPDA);
```

### 🗳️ Private Voting

DAO governance without vote buying or coercion.

- **Commit-Reveal**: Vote hidden during voting phase
- **ZK Verification**: Votes verified without revealing choice until reveal phase
- **Anti-coercion**: Can't prove how you voted to a third party

```typescript
// Cast hidden vote (choice encrypted)
const secret = generateVoteSecret();
const commitment = createVoteCommitment(true, secret); // true = yes
await castVote(wallet, proposalPDA, commitment);

// Reveal after voting ends
await revealVote(wallet, proposalPDA, true, secret);
```

### 👥 Stealth Multisig

Multi-signature wallets where signers remain anonymous.

- **Hidden Signers**: No one knows which addresses are signers
- **ZK Signatures**: Prove you're an authorized signer without revealing identity
- **Threshold Execution**: M-of-N signing with full anonymity

```typescript
// Create 2-of-3 stealth multisig
const signerCommitments = [commitment1, commitment2, commitment3];
await createMultisig(wallet, vaultId, 2, signerCommitments);

// Sign with hidden identity
await stealthSign(wallet, proposalPDA, signerProof);
```

### 🪙 Private Staking

Stake SOL with hidden amounts.

- **Hidden Amounts**: Stake amounts encrypted with Pedersen commitments
- **Bulletproofs**: Prove stake is within valid range without revealing amount
- **Private Rewards**: Only you can see your reward amounts

```typescript
// Stake with hidden amount
const { commitment, secret } = await stakePrivate(wallet, validatorPubkey, 100);
// On-chain: Only commitment visible, not "100 SOL"

// Claim rewards (amount private)
await claimStakingRewards(wallet, stakePoolPDA, commitment, secret);
```

### 💸 Shielded Payments (via ShadowWire)

Private token transfers with hidden amounts.

- **Amount Hiding**: Transfer amounts hidden via Pedersen commitments
- **Multi-token**: Works with SOL, USDC, and SPL tokens
- **Recipient Privacy**: Optional stealth addresses for recipients

### 🏦 Shielded Pools (Private Deposit/Withdrawal)

Create and manage privacy pools for shielded transactions.

- **Private Deposits**: Deposit funds with hidden amounts using Bulletproofs
- **Private Withdrawals**: Withdraw with nullifier-based double-spend protection
- **Note-based UTXO**: Similar to Zcash, each deposit creates a spendable note
- **Merkle Tree**: Notes stored in on-chain Merkle tree for membership proofs

```typescript
import { ShadowWireIntegration } from '@veil-protocol/sdk';

const shadowWire = new ShadowWireIntegration({ connection, encryptionKey });

// Create a shielded pool
const { poolAddress } = await shadowWire.createShieldedPool(
  wallet,
  poolId,
  500,  // 5% reward rate
  1,    // 1 epoch lockup
  signTransaction
);

// Private deposit (amount hidden on-chain)
const { noteCommitment } = await shadowWire.shieldDeposit(
  wallet,
  1.5,  // 1.5 SOL - hidden via Pedersen commitment!
  signTransaction,
  poolAddress
);

// Check shielded balance (only you can decrypt)
const balance = await shadowWire.getShieldedBalance(wallet, poolAddress);

// Private withdrawal (nullifier prevents double-spend)
await shadowWire.shieldWithdraw(
  wallet,
  1.0,  // Withdraw 1 SOL privately
  recipientWallet,
  signTransaction,
  poolAddress
);
```

---

## ShadowWire Integration

Veil Protocol extends [ShadowWire](https://shadowwire.xyz) (by RADR) to provide enhanced privacy features.

### ShadowWire ZK Proof Architecture

ShadowWire uses a client → backend → on-chain flow for private transfers:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SHADOWWIRE PRIVATE TRANSFER FLOW                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. CLIENT (Veil SDK)                                                   │
│  ────────────────────                                                   │
│  • Generate Bulletproofs range proof locally                            │
│    └── Proves amount in [0, 2^64) without revealing value               │
│  • Generate blinding factor for Pedersen commitment                     │
│  • Create stealth address for recipient (optional)                      │
│                                                                          │
│  2. BACKEND (ShadowWire)                                                │
│  ───────────────────────                                                │
│  • Receive: wallet, token, nonce, signature, plaintext amount           │
│  • Compute Pedersen commitment: C = g^amount * h^blinding_factor       │
│  • Aggregate individual Bulletproofs into batch proof                   │
│  • Encrypt sender/recipient metadata with NaCl sealed-box               │
│  • Prepare Solana instruction data                                      │
│  • Plaintext amount is ephemeral - used for commitment, then discarded  │
│                                                                          │
│  3. ON-CHAIN (Solana PDA Verifier)                                      │
│  ─────────────────────────────────                                      │
│  Submit: commitment + aggregated proof + encrypted data + nullifier     │
│  • Verify Bulletproofs proof against commitment                         │
│  • Check nullifier for double-spend protection                          │
│  • Update shielded pool state                                           │
│  • Release funds to mixing layer or recipient                           │
│                                                                          │
│  PRIVACY: Full unlinkability from mixing + encryption stack             │
└─────────────────────────────────────────────────────────────────────────┘
```

### How ShadowWire Works with Veil

ShadowWire provides the cryptographic primitives; Veil builds privacy applications on top:

| ShadowWire Provides | Veil Builds |
|---------------------|-------------|
| Pedersen Commitments | Private Voting (hidden votes) |
| Bulletproofs / Range Proofs | Private Staking (hidden amounts) |
| Stealth Addresses | Stealth Multisig (hidden signers) |
| Key Derivation | Private Identity (ZK auth) |
| Encrypted Messaging | Shielded Payments |

### How Veil Extends ShadowWire

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         VEIL PROTOCOL LAYER                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐         │
│  │ Private  │ │ Stealth  │ │ Private  │ │ Private  │ │   ZK   │         │
│  │ Voting   │ │ Multisig │ │ Staking  │ │ Payments │ │Identity│         │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘         │
│       └────────────┴────────────┴────────────┴───────────┘               │
│                              │                                           │
├──────────────────────────────┼───────────────────────────────────────────┤
│                              │                                           │
│  ┌───────────────────────────┴───────────────────────────────────────┐  │
│  │                      SHADOWWIRE SDK (RADR)                         │  │
│  │                                                                    │  │
│  │  • Bulletproofs Range Proofs   • Pedersen Commitments             │  │
│  │  • Poseidon Hash               • Stealth Addresses                │  │
│  │  • NaCl Encryption             • Key Derivation                   │  │
│  │  • Nullifier System            • Gasless Relayer Network          │  │
│  └───────────────────────────┬───────────────────────────────────────┘  │
│                              │                                           │
├──────────────────────────────┼───────────────────────────────────────────┤
│                              │                                           │
│  ┌───────────────────────────┴───────────────────────────────────────┐  │
│  │                    LIGHT PROTOCOL (ZK Compression)                 │  │
│  │                                                                    │  │
│  │  • Compressed Accounts (1000x cheaper state)                      │  │
│  │  • Compressed Tokens (private token holdings)                     │  │
│  │  • State Merkle Trees (26 levels, 2048 buffer)                   │  │
│  └───────────────────────────┬───────────────────────────────────────┘  │
│                              │                                           │
├──────────────────────────────┼───────────────────────────────────────────┤
│                              │                                           │
│  ┌───────────────────────────┴───────────────────────────────────────┐  │
│  │                       SOLANA BLOCKCHAIN                            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### ShadowPay Integration

ShadowPay is ShadowWire's private payment system. Veil integrates with it for:

| Feature | How Veil Uses ShadowPay |
|---------|------------------------|
| **Private Voting** | Vote deposit/rewards transferred privately |
| **Private Staking** | Stake and unstake with hidden amounts |
| **Stealth Multisig** | Treasury payments with hidden amounts |
| **Private Transfers** | General-purpose private SOL/token transfers |

**Enable in config:**
```typescript
// veil.config.ts
integrations: {
  shadowPay: true, // Enable private value transfers
  lightProtocol: true, // Enable ZK compression
}
```

---

## Light Protocol Integration

Veil Protocol uses [Light Protocol](https://lightprotocol.com) for ZK-compressed state management, reducing on-chain costs by up to 1000x.

### Why ZK Compression?

| Standard Accounts | Compressed Accounts |
|-------------------|---------------------|
| ~0.002 SOL rent per account | ~0.00003 SOL per compressed state |
| Full on-chain storage | State stored in Merkle trees |
| Transparent balances | Private token holdings via compressed tokens |
| High cost for privacy pools | Affordable shielded pool operations |

### How Veil Uses Light Protocol

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LIGHT PROTOCOL COMPRESSION FLOW                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PRIVACY POOLS (Shielded Deposits/Withdrawals)                          │
│  ─────────────────────────────────────────────                          │
│  • User deposits → creates compressed UTXO in state tree                │
│  • Withdrawal → nullifier prevents double-spend, new UTXO created       │
│  • Merkle proof verifies inclusion without revealing position           │
│                                                                          │
│  COMPRESSED TOKENS                                                       │
│  ─────────────────                                                       │
│  • SPL tokens wrapped as compressed tokens                              │
│  • Balances hidden in Merkle leaves                                     │
│  • Transfer proofs verify balance without revealing amount              │
│                                                                          │
│  STATE MERKLE TREE                                                       │
│  ─────────────────                                                       │
│  • 26 levels deep (67M+ leaves)                                         │
│  • 2048 changelog buffer for concurrent updates                         │
│  • Poseidon hash for ZK-friendly proofs                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Compressed Account Operations

```typescript
import { createRpc, LightSystemProgram } from "@lightprotocol/stateless.js";
import { createMint, mintTo, transfer } from "@lightprotocol/compressed-token";

// Initialize connection with compression support
const connection = createRpc(RPC_ENDPOINT, COMPRESSION_ENDPOINT);

// Create compressed token mint (1000x cheaper than SPL)
const { mint } = await createMint(connection, payer, authority, 9);

// Mint compressed tokens (private by default)
await mintTo(connection, payer, mint, destination, authority, amount);

// Transfer with ZK proof (amount hidden)
await transfer(connection, payer, mint, amount, owner, recipient);
```

---

## On-Chain Instructions

### Native Veil Protocol Instructions

| Instruction | Description |
|-------------|-------------|
| `initialize_commitment` | Store privacy-preserving wallet identity |
| `submit_proof` | Verify ZK proofs on-chain |
| `initiate_recovery` | Start time-locked social recovery |
| `execute_recovery` | Complete recovery after timelock |
| `cancel_recovery` | Owner cancels recovery attempt |
| `create_proposal` | Create private voting proposal |
| `cast_vote` | Submit vote commitment (hidden choice) |
| `reveal_vote` | Reveal vote after voting ends |
| `finalize_proposal` | Tally votes and finalize |
| `create_multisig` | Create stealth multisig vault |
| `create_multisig_proposal` | Propose transaction for signing |
| `stealth_sign` | Sign with hidden identity proof |
| `execute_multisig_proposal` | Execute after threshold reached |
| `create_stake_pool` | Create private staking pool |
| `stake_private` | Stake with hidden amount |
| `unstake` | Withdraw with ZK proof |
| `claim_rewards` | Claim staking rewards privately |

## Helius Integration

Veil uses [Helius](https://helius.xyz) as the recommended RPC provider for enhanced privacy.

### Why Helius?

```typescript
// src/lib/rpc.ts
// Privacy note:
// Using Helius RPC to avoid public polling and reduce metadata leakage.

const connection = new Connection(
  `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
);
```

| Public RPC Issues | Helius Benefits |
|-------------------|-----------------|
| Logs IP + wallet associations | Dedicated endpoints |
| Request patterns reveal behavior | Better privacy practices |
| Rate limiting exposes usage | No correlation between sessions |

### Setup

```bash
# Add to .env
VITE_HELIUS_API_KEY=your-api-key
```

---

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Use the Veil CLI

```bash
# Install CLI globally
npm install -g @veil-protocol/cli

# Create a new project
veil init my-app --helius --shadow-pay

# Interactive setup
cd my-app && npm install
```

### CLI Commands

| Command | Description |
|---------|-------------|
| `veil init <name>` | Initialize a new Veil project with privacy features |
| `veil info` | Show Veil Protocol information and features |
| `veil network` | Display network configuration help |
| `veil shadowwire` | Show ShadowWire ZK proof architecture details |
| `veil compression` | Show Light Protocol ZK compression info |
| `veil privacy-stack` | Display full privacy stack architecture diagram |

### Use the SDK

```typescript
import {
  initializeCommitment,
  createProposal,
  castVote,
  createMultisig,
  stealthSign,
  stakePrivate
} from '@veil-protocol/sdk';

// Initialize private identity
const commitment = await generateIdentityCommitment(email, secret);
await initializeCommitment(wallet, commitment);

// Create private voting proposal
await createProposal(wallet, proposalId, metadataHash, votingEnds, revealEnds);

// Cast hidden vote
const voteSecret = generateVoteSecret();
const voteCommitment = createVoteCommitment(true, voteSecret);
await castVote(wallet, proposalPDA, voteCommitment);

// Create stealth multisig (2-of-3)
const signerCommitments = [commitment1, commitment2, commitment3];
await createMultisig(wallet, vaultId, 2, signerCommitments);

// Private staking
const { stakeCommitment, secret } = await stakePrivate(wallet, validator, 100);
```

---

## Project Structure

```
aegis-shield/
├── programs/veil-protocol/    # Solana program (Rust/Anchor)
│   └── src/lib.rs             # All on-chain instructions
├── src/
│   ├── lib/
│   │   ├── solana.ts          # TypeScript SDK for program interaction
│   │   ├── rpc.ts             # Privacy-focused RPC abstraction (Helius)
│   │   ├── config.ts          # Veil configuration with integrations
│   │   └── staking.ts         # Private staking functions
│   ├── pages/                 # React pages (Demo, Features, etc.)
│   └── components/            # UI components
├── cli/                       # Veil CLI for project scaffolding
│   ├── src/index.ts           # CLI entry point
│   └── src/generators.ts      # Project template generators
├── packages/
│   └── sdk/                   # @veil-protocol/sdk npm package
├── target/idl/                # Generated IDL from Anchor
└── Anchor.toml                # Anchor configuration
```

## Technologies

### Core Stack
- **Blockchain:** Solana (Devnet → Mainnet ready)
- **Smart Contracts:** Anchor Framework 0.32.1
- **Frontend:** React + Vite + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Wallet:** Solana Wallet Adapter

### Privacy Cryptography
- **ZK Proofs:** Identity verification, vote verification
- **Poseidon Hash:** ZK-friendly hashing
- **Pedersen Commitments:** Amount hiding (staking, voting)
- **Bulletproofs:** Range proofs for stake amounts
- **Commit-Reveal:** Private voting scheme

### Integrations
- **[Helius](https://helius.xyz):** Privacy-focused RPC (reduces metadata leakage)
- **[ShadowWire/ShadowPay](https://shadowwire.xyz):** Private value transfers (RADR)
- **Jupiter:** DEX aggregation (with privacy layer)

---

## Development

### Build Program

```bash
anchor build
```

### Deploy to Devnet

```bash
anchor deploy --provider.cluster devnet
```

### Run Tests

```bash
anchor test
```

## License

MIT
