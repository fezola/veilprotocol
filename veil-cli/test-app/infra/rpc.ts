/**
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

const NETWORK = "devnet";

/**
 * Get the RPC URL based on configuration.
 * Server-side only for privacy.
 */
function getRpcUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side: use public endpoint (limited)
    return clusterApiUrl("devnet");
  }
  
  // Server-side: use configured RPC
  return "https://api.devnet.solana.com" || clusterApiUrl("devnet");
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
