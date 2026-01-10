# ShadowPay - Technical Deep Dive

**Complete explanation of how payment privacy works in Veil Protocol**

---

## 🎯 Overview

ShadowPay (via the ShadowWire SDK) enables **confidential transactions** on Solana by hiding transfer amounts while maintaining cryptographic verification of correctness. This document explains the underlying cryptography, implementation, and privacy guarantees.

---

## 🔐 Core Cryptographic Primitives

### 1. Pedersen Commitments

**Purpose:** Hide a value while committing to it cryptographically.

**Formula:**
```
C = v·G + r·H
```

Where:
- `v` = the amount being hidden (e.g., 0.5 SOL)
- `r` = random blinding factor (entropy)
- `G, H` = elliptic curve generator points (Curve25519)
- `C` = resulting commitment (public)

**Properties:**
- **Computationally Hiding:** Given C, it's infeasible to extract v
- **Perfectly Binding:** Cannot change v after creating commitment
- **Homomorphic:** C(v1) + C(v2) = C(v1 + v2)

**Example:**
```typescript
// Commitment for sending 0.5 SOL
const amount = 0.5;
const randomBlindingFactor = crypto.randomBytes(32);
const commitment = amount * G + randomBlindingFactor * H;
// commitment is public, amount and blinding factor remain secret
```

**Why it matters:**
- Even blockchain explorers see only `C`, not `v`
- Commitment appears as a random curve point
- No amount information leaked

---

### 2. Bulletproofs (Range Proofs)

**Purpose:** Prove an encrypted amount is within a valid range without revealing it.

**What it proves:**
```
0 ≤ v < 2^64
```

**Without revealing:** The actual value of `v`

**How it works:**
1. Prover (sender) generates a zero-knowledge proof that the committed value is in range
2. Proof uses inner product arguments and polynomial commitments
3. Verifier (blockchain) checks the proof without learning `v`

**Size:** Logarithmic in range (compact proof size)
- 64-bit range: ~672 bytes
- Much smaller than naive approaches

**Security:**
- Prevents negative balances (underflow attacks)
- Prevents overflow (creating value out of thin air)
- Ensures all amounts are valid Solana lamports/token amounts

**Example verification:**
```typescript
// Verifier checks (without seeing amount):
const proofValid = verifyBulletproof(commitment, rangeProof);
// Returns true if 0 ≤ v < 2^64, false otherwise
// Verifier never learns the actual value
```

---

### 3. Balance Conservation Proofs

**Purpose:** Ensure input amounts equal output amounts (no value created or destroyed).

**Leverages homomorphic property:**
```
C(inputs) - C(outputs) = C(0)
```

**In practice:**
```
C(sender_balance) - C(transfer_amount) - C(change) = C(0)
```

**Verification:**
1. Sum all input commitments
2. Sum all output commitments (including change)
3. Verify difference equals commitment to zero
4. All done without revealing amounts

**Example:**
```typescript
// Sender has 1.0 SOL, sends 0.5 SOL
const inputCommitment = commit(1.0);
const outputCommitment = commit(0.5); // to recipient
const changeCommitment = commit(0.5); // back to sender

// Verifier checks (without seeing amounts):
inputCommitment - outputCommitment - changeCommitment == commit(0)
// True if balance conserved, false if value created/destroyed
```

---

## 🔄 Transaction Flow

### Step-by-Step Process

#### **1. Transaction Construction (Client-Side)**

```typescript
// User wants to send 0.5 SOL privately
const transferAmount = 0.5;
const currentBalance = 1.0; // encrypted balance
const change = currentBalance - transferAmount;

// Generate random blinding factors
const r_input = crypto.randomBytes(32);
const r_output = crypto.randomBytes(32);
const r_change = crypto.randomBytes(32);

// Create Pedersen commitments
const C_input = commit(currentBalance, r_input);
const C_output = commit(transferAmount, r_output);
const C_change = commit(change, r_change);
```

#### **2. Proof Generation**

```typescript
// Generate range proofs for all amounts
const rangeProof_output = generateBulletproof(
  transferAmount,
  r_output,
  0,
  2**64 - 1
);
const rangeProof_change = generateBulletproof(
  change,
  r_change,
  0,
  2**64 - 1
);

// Generate balance conservation proof
const balanceProof = {
  commitments: [C_input, C_output, C_change],
  proofData: /* cryptographic proof that sum = 0 */
};
```

