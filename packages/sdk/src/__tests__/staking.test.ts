/**
 * Private Staking Module Tests
 *
 * Tests for staking with hidden amounts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Connection, PublicKey } from '@solana/web3.js';
import {
  PrivateStakingClient,
  verifyStakeCommitment,
  calculateRewards,
  isStakeUnlocked
} from '../staking';
import { bytesToHex } from '../crypto';

// Mock connection
const mockConnection = {
  getBalance: async () => 1000000000,
  getAccountInfo: async () => null,
} as unknown as Connection;

describe('Private Staking Module', () => {
  let client: PrivateStakingClient;

  beforeEach(() => {
    client = new PrivateStakingClient(mockConnection, 'test-encryption-key');
  });

  describe('PrivateStakingClient', () => {
    describe('stake', () => {
      it('should create a private stake', async () => {
        const validator = PublicKey.default;
        const mockSignTx = async (tx: any) => tx;

        const result = await client.stake(
          validator,
          100, // 100 SOL
          mockSignTx
        );

        expect(result.success).toBe(true);
        expect(result.commitment).toBeDefined();
        expect(result.unlockAt).toBeDefined();
        expect(result.unlockAt!).toBeGreaterThan(Date.now() / 1000);
      });

      it('should reject zero amount', async () => {
        const validator = PublicKey.default;
        const mockSignTx = async (tx: any) => tx;

        const result = await client.stake(
          validator,
          0,
          mockSignTx
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain('positive');
      });

      it('should reject negative amount', async () => {
        const validator = PublicKey.default;
        const mockSignTx = async (tx: any) => tx;

        const result = await client.stake(
          validator,
          -10,
          mockSignTx
        );

        expect(result.success).toBe(false);
      });

      it('should create different commitments for different stakes', async () => {
        const validator = PublicKey.default;
        const mockSignTx = async (tx: any) => tx;

        const result1 = await client.stake(validator, 100, mockSignTx);
        
        // Create new client for independent stake
        const client2 = new PrivateStakingClient(mockConnection, 'key2');
        const result2 = await client2.stake(validator, 100, mockSignTx);

        expect(result1.commitment).not.toBe(result2.commitment);
      });
    });

    describe('getActiveStakes', () => {
      it('should return empty array initially', () => {
        const stakes = client.getActiveStakes();
        expect(stakes).toEqual([]);
      });

      it('should return stakes after staking', async () => {
        const validator = PublicKey.default;
        const mockSignTx = async (tx: any) => tx;

        await client.stake(validator, 100, mockSignTx);
        await client.stake(validator, 50, mockSignTx);

        const stakes = client.getActiveStakes();
        expect(stakes.length).toBe(2);
      });
    });

    describe('getRewardsInfo', () => {
      it('should return zero for unknown stake', async () => {
        const unknownCommitment = new Uint8Array(32).fill(1);

        const rewards = await client.getRewardsInfo(unknownCommitment);

        expect(rewards.pending).toBe(0);
        expect(rewards.claimed).toBe(0);
      });

      it('should calculate pending rewards for active stake', async () => {
        const validator = PublicKey.default;
        const mockSignTx = async (tx: any) => tx;

        const result = await client.stake(validator, 100, mockSignTx);
        const commitmentBytes = new Uint8Array(32);
        // Convert hex to bytes
        for (let i = 0; i < 32; i++) {
          commitmentBytes[i] = parseInt(result.commitment!.slice(i * 2, i * 2 + 2), 16);
        }

        const rewards = await client.getRewardsInfo(commitmentBytes);

        expect(rewards.apr).toBeGreaterThan(0);
      });
    });

    describe('claimRewards', () => {
      it('should claim rewards successfully', async () => {
        const stakeCommitment = new Uint8Array(32).fill(1);
        const mockSignTx = async (tx: any) => tx;

        const result = await client.claimRewards(stakeCommitment, mockSignTx);

        expect(result.success).toBe(true);
      });
    });
  });

  describe('calculateRewards', () => {
    it('should calculate rewards correctly', () => {
      // 100 SOL at 5% (500 bps) for 1 epoch
      const rewards = calculateRewards(100, 500, 1);
      expect(rewards).toBe(5); // 5 SOL
    });

    it('should scale with epochs', () => {
      const rewards1 = calculateRewards(100, 500, 1);
      const rewards2 = calculateRewards(100, 500, 2);
      expect(rewards2).toBe(rewards1 * 2);
    });
  });

  describe('isStakeUnlocked', () => {
    it('should return true for past unlock time', () => {
      const pastTime = Math.floor(Date.now() / 1000) - 86400; // 1 day ago
      expect(isStakeUnlocked(pastTime)).toBe(true);
    });

    it('should return false for future unlock time', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      expect(isStakeUnlocked(futureTime)).toBe(false);
    });
  });
});

