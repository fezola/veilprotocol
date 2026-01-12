# Build With Veil - Developer Integration Guide

**Integrate privacy infrastructure into any Solana application**

---

## 🎯 Overview

Veil Protocol provides **modular privacy infrastructure** that can be integrated into any Solana dApp, DeFi protocol, wallet, DAO, or game. Each component works independently or composes with others for comprehensive privacy.

**Core Message:** *"Veil is infrastructure, not just an app. Build private products on top of our privacy stack."*

---

## 🏗️ Architecture - 4 Independent Layers

All layers can be used standalone or combined:

```
┌─────────────────────────────────────────┐
│  Identity Layer (ZK Proofs - Groth16)   │  ← Authentication without KYC
├─────────────────────────────────────────┤
│  Infrastructure (Helius Private RPC)    │  ← No metadata leakage
├─────────────────────────────────────────┤
│  Recovery Layer (Shamir + Timelock)     │  ← Guardian privacy
├─────────────────────────────────────────┤
│  Transfer Layer (ShadowPay SDK)         │  ← Amount hiding
└─────────────────────────────────────────┘
```

**Each layer operates independently but composes for full-stack privacy.**

---

## 📦 Integration Use Cases

### 1️⃣ DeFi Protocols

**Use Veil for:** Lending platforms, DEXs, yield farms, launchpads

**What You Can Build:**

✅ **Private User Verification**
- Verify user eligibility (e.g., accredited investor, whale) WITHOUT KYC exposure
- Use ZK proofs to prove criteria met without revealing identity
- Example: "Prove you hold >10k SOL without revealing wallet"

✅ **Institutional Account Recovery**
- Multi-sig wallets with private signer identities
- Shamir secret sharing (3-of-5 guardians)
- Guardians never revealed on-chain

✅ **Private Trading**
- Hide wallet balances during trades (prevent front-running)
- ShadowPay integration for confidential amounts
- No on-chain balance exposure

**Integration Points:**
```typescript
// Use Identity Layer
import { verifyZKProof } from '@veil/identity';

// Verify user meets criteria without KYC
const proof = await verifyZKProof({
  criterion: 'minBalance',
  threshold: 10000,
  // User proves balance without revealing exact amount
});

if (proof.valid) {
  // Grant access to protocol
}
```

**Real Examples:**
- **Lending Protocol:** Verify creditworthiness without exposing holdings
- **DEX:** Hide pre-trade balances to prevent MEV attacks
- **Launchpad:** Prove whitelist eligibility without public list

---

### 2️⃣ Wallet Applications

**Use Veil for:** Custodial wallets, browser extensions, mobile wallets

**What You Can Build:**

✅ **ZK-Based Login**
- No password databases (just commitment hashes)
- User proves knowledge of secret without revealing it
- No email/phone required

✅ **Social Recovery with Privacy**
- Guardian identities never stored on-chain
- Shamir secret sharing (user chooses threshold)
- Timelock + cancellation window

✅ **Private Transactions**
- ShadowPay SDK integration
- Hide amounts on-chain
- Pedersen commitments + Bulletproofs

**Integration Points:**
```typescript
// Use all 4 layers together
import { VeilWallet } from '@veil/sdk';

const wallet = new VeilWallet({
  identity: { zkAuth: true },           // Identity Layer
  rpc: { helius: HELIUS_KEY },          // Infrastructure Layer
  recovery: { guardians: 5, threshold: 3 }, // Recovery Layer
  privacy: { shadowPay: true }          // Transfer Layer
});

// Wallet now has full privacy stack
await wallet.login(); // ZK-based
await wallet.setupRecovery(guardianEmails); // Private guardians
await wallet.sendPrivate(recipient, amount); // Hidden amount
```

**Real Examples:**
- **Mobile Wallet:** Add social recovery without guardian exposure
- **Browser Extension:** ZK login without password storage
- **Custodial Wallet:** Institutional multi-sig with private signers

