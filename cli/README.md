# @veil-protocol/cli

CLI for scaffolding Veil Protocol privacy-first Solana projects.

## Installation

```bash
npm install -g @veil-protocol/cli
```

## Usage

### Initialize a new project

```bash
veil init my-app
```

Interactive prompts will guide you through:
- **Network selection** (devnet for testing, mainnet for production)
- Helius RPC integration (recommended for privacy)
- ShadowPay integration (private transfers)
- Template selection (Basic, Governance, Treasury, Full)

### With flags

```bash
# Devnet (default - recommended for development)
veil init my-app --network=devnet --helius --shadow-pay

# Mainnet (production)
veil init my-app --network=mainnet-beta --helius --shadow-pay
```

### Show network configuration help

```bash
veil network
```

### Show info

```bash
veil info
```

### ShadowWire ZK Proof Architecture (New in v0.2.1)

```bash
veil shadowwire
```

Shows the complete ZK proof flow:
- Client-side Bulletproofs generation
- Backend commitment computation
- On-chain verification with nullifiers

### Light Protocol ZK Compression (New in v0.2.1)

```bash
veil compression
```

Displays Light Protocol integration details:
- 1000x cheaper compressed accounts
- State Merkle trees for privacy pools
- Compressed token holdings

### Full Privacy Stack (New in v0.2.1)

```bash
veil privacy-stack
```

Shows the complete privacy architecture diagram with all layers.

## Network Configuration

### Devnet (Development)

- **Free SOL** from [faucet.solana.com](https://faucet.solana.com)
- Perfect for development and testing
- No real money involved
- Wallet: Enable "Testnet Mode" in Phantom/Solflare

### Mainnet (Production)

- **Real SOL required**
- Permanent transactions
- Full privacy features
- Wallet: Disable "Testnet Mode"

### Switching Networks

Update your `.env` file:

```bash
# Devnet (development)
VITE_SOLANA_NETWORK=devnet
VITE_HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY

# Mainnet (production)
VITE_SOLANA_NETWORK=mainnet-beta
VITE_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

Then restart your application and switch your wallet to match.

## Templates

| Template | Features |
|----------|----------|
| Basic | Identity + Recovery |
| Governance | + Private Voting |
| Treasury | + Stealth Multisig |
| Full | All features including Private Staking |

## Generated Structure

```
my-app/
├── veil.config.ts      # Veil Protocol configuration
├── package.json
└── src/
    └── lib/
        └── rpc.ts      # Privacy-focused RPC abstraction
```

## Why Helius?

Using Helius RPC reduces metadata leakage:
- Public RPC endpoints log IP + wallet associations
- Request patterns can reveal user behavior
- Helius provides dedicated endpoints with better privacy practices

## Relationship to Aegis Shield

This CLI scaffolds projects that use the Aegis Shield core (`aegis-shield` repo).
Veil is the developer-friendly interface; Aegis Shield is the security core.

