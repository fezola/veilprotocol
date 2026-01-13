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
- Helius RPC integration (recommended for privacy)
- ShadowPay integration (private transfers)
- Template selection (Basic, Governance, Treasury, Full)

### With flags

```bash
veil init my-app --helius --shadow-pay
```

### Show info

```bash
veil info
```

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

