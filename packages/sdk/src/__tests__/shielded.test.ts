/**
 * Shielded Balance Module Tests
 *
 * Tests for shielded pool operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ShieldedBalanceClient,
  createShieldedClient,
  SHIELDED_POOL_PROGRAM_ID
} from '../shielded';
import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';

// Mock connection
const mockConnection = {
  getBalance: vi.fn().mockResolvedValue(1000000000),
  getAccountInfo: vi.fn().mockResolvedValue(null),
  sendTransaction: vi.fn().mockResolvedValue('mock-signature'),
  confirmTransaction: vi.fn().mockResolvedValue({ value: { err: null } }),
  getLatestBlockhash: vi.fn().mockResolvedValue({ blockhash: 'mock-blockhash', lastValidBlockHeight: 100 }),
} as unknown as Connection;

describe('Shielded Balance Module', () => {
  describe('createShieldedClient', () => {
    it('should create a shielded client', () => {
      const client = createShieldedClient(mockConnection, 'test-key');
      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(ShieldedBalanceClient);
    });
  });

  describe('SHIELDED_POOL_PROGRAM_ID', () => {
    it('should be a valid PublicKey', () => {
      expect(SHIELDED_POOL_PROGRAM_ID).toBeDefined();
      expect(SHIELDED_POOL_PROGRAM_ID).toBeInstanceOf(PublicKey);
    });
  });

  describe('ShieldedBalanceClient', () => {
    let client: ShieldedBalanceClient;
    let wallet: Keypair;

    beforeEach(() => {
      client = new ShieldedBalanceClient(mockConnection, 'test-encryption-key');
      wallet = Keypair.generate();
    });

    it('should get shielded balance (initially 0)', async () => {
      const balance = await client.getShieldedBalance();
      expect(typeof balance).toBe('number');
      expect(balance).toBe(0);
    });

    it('should get public balance', async () => {
      const balance = await client.getPublicBalance(wallet.publicKey);
      expect(typeof balance).toBe('number');
      expect(balance).toBe(1); // 1000000000 lamports = 1 SOL
    });

    it('should have deposit method', () => {
      expect(client.deposit).toBeDefined();
      expect(typeof client.deposit).toBe('function');
    });

    it('should have withdraw method', () => {
      expect(client.withdraw).toBeDefined();
      expect(typeof client.withdraw).toBe('function');
    });
  });
});

