/**
 * Stealth Multisig Module Tests
 *
 * Tests for M-of-N signing with hidden identities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Connection, PublicKey } from '@solana/web3.js';
import {
  StealthMultisigClient,
  verifySignerCommitment,
  isThresholdReached,
  MAX_SIGNERS
} from '../multisig';
import { bytesToHex } from '../crypto';

// Mock connection
const mockConnection = {
  getBalance: async () => 1000000000,
  getAccountInfo: async () => null,
} as unknown as Connection;

describe('Stealth Multisig Module', () => {
  let client: StealthMultisigClient;

  beforeEach(() => {
    client = new StealthMultisigClient(mockConnection, 'test-encryption-key');
  });

  describe('StealthMultisigClient', () => {
    describe('createVault', () => {
      it('should create a 2-of-3 multisig vault', async () => {
        const mockSignTx = async (tx: any) => tx;

        const result = await client.createVault(
          2, // threshold
          ['alice@email.com', 'bob@email.com', 'carol@email.com'],
          mockSignTx
        );

        expect(result.success).toBe(true);
        expect(result.vaultId).toBeDefined();
        expect(result.signerSecrets).toBeDefined();
        expect(result.signerSecrets!.length).toBe(3);
      });

      it('should create unique commitments for each signer', async () => {
        const mockSignTx = async (tx: any) => tx;

        const result = await client.createVault(
          2,
          ['alice@email.com', 'bob@email.com', 'carol@email.com'],
          mockSignTx
        );

        const commitments = result.signerSecrets!.map(s => bytesToHex(s.commitment));
        const uniqueCommitments = new Set(commitments);

        expect(uniqueCommitments.size).toBe(3);
      });

      it('should reject invalid threshold (0)', async () => {
        const mockSignTx = async (tx: any) => tx;

        const result = await client.createVault(
          0,
          ['alice@email.com'],
          mockSignTx
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid threshold');
      });

      it('should reject threshold > signers', async () => {
        const mockSignTx = async (tx: any) => tx;

        const result = await client.createVault(
          5,
          ['alice@email.com', 'bob@email.com'],
          mockSignTx
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid threshold');
      });

      it('should reject too many signers', async () => {
        const mockSignTx = async (tx: any) => tx;
        const tooManySigners = Array.from({ length: 15 }, (_, i) => `signer${i}@email.com`);

        const result = await client.createVault(
          3,
          tooManySigners,
          mockSignTx
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('Maximum');
      });
    });

    describe('createProposal', () => {
      it('should create a proposal', async () => {
        const mockSignTx = async (tx: any) => tx;
        const vaultId = new Uint8Array(32).fill(1);
        const instructionData = new Uint8Array([1, 2, 3, 4]);

        const result = await client.createProposal(
          vaultId,
          instructionData,
          mockSignTx
        );

        expect(result.success).toBe(true);
        expect(result.proposalId).toBeDefined();
      });
    });

    describe('stealthSign', () => {
      it('should sign with a valid signer secret', async () => {
        const mockSignTx = async (tx: any) => tx;

        // First create a vault
        const vaultResult = await client.createVault(
          2,
          ['alice@email.com', 'bob@email.com'],
          mockSignTx
        );

        // Then sign with one of the secrets
        const proposalId = new Uint8Array(32).fill(1);
        const signerSecret = vaultResult.signerSecrets![0];

        const signResult = await client.stealthSign(
          proposalId,
          signerSecret,
          mockSignTx
        );

        expect(signResult.success).toBe(true);
        expect(signResult.signature).toBeDefined();
      });
    });
  });

  describe('isThresholdReached', () => {
    it('should return true when approvals >= threshold', () => {
      const proposal = {
        multisig: PublicKey.default,
        proposalId: new Uint8Array(32),
        instructionHash: new Uint8Array(32),
        createdAt: Date.now(),
        approvalCount: 3,
        approvalCommitments: [],
        isExecuted: false,
      };

      expect(isThresholdReached(proposal, 2)).toBe(true);
      expect(isThresholdReached(proposal, 3)).toBe(true);
    });

    it('should return false when approvals < threshold', () => {
      const proposal = {
        multisig: PublicKey.default,
        proposalId: new Uint8Array(32),
        instructionHash: new Uint8Array(32),
        createdAt: Date.now(),
        approvalCount: 1,
        approvalCommitments: [],
        isExecuted: false,
      };

      expect(isThresholdReached(proposal, 2)).toBe(false);
    });
  });

  describe('MAX_SIGNERS constant', () => {
    it('should be 10', () => {
      expect(MAX_SIGNERS).toBe(10);
    });
  });
});

