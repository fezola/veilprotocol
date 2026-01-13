/**
 * Identity Module Tests
 *
 * Tests for ZK-based identity generation and verification
 */

import { describe, it, expect } from 'vitest';
import {
  generateIdentityProof,
  verifyIdentityProof,
  createIdentityCommitment,
  deriveWallet
} from '../identity';

describe('Identity Module', () => {
  describe('generateIdentityProof', () => {
    it('should generate a proof from email and secret', async () => {
      const result = await generateIdentityProof({
        method: 'email',
        identifier: 'test@example.com',
        secret: 'my-secret-key'
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.commitment).toBeDefined();
      expect(result.proof).toBeDefined();
      expect(result.wallet).toBeDefined();
    });

    it('should generate deterministic wallets for same inputs', async () => {
      const result1 = await generateIdentityProof({
        method: 'email',
        identifier: 'test@example.com',
        secret: 'my-secret-key'
      });

      const result2 = await generateIdentityProof({
        method: 'email',
        identifier: 'test@example.com',
        secret: 'my-secret-key'
      });

      // Same inputs should produce same wallet
      expect(result1.wallet.toBase58()).toBe(result2.wallet.toBase58());
    });

    it('should generate different wallets for different inputs', async () => {
      const result1 = await generateIdentityProof({
        method: 'email',
        identifier: 'test@example.com',
        secret: 'secret-1'
      });

      const result2 = await generateIdentityProof({
        method: 'email',
        identifier: 'test@example.com',
        secret: 'secret-2'
      });

      expect(result1.wallet.toBase58()).not.toBe(result2.wallet.toBase58());
    });
  });

  describe('verifyIdentityProof', () => {
    it('should verify a valid proof', async () => {
      const result = await generateIdentityProof({
        method: 'email',
        identifier: 'test@example.com',
        secret: 'my-secret-key'
      });

      const isValid = await verifyIdentityProof(result.proof);
      expect(isValid).toBe(true);
    });

    it('should reject an invalid proof', async () => {
      const invalidProof = {
        proof: {
          pi_a: null,
          pi_b: null,
          pi_c: null,
          protocol: 'invalid',
          curve: 'bn128'
        },
        publicSignals: [],
        commitment: '',
        nullifier: '',
        timestamp: 0,
        verified: false
      };

      const isValid = await verifyIdentityProof(invalidProof as any);
      expect(isValid).toBe(false);
    });
  });

  describe('createIdentityCommitment', () => {
    it('should create a commitment from identity', async () => {
      const commitment = await createIdentityCommitment({
        method: 'email',
        identifier: 'test@example.com',
        secret: 'my-secret-key'
      });

      expect(commitment).toBeDefined();
      expect(commitment).toBeInstanceOf(Uint8Array);
      expect(commitment.length).toBe(32);
    });

    it('should create deterministic commitments', async () => {
      const c1 = await createIdentityCommitment({
        method: 'email',
        identifier: 'test@example.com',
        secret: 'my-secret-key'
      });

      const c2 = await createIdentityCommitment({
        method: 'email',
        identifier: 'test@example.com',
        secret: 'my-secret-key'
      });

      expect(c1).toEqual(c2);
    });
  });

  describe('deriveWallet', () => {
    it('should derive a wallet from commitment', async () => {
      const commitment = await createIdentityCommitment({
        method: 'email',
        identifier: 'test@example.com',
        secret: 'my-secret-key'
      });

      const wallet = await deriveWallet(commitment);
      expect(wallet).toBeDefined();
      expect(wallet.publicKey).toBeDefined();
      expect(wallet.secretKey).toBeDefined();
    });

    it('should derive same wallet from same commitment', async () => {
      const commitment = await createIdentityCommitment({
        method: 'email',
        identifier: 'test@example.com',
        secret: 'my-secret-key'
      });

      const wallet1 = await deriveWallet(commitment);
      const wallet2 = await deriveWallet(commitment);

      expect(wallet1.publicKey.toBase58()).toBe(wallet2.publicKey.toBase58());
    });
  });
});

