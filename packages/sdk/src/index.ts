/**
 * @veil-protocol/sdk
 *
 * Complete Privacy Infrastructure for Solana
 *
 * Features:
 * - 🎭 Identity: ZK-based anonymous authentication
 * - 🛡️ Shielded: Hide wallet balances from public view
 * - 💸 Transfer: Private transactions with hidden amounts
 * - 🪙 Tokens: Private token holdings
 * - 🔄 DEX: Private swaps on Jupiter/Raydium
 * - 🔑 Recovery: Privacy-preserving wallet recovery
 * - 👛 Wallet: Wallet adapter for dApp integration
 * - 🗳️ Voting: Private commit-reveal voting for DAOs
 * - 👥 Multisig: Stealth M-of-N signing with hidden identities
 * - 💰 Staking: Private staking with hidden amounts
 *
 * @example
 * ```typescript
 * import { VeilClient } from '@veil-protocol/sdk';
 *
 * const veil = new VeilClient({ connection });
 *
 * // Anonymous login
 * await veil.connect({
 *   method: 'email',
 *   identifier: 'user@example.com',
 *   secret: 'password'
 * });
 *
 * // Shield your balance
 * await veil.shieldFunds(5.0); // Deposit 5 SOL privately
 *
 * // Private transfer
 * await veil.privateTransfer(recipient, 1.0);
 *
 * // Private swap
 * await veil.privateSwap(TOKENS.SOL, TOKENS.USDC, 1.0);
 *
 * // Private voting
 * const { commitment } = await veil.voting.createVote(proposalId, VoteChoice.YES);
 *
 * // Stealth multisig
 * await veil.multisig.stealthSign(proposalId, signerSecret);
 *
 * // Private staking
 * await veil.staking.stake(validatorPubkey, 100);
 * ```
 */

import { Connection, PublicKey } from '@solana/web3.js';

// Module exports
export * from './types';
export * from './crypto';
export * from './identity';
export * from './recovery';
export * from './transfer';
export * from './shielded';
export * from './tokens';
export * from './dex';
export * from './wallet-adapter';
export * from './voting';
export * from './multisig';
export * from './staking';

// Import for VeilClient
import { generateIdentityProof, createIdentityCommitment, deriveWallet } from './identity';
import { createShieldedClient, ShieldedBalanceClient } from './shielded';
import { createTransferClient, PrivateTransferClient } from './transfer';
import { createTokenClient, PrivateTokenClient } from './tokens';
import { createDexClient, PrivateDexClient, TOKENS } from './dex';
import { createRecoveryKey, splitSecret, combineShares } from './recovery';
import { PrivateVotingClient } from './voting';
import { StealthMultisigClient } from './multisig';
import { PrivateStakingClient } from './staking';
import { IdentityInput, RecoveryConfig, ShamirShare } from './types';

// ============================================================================
// UNIFIED VEIL CLIENT
// ============================================================================

export interface VeilClientConfig {
  connection: Connection;
  cluster?: 'mainnet-beta' | 'devnet' | 'testnet';
}

/**
 * Main Veil Protocol client
 * Unified interface for all privacy features
 */
export class VeilClient {
  public connection: Connection;
  public publicKey: PublicKey | null = null;
  public connected: boolean = false;

  private encryptionKey: string = '';
  private commitment: Uint8Array | null = null;

  // Privacy modules
  public shielded: ShieldedBalanceClient | null = null;
  public transfer: PrivateTransferClient | null = null;
  public tokens: PrivateTokenClient | null = null;
  public dex: PrivateDexClient | null = null;
  public voting: PrivateVotingClient | null = null;
  public multisig: StealthMultisigClient | null = null;
  public staking: PrivateStakingClient | null = null;

  constructor(config: VeilClientConfig) {
    this.connection = config.connection;
  }

  /**
   * Connect with anonymous identity
   */
  async connect(identity: IdentityInput): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await generateIdentityProof(identity);
      if (!result.success) {
        return { success: false, error: result.error };
      }

      this.commitment = result.commitment;
      this.publicKey = result.wallet;
      this.connected = true;
      this.encryptionKey = Buffer.from(result.commitment).toString('hex');

      // Initialize modules
      this.shielded = createShieldedClient(this.connection, this.encryptionKey);
      this.transfer = createTransferClient(this.connection);
      this.tokens = createTokenClient(this.connection, this.encryptionKey);
      this.dex = createDexClient(this.connection);
      this.voting = new PrivateVotingClient(this.connection, this.encryptionKey);
      this.multisig = new StealthMultisigClient(this.connection, this.encryptionKey);
      this.staking = new PrivateStakingClient(this.connection, this.encryptionKey);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown' };
    }
  }
  
  /**
   * Disconnect
   */
  disconnect(): void {
    this.publicKey = null;
    this.connected = false;
    this.commitment = null;
    this.shielded = null;
    this.transfer = null;
    this.tokens = null;
    this.dex = null;
    this.voting = null;
    this.multisig = null;
    this.staking = null;
  }
  
  /**
   * Get balances (public vs shielded)
   */
  async getBalances(): Promise<{ public: number; shielded: number }> {
    if (!this.connected || !this.publicKey || !this.shielded) {
      return { public: 0, shielded: 0 };
    }
    
    const publicBalance = await this.shielded.getPublicBalance(this.publicKey);
    const shieldedBalance = await this.shielded.getShieldedBalance();
    
    return { public: publicBalance, shielded: shieldedBalance };
  }
  
  /**
   * Setup wallet recovery
   */
  async setupRecovery(config: RecoveryConfig): Promise<{
    recoveryKey: string;
    shares?: ShamirShare[];
  }> {
    if (!this.publicKey) {
      throw new Error('Not connected');
    }
    
    const { key, shares } = await createRecoveryKey(this.publicKey, config);
    return { recoveryKey: key.key, shares };
  }
}

// ============================================================================
// VERSION & CONSTANTS
// ============================================================================

export const VERSION = '0.1.0';
export const VEIL_PROGRAM_ID = new PublicKey('5C1VaebPdHZYETnTL18cLJK2RexXmVVhkkYpnYHD5P4h');

// Re-export token constants
export { TOKENS };

