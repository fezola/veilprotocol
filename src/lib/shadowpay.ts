/**
 * ShadowPay Integration - Privacy-Safe Value Transfer
 *
 * Purpose: Enable private value movement within the privacy-first account lifecycle
 * Scope: Minimal integration - one private payment capability
 *
 * This is NOT a payments app.
 * This is a privacy capability inside a larger privacy system.
 */

import { ShadowWireClient } from '@radr/shadowwire';
import type { PublicKey } from '@solana/web3.js';

// Types for privacy-safe payment flow
export interface PrivatePaymentRequest {
  recipient: string;
  amount: number;
  token?: 'SOL'; // Hackathon scope: SOL only
}

export interface PrivatePaymentResult {
  success: boolean;
  status: 'submitted' | 'completed' | 'failed';
  message: string;
  // NO transaction hashes exposed by default
  // NO counterparty details leaked
  // NO timing metadata
}

// Initialize ShadowWire client (singleton)
let shadowWireClient: ShadowWireClient | null = null;

function getShadowWireClient(): ShadowWireClient {
  if (!shadowWireClient) {
    shadowWireClient = new ShadowWireClient({
      debug: import.meta.env.DEV, // Only in development
    });
  }
  return shadowWireClient;
}

/**
 * Send a private payment using ShadowWire
 *
 * Privacy guarantees:
 * - Amount privacy (not visible on-chain)
 * - Transfer privacy (handled by ShadowPay)
 * - No identity leakage
 * - No wallet linkage
 *
 * What this does NOT do:
 * - Hide the transaction entirely
 * - Anonymize Solana globally
 * - Store payment history
 */
export async function sendPrivatePayment(
  request: PrivatePaymentRequest,
  walletPublicKey: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
): Promise<PrivatePaymentResult> {
  try {
    const client = getShadowWireClient();

    // Use ShadowWire for private transfer
    // Let ShadowPay handle amount privacy and transfer logic
    const result = await client.transfer({
      sender: walletPublicKey.toBase58(),
      recipient: request.recipient,
      amount: request.amount,
      token: request.token || 'SOL',
      type: 'internal', // Private transfer type - hides amount on-chain
      wallet: { signMessage }, // Required wallet signature
    });

    if (result.success) {
      return {
        success: true,
        status: 'completed',
        message: 'Private payment completed',
      };
    } else {
      return {
        success: false,
        status: 'failed',
        message: result.error || 'Payment failed',
      };
    }
  } catch (error) {
    console.error('[ShadowPay] Payment error:', error);
    return {
      success: false,
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error',
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

  if (amount > 1000) {
    return {
      valid: false,
      message: 'Demo limit: 1000 SOL maximum',
    };
  }

  return { valid: true };
}

/**
 * Privacy positioning:
 * - ShadowPay enables private value transfer
 * - Veil Protocol ensures identity, access, and recovery remain private
 * - Privacy guarantees work together, not in isolation
 */