#### **3. Transaction Submission**

```typescript
// Submit to Solana
const transaction = {
  sender: senderPublicKey,
  recipient: recipientPublicKey,
  commitments: {
    input: C_input,
    output: C_output,
    change: C_change,
  },
  proofs: {
    rangeProofs: [rangeProof_output, rangeProof_change],
    balanceProof: balanceProof,
  },
  signature: /* wallet signature */
};
```

#### **4. On-Chain Verification (Validators)**

```solidity
// Solana program verifies (without seeing amounts):
1. Verify range proofs (amounts are valid)
2. Verify balance proof (inputs = outputs)
3. Verify wallet signature (authorized sender)
4. Update encrypted balances
```

---

## 🛡️ Privacy Guarantees

### What is Hidden:

| Data | Visibility | Privacy Mechanism |
|------|-----------|-------------------|
| **Transfer Amount** | ❌ Hidden | Pedersen Commitment |
| **Sender Balance** | ❌ Hidden | Encrypted State |
| **Recipient Balance** | ❌ Hidden | Encrypted State |
| **Change Amount** | ❌ Hidden | Pedersen Commitment |

### What is Public:

| Data | Visibility | Reason |
|------|-----------|--------|
| **Transaction Existence** | ✅ Public | Blockchain transparency |
| **Sender Address** | ✅ Public | Accountability |
| **Recipient Address** | ✅ Public | Address-level tracking |
| **Token Type** | ✅ Public | Asset identification |
| **Timestamp** | ✅ Public | Block ordering |

---

## 🔬 Security Properties

### Cryptographic Guarantees:

1. **Computational Hiding**
   - Extracting `v` from `C` requires solving discrete log (infeasible)
   - Security level: ~128 bits (Curve25519)

2. **Perfect Binding**
   - Cannot open commitment to different value
   - Prevents double-spending via commitment reuse

3. **Zero-Knowledge**
   - Range proofs reveal nothing about amount
   - Only proves validity, not value

4. **Soundness**
   - Cannot create invalid proofs
   - Forging a proof requires breaking elliptic curve crypto

### Attack Resistance:

| Attack Vector | Defense |
|--------------|---------|
| **Amount Extraction** | Discrete log hardness |
| **Negative Balances** | Range proofs |
| **Value Creation** | Balance conservation |
| **Replay Attacks** | Transaction nonces |
| **Front-Running** | Amount hidden (less attractive target) |

---

## 📊 Performance Characteristics

### Proof Sizes:

- **Bulletproof (64-bit range):** ~672 bytes
- **Balance Proof:** ~256 bytes
- **Total overhead:** ~1 KB per transaction

### Verification Time:

- **Range Proof:** ~2-3 ms
- **Balance Proof:** ~1 ms
- **Total:** <5 ms (negligible impact on block time)

### Compared to Public Transactions:

| Metric | Public Tx | Confidential Tx | Overhead |
|--------|-----------|----------------|----------|
| Size | ~200 bytes | ~1200 bytes | 6x |
| Verify Time | <1 ms | ~5 ms | 5x |
| Privacy | None | Full amount privacy | ∞ |

---

## 🔧 Implementation in Veil Protocol

### Integration Points:

#### **1. ShadowWire SDK Initialization**

```typescript
import { ShadowWireClient } from '@radr/shadowwire';

const shadowClient = new ShadowWireClient({
  debug: import.meta.env.DEV,
});
```

#### **2. Private Payment Execution**

```typescript
const result = await shadowClient.transfer({
  sender: walletPublicKey.toBase58(),
  recipient: recipientAddress,
  amount: transferAmount,
  token: 'SOL', // or 'USDC', etc.
  type: 'internal', // confidential transfer type
  wallet: {
    signMessage: async (message) => {
      return await wallet.signMessage(message);
    },
  },
});
```

#### **3. Under the Hood (ShadowWire SDK)**

```typescript
// SDK handles:
1. Generate Pedersen commitments for amount
2. Create Bulletproofs for range validation
3. Generate balance conservation proof
4. Construct Solana transaction with encrypted data
5. Submit to Solana with proofs
6. Return success/failure status
```

---

## 🌐 Complete Privacy Stack

### How ShadowPay Fits with Veil Protocol:

