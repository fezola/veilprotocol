/**
 * ShadowPay Integration - Privacy-Safe Value Transfer
 *
 * Purpose: Enable private value movement within the privacy-first account lifecycle
 * Scope: Full mainnet integration with @radr/shadowwire
 *
 * IMPORTANT: ShadowWire operates on MAINNET only.
 * - Private payments require mainnet SOL
 * - Veil Protocol features (voting, staking, multisig) work on devnet
 * - This creates a hybrid network approach for the hackathon
 */

import { ShadowWireClient } from '@radr/shadowwire';
import type { PublicKey } from '@solana/web3.js';

// ============================================================================
// NETWORK CONFIGURATION
// ============================================================================

/**
 * ShadowWire Network Mode
 * - 'mainnet': Real private transactions (requires mainnet SOL)
 * - 'demo': Simulated for testing/demos (no real transactions)
 */
export type ShadowPayNetwork = 'mainnet' | 'demo';

// Default to mainnet for real integration, can be overridden via env
const SHADOWPAY_NETWORK: ShadowPayNetwork =
  (import.meta.env.VITE_SHADOWPAY_NETWORK as ShadowPayNetwork) || 'mainnet';

// Minimum SOL required for a private payment (covers fees + small transfer)
export const MIN_SOL_FOR_PRIVATE_PAYMENT = 0.01;

// ============================================================================
// TYPES
// ============================================================================

export interface PrivatePaymentRequest {
  recipient: string;
  amount: number;
  token?: 'SOL';
}

export interface PrivatePaymentResult {
  success: boolean;
  status: 'submitted' | 'completed' | 'failed';
  message: string;
  network: ShadowPayNetwork;
  txSignature?: string; // Only exposed on successful mainnet tx
  commitment?: string;  // Pedersen commitment hash
}

export interface NetworkStatus {
  network: ShadowPayNetwork;
  isMainnet: boolean;
  requiresMainnetSol: boolean;
  minSolRequired: number;
}

// ============================================================================
// CLIENT INITIALIZATION
// ============================================================================

let shadowWireClient: ShadowWireClient | null = null;

/**
 * Get the ShadowWire client configured for mainnet
 * ShadowWire only operates on mainnet - no devnet support
 */
function getShadowWireClient(): ShadowWireClient {
  if (!shadowWireClient) {
    shadowWireClient = new ShadowWireClient({
      // ShadowWire is mainnet-only - no network param needed for mainnet
      debug: import.meta.env.DEV,
    });
  }
  return shadowWireClient;
}

/**
 * Check current network configuration
 */
export function getNetworkStatus(): NetworkStatus {
  return {
    network: SHADOWPAY_NETWORK,
    isMainnet: SHADOWPAY_NETWORK === 'mainnet',
    requiresMainnetSol: SHADOWPAY_NETWORK === 'mainnet',
    minSolRequired: MIN_SOL_FOR_PRIVATE_PAYMENT,
  };
}

/**
 * Check if we're in demo mode (no real transactions)
 */
export function isDemoMode(): boolean {
  return SHADOWPAY_NETWORK === 'demo';
}

/**
 * Send a private payment using ShadowWire
 *
 * MAINNET INTEGRATION:
 * - ShadowWire operates on Solana mainnet only
 * - Requires mainnet SOL for transactions
 * - Provides real amount privacy via Pedersen commitments
 *
 * Privacy guarantees:
 * - Amount privacy (hidden on-chain via commitments)
 * - Transfer privacy (mixing pool breaks sender-recipient link)
 * - No identity leakage
 * - No wallet pattern analysis possible
 */
