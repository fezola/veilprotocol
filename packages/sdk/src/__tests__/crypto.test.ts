/**
 * Crypto Module Tests
 *
 * Tests for cryptographic primitives
 */

import { describe, it, expect } from 'vitest';
import {
  poseidonHash,
  sha256,
  generateRandomness,
  deriveKey,
  encrypt,
  decrypt,
  BN128_PRIME
} from '../crypto';

describe('Crypto Module', () => {
  describe('poseidonHash', () => {
    it('should hash bigint inputs', async () => {
      const result = await poseidonHash([BigInt(1), BigInt(2), BigInt(3)]);
      expect(result).toBeDefined();
      expect(typeof result).toBe('bigint');
      expect(result).toBeGreaterThan(BigInt(0));
      expect(result).toBeLessThan(BN128_PRIME);
    });

    it('should produce deterministic results', async () => {
      const inputs = [BigInt(100), BigInt(200)];
      const hash1 = await poseidonHash(inputs);
      const hash2 = await poseidonHash(inputs);
      expect(hash1).toBe(hash2);
    });

    it('should produce different results for different inputs', async () => {
      const hash1 = await poseidonHash([BigInt(1)]);
      const hash2 = await poseidonHash([BigInt(2)]);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('sha256', () => {
    it('should hash Uint8Array data', async () => {
      const data = new TextEncoder().encode('hello world');
      const hash = await sha256(data);
      expect(hash).toBeDefined();
      expect(hash).toBeInstanceOf(Uint8Array);
      expect(hash.length).toBe(32);
    });

    it('should produce deterministic results', async () => {
      const data = new TextEncoder().encode('test data');
      const hash1 = await sha256(data);
      const hash2 = await sha256(data);
      expect(hash1).toEqual(hash2);
    });
  });

  describe('generateRandomness', () => {
    it('should generate random bigint', () => {
      const rand = generateRandomness();
      expect(rand).toBeDefined();
      expect(typeof rand).toBe('bigint');
      expect(rand).toBeGreaterThan(BigInt(0));
    });

    it('should generate different values each time', () => {
      const rand1 = generateRandomness();
      const rand2 = generateRandomness();
      expect(rand1).not.toBe(rand2);
    });
  });

  describe('deriveKey', () => {
    it('should derive a key from password and salt', async () => {
      const key = await deriveKey('password', 'salt');
      expect(key).toBeDefined();
      expect(key).toBeInstanceOf(Uint8Array);
      expect(key.length).toBe(32);
    });

    it('should produce deterministic results', async () => {
      const key1 = await deriveKey('password', 'salt');
      const key2 = await deriveKey('password', 'salt');
      expect(key1).toEqual(key2);
    });

    it('should produce different keys for different passwords', async () => {
      const key1 = await deriveKey('password1', 'salt');
      const key2 = await deriveKey('password2', 'salt');
      expect(key1).not.toEqual(key2);
    });
  });

  describe('encrypt / decrypt (string-based)', () => {
    it('should encrypt and decrypt string data', () => {
      const key = 'my-secret-key';
      const plaintext = 'secret message';

      const encrypted = encrypt(plaintext, key);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);

      const decrypted = decrypt(encrypted, key);
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different result with wrong key', () => {
      const plaintext = 'secret';
      const encrypted = encrypt(plaintext, 'key1');

      // Wrong key either throws or produces garbage
      try {
        const decrypted = decrypt(encrypted, 'key2');
        // If it doesn't throw, it should produce garbage
        expect(decrypted).not.toBe(plaintext);
      } catch {
        // Throwing is also acceptable behavior
        expect(true).toBe(true);
      }
    });
  });
});

