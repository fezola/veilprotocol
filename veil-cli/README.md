# create-veil-app

Privacy-first project scaffolding CLI for Solana. Create production-ready apps with the complete Veil + ShadowWire privacy stack.

## Quick Start

```bash
npx create-veil-app my-app
```

Or install globally:

```bash
npm install -g create-veil-app
veil init my-app
```

## Features

- **15 Templates** — DEX, Lending, Wallet, Gaming, NFT, Social, and more
- **Full Privacy Stack** — Identity, Recovery, Voting, Staking, Multisig
- **ShadowPay Integration** — Mainnet private payments via @radr/shadowwire
- **Framework Choice** — Next.js or Vite
- **Helius RPC** — Pre-configured for optimal Solana performance

## Templates

| Category | Templates |
|----------|-----------|
| **DeFi** | `dex`, `lending`, `yield`, `pool` |
| **DApp** | `gaming`, `nft`, `social`, `governance` |
| **Exchange** | `cex`, `aggregator`, `trading` |
| **Wallet** | `wallet`, `portfolio`, `payments` |
| **Starter** | `basic` |

## Usage

### Interactive Mode

```bash
veil init
```

Prompts for:
1. Project name
2. Template category & type
3. Framework (Next.js / Vite)
4. Helius RPC (recommended)
5. ShadowPay mode (App / Wallet / Skip)
6. Network (devnet / localnet)

### Non-Interactive Mode

```bash
veil init my-dex \
  --template=dex \
  --framework=nextjs \
  --network=devnet \
  --shadow-pay
```

### List Templates

```bash
veil templates
```

## Generated Project Structure

```
my-app/
├── app/                    # Frontend application
│   ├── components/         # UI components
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── providers.tsx       # Wallet providers
├── lib/
│   ├── privacy/            # Login, recovery, access control
│   ├── veil/               # RPC, Helius integration
│   ├── voting/             # Commit-reveal voting
│   ├── staking/            # Pedersen staking
│   ├── multisig/           # Stealth signers
│   └── shadowpay/          # Mainnet private transfers (if enabled)
├── hooks/                  # React hooks for Veil SDK
├── contexts/               # Provider contexts
├── types/                  # TypeScript definitions
├── veil.config.ts          # Veil configuration
└── .env.example            # Environment template
```

## Network Configuration

| Network | Purpose |
|---------|---------|
| **Devnet** | Veil features (voting, staking, multisig) |
| **Mainnet** | ShadowPay private payments |

## Commands

| Command | Description |
|---------|-------------|
| `veil init [name]` | Create new project |
| `veil templates` | List available templates |
| `veil add` | Add Veil to existing project |
| `veil --help` | Show help |

## Options

| Flag | Description |
|------|-------------|
| `-t, --template <type>` | Template type |
| `-f, --framework <fw>` | nextjs or vite |
| `--shadow-pay` | Enable ShadowPay (mainnet) |
| `--no-shadow-pay` | Disable ShadowPay |
| `--helius` | Enable Helius RPC |
| `--no-helius` | Disable Helius RPC |
| `--network <net>` | devnet or localnet |

## Privacy Stack

Every generated project includes:

| Feature | Description | Cryptography |
|---------|-------------|--------------|
| **Identity** | ZK authentication | Poseidon hash |
| **Recovery** | Social recovery | Shamir secret sharing |
| **Voting** | Private voting | Commit-reveal |
| **Staking** | Hidden amounts | Pedersen commitments |
| **Multisig** | Anonymous signers | Stealth addresses |
| **ShadowPay** | Private transfers | @radr/shadowwire |

## License

MIT © Veil Protocol

