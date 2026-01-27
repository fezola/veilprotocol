/**
 * Core Types for Veil Protocol SDK
 * All privacy-related type definitions
 */

import { PublicKey } from '@solana/web3.js';

// ============================================================================
// CRYPTOGRAPHIC PRIMITIVES
// ============================================================================

/** A 32-byte commitment hash */
export type Commitment = Uint8Array;

/** A Pedersen commitment for amount hiding */
export interface PedersenCommitment {
  commitment: Uint8Array;
  blindingFactor: Uint8Array;
}

/** ZK Proof in Groth16 format */
export interface ZKProof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: 'groth16';
  curve: 'bn128';
}

/** Complete proof data with public signals */
export interface ProofData {
  proof: ZKProof;
  publicSignals: string[];
  commitment: string;
  nullifier: string;
  timestamp: number;
  verified: boolean;
}

// ============================================================================
// IDENTITY TYPES
// ============================================================================

/** Supported identity methods */
export type IdentityMethod = 'email' | 'passkey' | 'social' | 'custom';

/** Identity input (never stored on-chain) */
export interface IdentityInput {
  method: IdentityMethod;
  identifier: string;
  secret: string;
}

/** Result of identity proof generation */
export interface IdentityProofResult {
  success: boolean;
  commitment: Commitment;
  proof: ProofData;
  wallet: PublicKey;
  error?: string;
}

// ============================================================================
// SHIELDED BALANCE TYPES
// ============================================================================

/** A shielded balance entry */
export interface ShieldedBalance {
  /** Encrypted amount (only owner can decrypt) */
  encryptedAmount: Uint8Array;
  /** Pedersen commitment to the amount */
  commitment: PedersenCommitment;
  /** Token mint (SOL = system program) */
  mint: PublicKey;
  /** Timestamp of last update */
  updatedAt: number;
}

/** Deposit request to shielded pool */
export interface ShieldDeposit {
  amount: number;
  mint: PublicKey;
  proof: ProofData;
}

/** Withdrawal request from shielded pool */
export interface ShieldWithdraw {
  amount: number;
  mint: PublicKey;
  recipient: PublicKey;
  proof: ProofData;
}

// ============================================================================
// PRIVATE TRANSACTION TYPES
// ============================================================================

/** Private transfer request */
export interface PrivateTransfer {
  amountCommitment: PedersenCommitment;
  recipient: PublicKey;
  memo?: string;
  proof: ProofData;
}

/** Transfer result */
export interface TransferResult {
  success: boolean;
  signature?: string;
  error?: string;
}

// ============================================================================
// RECOVERY TYPES
// ============================================================================

/** Recovery method */
export type RecoveryMethod = 'timelock' | 'shamir' | 'hybrid';

/** Shamir share */
export interface ShamirShare {
  index: number;
  share: string;
  threshold: number;
  total: number;
}

/** Recovery configuration */
export interface RecoveryConfig {
  method: RecoveryMethod;
  timelockDays?: number;
  shamirThreshold?: number;
  shamirTotal?: number;
}

/** Recovery key with metadata */
export interface RecoveryKey {
  key: string;
  commitment: string;
  method: RecoveryMethod;
  createdAt: number;
  expiresAt?: number;
}

// ============================================================================
// DEX TYPES
// ============================================================================

/** Private swap request */
export interface PrivateSwapRequest {
  inputMint: PublicKey;
  outputMint: PublicKey;
  amountCommitment: PedersenCommitment;
  minOutputCommitment: PedersenCommitment;
  slippageBps: number;
  proof: ProofData;
}

/** Swap result */
export interface SwapResult {
  success: boolean;
  signature?: string;
  inputAmount?: number;
  outputAmount?: number;
  error?: string;
}

// ============================================================================
// TOKEN PRIVACY TYPES
// ============================================================================

/** Private token account */
export interface PrivateTokenAccount {
  mint: PublicKey;
  encryptedBalance: Uint8Array;
  commitment: PedersenCommitment;
  owner: Commitment;
}

/** Token privacy config */
export interface TokenPrivacyConfig {
  hideBalance: boolean;
  hideTransfers: boolean;
  hideHoldings: boolean;
}

// ============================================================================
// SHIELDED POOL TYPES
// ============================================================================

/** Parameters for creating a shielded pool */
export interface CreatePoolParams {
  /** Unique pool identifier (32 bytes) */
  poolId: Uint8Array;
  /** Reward rate in basis points (0-10000) */
  rewardRateBps: number;
  /** Lockup period in epochs (1-52) */
  lockupEpochs: number;
}

/** Shielded pool state (on-chain) */
export interface ShieldedPool {
  /** Pool address */
  address: PublicKey;
  /** Pool ID */
  poolId: Uint8Array;
  /** Creator public key */
  creator: PublicKey;
  /** Reward rate in basis points */
  rewardRateBps: number;
  /** Lockup epochs */
  lockupEpochs: number;
  /** Current Merkle root of note commitments */
  merkleRoot: Uint8Array;
  /** Next note index */
  nextNoteIndex: number;
  /** Total notes created */
  totalNotes: number;
  /** Number of nullifiers (spent notes) */
  nullifierCount: number;
  /** Creation timestamp */
  createdAt: number;
  /** Pool active status */
  isActive: boolean;
}

/** Parameters for depositing to a shielded pool */
export interface PoolDepositParams {
  /** Pool to deposit to */
  pool: PublicKey;
  /** Amount to deposit (in SOL) */
  amount: number;
  /** Note commitment = H(amount || blinding || owner_commitment) */
  noteCommitment: Uint8Array;
  /** Encrypted note data (only owner can decrypt) */
  encryptedNote: Uint8Array;
  /** Bulletproofs range proof */
  rangeProof: Uint8Array;
}

/** Parameters for withdrawing from a shielded pool */
export interface PoolWithdrawParams {
  /** Pool to withdraw from */
  pool: PublicKey;
  /** Nullifier to prevent double-spend */
  nullifier: Uint8Array;
  /** Merkle proof for note membership */
  merkleProof: Uint8Array[];
  /** Merkle path indices (bit flags) */
  merklePathIndices: number;
  /** ZK proof for valid withdrawal */
  withdrawalProof: Uint8Array;
  /** Output commitment for change (or zero for full withdraw) */
  outputCommitment: Uint8Array;
  /** Recipient public key */
  recipient: PublicKey;
}

/** Shielded note (represents a hidden stake/deposit) */
export interface ShieldedNote {
  /** Pool this note belongs to */
  pool: PublicKey;
  /** Note commitment */
  commitment: Uint8Array;
  /** Encrypted note data */
  encryptedData: Uint8Array;
  /** Index in Merkle tree */
  noteIndex: number;
  /** Creation timestamp */
  createdAt: number;
  /** Unlock timestamp */
  unlockAt: number;
  /** Whether the note has been spent */
  isSpent: boolean;
}

/** Result of a pool operation */
export interface PoolOperationResult {
  success: boolean;
  signature?: string;
  noteCommitment?: Uint8Array;
  nullifier?: Uint8Array;
  error?: string;
}

/** Client-side note data (decrypted) */
export interface DecryptedNote {
  /** Amount in lamports */
  amount: bigint;
  /** Blinding factor */
  blindingFactor: Uint8Array;
  /** Owner commitment */
  ownerCommitment: Uint8Array;
  /** Unlock timestamp */
  unlockAt: number;
}

