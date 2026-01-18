/**
 * Private Voting Module Tests
 *
 * Tests for commit-reveal voting scheme
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Connection, PublicKey } from '@solana/web3.js';
import {
  PrivateVotingClient,
  VoteChoice,
  verifyVoteCommitment
} from '../voting';
import { bytesToHex, hexToBytes } from '../crypto';

// Mock connection
const mockConnection = {
  getBalance: async () => 1000000000,
  getAccountInfo: async () => null,
} as unknown as Connection;

describe('Private Voting Module', () => {
  let client: PrivateVotingClient;

  beforeEach(() => {
    client = new PrivateVotingClient(mockConnection, 'test-encryption-key');
  });

  describe('PrivateVotingClient', () => {
    describe('createVote', () => {
      it('should create a vote commitment for YES', async () => {
        const proposalId = new Uint8Array(32).fill(1);
        const mockSignTx = async (tx: any) => tx;

        const result = await client.createVote(
          proposalId,
          VoteChoice.YES,
          mockSignTx
        );

        expect(result.success).toBe(true);
        expect(result.commitment).toBeDefined();
        expect(result.commitment!.length).toBe(64); // 32 bytes hex
      });

      it('should create a vote commitment for NO', async () => {
        const proposalId = new Uint8Array(32).fill(2);
        const mockSignTx = async (tx: any) => tx;

        const result = await client.createVote(
          proposalId,
          VoteChoice.NO,
          mockSignTx
        );

        expect(result.success).toBe(true);
        expect(result.commitment).toBeDefined();
      });

      it('should create different commitments for different proposals', async () => {
        const proposalId1 = new Uint8Array(32).fill(1);
        const proposalId2 = new Uint8Array(32).fill(2);
        const mockSignTx = async (tx: any) => tx;

        const result1 = await client.createVote(proposalId1, VoteChoice.YES, mockSignTx);
        const result2 = await client.createVote(proposalId2, VoteChoice.YES, mockSignTx);

        expect(result1.commitment).not.toBe(result2.commitment);
      });

      it('should create different commitments for different choices', async () => {
        const proposalId = new Uint8Array(32).fill(1);
        const mockSignTx = async (tx: any) => tx;

        // Create two clients to get independent votes
        const client1 = new PrivateVotingClient(mockConnection, 'key1');
        const client2 = new PrivateVotingClient(mockConnection, 'key2');

        const result1 = await client1.createVote(proposalId, VoteChoice.YES, mockSignTx);
        const result2 = await client2.createVote(proposalId, VoteChoice.NO, mockSignTx);

        expect(result1.commitment).not.toBe(result2.commitment);
      });
    });

    describe('createProposal', () => {
      it('should create a new proposal', async () => {
        const metadataHash = new Uint8Array(32).fill(1);
        const mockSignTx = async (tx: any) => tx;

        const result = await client.createProposal(
          metadataHash,
          86400, // 1 day voting
          43200, // 12 hour reveal
          mockSignTx
        );

        expect(result.success).toBe(true);
        expect(result.proposalId).toBeDefined();
        expect(result.proposalId!.length).toBe(64);
      });
    });

    describe('getProposalResults', () => {
      it('should return empty results for new proposal', async () => {
        const proposalId = PublicKey.default;

        const results = await client.getProposalResults(proposalId);

        expect(results.yes).toBe(0);
        expect(results.no).toBe(0);
        expect(results.total).toBe(0);
      });
    });
  });

  describe('VoteChoice enum', () => {
    it('should have correct values', () => {
      expect(VoteChoice.YES).toBe(1);
      expect(VoteChoice.NO).toBe(0);
      expect(VoteChoice.ABSTAIN).toBe(2);
    });
  });
});

