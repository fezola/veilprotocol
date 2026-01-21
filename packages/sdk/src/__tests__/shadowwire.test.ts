/**
 * ShadowWire Integration Module Tests
 *
 * Tests for ShadowWire integration with Veil Protocol
 * - Private transfers
 * - Stealth addresses
 * - USD1 stablecoin integration
 * - Voting, multisig, staking via ShadowWire
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import {
  ShadowWireIntegration,
  USD1PrivateClient,
  createShadowWireClient,
  createUSD1Client,
  USD1_MINT,
  USD1_DECIMALS,
  VoteChoice,
} from '../shadowwire';

// Mock connection
const createMockConnection = () => ({
  getBalance: vi.fn().mockResolvedValue(1000000000),
  getAccountInfo: vi.fn().mockResolvedValue(null),
  sendTransaction: vi.fn().mockResolvedValue('mock-signature'),
  sendRawTransaction: vi.fn().mockResolvedValue('mock-signature'),
  confirmTransaction: vi.fn().mockResolvedValue({ value: { err: null } }),
  getLatestBlockhash: vi.fn().mockResolvedValue({
    blockhash: 'mock-blockhash',
    lastValidBlockHeight: 100,
  }),
} as unknown as Connection);

describe('ShadowWire Integration Module', () => {
  let mockConnection: Connection;
  const mockSignTx = async (tx: Transaction) => tx;

  beforeEach(() => {
    mockConnection = createMockConnection();
  });

  describe('createShadowWireClient', () => {
    it('should create a ShadowWire integration client', () => {
      const client = createShadowWireClient({
        connection: mockConnection,
        encryptionKey: 'test-key',
      });
      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(ShadowWireIntegration);
    });
  });

  describe('ShadowWireIntegration', () => {
    let client: ShadowWireIntegration;

    beforeEach(() => {
      client = new ShadowWireIntegration({
        connection: mockConnection,
        encryptionKey: 'test-encryption-key',
      });
    });

    describe('privateTransfer', () => {
      it('should create a private transfer', async () => {
        const recipient = Keypair.generate().publicKey;
        const result = await client.privateTransfer(
          { recipient, amount: 1.0 },
          mockSignTx
        );

        expect(result.success).toBe(true);
        expect(result.signature).toBeDefined();
      });

      it('should create a stealth transfer', async () => {
        const recipient = Keypair.generate().publicKey;
        const result = await client.privateTransfer(
          { recipient, amount: 1.0, useStealth: true },
          mockSignTx
        );

        expect(result.success).toBe(true);
        expect(result.stealthAddress).toBeDefined();
      });

      it('should include range proof in transfer result', async () => {
        const recipient = Keypair.generate().publicKey;
        const result = await client.privateTransfer(
          { recipient, amount: 1.0 },
          mockSignTx
        );

        expect(result.success).toBe(true);
        expect(result.rangeProof).toBeDefined();
        expect(result.rangeProof!.proofBytes).toBeDefined();
        expect(result.rangeProof!.blindingFactor).toBeDefined();
        expect(result.rangeProof!.blindingFactor.length).toBe(32);
        expect(result.rangeProof!.bitWidth).toBe(64);
      });
    });

    describe('generateRangeProof', () => {
      it('should generate a 64-bit range proof', async () => {
        const amount = BigInt(1000000000); // 1 SOL in lamports
        const proof = await client.generateRangeProof(amount, 64);

        expect(proof.proofBytes).toBeDefined();
        expect(proof.proofBytes.length).toBeGreaterThan(0);
        expect(proof.blindingFactor).toBeDefined();
        expect(proof.blindingFactor.length).toBe(32);
        expect(proof.bitWidth).toBe(64);
      });

      it('should generate different proofs for same amount', async () => {
        const amount = BigInt(1000000000);
        const proof1 = await client.generateRangeProof(amount, 64);
        const proof2 = await client.generateRangeProof(amount, 64);

        // Different blinding factors should produce different proofs
        expect(proof1.blindingFactor).not.toEqual(proof2.blindingFactor);
      });
    });

    describe('createPedersenCommitment', () => {
      it('should create a Pedersen commitment', async () => {
        const amount = BigInt(1000000000);
        const blindingFactor = new Uint8Array(32).fill(1);
        const commitment = await client.createPedersenCommitment(amount, blindingFactor);

        expect(commitment).toBeDefined();
        expect(commitment.length).toBe(32);
      });

      it('should create deterministic commitment for same inputs', async () => {
        const amount = BigInt(1000000000);
        const blindingFactor = new Uint8Array(32).fill(1);

        const commitment1 = await client.createPedersenCommitment(amount, blindingFactor);
        const commitment2 = await client.createPedersenCommitment(amount, blindingFactor);

        expect(commitment1).toEqual(commitment2);
      });

      it('should create different commitments for different amounts', async () => {
        const blindingFactor = new Uint8Array(32).fill(1);

        const commitment1 = await client.createPedersenCommitment(BigInt(1000), blindingFactor);
        const commitment2 = await client.createPedersenCommitment(BigInt(2000), blindingFactor);

        expect(commitment1).not.toEqual(commitment2);
      });
    });

    describe('generateStealthAddress', () => {
      it('should generate a stealth address', async () => {
        const recipient = Keypair.generate().publicKey;
        const stealth = await client.generateStealthAddress(recipient);

        expect(stealth.address).toBeDefined();
        expect(stealth.address).toBeInstanceOf(PublicKey);
        expect(stealth.viewKey).toBeDefined();
        expect(stealth.viewKey.length).toBe(32);
        expect(stealth.spendKey).toBeDefined();
        expect(stealth.spendKey.length).toBe(32);
      });

      it('should generate different stealth addresses for same recipient', async () => {
        const recipient = Keypair.generate().publicKey;
        const stealth1 = await client.generateStealthAddress(recipient);
        const stealth2 = await client.generateStealthAddress(recipient);

        expect(stealth1.address.toBase58()).not.toBe(stealth2.address.toBase58());
      });
    });

    describe('Veil privacy modules', () => {
      it('should have voting module', () => {
        expect(client.voting).toBeDefined();
      });

      it('should have multisig module', () => {
        expect(client.multisig).toBeDefined();
      });

      it('should have staking module', () => {
        expect(client.staking).toBeDefined();
      });
    });

    describe('createPrivateVote', () => {
      it('should create a private vote', async () => {
        const proposalId = new Uint8Array(32).fill(1);
        const result = await client.createPrivateVote(
          proposalId,
          VoteChoice.YES,
          mockSignTx
        );

        expect(result.success).toBe(true);
        expect(result.commitment).toBeDefined();
      });
    });

    describe('createStealthMultisig', () => {
      it('should create a stealth multisig', async () => {
        const result = await client.createStealthMultisig(
          2,
          ['alice@email.com', 'bob@email.com', 'carol@email.com'],
          mockSignTx
        );

        expect(result.success).toBe(true);
        expect(result.vaultId).toBeDefined();
        expect(result.signerSecrets).toBeDefined();
        expect(result.signerSecrets!.length).toBe(3);
      });
    });

    describe('privateStake', () => {
      it('should create a private stake', async () => {
        const validator = Keypair.generate().publicKey;
        const result = await client.privateStake(validator, 100, mockSignTx);

        expect(result.success).toBe(true);
        expect(result.commitment).toBeDefined();
      });
    });
  });

  describe('USD1PrivateClient', () => {
    let client: USD1PrivateClient;
    let wallet: Keypair;

    beforeEach(() => {
      client = new USD1PrivateClient({
        connection: mockConnection,
        encryptionKey: 'test-encryption-key',
      });
      wallet = Keypair.generate();
    });

    describe('createUSD1Client', () => {
      it('should create a USD1 client', () => {
        const usd1Client = createUSD1Client({
          connection: mockConnection,
          encryptionKey: 'test-key',
        });
        expect(usd1Client).toBeDefined();
        expect(usd1Client).toBeInstanceOf(USD1PrivateClient);
      });
    });

    describe('getBalance', () => {
      it('should return USD1 balance', async () => {
        const balance = await client.getBalance(wallet.publicKey);

        expect(balance).toBeDefined();
        expect(balance.public).toBe(0);
        expect(balance.shielded).toBe(0);
        expect(balance.total).toBe(0);
      });
    });

    describe('shield', () => {
      it('should shield USD1 tokens', async () => {
        const result = await client.shield(
          wallet.publicKey,
          100,
          mockSignTx
        );

        expect(result.success).toBe(true);
        expect(result.signature).toBeDefined();
      });
    });

    describe('privateTransfer', () => {
      it('should transfer USD1 privately', async () => {
        const recipient = Keypair.generate().publicKey;
        const result = await client.privateTransfer(
          { recipient, amount: 50 },
          mockSignTx
        );

        expect(result.success).toBe(true);
        expect(result.signature).toBeDefined();
      });

      it('should transfer USD1 with stealth address', async () => {
        const recipient = Keypair.generate().publicKey;
        const result = await client.privateTransfer(
          { recipient, amount: 50, useStealth: true },
          mockSignTx
        );

        expect(result.success).toBe(true);
        expect(result.stealthAddress).toBeDefined();
      });
    });

    describe('unshield', () => {
      it('should unshield USD1 tokens', async () => {
        const recipient = Keypair.generate().publicKey;
        const result = await client.unshield(100, recipient, mockSignTx);

        expect(result.success).toBe(true);
        expect(result.signature).toBeDefined();
      });
    });
  });

  describe('USD1 Constants', () => {
    it('should have correct USD1 mint', () => {
      expect(USD1_MINT).toBeDefined();
      expect(USD1_MINT).toBeInstanceOf(PublicKey);
    });

    it('should have correct USD1 decimals', () => {
      expect(USD1_DECIMALS).toBe(6);
    });
  });
});