---

### 3️⃣ DAOs & Governance

**Use Veil for:** Token-gated communities, governance platforms, voting systems

**What You Can Build:**

✅ **Private Membership Verification**
- Prove DAO membership without revealing wallet
- ZK proof: "I hold governance token" (no amount shown)
- No public membership lists

✅ **Anonymous Voting**
- Prove voting eligibility without identity exposure
- Hide vote choice on-chain
- Prevent vote buying/coercion

✅ **Multi-Sig with Privacy**
- Treasury management with private signers
- Shamir recovery for lost keys
- No on-chain signer exposure

**Integration Points:**
```typescript
// Use Identity Layer for DAO access
import { proveDAOMembership } from '@veil/dao';

// User proves they hold governance token
const membershipProof = await proveDAOMembership({
  dao: 'myDAO',
  minTokens: 100, // Threshold
  // Proves user has ≥100 tokens without revealing exact amount
});

if (membershipProof.valid) {
  // Grant access to governance forum/voting
}
```

**Real Examples:**
- **Token-Gated Forum:** Verify membership without public member list
- **Governance Platform:** Anonymous voting with eligibility proofs
- **DAO Treasury:** Multi-sig with guardian privacy

---

### 4️⃣ Gaming & NFTs

**Use Veil for:** Web3 games, NFT platforms, metaverse apps

**What You Can Build:**

✅ **Private Account Recovery**
- Players recover accounts without email/phone
- Social recovery via in-game friends (guardians)
- No personal data stored

✅ **Hidden Asset Balances**
- Prove NFT ownership without revealing collection size
- Hide in-game currency balances
- Prevent targeting of "whales"

✅ **Gated Content Access**
- Verify NFT ownership for access without public lists
- ZK proof: "I own this NFT" (no wallet exposure)
- Private trait verification

**Integration Points:**
```typescript
// Use Identity + Recovery Layers for gaming
import { VeilGaming } from '@veil/gaming';

const gameAccount = new VeilGaming({
  playerId: userId,
  recovery: {
    guardians: ['friend1@game.com', 'friend2@game.com'],
    threshold: 2,
    // Guardians private, player can recover via friends
  }
});

// Prove NFT ownership for gated content
const nftProof = await gameAccount.proveOwnership({
  collection: 'rare-skins',
  // Proves ownership without revealing wallet
});
```

**Real Examples:**
- **Web3 Game:** Account recovery via guild members (private)
- **NFT Platform:** Prove ownership for exclusive access
- **Metaverse:** Hide asset balances to prevent targeting

---

## 🛠️ Developer Integration - Layer by Layer

### **Layer 1: Identity (ZK Auth)**

**What It Does:** Passwordless authentication with zero-knowledge proofs

**SDK:**
```bash
npm install @veil/identity
```

**Basic Usage:**
```typescript
import { ZKAuth } from '@veil/identity';

// Setup
const auth = new ZKAuth({
  curve: 'bn128',
  protocol: 'groth16'
});

// User login (generates ZK proof)
const proof = await auth.login(userSecret);

// Server verifies proof (learns nothing about secret)
const valid = await auth.verify(proof);
```

**Use Cases:**
- Replace email/password login
- Prove identity without revealing PII
- Gated access without KYC

---

### **Layer 2: Infrastructure (Helius RPC)**

**What It Does:** Private RPC endpoints (no metadata leakage)

**Configuration:**
```typescript
import { Connection } from '@solana/web3.js';

const connection = new Connection(
  `https://devnet.helius-rpc.com/?api-key=${HELIUS_KEY}`,
  'confirmed'
);

// All RPC calls now private
// Helius doesn't correlate requests to IP/identity
```

**Use Cases:**
- Hide transaction patterns
- Prevent IP tracking
- Privacy-preserving infrastructure

---

### **Layer 3: Recovery (Shamir + Timelock)**

**What It Does:** Social recovery with guardian privacy

**SDK:**
```bash
npm install @veil/recovery
```

**Basic Usage:**
```typescript
import { ShamirRecovery } from '@veil/recovery';

