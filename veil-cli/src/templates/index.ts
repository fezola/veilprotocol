import { VeilConfig } from "../cli.js";

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
  let env = `# Veil Configuration
NEXT_PUBLIC_NETWORK=${config.network}
`;

  if (config.helius) {
    env += `
# Helius RPC (get your key at https://helius.dev)
HELIUS_API_KEY=your_helius_api_key
HELIUS_RPC_URL=https://${config.network}.helius-rpc.com/?api-key=YOUR_KEY
HELIUS_WEBHOOK_SECRET=your_webhook_secret
`;
  }

  if (config.shadowPay) {
    env += `
# ShadowPay Integration
SHADOWPAY_API_KEY=your_shadowpay_key
`;
  }

  return env;
}

export function generateReadme(config: VeilConfig): string {
  return `# ${config.projectName}

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

\`\`\`
/${config.template === "nextjs" ? "app" : "src"}        → Frontend application
/privacy    → Privacy modules (login, recovery, access)
/infra      → Infrastructure (RPC, Helius)
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

## Privacy Guarantees

See \`/privacy/guarantees.ts\` for documented privacy guarantees.

---

Built with [Veil](https://github.com/veil-protocol) — Privacy-first access & recovery for Solana
`;
}

// Re-export from other template files
export * from "./privacy.js";
export * from "./infra.js";
export * from "./project.js";
export * from "./components.js";
export * from "./config.js";
export * from "./shadowpay.js";
export * from "./sdk-integration.js";