export async function sendPrivatePayment(
  request: PrivatePaymentRequest,
  walletPublicKey: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
): Promise<PrivatePaymentResult> {
  const networkStatus = getNetworkStatus();

  // Demo mode - simulate without real transactions
  if (isDemoMode()) {
    console.log('[ShadowPay] Running in demo mode - no real transactions');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate a fake commitment for demo
    const demoCommitment = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return {
      success: true,
      status: 'completed',
      message: 'Demo: Private payment simulated (set VITE_SHADOWPAY_NETWORK=mainnet for real transactions)',
      network: 'demo',
      commitment: demoCommitment,
    };
  }

  // Mainnet mode - real ShadowWire transactions
  try {
    const client = getShadowWireClient();

    // Generate auth message for ShadowWire API
    const nonce = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    const authMessage = `shadowpay:zk_transfer:${nonce}:${timestamp}`;
    const authMessageBytes = new TextEncoder().encode(authMessage);

    // Sign the auth message with wallet
    const signature = await signMessage(authMessageBytes);
    const signatureBase64 = btoa(String.fromCharCode(...signature));

    console.log('[ShadowPay] Sending mainnet private payment via ShadowWire...');
    console.log('[ShadowPay] Amount:', request.amount, 'SOL (will be hidden on-chain)');

    // Use ShadowWire for private transfer
    const result = await client.transfer({
      sender: walletPublicKey.toBase58(),
      recipient: request.recipient,
      amount: request.amount,
      token: request.token || 'SOL',
      type: 'internal', // Private transfer - amount hidden via Pedersen commitment
      wallet: {
        signMessage,
        publicKey: walletPublicKey.toBase58(),
      },
      auth: {
        message: authMessage,
        signature: signatureBase64,
        nonce,
        timestamp,
      },
    });

    if (result.success) {
      console.log('[ShadowPay] Mainnet payment successful!');
      return {
        success: true,
        status: 'completed',
        message: 'Private payment completed on mainnet',
        network: 'mainnet',
        txSignature: result.signature,
        commitment: result.commitment,
      };
    } else {
      return {
        success: false,
        status: 'failed',
        message: result.error || 'Payment failed',
        network: 'mainnet',
      };
    }
  } catch (error) {
    console.error('[ShadowPay] Mainnet payment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Provide helpful error messages
    if (errorMessage.includes('insufficient')) {
      return {
        success: false,
        status: 'failed',
        message: `Insufficient mainnet SOL. You need at least ${MIN_SOL_FOR_PRIVATE_PAYMENT} SOL for private payments.`,
        network: 'mainnet',
      };
    }

    return {
      success: false,
      status: 'failed',
      message: `Mainnet error: ${errorMessage}`,
      network: 'mainnet',
    };
  }
}

/**
 * Validate recipient address (basic format check)
 * Does NOT expose validation to blockchain
 */
export function validateRecipientAddress(address: string): boolean {
  // Basic Solana address validation (32-44 chars, base58)
  if (!address || address.length < 32 || address.length > 44) {
    return false;
  }

  // Base58 character set
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Regex.test(address);
}

/**
 * Privacy-safe amount validation
 * No external calls, no metadata leaked
 */
export function validateAmount(amount: number): {
  valid: boolean;
  message?: string;
} {
  if (amount <= 0) {
    return {
      valid: false,
      message: 'Amount must be greater than zero',
    };
  }

  if (amount < MIN_SOL_FOR_PRIVATE_PAYMENT) {
    return {
      valid: false,
      message: `Minimum amount is ${MIN_SOL_FOR_PRIVATE_PAYMENT} SOL`,
    };
  }

  if (amount > 100) {
    return {
      valid: false,
      message: 'Maximum 100 SOL per private transaction',
    };
  }

  return { valid: true };
}

/**
 * Check if wallet has enough mainnet SOL for private payments
 */
export async function checkMainnetBalance(
  walletAddress: string
): Promise<{ sufficient: boolean; balance: number; required: number }> {
  try {
    // Use mainnet RPC to check balance
    const response = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [walletAddress],
      }),
    });

    const data = await response.json();
    const balanceLamports = data.result?.value || 0;
    const balanceSol = balanceLamports / 1e9;

    return {
      sufficient: balanceSol >= MIN_SOL_FOR_PRIVATE_PAYMENT,
      balance: balanceSol,
      required: MIN_SOL_FOR_PRIVATE_PAYMENT,
    };
  } catch (error) {
    console.error('[ShadowPay] Failed to check mainnet balance:', error);
    return {
      sufficient: false,
      balance: 0,
      required: MIN_SOL_FOR_PRIVATE_PAYMENT,
    };
  }
}

// ============================================================================
// NETWORK INFO FOR UI
// ============================================================================

/**
 * Get human-readable network information for UI display
 */
export function getNetworkInfo(): {
  name: string;
  description: string;
  warning?: string;
} {
  if (isDemoMode()) {
    return {
      name: 'Demo Mode',
      description: 'Simulated private payments (no real transactions)',
      warning: 'Set VITE_SHADOWPAY_NETWORK=mainnet for real private payments',
    };
  }

  return {
    name: 'Mainnet',
    description: 'Real private payments via ShadowWire',
    warning: 'Requires mainnet SOL - transactions are final',
  };
}

/**
 * Privacy Stack Summary:
 *
 * VEIL PROTOCOL (Devnet):
 * - Identity: ZK commitments, no on-chain PII
 * - Recovery: Shamir secret sharing, guardian privacy
 * - Voting: Commit-reveal, hidden choices
 * - Staking: Pedersen commitments, hidden amounts
 * - Multisig: Stealth signers, hidden thresholds
 *
 * SHADOWPAY (Mainnet):
 * - Private transfers via @radr/shadowwire
 * - Amount hiding via Pedersen commitments
 * - Sender-recipient unlinking via mixing
 * - Range proofs via Bulletproofs
 */
