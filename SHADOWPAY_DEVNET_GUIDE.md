# ShadowPay Devnet Setup & Usage Guide

**Complete guide for using ShadowPay with real wallet signatures on Solana devnet**

---

## 🎯 Two Ways to Use ShadowPay

### Option 1: Demo Mode (No Wallet Required) ⭐ RECOMMENDED FOR JUDGES

**Best for:** Quick demonstration, hackathon judging, understanding the technology

**Steps:**
1. Open Dashboard → Click "Try Private Payment (Demo)"
2. Click "Try Demo Mode" button
3. Enter any valid Solana address
4. Complete full flow without wallet
5. See simulated success (2-second delay)

**Advantage:** Zero setup, works immediately

---

### Option 2: Real Wallet Mode (Devnet) 🔗

**Best for:** Testing actual ShadowPay integration with real signatures

**Requirements:**
- Solana wallet (Phantom, Solflare, etc.)
- Devnet SOL (free from faucet)
- Wallet connected to devnet

---

## 🚀 Setup for Real Wallet Mode

### Step 1: Get a Solana Wallet

If you don't have one:
- **Phantom:** [phantom.app](https://phantom.app) (Chrome/Firefox extension)
- **Solflare:** [solflare.com](https://solflare.com) (Chrome/Firefox extension)

### Step 2: Switch Wallet to Devnet

**For Phantom:**
1. Click Phantom icon
2. Click Settings (gear icon)
3. Scroll to "Developer Settings"
4. Change Network → **Devnet**

**For Solflare:**
1. Click Solflare icon
2. Click Settings
3. Network → Select **Devnet**

### Step 3: Get Free Devnet SOL

**Option A: Solana Faucet** (Recommended)
1. Visit [faucet.solana.com](https://faucet.solana.com)
2. Paste your wallet address
3. Click "Airdrop"
4. Receive 1-2 devnet SOL (free, instant)

**Option B: Command Line**
```bash
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet
```

### Step 4: Verify Devnet SOL Balance

1. Open your wallet
2. Confirm you see devnet SOL balance
3. Network should show "Devnet"

---

## 🎬 Using ShadowPay with Real Wallet

### Complete Flow:

1. **Connect Wallet**
   - Open Dashboard
   - Click "Connect Wallet" (top right)
   - Approve connection
   - Confirm wallet shows devnet

2. **Open Payment Dialog**
   - Click "Try Private Payment (Demo)" button
   - Dialog opens
   - See "Devnet Mode" notice (with faucet link)
   - NO "Demo Mode" button (you have a connected wallet)

3. **Enter Payment Details**
   - **Recipient:** Any valid devnet address
     - Example: Your own address (to yourself)
     - Example: `11111111111111111111111111111111` (burn address)
   - **Amount:** Small amount (e.g., `0.01` SOL)
   - Expand "How does amount hiding work?" to learn

4. **Review & Confirm**
   - Click "Review Payment"
   - See payment summary
   - See "Amount Hidden" privacy badge
   - Click "Confirm"

5. **Sign Transaction**
   - **IMPORTANT:** Wallet popup will appear
   - **Message to sign:** `shadowpay:zk_transfer:{nonce}:{timestamp}`
   - This signature authorizes the private payment
   - Click "Sign" in wallet

6. **Processing**
   - See "Processing Payment..." message
   - ShadowWire SDK creates:
     - Pedersen commitments (amount hiding)
     - Bulletproofs (range validation)
     - Balance conservation proof
   - Submits to Solana devnet

7. **Success**
   - "Private Payment Completed" message
   - Privacy guarantees shown:
     - ✅ Amount hidden on-chain
     - ✅ Identity not leaked
     - ✅ No wallet linkage exposed

---

## 🔐 What Happens Behind the Scenes

### When You Click "Confirm":

```typescript
// 1. ShadowWire SDK is initialized (devnet)
const client = new ShadowWireClient({
  network: 'devnet',
  debug: true
});

// 2. Your wallet signs the authorization message
const signature = await wallet.signMessage(
  'shadowpay:zk_transfer:{nonce}:{timestamp}'
);

// 3. SDK generates cryptographic proofs
- Pedersen commitment: C = amount·G + random·H
- Bulletproof: Prove 0 ≤ amount < 2^64
- Balance proof: Inputs = Outputs

// 4. Transaction submitted to devnet
- Amount is encrypted (Pedersen commitment)
- Proofs are included
- Validators verify without seeing amount
```

### What Gets Written to Blockchain:

```
Transaction {
  sender: YOUR_PUBLIC_KEY,
  recipient: RECIPIENT_PUBLIC_KEY,
  commitment: 0x4f2b8a... (encrypted amount),
  proof: 0x9c3d5f... (Bulletproof),
  balance_proof: 0x2a1b4c...,
  signature: 0x7e8d3a...
}
```

**Observers see:**
- ✅ Transaction occurred
- ✅ Sender and recipient addresses
- ❌ **NOT** the amount (encrypted!)
- ❌ **NOT** your balance
- ❌ **NOT** transaction patterns

---

## 🛠️ Technical Configuration

### Files Updated:

**1. `src/lib/shadowpay.ts`** (line 36)
```typescript
shadowWireClient = new ShadowWireClient({
  network: 'devnet', // ← Added for devnet support
  debug: import.meta.env.DEV,
});
```

**2. `.env`** (created)
```bash
VITE_SOLANA_NETWORK=devnet
VITE_SHADOWPAY_NETWORK=devnet
VITE_HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
```

**3. `src/components/WalletProvider.tsx`**
```typescript
<ConnectionProvider endpoint={DEVNET_ENDPOINT}>
  {/* Already configured for devnet */}
</ConnectionProvider>
```

---

## ✅ Troubleshooting

### Issue: "Sender signature required"

**Cause:** Wallet not properly connected or wrong network

**Fix:**
1. Ensure wallet is on **devnet** (not mainnet!)
2. Disconnect and reconnect wallet
3. Refresh page
4. Try again

### Issue: "Insufficient funds"

**Cause:** No devnet SOL in wallet

**Fix:**
1. Visit [faucet.solana.com](https://faucet.solana.com)
2. Get free devnet SOL
3. Confirm balance in wallet
4. Try again

### Issue: "Transaction failed"

**Possible Causes:**
- Network congestion (devnet is sometimes slow)
- Invalid recipient address
- Amount too large

**Fix:**
1. Use smaller amount (`0.01` SOL)
2. Check recipient address format
3. Wait 30 seconds and try again

### Issue: Still Getting Signature Error?

**Try Demo Mode Instead:**
1. Disconnect wallet
2. Click "Try Private Payment (Demo)"
3. Click "Try Demo Mode"
4. Complete full demo flow without wallet
5. See simulated private payment

---

## 📊 Comparison: Demo Mode vs. Real Wallet

| Feature | Demo Mode | Real Wallet Mode |
|---------|-----------|------------------|
| **Setup** | None | Wallet + devnet SOL |
| **Speed** | Instant (2s simulation) | ~10-30 seconds |
| **Signature** | Not required | Required |
| **On-Chain** | No transaction | Real devnet transaction |
| **Learning** | Full UX + education | Same + real cryptography |
| **Best For** | Judges, quick demo | Technical testing |

**Recommendation for Judges:** Use Demo Mode first to understand the flow, then try Real Wallet Mode if you want to see actual on-chain confidential transactions.

---

## 🎓 Educational Value

### Both Modes Teach:

✅ **How Pedersen Commitments Work**
- Formula: C = v·G + r·H
- Amount hiding cryptography
- Discrete log security

✅ **Why Bulletproofs Are Needed**
- Range validation (0 ≤ amount < 2^64)
- Zero-knowledge proof
- Prevents negative balances

✅ **Balance Conservation**
- Homomorphic properties
- Input = Output verification
- No value creation

### Real Wallet Mode Additionally Shows:

✅ **Wallet Signature Flow**
- Authorization message format
- User consent for private payments
- Non-custodial security

✅ **On-Chain Verification**
- Real Solana devnet transaction
- Encrypted amounts on blockchain
- Validator proof checking

✅ **Production Integration**
- ShadowWire SDK in action
- Network configuration
- Error handling

---

## 🏆 For Hackathon Judges

### Quick Evaluation Path:

**3-Minute Demo Mode:**
1. Dashboard → "Try Demo" → "Try Demo Mode"
2. See full flow without setup
3. Read technical explanations
4. Visit `/shadowpay-explained` page

**5-Minute Real Wallet (Optional):**
1. Switch wallet to devnet
2. Get free devnet SOL
3. Connect wallet → Try payment
4. Sign message → See real transaction
5. Verify on Solana Explorer (devnet)

**Total Time:** 3-8 minutes (depending on depth)

---

## 🔗 Resources

### Get Devnet SOL:
- **Solana Faucet:** [faucet.solana.com](https://faucet.solana.com)
- **Solana CLI:** `solana airdrop 2 ADDRESS --url devnet`

### Check Transactions:
- **Solana Explorer (Devnet):** [explorer.solana.com?cluster=devnet](https://explorer.solana.com?cluster=devnet)
- Paste transaction signature to see encrypted amounts

### Learn More:
- **Educational Page:** `/shadowpay-explained` in app
- **Technical Spec:** `SHADOWPAY_TECHNICAL.md`
- **Complete Guide:** `SHADOWPAY_COMPLETE_GUIDE.md`

### Wallets:
- **Phantom:** [phantom.app](https://phantom.app)
- **Solflare:** [solflare.com](https://solflare.com)

---

## ✨ Summary

**Demo Mode:** Zero setup, works immediately, full educational value

**Real Wallet Mode:** 5-minute setup, real devnet transactions, production-grade testing

**Both modes teach the same cryptographic concepts with comprehensive educational content.**

**For judges:** Demo Mode is recommended for quick evaluation. Real Wallet Mode is optional for deeper technical verification.

---

## 🎉 Status

**Configuration:** ✅ Complete
- ShadowWire SDK: Devnet configured
- Wallet Provider: Devnet endpoint
- Environment: Devnet variables set
- UI: Devnet notice added

**Demo Mode:** ✅ Working
- No wallet required
- Full flow simulation
- Educational content

**Real Wallet Mode:** ✅ Ready
- Devnet configured
- Signature flow enabled
- Error handling added

**Documentation:** ✅ Comprehensive
- Setup guide (this file)
- Technical deep-dive
- Educational content
- Troubleshooting guide

---

**Both demo and real wallet modes are ready for hackathon evaluation!** 🚀🔒
