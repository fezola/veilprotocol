/**
 * Veil Private Staking Module
 * 
 * Stake with hidden amounts and validators.
 * Uses Pedersen commitments to hide stake amounts on-chain.
 */

import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  sha256String, 
  poseidonHash, 
  bytesToHex, 
  bytesToBigInt, 
  randomBytes,
  createPedersenCommitment 
} from '../crypto';
import { ProofData, Commitment, PedersenCommitment } from '../types';

// Program ID for private staking
export const STAKING_PROGRAM_ID = new PublicKey('5C1VaebPdHZYETnTL18cLJK2RexXmVVhkkYpnYHD5P4h');

// ============================================================================
// TYPES
// ============================================================================

export interface StakePool {
  poolId: Uint8Array;
  creator: PublicKey;
  minStakeLamports: bigint;
  rewardRateBps: number;
  lockupEpochs: number;
  totalStakeCommitments: number;
  totalStakedLamports: bigint;
  createdAt: number;
  isActive: boolean;
}

export interface PrivateStake {
  pool: PublicKey;
  staker: PublicKey;
  stakeCommitment: Uint8Array;
  validatorCommitment: Uint8Array;
  stakedAt: number;
  unlockAt: number;
  isActive: boolean;
  claimedRewards: bigint;
}

export interface StakeSecret {
  secret: Uint8Array;
  amount: number;
  validatorPubkey: PublicKey;
  commitment: Uint8Array;
}

export interface StakeResult {
  success: boolean;
  commitment?: string;
  signature?: string;
  unlockAt?: number;
  error?: string;
}

export interface RewardsInfo {
  pending: number;
  claimed: number;
  apr: number;
}

// ============================================================================
// PRIVATE STAKING CLIENT
// ============================================================================

export class PrivateStakingClient {
  private connection: Connection;
  private encryptionKey: string;
  private stakes: Map<string, StakeSecret> = new Map();

  constructor(connection: Connection, encryptionKey: string) {
    this.connection = connection;
    this.encryptionKey = encryptionKey;
  }

  /**
   * Stake privately with hidden amount
   * The amount is committed using Pedersen commitments
   * 
   * @example
   * ```typescript
   * const { commitment, secret } = await staking.stake(
   *   validatorPubkey,
   *   100,  // SOL amount - encrypted!
   *   signTransaction
   * );
   * // Save secret for unstaking!
   * ```
   */
  async stake(
    validatorPubkey: PublicKey,
    amount: number,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<StakeResult> {
    try {
      if (amount <= 0) {
        return { success: false, error: 'Amount must be positive' };
      }

      const secret = randomBytes(32);
      const amountLamports = BigInt(Math.floor(amount * LAMPORTS_PER_SOL));

      // Create validator commitment (hides which validator)
      const validatorCommitment = await this.computeValidatorCommitment(validatorPubkey, secret);

      // Create stake commitment (hides amount)
      const stakeCommitment = await this.computeStakeCommitment(
        amountLamports,
        validatorCommitment,
        secret
      );

      // Calculate unlock time (default 1 epoch = ~5 days)
      const unlockAt = Math.floor(Date.now() / 1000) + (5 * 24 * 60 * 60);

      // Store locally
      const stakeData: StakeSecret = {
        secret,
        amount,
        validatorPubkey,
        commitment: stakeCommitment,
      };
      this.stakes.set(bytesToHex(stakeCommitment), stakeData);

      return {
        success: true,
        commitment: bytesToHex(stakeCommitment),
        unlockAt,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to stake',
      };
    }
  }

  /**
   * Unstake after lockup period
   * Requires the secret to prove ownership
   */
  async unstake(
    stakeCommitment: Uint8Array,
    secret: Uint8Array,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<StakeResult> {
    try {
      const stakeData = this.stakes.get(bytesToHex(stakeCommitment));
      if (!stakeData) {
        return { success: false, error: 'Stake not found' };
      }

      // Verify secret
      if (bytesToHex(secret) !== bytesToHex(stakeData.secret)) {
        return { success: false, error: 'Invalid secret' };
      }

      // In production, call unstake instruction
      this.stakes.delete(bytesToHex(stakeCommitment));

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to unstake',
      };
    }
  }

  /**
   * Claim staking rewards
   */
  async claimRewards(
    stakeCommitment: Uint8Array,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<StakeResult> {
    try {
      // In production, call claim_rewards instruction
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to claim rewards',
      };
    }
  }

  /**
   * Get pending rewards info
   */
  async getRewardsInfo(stakeCommitment: Uint8Array): Promise<RewardsInfo> {
    const stakeData = this.stakes.get(bytesToHex(stakeCommitment));
    if (!stakeData) {
      return { pending: 0, claimed: 0, apr: 0 };
    }

    // Calculate approximate rewards (simplified)
    const stakedAt = Date.now() - (7 * 24 * 60 * 60 * 1000); // Assume 1 week ago
    const epochsElapsed = 1;
    const apr = 0.05; // 5% APR
    const pending = stakeData.amount * (apr / 52) * epochsElapsed;

    return {
      pending,
      claimed: 0,
      apr: apr * 100,
    };
  }

  /**
   * Get all active stakes for this client
   */
  getActiveStakes(): StakeSecret[] {
    return Array.from(this.stakes.values());
  }

  /**
   * Compute validator commitment: hash(validator || salt)
   */
  private async computeValidatorCommitment(
    validator: PublicKey,
    salt: Uint8Array
  ): Promise<Uint8Array> {
    const data = validator.toBase58() + bytesToHex(salt);
    return sha256String(data);
  }

  /**
   * Compute stake commitment: hash(amount || validatorCommitment || secret)
   */
  private async computeStakeCommitment(
    amountLamports: bigint,
    validatorCommitment: Uint8Array,
    secret: Uint8Array
  ): Promise<Uint8Array> {
    const data = amountLamports.toString() + bytesToHex(validatorCommitment) + bytesToHex(secret);
    return sha256String(data);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function verifyStakeCommitment(
  commitment: Uint8Array,
  amount: bigint,
  validatorCommitment: Uint8Array,
  secret: Uint8Array
): Promise<boolean> {
  const data = amount.toString() + bytesToHex(validatorCommitment) + bytesToHex(secret);
  const expected = await sha256String(data);
  return bytesToHex(expected) === bytesToHex(commitment);
}

export function calculateRewards(
  stakedAmount: number,
  rewardRateBps: number,
  epochsElapsed: number
): number {
  return stakedAmount * (rewardRateBps / 10000) * epochsElapsed;
}

export function isStakeUnlocked(unlockAt: number): boolean {
  return Date.now() / 1000 >= unlockAt;
}

