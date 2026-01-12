# my-veil-app

A privacy-first Solana application built with Veil.

## What is Veil?

Veil does not make Solana private.
It makes **using Solana safely** private.

## What's Private vs Public

| Aspect | Private | Public |
|--------|---------|--------|
| Your identity | ✅ Never on-chain | |
| Wallet address | ✅ Unlinkable to you | |
| Recovery guardians | ✅ Hidden | |
| Transaction amounts | | ❌ Visible |
| Transaction recipients | | ❌ Visible |

## Project Structure

```
/app        → Frontend application
/privacy    → Privacy modules (login, recovery, access)
/infra      → Infrastructure (RPC, Helius)
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev
```

## Privacy Guarantees

See `/privacy/guarantees.ts` for documented privacy guarantees.

---

Built with [Veil](https://github.com/veil-protocol) — Privacy-first access & recovery for Solana
