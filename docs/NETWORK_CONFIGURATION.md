# Network Configuration Guide

Complete guide for configuring Aegis Shield / Veil Protocol for different Solana networks.

## Overview

| Network | Purpose | RPC Endpoint | ShadowPay Privacy |
|---------|---------|--------------|-------------------|
| **Devnet** | Development & Testing | `api.devnet.solana.com` | ⚠️ Amounts visible |
| **Mainnet-beta** | Production | `api.mainnet-beta.solana.com` | ✅ Full privacy |
| **Localnet** | Local development | `localhost:8899` | N/A |

> **⚠️ Important:** ShadowWire's privacy features (Pedersen commitments, Bulletproofs, amount hiding) only work on **mainnet**.
>
> On devnet, the transaction flow works but **amounts are visible** on Solscan. This is because ShadowWire's infrastructure only operates on mainnet.

---

## Quick Start

### Devnet (Recommended for Development)

```bash
# 1. Create .env file
VITE_SOLANA_NETWORK=devnet
VITE_HELIUS_API_KEY=your_helius_api_key
VITE_HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY

# 2. Get free devnet SOL
solana airdrop 2 --url devnet
# Or visit: https://faucet.solana.com

# 3. Configure wallet to devnet
# Phantom: Settings → Developer Settings → Testnet Mode → ON
# Solflare: Settings → Network → Devnet
```

### Mainnet (Production)

```bash
# 1. Update .env file
VITE_SOLANA_NETWORK=mainnet-beta
VITE_HELIUS_API_KEY=your_helius_api_key
VITE_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# 2. Fund wallet with real SOL
# Purchase from exchange or transfer from another wallet

# 3. Configure wallet to mainnet
# Phantom: Settings → Developer Settings → Testnet Mode → OFF
# Solflare: Settings → Network → Mainnet
```

---

## Configuration Files

### 1. Environment Variables (`.env`)

```bash
# ============================================
# NETWORK CONFIGURATION
# ============================================

# Choose ONE of the following:
VITE_SOLANA_NETWORK=devnet          # For development
# VITE_SOLANA_NETWORK=mainnet-beta  # For production

# ============================================
# RPC CONFIGURATION (Helius recommended)
# ============================================

VITE_HELIUS_API_KEY=your_api_key_here

# Devnet RPC
VITE_HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY

# Mainnet RPC (uncomment for production)
# VITE_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

### 2. Veil Config (`veil.config.ts`)

```typescript
import { defineVeilConfig } from "veil-core";

export default defineVeilConfig({
  project: {
    name: "my-app",
    network: "devnet",  // Change to "mainnet-beta" for production
  },

  infrastructure: {
    rpc: {
      provider: "helius",  // Recommended for privacy
      publicPolling: false,
    },
  },

  integrations: {
    shadowPay: {
      enabled: true,  // Private payments
    },
  },
});
```

### 3. Wallet Provider Configuration

```typescript
// src/components/WalletProvider.tsx
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

const network = process.env.VITE_SOLANA_NETWORK === 'mainnet-beta'
  ? WalletAdapterNetwork.Mainnet
  : WalletAdapterNetwork.Devnet;

const endpoint = useMemo(() => {
  // Use Helius for privacy
  if (process.env.VITE_HELIUS_RPC_URL) {
    return process.env.VITE_HELIUS_RPC_URL;
  }
  return clusterApiUrl(network);
}, [network]);
```

---

## CLI Commands

### Initialize with Specific Network

```bash
# Devnet project (default)
veil init my-app --network=devnet

# Mainnet project
veil init my-app --network=mainnet-beta

# With all options
veil init my-app \
  --network=devnet \
  --helius \
  --shadow-pay \
  --framework=nextjs
```

### List Available Options

```bash
veil init --help
```

---


---

## Switching Networks

### From Devnet to Mainnet

Follow this checklist when going to production:

#### Step 1: Update Environment Variables

```bash
# .env
VITE_SOLANA_NETWORK=mainnet-beta
VITE_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

#### Step 2: Update veil.config.ts

```typescript
project: {
  name: "my-app",
  network: "mainnet-beta",  // Changed from "devnet"
}
```

#### Step 3: Restart Application

```bash
# Stop dev server (Ctrl+C)
npm run dev

# Or rebuild for production
npm run build
```

#### Step 4: Switch Wallet Network

**Phantom:**
1. Open Phantom wallet
2. Click Settings (gear icon)
3. Go to "Developer Settings"
4. Toggle OFF "Testnet Mode"

**Solflare:**
1. Open Solflare wallet
2. Click Settings
3. Select "Network"
4. Choose "Mainnet"

#### Step 5: Fund Your Wallet

Transfer real SOL to your wallet address. The address is the same on both networks, but balances are separate.

---

## Production Checklist

Before deploying to mainnet:

- [ ] **Environment Variables**
  - [ ] `VITE_SOLANA_NETWORK=mainnet-beta`
  - [ ] Helius RPC URL updated to mainnet
  - [ ] API keys are production keys (not test keys)

