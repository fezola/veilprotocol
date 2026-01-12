import { VeilConfig } from "../cli.js";

export function generateRpcTs(config: VeilConfig): string {
  const rpcUrl = config.helius 
    ? "process.env.HELIUS_RPC_URL" 
    : config.network === "devnet"
      ? '"https://api.devnet.solana.com"'
      : '"http://localhost:8899"';

  return `/**
 * RPC Configuration
 * 
 * Privacy-aware RPC layer that abstracts connection details.
 * 
 * PRIVACY NOTE:
 * - RPC providers can see your requests
 * - Use Helius for better rate limits and webhooks
 * - Never expose API keys in client-side code
 */

import { Connection, clusterApiUrl } from "@solana/web3.js";

const NETWORK = "${config.network}";

/**
 * Get the RPC URL based on configuration.
 * Server-side only for privacy.
 */
function getRpcUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side: use public endpoint (limited)
    return clusterApiUrl("${config.network}");
  }
  
  // Server-side: use configured RPC
  return ${rpcUrl} || clusterApiUrl("${config.network}");
}

/**
 * Create a connection to the Solana network.
 */
export function createConnection(): Connection {
  return new Connection(getRpcUrl(), {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60000,
  });
}

/**
 * Get network name for display.
 */
export function getNetworkName(): string {
  return NETWORK.charAt(0).toUpperCase() + NETWORK.slice(1);
}

export { NETWORK };
`;
}

export function generateHeliusTs(config: VeilConfig): string {
  if (!config.helius) {
    return `/**
 * Helius Integration (Disabled)
 * 
 * Helius provides enhanced RPC and webhooks for Solana.
 * Enable it during project setup to use these features.
 */

export const HELIUS_ENABLED = false;

export function getHeliusRpcUrl(): string {
  throw new Error("Helius is not enabled. Run veil init with Helius enabled.");
}
`;
  }

  return `/**
 * Helius Integration
 * 
 * Enhanced RPC and webhook support for Solana.
 * 
 * PRIVACY NOTE:
 * - Helius sees your RPC requests (standard for any RPC provider)
 * - Webhooks can notify you of on-chain events
 * - Never expose API keys client-side
 */

export const HELIUS_ENABLED = true;

/**
 * Get Helius RPC URL (server-side only).
 */
export function getHeliusRpcUrl(): string {
  const apiKey = process.env.HELIUS_API_KEY;
  if (!apiKey) {
    throw new Error("HELIUS_API_KEY not configured");
  }
  return \`https://${config.network}.helius-rpc.com/?api-key=\${apiKey}\`;
}

/**
 * Verify Helius webhook signature.
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string
): Promise<boolean> {
  const secret = process.env.HELIUS_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("HELIUS_WEBHOOK_SECRET not configured");
    return false;
  }

  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const signatureBytes = Uint8Array.from(
    atob(signature),
    (c) => c.charCodeAt(0)
  );

  const payloadBytes = encoder.encode(payload);
  return crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes.buffer as ArrayBuffer,
    payloadBytes.buffer as ArrayBuffer
  );
}

/**
 * Webhook handler placeholder.
 * Implement your own logic based on event type.
 */
export interface HeliusWebhookEvent {
  type: string;
  data: unknown;
  timestamp: number;
}

export async function handleWebhook(event: HeliusWebhookEvent): Promise<void> {
  console.log("Received webhook event:", event.type);
  // Implement your webhook handling logic here
}
`;
}

