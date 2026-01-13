/**
 * Veil Protocol Configuration
 * 
 * This file contains the configuration for the Veil Protocol,
 * including feature flags, integrations, and program settings.
 */

export interface VeilConfig {
  // Network configuration
  network: 'devnet' | 'mainnet-beta';
  programId: string;
  
  // Feature flags
  features: {
    identity: boolean;
    recovery: boolean;
    voting: boolean;
    multisig: boolean;
    staking: boolean;
  };
  
  // External integrations
  integrations: {
    /**
     * ShadowPay: Private value transfer via ShadowWire
     * Enable for private token transfers with hidden amounts.
     * 
     * When enabled:
     * - Transfers use Pedersen commitments to hide amounts
     * - Recipients can verify amounts without public exposure
     * - Compatible with SOL, USDC, and other SPL tokens
     * 
     * @see https://shadowwire.io/docs/shadowpay
     */
    shadowPay: boolean;
    
    /**
     * Helius: Privacy-focused RPC
     * Using Helius RPC reduces metadata leakage from public endpoints.
     */
    helius: boolean;
  };
  
  // Recovery settings
  recovery: {
    timelockSeconds: number;
    minGuardians: number;
    maxGuardians: number;
  };
  
  // Voting settings
  voting: {
    defaultVotingPeriod: number;
    defaultRevealPeriod: number;
  };
  
  // Staking settings
  staking: {
    minStake: number;
    maxStake: number;
  };
}

/**
 * Default configuration for Veil Protocol
 */
export const defaultConfig: VeilConfig = {
  network: 'devnet',
  programId: '5C1VaebPdHZYETnTL18cLJK2RexXmVVhkkYpnYHD5P4h',
  
  features: {
    identity: true,
    recovery: true,
    voting: true,
    multisig: true,
    staking: true,
  },
  
  integrations: {
    // ShadowPay: Enable for private value transfer (Radar Hackathon eligible)
    // When true, transfers use Pedersen commitments to hide amounts
    shadowPay: false, // Set to true to enable private transfers
    
    // Helius: Privacy-focused RPC (recommended)
    // Using Helius RPC to avoid public polling and reduce metadata leakage
    helius: true,
  },
  
  recovery: {
    timelockSeconds: 86400, // 24 hours
    minGuardians: 2,
    maxGuardians: 5,
  },
  
  voting: {
    defaultVotingPeriod: 259200, // 3 days
    defaultRevealPeriod: 86400, // 1 day
  },
  
  staking: {
    minStake: 1, // 1 SOL minimum
    maxStake: 10000, // 10,000 SOL maximum
  },
};

// Current active configuration
let activeConfig: VeilConfig = { ...defaultConfig };

/**
 * Get the current configuration
 */
export function getConfig(): VeilConfig {
  return activeConfig;
}

/**
 * Update the configuration
 */
export function setConfig(config: Partial<VeilConfig>): void {
  activeConfig = { ...activeConfig, ...config };
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof VeilConfig['features']): boolean {
  return activeConfig.features[feature];
}

/**
 * Check if an integration is enabled
 */
export function isIntegrationEnabled(integration: keyof VeilConfig['integrations']): boolean {
  return activeConfig.integrations[integration];
}

/**
 * Enable ShadowPay integration
 * 
 * @example
 * ```ts
 * enableShadowPay();
 * // Now transfers will use Pedersen commitments for privacy
 * ```
 */
export function enableShadowPay(): void {
  activeConfig.integrations.shadowPay = true;
  console.log('[Veil] ShadowPay enabled - transfers will use privacy features');
}

/**
 * Disable ShadowPay integration
 */
export function disableShadowPay(): void {
  activeConfig.integrations.shadowPay = false;
}

export default defaultConfig;