- [ ] **Configuration Files**
  - [ ] `veil.config.ts` network set to `mainnet-beta`
  - [ ] Remove any hardcoded devnet references

- [ ] **Wallet Setup**
  - [ ] Wallet switched to Mainnet
  - [ ] Wallet funded with real SOL
  - [ ] Test with small transaction first

- [ ] **Testing**
  - [ ] All features tested on devnet first
  - [ ] Error handling works correctly
  - [ ] Transaction confirmations display properly

- [ ] **Security**
  - [ ] Private keys not exposed in code
  - [ ] .env file in .gitignore
  - [ ] Rate limiting configured

---

## Troubleshooting

### Common Issues

#### "Transaction simulation failed"

**Cause:** Wrong network configuration
**Fix:**
1. Check `VITE_SOLANA_NETWORK` matches your wallet network
2. Ensure RPC URL matches the network (devnet vs mainnet)
3. Restart the application after .env changes

#### "Insufficient funds for transaction"

**Cause:** No SOL on current network
**Fix:**
- **Devnet:** Get free SOL from https://faucet.solana.com
- **Mainnet:** Transfer real SOL to your wallet

#### "Wallet shows different balance than app"

**Cause:** Wallet and app on different networks
**Fix:**
1. Check your wallet's network setting
2. Check `VITE_SOLANA_NETWORK` in .env
3. Both must match (devnet ↔ devnet, mainnet ↔ mainnet)

#### Transaction succeeds but not visible on explorer

**Cause:** Looking at wrong explorer network
**Fix:**
- **Devnet:** Use `https://solscan.io/?cluster=devnet`
- **Mainnet:** Use `https://solscan.io/`

---

## RPC Endpoints

### Public Endpoints (Not Recommended for Production)

| Network | Endpoint |
|---------|----------|
| Devnet | `https://api.devnet.solana.com` |
| Mainnet | `https://api.mainnet-beta.solana.com` |

### Helius Endpoints (Recommended)

| Network | Endpoint |
|---------|----------|
| Devnet | `https://devnet.helius-rpc.com/?api-key=YOUR_KEY` |
| Mainnet | `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY` |

**Why Helius?**
- Better privacy (dedicated endpoints)
- Higher rate limits
- Webhook support for transaction monitoring
- No IP correlation with other users

Get your free API key at: https://helius.dev

---

## Network-Specific Features

| Feature | Devnet | Mainnet |
|---------|--------|---------|
| Free SOL | ✅ Yes (faucet) | ❌ No (real cost) |
| Transaction Flow | ✅ Works | ✅ Works |
| **Amount Privacy** | ⚠️ **Visible** | ✅ **Hidden** |
| Pedersen Commitments | ❌ Not active | ✅ Active |
| Bulletproofs | ❌ Not active | ✅ Active |
| ShadowWire | ❌ Not available | ✅ Full support |
| Program ID | Same | Same |
| Data Persistence | May be reset | Permanent |
| Explorer | Solscan (devnet) | Solscan (mainnet) |

### Why Devnet Doesn't Have Privacy

ShadowWire (the privacy layer from RADR) only operates on **Solana mainnet**. Their infrastructure for:
- Pedersen commitments (amount hiding)
- Bulletproofs (range proofs)
- Mixing pools (sender-recipient unlinking)

...is only deployed on mainnet.

**Devnet is for:**
- Testing transaction flow
- Validating wallet integration
- UI/UX development
- Hackathon demos (use demo mode for privacy simulation)

**Mainnet is for:**
- Real private payments
- Full amount hiding
- Production use

---

## Best Practices

1. **Always develop on Devnet first** - Test all features with free SOL before using real funds

2. **Use environment variables** - Never hardcode network URLs or API keys

3. **Separate configs** - Use `.env.development` and `.env.production` for different environments

4. **Test the switch** - Before mainnet launch, do a full test of the network switch process

5. **Monitor transactions** - Set up Helius webhooks to monitor transaction status in production

6. **Start small** - First mainnet transactions should use minimal amounts


## SDK Usage

### Initialize with Network

```typescript
import { VeilAuth } from '@veil-protocol/sdk';
import { Connection } from '@solana/web3.js';

// Devnet Configuration
const devnetConfig = {
  network: 'devnet' as const,
  rpcUrl: 'https://devnet.helius-rpc.com/?api-key=YOUR_KEY'
};

// Mainnet Configuration
const mainnetConfig = {
  network: 'mainnet-beta' as const,
  rpcUrl: 'https://mainnet.helius-rpc.com/?api-key=YOUR_KEY'
};

// Use based on environment
const config = process.env.NODE_ENV === 'production'
  ? mainnetConfig
  : devnetConfig;

const veil = new VeilAuth(config);
const connection = new Connection(config.rpcUrl);
```

### ShadowPay Network Configuration

```typescript
import { ShadowWireClient } from '@radr/shadowwire';

// The client automatically uses the correct network
const client = new ShadowWireClient({
  network: process.env.VITE_SOLANA_NETWORK || 'devnet',
  debug: process.env.NODE_ENV !== 'production',
});
```

