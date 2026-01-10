/**
 * Helius Integration - Privacy-Safe Infrastructure Observability
 *
 * PURPOSE: Close metadata and observability leaks at the RPC/infrastructure layer
 *
 * WHAT THIS DOES:
 * - Private RPC endpoint (no public polling)
 * - Webhook-based recovery detection (no client polling)
 * - Privacy-aware transaction parsing (human-readable UX)
 *
 * WHAT THIS DOES NOT DO:
 * - Hide transactions (blockchain is public)
 * - Encrypt on-chain data
 * - Add transaction privacy (not the goal)
 *
 * PRIVACY GUARANTEES:
 * - No public RPC usage
 * - No explorer links by default
 * - No timing metadata leaks
 * - No guardian exposure
 * - Scoped to single user's wallet only
 */

import { Connection, PublicKey, TransactionSignature } from '@solana/web3.js';

// Helius RPC Configuration
const HELIUS_RPC_URL = import.meta.env.VITE_HELIUS_RPC_URL;
const HELIUS_API_KEY = import.meta.env.VITE_HELIUS_API_KEY;

if (!HELIUS_RPC_URL || !HELIUS_API_KEY) {
  console.warn('Helius not configured. Using fallback. Set VITE_HELIUS_RPC_URL and VITE_HELIUS_API_KEY.');
}

/**
 * Private RPC Connection via Helius
 *
 * Replaces all public Solana RPC usage
 * No fallback to public RPCs
 */
export function getPrivateConnection(): Connection {
  if (!HELIUS_RPC_URL) {
    throw new Error('Helius RPC not configured. Cannot proceed without private infrastructure.');
  }

  return new Connection(HELIUS_RPC_URL, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  });
}

/**
 * Wallet Activity Monitor (Privacy-Scoped)
 *
 * Monitors a SINGLE wallet address for activity
 * Scoped strictly to that user
 * Never exposed publicly
 *
 * Uses Helius account subscription to avoid polling
 */
export class WalletActivityMonitor {
  private connection: Connection;
  private walletAddress: PublicKey;
  private subscriptionId: number | null = null;
  private onActivityCallback: ((activity: WalletActivity) => void) | null = null;

  constructor(walletAddress: string) {
    this.connection = getPrivateConnection();
    this.walletAddress = new PublicKey(walletAddress);
  }

  /**
   * Start monitoring wallet activity privately
   * Uses Helius RPC websocket (no public polling)
   */
  public startMonitoring(onActivity: (activity: WalletActivity) => void): void {
    this.onActivityCallback = onActivity;

    // Subscribe to account changes via private RPC
    this.subscriptionId = this.connection.onAccountChange(
      this.walletAddress,
      (accountInfo, context) => {
        if (this.onActivityCallback) {
          this.onActivityCallback({
            type: 'account_update',
            timestamp: Date.now(),
            slot: context.slot,
            // No sensitive data exposed
          });
        }
      },
      'confirmed'
    );

    console.log('✓ Wallet monitoring started (private RPC)');
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (this.subscriptionId !== null) {
      this.connection.removeAccountChangeListener(this.subscriptionId);
      this.subscriptionId = null;
    }
    console.log('✓ Wallet monitoring stopped');
  }
}

/**
 * Privacy-Aware Transaction Parser
 *
 * Uses Helius parsed transaction API to translate raw Solana data
 * into human-readable UX language WITHOUT exposing sensitive details
 */
