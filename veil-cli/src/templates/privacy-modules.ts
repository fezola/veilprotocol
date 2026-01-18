/**
 * Privacy Module Templates
 * 
 * Templates for voting, multisig, and staking with full privacy
 */

export function generateVotingTs(): string {
  return `/**
 * Private Voting Module
 * 
 * Commit-reveal voting for DAOs with hidden votes until reveal phase.
 * 
 * PRIVACY GUARANTEE:
 * - Vote choices are hidden during voting phase (commitment only)
 * - Votes revealed simultaneously after voting ends
 * - No correlation between commitment and voter identity
 */

import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { PrivateVotingClient, VoteChoice } from "@veil-protocol/sdk/voting";

// Initialize voting client
export function createVotingClient(
  connection: Connection, 
  encryptionKey: string
): PrivateVotingClient {
  return new PrivateVotingClient(connection, encryptionKey);
}

/**
 * Cast a private vote on a proposal
 * Your vote choice is hidden until the reveal phase
 */
export async function castPrivateVote(
  client: PrivateVotingClient,
  proposalId: Uint8Array,
  choice: VoteChoice,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<{ success: boolean; commitment?: string; error?: string }> {
  return client.createVote(proposalId, choice, signTransaction);
}

/**
 * Reveal your vote after voting ends
 * All votes are revealed simultaneously
 */
export async function revealVote(
  client: PrivateVotingClient,
  proposalId: Uint8Array,
  commitment: Uint8Array,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<{ success: boolean; error?: string }> {
  return client.revealVote(proposalId, commitment, signTransaction);
}

// Re-export types
export { VoteChoice } from "@veil-protocol/sdk/voting";
`;
}

export function generateMultisigTs(): string {
  return `/**
 * Stealth Multisig Module
 * 
 * M-of-N signing with hidden signer identities.
 * 
 * PRIVACY GUARANTEE:
 * - Signer identities never revealed on-chain (commitment hashes only)
 * - No one knows WHICH signers approved a transaction
 * - Only know that threshold was reached
 */

import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { StealthMultisigClient, SignerSecret } from "@veil-protocol/sdk/multisig";

// Initialize multisig client
export function createMultisigClient(
  connection: Connection,
  encryptionKey: string
): StealthMultisigClient {
  return new StealthMultisigClient(connection, encryptionKey);
}

/**
 * Create a stealth multisig vault
 * Signers are identified by commitment hashes, not addresses
 */
export async function createStealthVault(
  client: StealthMultisigClient,
  threshold: number,
  signerIdentifiers: string[], // emails, names, etc. - never stored on-chain
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<{
  success: boolean;
  vaultId?: string;
  signerSecrets?: SignerSecret[];
  error?: string;
}> {
  return client.createVault(threshold, signerIdentifiers, signTransaction);
}

/**
 * Sign a proposal without revealing your identity
 * Only commitment hash is stored on-chain
 */
export async function stealthSign(
  client: StealthMultisigClient,
  proposalId: Uint8Array,
  signerSecret: SignerSecret,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<{ success: boolean; signature?: string; error?: string }> {
  return client.stealthSign(proposalId, signerSecret, signTransaction);
}
`;
}

export function generateStakingTs(): string {
  return `/**
 * Private Staking Module
 * 
 * Stake with hidden amounts using Pedersen commitments.
 * 
 * PRIVACY GUARANTEE:
 * - Stake amounts hidden via Pedersen commitments
 * - Only you can decrypt your stake/rewards
 * - Withdrawal uses ZK proof (proves ownership without revealing amount)
 */

import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { PrivateStakingClient } from "@veil-protocol/sdk/staking";

// Initialize staking client
export function createStakingClient(
  connection: Connection,
  encryptionKey: string
): PrivateStakingClient {
  return new PrivateStakingClient(connection, encryptionKey);
}

/**
 * Stake privately with hidden amount
 * Amount is committed, not revealed on-chain
 */
export async function privateStake(
  client: PrivateStakingClient,
  validator: PublicKey,
  amountSol: number,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<{
  success: boolean;
  commitment?: string;
  unlockAt?: number;
  error?: string;
}> {
  return client.stake(validator, amountSol, signTransaction);
}

/**
 * Get your stake rewards (decrypted client-side)
 */
export async function getRewards(
  client: PrivateStakingClient,
  stakeCommitment: Uint8Array
): Promise<{ pending: number; claimed: number; apr: number }> {
  return client.getRewardsInfo(stakeCommitment);
}
`;
}

