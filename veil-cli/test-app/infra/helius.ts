/**
 * Helius Integration (Disabled)
 * 
 * Helius provides enhanced RPC and webhooks for Solana.
 * Enable it during project setup to use these features.
 */

export const HELIUS_ENABLED = false;

export function getHeliusRpcUrl(): string {
  throw new Error("Helius is not enabled. Run veil init with Helius enabled.");
}