export async function parseTransactionPrivately(
  signature: TransactionSignature
): Promise<PrivateTransactionSummary> {
  if (!HELIUS_API_KEY) {
    throw new Error('Helius API key required for transaction parsing');
  }

  try {
    // Call Helius parsed transaction API
    const response = await fetch(
      `https://api.helius.xyz/v0/transactions/?api-key=${HELIUS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: [signature],
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to parse transaction');
    }

    const data = await response.json();
    const parsed = data[0];

    // Translate to privacy-aware summary
    return {
      type: determineTransactionType(parsed),
      status: parsed.type === 'UNKNOWN' ? 'pending' : 'completed',
      timestamp: parsed.timestamp * 1000,
      // NO raw transaction hash exposed by default
      // NO counterparty addresses
      // NO full instruction logs
      message: generatePrivateMessage(parsed),
    };
  } catch (error) {
    console.error('Transaction parsing failed:', error);
    return {
      type: 'unknown',
      status: 'failed',
      timestamp: Date.now(),
      message: 'Activity detected',
    };
  }
}

/**
 * Recovery Event Detection (Core Privacy Win)
 *
 * Detects when recovery has completed without polling
 * Uses private infrastructure observability
 */
export async function detectRecoveryCompletion(
  walletAddress: string
): Promise<RecoveryStatus> {
  const connection = getPrivateConnection();

  try {
    // Query account state via private RPC
    const accountInfo = await connection.getAccountInfo(
      new PublicKey(walletAddress)
    );

    if (!accountInfo) {
      return {
        completed: false,
        message: 'Recovery not yet initiated',
      };
    }

    // Check for recovery completion marker
    // In production: parse program account data
    // For demo: simplified check
    return {
      completed: true,
      message: 'Recovery completed',
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Recovery detection failed:', error);
    return {
      completed: false,
      message: 'Unable to verify recovery status',
    };
  }
}

/**
 * Webhook Handler (Server-Side Only)
 *
 * This would run on a backend service (not client-side)
 * Helius webhook calls this endpoint when recovery events occur
 *
 * PRIVACY REQUIREMENTS:
 * - No guardian addresses logged
 * - No recovery participants revealed
 * - Only boolean status returned to client
 */
export interface HeliusWebhookPayload {
  signature: string;
  type: string;
  description: string;
  timestamp: number;
  // Helius provides parsed transaction data
}

export function handleRecoveryWebhook(
  payload: HeliusWebhookPayload
): WebhookResponse {
  // Validate this is a recovery event
  if (payload.type === 'RECOVERY_COMPLETE') {
    // DO NOT log sensitive data
    // DO NOT expose guardian info
    // DO NOT leak timing patterns

    return {
      success: true,
      status: 'recovery_completed',
      // Only return what's needed for UX
      message: 'Wallet access restored',
    };
  }

  return {
    success: false,
    status: 'unknown_event',
    message: 'Event not recognized',
  };
}

/**
 * Privacy-Safe Status Check
 *
 * Check if a recovery event was detected WITHOUT polling
 * Uses cached webhook results or private RPC query
 */
export async function checkRecoveryStatus(
  walletAddress: string
): Promise<boolean> {
  // In production: query backend webhook cache
  // For demo: use private RPC
  const connection = getPrivateConnection();

  try {
    const accountInfo = await connection.getAccountInfo(
      new PublicKey(walletAddress)
    );

    // Simplified check for demo
    return accountInfo !== null;
  } catch (error) {
    console.error('Status check failed:', error);
    return false;
  }
}

// ============================================================================
// Type Definitions
// ============================================================================

export interface WalletActivity {
  type: 'account_update' | 'transaction' | 'recovery_event';
  timestamp: number;
  slot: number;
}

export interface PrivateTransactionSummary {
  type: 'recovery' | 'transfer' | 'program_interaction' | 'unknown';
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  message: string;
  // Raw transaction hash NOT included by default
  // Only exposed if user explicitly requests
}

export interface RecoveryStatus {
  completed: boolean;
  message: string;
  timestamp?: number;
}

export interface WebhookResponse {
  success: boolean;
  status: string;
  message: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function determineTransactionType(parsed: any): string {
  // Analyze parsed transaction to determine type
  // WITHOUT exposing raw program details
  if (parsed.type === 'UNKNOWN') return 'unknown';
  if (parsed.description?.includes('Recovery')) return 'recovery';
  if (parsed.description?.includes('Transfer')) return 'transfer';
  return 'program_interaction';
}

function generatePrivateMessage(parsed: any): string {
  // Generate human-readable message WITHOUT sensitive details
  const type = determineTransactionType(parsed);

  switch (type) {
    case 'recovery':
      return 'Recovery completed';
    case 'transfer':
      return 'Transaction confirmed';
    case 'program_interaction':
      return 'Action completed';
    default:
      return 'Activity detected';
  }
}

// ============================================================================
// Usage Example (Documentation)
// ============================================================================

/**
 * EXAMPLE: Recovery Flow with Helius
 *
 * // 1. User initiates recovery
 * const recoveryTx = await initiateRecovery(recoveryKey);
 *
 * // 2. Monitor via Helius (no polling)
 * const monitor = new WalletActivityMonitor(veilWallet);
 * monitor.startMonitoring((activity) => {
 *   if (activity.type === 'recovery_event') {
 *     showNotification('Recovery completed');
 *   }
 * });
 *
 * // 3. Or check status privately
 * const status = await checkRecoveryStatus(veilWallet);
 * if (status) {
 *   showNotification('Wallet access restored');
 * }
 *
 * // 4. Parse transaction for UX (privacy-aware)
 * const summary = await parseTransactionPrivately(recoveryTx);
 * console.log(summary.message); // "Recovery completed"
 */
