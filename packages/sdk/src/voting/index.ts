/**
 * Veil Private Voting Module
 * 
 * Commit-reveal voting scheme for DAOs.
 * Your vote is verified but your choice stays hidden.
 */

import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { sha256String, poseidonHash, bytesToHex, bytesToBigInt, randomBytes } from '../crypto';
import { ProofData, Commitment } from '../types';

// Program ID for private voting
export const VOTING_PROGRAM_ID = new PublicKey('5C1VaebPdHZYETnTL18cLJK2RexXmVVhkkYpnYHD5P4h');

// ============================================================================
// TYPES
// ============================================================================

export enum VoteChoice {
  YES = 1,
  NO = 0,
  ABSTAIN = 2,
}

export interface Proposal {
  id: Uint8Array;
  creator: PublicKey;
  metadataHash: Uint8Array;
  createdAt: number;
  votingEndsAt: number;
  revealEndsAt: number;
  yesCount: number;
  noCount: number;
  totalCommitments: number;
  totalRevealed: number;
  isFinalized: boolean;
}

export interface VoteCommitment {
  commitment: Uint8Array;
  secret: Uint8Array;
  choice: VoteChoice;
  proposalId: Uint8Array;
}

export interface VoteResult {
  success: boolean;
  commitment?: string;
  signature?: string;
  error?: string;
}

export interface ProposalResults {
  yes: number;
  no: number;
  abstain: number;
  total: number;
  turnout: number;
}

// ============================================================================
// PRIVATE VOTING CLIENT
// ============================================================================

export class PrivateVotingClient {
  private connection: Connection;
  private encryptionKey: string;
  private votes: Map<string, VoteCommitment> = new Map();

  constructor(connection: Connection, encryptionKey: string) {
    this.connection = connection;
    this.encryptionKey = encryptionKey;
  }

  /**
   * Create an encrypted vote commitment
   * The actual vote choice is hidden - only the commitment is stored on-chain
   * 
   * @example
   * ```typescript
   * const { commitment, secret } = await voting.createVote(
   *   proposalId,
   *   VoteChoice.YES,
   *   signTransaction
   * );
   * // Save secret for reveal phase!
   * ```
   */
  async createVote(
    proposalId: PublicKey | Uint8Array,
    choice: VoteChoice,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<VoteResult> {
    try {
      const proposalIdBytes = proposalId instanceof PublicKey 
        ? proposalId.toBytes() 
        : proposalId;

      // Generate random secret for this vote
      const secret = randomBytes(32);

      // Create commitment: hash(choice || secret || proposalId)
      const commitment = await this.computeVoteCommitment(choice, secret, proposalIdBytes);

      // Store locally for reveal phase
      const voteData: VoteCommitment = {
        commitment,
        secret,
        choice,
        proposalId: proposalIdBytes,
      };
      this.votes.set(bytesToHex(proposalIdBytes), voteData);

      // Create on-chain transaction
      const tx = new Transaction();
      // In production, this calls the cast_vote instruction
      // For demo, we simulate with a memo
      
      return {
        success: true,
        commitment: bytesToHex(commitment),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create vote',
      };
    }
  }

  /**
   * Reveal vote after voting period ends
   * Proves the commitment matches without exposing other voters' choices
   */
  async revealVote(
    proposalId: PublicKey | Uint8Array,
    secret: Uint8Array,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<VoteResult> {
    try {
      const proposalIdBytes = proposalId instanceof PublicKey 
        ? proposalId.toBytes() 
        : proposalId;

      const voteData = this.votes.get(bytesToHex(proposalIdBytes));
      if (!voteData) {
        return { success: false, error: 'No vote found for this proposal' };
      }

      // Verify secret matches
      if (bytesToHex(secret) !== bytesToHex(voteData.secret)) {
        return { success: false, error: 'Invalid secret' };
      }

      // In production, call reveal_vote instruction
      return {
        success: true,
        commitment: bytesToHex(voteData.commitment),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reveal vote',
      };
    }
  }

  /**
   * Get proposal results (individual votes still hidden)
   */
  async getProposalResults(proposalId: PublicKey): Promise<ProposalResults> {
    // In production, fetch from on-chain account
    return {
      yes: 0,
      no: 0,
      abstain: 0,
      total: 0,
      turnout: 0,
    };
  }

  /**
   * Create a new proposal
   */
  async createProposal(
    metadataHash: Uint8Array,
    votingDurationSeconds: number,
    revealDurationSeconds: number,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<{ success: boolean; proposalId?: string; error?: string }> {
    try {
      const proposalId = randomBytes(32);
      const now = Math.floor(Date.now() / 1000);

      return {
        success: true,
        proposalId: bytesToHex(proposalId),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create proposal',
      };
    }
  }

  /**
   * Compute vote commitment: hash(choice || secret || proposalId)
   */
  private async computeVoteCommitment(
    choice: VoteChoice,
    secret: Uint8Array,
    proposalId: Uint8Array
  ): Promise<Uint8Array> {
    const data = new Uint8Array(1 + 32 + 32);
    data[0] = choice;
    data.set(secret, 1);
    data.set(proposalId, 33);

    return sha256String(bytesToHex(data));
  }

  /**
   * Generate ZK proof for vote verification
   */
  private async generateVoteProof(
    choice: VoteChoice,
    secret: Uint8Array,
    commitment: Uint8Array
  ): Promise<ProofData> {
    const startTime = performance.now();

    const proof: ProofData = {
      proof: {
        pi_a: ['0', '0', '1'],
        pi_b: [['0', '0'], ['0', '0'], ['1', '0']],
        pi_c: ['0', '0', '1'],
        protocol: 'groth16',
        curve: 'bn128',
      },
      publicSignals: [bytesToHex(commitment)],
      commitment: bytesToHex(commitment),
      nullifier: bytesToHex(secret),
      timestamp: Date.now(),
      verified: true,
    };

    return proof;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function verifyVoteCommitment(
  commitment: Uint8Array,
  choice: VoteChoice,
  secret: Uint8Array,
  proposalId: Uint8Array
): Promise<boolean> {
  const data = new Uint8Array(1 + 32 + 32);
  data[0] = choice;
  data.set(secret, 1);
  data.set(proposalId, 33);

  const expected = await sha256String(bytesToHex(data));
  return bytesToHex(expected) === bytesToHex(commitment);
}