// Setup recovery
const recovery = new ShamirRecovery({
  guardians: 5,
  threshold: 3,
  timelock: 7 * 24 * 60 * 60 // 7 days
});

// Generate shares (client-side only)
const shares = await recovery.generateShares(secret);

// Distribute to guardians via email (encrypted)
await recovery.distributeShares(guardianEmails, shares);

// Recover (needs 3-of-5 shares)
const recovered = await recovery.reconstruct([share1, share2, share3]);
```

**Use Cases:**
- Wallet recovery without seed phrases
- Multi-sig with private signers
- Social account recovery

---

### **Layer 4: Transfer (ShadowPay)**

**What It Does:** Confidential transactions (amount hiding)

**SDK:**
```bash
npm install @radr/shadowwire
```

**Basic Usage:**
```typescript
import { ShadowWireClient } from '@radr/shadowwire';

const client = new ShadowWireClient({
  network: 'devnet'
});

// Send private payment
const result = await client.sendPrivate({
  recipient: recipientAddress,
  amount: 100, // Hidden on-chain
  token: 'SOL'
});

// On-chain: Only Pedersen commitment visible (not amount)
```

**Use Cases:**
- Private payments
- Hidden DEX trade amounts
- Confidential balances

---

## 🎯 Integration Patterns

### **Pattern 1: Full Stack Privacy**

Use all 4 layers for maximum privacy:

```typescript
import { VeilSDK } from '@veil/sdk';

const veil = new VeilSDK({
  identity: { zkAuth: true },
  infrastructure: { heliusKey: HELIUS_KEY },
  recovery: { guardians: 5, threshold: 3 },
  transfer: { shadowPay: true }
});

// Full privacy: Auth + RPC + Recovery + Transfers
await veil.login();              // ZK auth
await veil.setupRecovery();      // Private guardians
await veil.sendPrivate(to, amt); // Hidden amount
```

**Best For:** Wallets, DeFi protocols requiring comprehensive privacy

---

### **Pattern 2: Identity Only**

Use ZK auth for gated access:

```typescript
import { ZKAuth } from '@veil/identity';

const auth = new ZKAuth();

// Prove eligibility without revealing identity
const proof = await auth.proveEligibility({
  criterion: 'tokenHolder',
  minAmount: 1000
});

if (proof.valid) {
  // Grant access
}
```

**Best For:** DAOs, NFT platforms, token-gated content

---

### **Pattern 3: Recovery Only**

Add social recovery to existing wallet:

```typescript
import { ShamirRecovery } from '@veil/recovery';

const recovery = new ShamirRecovery({
  guardians: 3,
  threshold: 2
});

// Existing wallet adds recovery
await recovery.setupRecovery(walletSecret, guardianEmails);
```

**Best For:** Upgrading existing wallets, gaming accounts

---

### **Pattern 4: Transfer Only**

Add private payments to existing app:

```typescript
import { ShadowWireClient } from '@radr/shadowwire';

const shadowPay = new ShadowWireClient();

// Existing app adds private transfers
await shadowPay.sendPrivate(recipient, amount);
```

**Best For:** DEXs, payment apps, marketplaces

---

## 📚 Documentation & Resources

### **Live Demo:**
Visit [Dashboard](/) to see all layers in action

### **Integration Guides:**
- [Privacy Guarantees](/guarantees) - Technical deep dive
- [ShadowPay Explained](/shadowpay-explained) - Confidential transfers
- [ZK Proof Demo](/dashboard) - Try generating proofs

### **Code Examples:**
All integration patterns available in:
- `src/lib/zkProof.ts` - Identity Layer
- `src/lib/shadowpay.ts` - Transfer Layer
- `src/lib/recovery.ts` - Recovery Layer (client-side)

### **Support:**
- GitHub: [veil-protocol](https://github.com/veil-protocol)
- Docs: `/docs`
- Contact: Available on Dashboard

---

## 🚀 Quick Start

### **1. Install Dependencies**

```bash
# Full SDK
npm install @veil/sdk

