# Veil Protocol

**Privacy-preserving wallet infrastructure for Solana**

## Overview

Veil Protocol provides a comprehensive privacy layer for Solana applications, enabling:

- 🔐 **Private Identity** - Zero-knowledge proof-based wallet identity
- 🔄 **Social Recovery** - Time-locked recovery without exposing guardians
- 🗳️ **Private Voting** - Commit-reveal scheme for anonymous governance
- 👥 **Stealth Multisig** - Hidden signer identities with threshold signatures
- 💸 **Shielded Payments** - Private transfers via ShadowWire integration

## Program ID

**Devnet:** `5C1VaebPdHZYETnTL18cLJK2RexXmVVhkkYpnYHD5P4h`

[View on Solscan](https://solscan.io/account/5C1VaebPdHZYETnTL18cLJK2RexXmVVhkkYpnYHD5P4h?cluster=devnet)

## Architecture

### Native On-Chain Features (Veil Protocol)

These features are implemented directly in our Solana program:

| Feature | Status | Description |
|---------|--------|-------------|
| `initialize_commitment` | ✅ Live | Store privacy-preserving wallet identity |
| `submit_proof` | ✅ Live | Verify ZK proofs on-chain |
| `initiate_recovery` | ✅ Live | Start time-locked social recovery |
| `execute_recovery` | ✅ Live | Complete recovery after timelock |
| `cancel_recovery` | ✅ Live | Owner cancels recovery attempt |
| `create_proposal` | ✅ Live | Create private voting proposal |
| `cast_vote` | ✅ Live | Submit vote commitment (hidden choice) |
| `reveal_vote` | ✅ Live | Reveal vote after voting ends |
| `finalize_proposal` | ✅ Live | Tally votes and finalize |
| `create_multisig` | ✅ Live | Create stealth multisig vault |
| `create_multisig_proposal` | ✅ Live | Propose transaction for signing |
| `stealth_sign` | ✅ Live | Sign with hidden identity proof |
| `execute_multisig_proposal` | ✅ Live | Execute after threshold reached |

### External Integrations

| Feature | Provider | Description |
|---------|----------|-------------|
| Shielded Payments | ShadowWire | Private token transfers with amount hiding |
| Private Swaps | Jupiter + Privacy Layer | DEX integration with privacy |
| Token Privacy | Encrypted Token Accounts | Hide token balances |

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Use the SDK

```typescript
import {
  initializeCommitment,
  createProposal,
  castVote,
  createMultisig,
  stealthSign
} from './lib/solana';

// Initialize private identity
const commitment = new Uint8Array(32); // Your ZK commitment
await initializeCommitment(wallet, commitment);

// Create private voting proposal
await createProposal(wallet, proposalId, metadataHash, votingEnds, revealEnds);

// Cast hidden vote
const secret = generateVoteSecret();
const commitment = await createVoteCommitment(true, secret); // true = yes vote
await castVote(wallet, proposalPDA, commitment);

// Create stealth multisig (2-of-3)
const signerCommitments = [commitment1, commitment2, commitment3];
await createMultisig(wallet, vaultId, 2, signerCommitments);
```

## Project Structure

```
aegis-shield/
├── programs/veil-protocol/    # Solana program (Rust/Anchor)
│   └── src/lib.rs             # All on-chain instructions
├── src/
│   ├── lib/solana.ts          # TypeScript SDK for program interaction
│   ├── pages/                 # React pages (Demo, Features, etc.)
│   └── components/            # UI components
├── packages/
│   └── sdk/                   # @veil-protocol/sdk npm package
├── target/idl/                # Generated IDL from Anchor
└── Anchor.toml                # Anchor configuration
```

## Technologies

- **Blockchain:** Solana (Devnet)
- **Smart Contracts:** Anchor Framework 0.32.1
- **Frontend:** React + Vite + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Wallet:** Solana Wallet Adapter
- **Cryptography:** ZK proofs, Poseidon hash, commit-reveal schemes

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
