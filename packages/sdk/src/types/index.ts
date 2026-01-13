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

