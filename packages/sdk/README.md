# @veil-protocol/sdk

Complete privacy infrastructure SDK for Solana. Build privacy-first applications with ZK proofs, shielded balances, and private transactions.

## Installation

```bash
npm install @veil-protocol/sdk @solana/web3.js
```

## Features

| Module | Description | Cryptography |
|--------|-------------|--------------|
| **Identity** | ZK authentication, no PII on-chain | Poseidon hash |
| **Shielded** | Hidden balances & amounts | Pedersen commitments |
| **Recovery** | Social recovery with hidden guardians | Shamir secret sharing |
| **Transfer** | Private transactions | Commitment schemes |
| **DEX** | Dark pool swaps | Order book privacy |
| **Tokens** | Confidential token balances | Balance encryption |

## Quick Start

```typescript
import { VeilIdentity, ShieldedBalance, RecoveryManager } from '@veil-protocol/sdk';
import { Connection, Keypair } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.generate();

// 1. Create private identity (no email/password on-chain)
const identity = new VeilIdentity(connection);
const { commitment, proof } = await identity.register(wallet, 'secret-passphrase');

// 2. Shield your balance
const shielded = new ShieldedBalance(connection);
const hiddenBalance = shielded.createCommitment(1000000, wallet.publicKey);

// 3. Set up social recovery (guardians never know they're guardians)
const recovery = new RecoveryManager(connection);
const shares = await recovery.setupRecovery(wallet, [
  guardian1.publicKey,
  guardian2.publicKey,
  guardian3.publicKey,
], 2); // 2-of-3 threshold
```

## Modular Imports

```typescript
// Import only what you need
import { VeilIdentity } from '@veil-protocol/sdk/identity';
import { ShieldedBalance } from '@veil-protocol/sdk/shielded';
import { RecoveryManager } from '@veil-protocol/sdk/recovery';
import { PrivateTransfer } from '@veil-protocol/sdk/transfer';
import { DarkPool } from '@veil-protocol/sdk/dex';
import { ConfidentialToken } from '@veil-protocol/sdk/tokens';
```

## Privacy Guarantees

| What's Hidden | How |
|---------------|-----|
| Your identity | Poseidon hash of credentials |
| Account balances | Pedersen commitments |
| Recovery guardians | Shamir shares, guardians unaware |
| Transaction amounts | Commitment schemes |
| Voting choices | Commit-reveal pattern |

## Network Configuration

```typescript
// Devnet for development
const connection = new Connection('https://api.devnet.solana.com');

// Mainnet for production
const connection = new Connection('https://api.mainnet-beta.solana.com');

// With Helius RPC (recommended)
const connection = new Connection('https://devnet.helius-rpc.com/?api-key=YOUR_KEY');
```

## ShadowPay Integration

For mainnet private payments, use with [@radr/shadowwire](https://www.npmjs.com/package/@radr/shadowwire):

```typescript
import { ShadowWire } from '@radr/shadowwire';

// ShadowPay runs on mainnet for real private transfers
const shadowwire = new ShadowWire({
  rpc: 'https://api.mainnet-beta.solana.com',
});
```

## CLI Scaffolding

Create a new privacy-first project:

```bash
npx create-veil-app my-app
```

## API Reference

### VeilIdentity

```typescript
class VeilIdentity {
  register(wallet: Keypair, passphrase: string): Promise<{ commitment: Uint8Array, proof: Uint8Array }>;
  verify(commitment: Uint8Array, proof: Uint8Array): Promise<boolean>;
  generateProof(passphrase: string): Uint8Array;
}
```

### ShieldedBalance

```typescript
class ShieldedBalance {
  createCommitment(amount: number, owner: PublicKey): Commitment;
  verifyCommitment(commitment: Commitment, amount: number): boolean;
  addCommitments(a: Commitment, b: Commitment): Commitment;
}
```

### RecoveryManager

```typescript
class RecoveryManager {
  setupRecovery(wallet: Keypair, guardians: PublicKey[], threshold: number): Promise<Share[]>;
  initiateRecovery(guardianShares: Share[]): Promise<Keypair>;
}
```

## License

MIT © Veil Protocol