# Or individual layers
npm install @veil/identity @veil/recovery @radr/shadowwire
```

### **2. Choose Your Pattern**

Pick integration pattern based on your needs:
- **Full Stack:** Use all 4 layers
- **Identity Only:** Gated access, DAOs
- **Recovery Only:** Social recovery
- **Transfer Only:** Private payments

### **3. Integrate**

```typescript
import { VeilSDK } from '@veil/sdk';

const veil = new VeilSDK({
  // Configure layers you need
  identity: true,
  recovery: true,
  // ... etc
});

await veil.initialize();
```

### **4. Deploy**

All layers work on:
- ✅ Solana Devnet (testing)
- ✅ Solana Mainnet (production)

---

## 🎯 Why Build With Veil?

### **✅ Modular**
Use only the layers you need. Each works independently.

### **✅ Production-Ready**
Deployed to Solana devnet, ready for mainnet.

### **✅ Privacy-First**
Zero-knowledge proofs, private guardians, hidden amounts.

### **✅ Developer-Friendly**
Simple SDKs, clear docs, working examples.

### **✅ Open Track**
Built for composability. Infrastructure, not just an app.

---

## 💡 Integration Examples

### **Example 1: Private DAO Forum**

```typescript
import { ZKAuth } from '@veil/identity';

// Verify DAO membership without public list
async function verifyMember(user) {
  const proof = await ZKAuth.prove({
    statement: 'I hold ≥100 DAO tokens',
    witness: user.tokenBalance
  });

  return proof.valid; // No balance revealed
}
```

### **Example 2: Gaming Recovery**

```typescript
import { ShamirRecovery } from '@veil/recovery';

// Player recovers account via guild members
async function setupGameRecovery(playerId, guildMembers) {
  const recovery = new ShamirRecovery({
    guardians: guildMembers.length,
    threshold: Math.ceil(guildMembers.length / 2)
  });

  await recovery.setupRecovery(playerId, guildMembers);
  // Guild members' identities never on-chain
}
```

### **Example 3: Private DEX**

```typescript
import { ShadowWireClient } from '@radr/shadowwire';

// Hide trade amounts to prevent MEV
async function privateTrade(from, to, amount) {
  const client = new ShadowWireClient();

  const result = await client.sendPrivate({
    recipient: to,
    amount: amount, // Hidden on-chain
    token: 'SOL'
  });

  // Only commitment visible, not amount
  return result.commitment;
}
```

---

## 🏆 Success Stories (Hypothetical)

**If Veil were integrated into existing products:**

### **Jupiter DEX + Veil Identity**
- Users prove swap eligibility without revealing wallet
- Prevent front-running via hidden pre-trade balances
- Private RPC prevents MEV targeting

### **Phantom Wallet + Veil Recovery**
- Social recovery with guardian privacy
- No seed phrases to lose
- Guardian identities never on-chain

### **Helium DAO + Veil Identity**
- Private governance voting
- Prove stake without revealing amount
- Anonymous proposal submission

### **Star Atlas + Veil Recovery**
- Player account recovery via guild
- No email/password required
- In-game friends as guardians

---

## 📞 Get Started

**Ready to integrate privacy into your product?**

1. **Explore Live Demo:** Visit [Dashboard](/) to try all layers
2. **Read Docs:** Check `/guarantees` and `/shadowpay-explained`
3. **Start Building:** Install `@veil/sdk` and follow patterns above
4. **Deploy:** Test on devnet, ship to mainnet

**Veil Protocol: Privacy infrastructure for Solana.**

---

*Built for the Open Track. Composable by design.*
