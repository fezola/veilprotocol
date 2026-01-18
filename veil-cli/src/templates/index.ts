import { VeilConfig, TEMPLATE_INFO } from "../cli.js";

export function generateVeilConfig(config: VeilConfig): string {
  return `/**
 * Veil Configuration
 *
 * This file documents the privacy guarantees of your application.
 * It is used by the Veil CLI and serves as documentation.
 */

export interface VeilConfig {
  project: {
    name: string;
    network: "devnet" | "mainnet-beta";
  };
  privacy: {
    identity: {
      enabled: boolean;
      method: "zk-login" | "passkey";
      storeOnChain: boolean;
    };
    access: {
      proofRequired: boolean;
      revealAddress: boolean;
    };
    recovery: {
      enabled: boolean;
      method: "timelock" | "shamir";
      publicGuardians: boolean;
      revealParticipants: boolean;
    };
  };
  infrastructure: {
    rpc: {
      provider: "helius" | "default";
      publicPolling: boolean;
    };
    observability: {
      webhooks: boolean;
      exposeMetadata: boolean;
    };
  };
  integrations: {
    shadowPay: {
      enabled: boolean;
    };
  };
}

export function defineVeilConfig(config: VeilConfig): VeilConfig {
  return config;
}

export default defineVeilConfig({
  project: {
    name: "${config.projectName}",
    network: "${config.network}",
  },

  privacy: {
    identity: {
      enabled: true,
      method: "zk-login", // conceptual, hackathon-safe
      storeOnChain: false,
    },

    access: {
      proofRequired: true,
      revealAddress: false,
    },

    recovery: {
      enabled: true,
      method: "timelock", // or "shamir"
      publicGuardians: false,
      revealParticipants: false,
    },
  },

  infrastructure: {
    rpc: {
      provider: "${config.helius ? "helius" : "default"}",
      publicPolling: false,
    },

    observability: {
      webhooks: ${config.helius},
      exposeMetadata: false,
    },
  },

  integrations: {
    shadowPay: {
      enabled: ${config.shadowPay ? "true" : "false"},
    },
  },
});
`;
}

export function generateEnvExample(config: VeilConfig): string {
  let env = `# ============================================
# Veil Configuration
# ============================================

# Veil Features Network (voting, staking, multisig)
NEXT_PUBLIC_NETWORK=${config.network}
`;

  if (config.helius) {
    env += `
# Helius RPC for Veil features (${config.network})
# Get your key at https://helius.dev
HELIUS_API_KEY=your_helius_api_key
HELIUS_RPC_URL=https://${config.network}.helius-rpc.com/?api-key=YOUR_KEY
HELIUS_WEBHOOK_SECRET=your_webhook_secret
`;
  }

  if (config.shadowPay) {
    env += `
# ============================================
# ShadowPay Configuration (MAINNET)
# ============================================
# ⚠️  ShadowPay uses MAINNET for real private transfers
# This is separate from Veil features which use ${config.network}

# Mainnet RPC for ShadowPay (Helius recommended for production)
NEXT_PUBLIC_SHADOWPAY_RPC=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# Optional: ShadowPay API for enhanced features
SHADOWPAY_API_KEY=your_shadowpay_key
`;
  }

  return env;
}

export function generateReadme(config: VeilConfig): string {
  const srcDir = config.framework === "nextjs" ? "app" : "src";
  const templateInfo = TEMPLATE_INFO[config.template];

  return `# ${config.projectName}

**${templateInfo.name}** — ${templateInfo.description}

A privacy-first Solana application built with Veil + ShadowWire.

## Privacy Architecture

This app includes the **complete Veil privacy stack**:

| Feature | Description | Network |
|---------|-------------|---------|
| 🔐 **Identity** | ZK authentication, no PII on-chain | ${config.network} |
| 🔄 **Recovery** | Shamir secret sharing, hidden guardians | ${config.network} |
| 🗳️ **Voting** | Commit-reveal privacy | ${config.network} |
| 📊 **Staking** | Hidden amounts via Pedersen | ${config.network} |
| 👥 **Multisig** | Stealth signers | ${config.network} |
${config.features.shadowpay ? `| ⚡ **ShadowPay** | Private transfers via @radr/shadowwire | mainnet |` : ""}

## What's Private vs Public

| Aspect | Private | Public |
|--------|---------|--------|
| Your identity | ✅ Never on-chain | |
| Wallet access method | ✅ Hidden | |
| Recovery guardians | ✅ Hidden | |
| Vote choices | ✅ Hidden until reveal | |
| Stake amounts | ✅ Committed privately | |
| Transaction amounts | | ❌ Visible (unless via ShadowPay) |

## Project Structure

\`\`\`
/${srcDir}              → Frontend application
/${srcDir}/components   → UI & privacy components
/lib/privacy     → Privacy modules (login, recovery, access)
/lib/veil        → Veil SDK integration (RPC, Helius)
${config.features.shadowpay ? `/lib/shadowpay   → ShadowWire private transfers (mainnet)` : ""}
/hooks           → React hooks for Veil SDK
/contexts        → Provider contexts
\`\`\`

## Getting Started

\`\`\`bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev
\`\`\`

## Network Configuration

- **Veil Features**: Run on \`${config.network}\` for development
- **ShadowPay**: Runs on \`mainnet\` for real private transfers

---

Built with [Veil](https://github.com/veil-protocol) + [ShadowWire](https://shadowwire.io)
`;
}

// Re-export from other template files
export * from "./privacy.js";
export * from "./privacy-modules.js";
export * from "./infra.js";
export * from "./project.js";
export * from "./components.js";
export * from "./config.js";
export * from "./shadowpay.js";
export * from "./sdk-integration.js";