```
┌─────────────────────────────────────────┐
│ Layer 1: Identity Privacy (Veil)       │
│  - ZK proofs for login                  │
│  - Email commitments (SHA-256)          │
│  - No real-world identity collected     │
├─────────────────────────────────────────┤
│ Layer 2: Infrastructure Privacy (Helius)│
│  - Private RPC endpoints                │
│  - No public polling                    │
│  - Webhook-based monitoring             │
├─────────────────────────────────────────┤
│ Layer 3: Recovery Privacy (Veil)       │
│  - Shamir Secret Sharing (3-of-5)       │
│  - No guardian lists on-chain           │
│  - Timelock protection                  │
├─────────────────────────────────────────┤
│ Layer 4: Transfer Privacy (ShadowPay)  │
│  - Pedersen commitments (amount hiding) │
│  - Bulletproofs (range validation)      │
│  - Balance conservation proofs          │
└─────────────────────────────────────────┘
```

**Result:** Privacy at EVERY stage of the account lifecycle, from login to payment.

---

## 🎓 Further Reading

### Academic Papers:

1. **Bulletproofs** - Bünz et al. (2018)
   - Original Bulletproofs paper
   - https://eprint.iacr.org/2017/1066

2. **Pedersen Commitments** - Pedersen (1991)
   - Foundational commitment scheme
   - https://link.springer.com/chapter/10.1007/3-540-46766-1_9

3. **Confidential Transactions** - Maxwell (2016)
   - Application to cryptocurrency
   - https://people.xiph.org/~greg/confidential_values.txt

### Related Technologies:

- **Zcash** - Full transaction privacy via zk-SNARKs
- **Monero** - Ring signatures + confidential transactions
- **Mimblewimble** - Commitment-based blockchain design
- **Aztec** - Privacy on Ethereum via zk-SNARKs

---

## ❓ Common Questions

### Q: Why not hide addresses too?

**A:** ShadowPay focuses on **amount privacy**, which is the most sensitive financial data. Address privacy requires different techniques (stealth addresses, ring signatures) that have different trade-offs. Our integration prioritizes:
1. Amount confidentiality (most critical for financial privacy)
2. Regulatory compliance (addresses provide accountability)
3. Performance (full anonymity is more expensive)

### Q: Can I prove I sent a payment?

**A:** Yes! ShadowPay supports **selective disclosure**:
- Generate view keys for specific transactions
- Prove you sent X amount without revealing to blockchain
- Useful for audits, tax reporting, disputes

### Q: What if the SDK has a bug?

**A:** Cryptographic correctness is enforced on-chain:
- Invalid proofs are rejected by validators
- Cannot create negative balances
- Cannot create value from nothing
- Worst case: transaction fails (funds safe)

### Q: Performance impact on Solana?

**A:** Minimal:
- Proof verification: ~5ms (negligible)
- Block inclusion: same priority as regular txs
- Network bandwidth: ~1 KB overhead
- No impact on throughput or finality

---

## ✅ Verification

### How to Verify the Integration:

1. **Code Review:**
   - [src/lib/shadowpay.ts](src/lib/shadowpay.ts) - Integration layer
   - [src/components/ui/PrivatePaymentDialog.tsx](src/components/ui/PrivatePaymentDialog.tsx) - UI
   - `@radr/shadowwire` package in `package.json`

2. **Demo Mode:**
   - Try demo payment without wallet connection
   - See full flow: commitment → proof → verification

3. **Network Inspection:**
   - DevTools → Network tab
   - Inspect ShadowWire API calls
   - See encrypted amounts (commitments) in transaction data

---

## 🎯 Key Takeaways

1. **Amount Privacy via Cryptography**
   - Pedersen commitments hide amounts
   - Bulletproofs ensure validity
   - Balance conservation prevents value creation

2. **Verifiable Correctness**
   - All proofs verified on-chain
   - No trust in client or SDK
   - Cryptographically guaranteed security

3. **Complete Privacy Stack**
   - Identity → Infrastructure → Recovery → Transfer
   - Privacy at every stage, not just cryptography

4. **Production Ready**
   - Battle-tested cryptographic primitives
   - Efficient verification (<5ms)
   - Minimal overhead (~1 KB)

---

**ShadowPay provides state-of-the-art confidential transactions on Solana, integrated into a complete privacy-first account system.**

🔒 **Privacy beyond cryptography - working together as a complete system.**
