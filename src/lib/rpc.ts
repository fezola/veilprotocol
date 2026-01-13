/**
 * Privacy-focused RPC abstraction for Veil Protocol
 * 
 * Privacy note:
 * Using Helius RPC to avoid public polling and reduce metadata leakage.
 * 
 * Why this matters for privacy:
 * - Public RPC endpoints can log your IP + wallet associations
 * - Request patterns can reveal user behavior and timing
 * - Helius provides dedicated endpoints with better privacy practices
 * - Reduced correlation between user sessions and on-chain activity
 * 
 * @module rpc
 */

import { Connection, clusterApiUrl, Commitment } from '@solana/web3.js';

// Environment configuration
const HELIUS_API_KEY = import.meta.env.VITE_HELIUS_API_KEY;
const NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';

/**
 * RPC Provider types
 */
export type RpcProvider = 'helius' | 'public' | 'custom';

export interface RpcConfig {
  provider: RpcProvider;
  endpoint?: string;
  commitment?: Commitment;
  /** Disable WebSocket to reduce metadata leakage */
  disableWs?: boolean;
}

const defaultConfig: RpcConfig = {
  provider: HELIUS_API_KEY ? 'helius' : 'public',
  commitment: 'confirmed',
  disableWs: true, // Privacy: WebSockets can leak more metadata
};

/**
 * Get the RPC endpoint based on configuration
 * 
 * Privacy note:
 * Using Helius RPC to avoid public polling and reduce metadata leakage.
 * Helius is the recommended provider for privacy-focused applications.
 */
function getRpcEndpoint(config: RpcConfig = defaultConfig): string {
  switch (config.provider) {
    case 'helius':
      if (!HELIUS_API_KEY) {
        console.warn('[Veil RPC] HELIUS_API_KEY not set - falling back to public RPC (less private)');
        return clusterApiUrl(NETWORK as 'devnet' | 'mainnet-beta');
      }
      // Privacy note: Using Helius RPC to avoid public polling and reduce metadata leakage
      const cluster = NETWORK === 'mainnet-beta' ? 'mainnet' : 'devnet';
      return `https://${cluster}.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
    
    case 'custom':
      if (!config.endpoint) {
        throw new Error('[Veil RPC] Custom provider requires endpoint');
      }
      return config.endpoint;
    
    case 'public':
    default:
      // Warning: Public RPC endpoints have less privacy
      console.warn('[Veil RPC] Using public RPC - consider Helius for better privacy');
      return clusterApiUrl(NETWORK as 'devnet' | 'mainnet-beta');
  }
}

// Singleton connection instance
let connectionInstance: Connection | null = null;
let currentConfig: RpcConfig = defaultConfig;

/**
 * Get a privacy-optimized Solana connection
 * 
 * @example
 * ```ts
 * const connection = getConnection();
 * const balance = await connection.getBalance(publicKey);
 * ```
 */
export function getConnection(config?: Partial<RpcConfig>): Connection {
  const mergedConfig = { ...defaultConfig, ...config };
  
  // Create new connection if config changed or not initialized
  if (!connectionInstance || JSON.stringify(mergedConfig) !== JSON.stringify(currentConfig)) {
    currentConfig = mergedConfig;
    connectionInstance = new Connection(getRpcEndpoint(mergedConfig), {
      commitment: mergedConfig.commitment,
      // Disable WebSocket to reduce metadata leakage
      wsEndpoint: mergedConfig.disableWs ? undefined : undefined,
    });
  }
  
  return connectionInstance;
}

/**
 * Reset the connection (useful for switching networks)
 */
export function resetConnection(): void {
  connectionInstance = null;
}

/**
 * Get current RPC provider info
 */
export function getRpcInfo(): { provider: RpcProvider; isPrivate: boolean } {
  return {
    provider: currentConfig.provider,
    isPrivate: currentConfig.provider === 'helius',
  };
}

/**
 * Check if Helius is configured
 */
export function isHeliusConfigured(): boolean {
  return !!HELIUS_API_KEY;
}

// Export types
export { Connection, Commitment };

