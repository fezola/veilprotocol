/**
 * Cryptographic Primitives for Veil Protocol
 * Core cryptography: hashing, commitments, encryption
 */

import CryptoJS from 'crypto-js';
import { PedersenCommitment } from '../types';

// BN128 curve prime for field operations
export const BN128_PRIME = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

// ============================================================================
// HASHING
// ============================================================================

/**
 * Poseidon hash simulation (production would use actual Poseidon)
 * Used for ZK-friendly hashing
 */
export async function poseidonHash(inputs: bigint[]): Promise<bigint> {
  const inputStr = inputs.map(n => n.toString()).join(',');
  const encoder = new TextEncoder();
  const data = encoder.encode(inputStr);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
  const hashArray = new Uint8Array(hashBuffer);

  let hash = BigInt(0);
  for (let i = 0; i < 31; i++) {
    hash = (hash << BigInt(8)) | BigInt(hashArray[i]);
  }
  return hash % BN128_PRIME;
}

/**
 * SHA-256 hash
 */
export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
  return new Uint8Array(hashBuffer);
}

/**
 * SHA-256 hash from string
 */
export async function sha256String(input: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  return sha256(encoder.encode(input));
}

/**
 * Create commitment hash from identity
 */
export async function createCommitment(
  identifier: string,
  secret: string
): Promise<Uint8Array> {
  const combined = `${identifier}:${secret}:${Date.now()}`;
  return sha256String(combined);
}

// ============================================================================
// PEDERSEN COMMITMENTS (Amount Hiding)
// ============================================================================

/**
 * Generator points for Pedersen commitments
 * In production, these would be properly derived curve points
 */
const G = BigInt('0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798');
const H = BigInt('0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8');

/**
 * Create a Pedersen commitment to an amount
 * C = amount * G + blindingFactor * H
 */
export function createPedersenCommitment(amount: bigint): PedersenCommitment {
  // Generate random blinding factor
  const blindingBytes = new Uint8Array(32);
  crypto.getRandomValues(blindingBytes);
  const blindingFactor = bytesToBigInt(blindingBytes) % BN128_PRIME;
  
  // Compute commitment (simplified - real impl uses elliptic curve ops)
  const commitment = (amount * G + blindingFactor * H) % BN128_PRIME;
  
  return {
    commitment: bigIntToBytes(commitment),
    blindingFactor: bigIntToBytes(blindingFactor),
  };
}

/**
 * Verify a Pedersen commitment
 */
export function verifyPedersenCommitment(
  commitment: PedersenCommitment,
  amount: bigint
): boolean {
  const blindingFactor = bytesToBigInt(commitment.blindingFactor);
  const expected = (amount * G + blindingFactor * H) % BN128_PRIME;
  const actual = bytesToBigInt(commitment.commitment);
  return expected === actual;
}

/**
 * Add two Pedersen commitments (homomorphic property)
 * C(a) + C(b) = C(a + b)
 */
export function addPedersenCommitments(
  c1: PedersenCommitment,
  c2: PedersenCommitment
): PedersenCommitment {
  const sum1 = (bytesToBigInt(c1.commitment) + bytesToBigInt(c2.commitment)) % BN128_PRIME;
  const sum2 = (bytesToBigInt(c1.blindingFactor) + bytesToBigInt(c2.blindingFactor)) % BN128_PRIME;
  
  return {
    commitment: bigIntToBytes(sum1),
    blindingFactor: bigIntToBytes(sum2),
  };
}

// ============================================================================
// ENCRYPTION (For private storage)
// ============================================================================

/**
 * Encrypt data with a key
 */
export function encrypt(data: string, key: string): string {
  return CryptoJS.AES.encrypt(data, key).toString();
}

/**
 * Decrypt data with a key
 */
export function decrypt(encryptedData: string, key: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Encrypt a number (for balance hiding)
 */
export function encryptAmount(amount: number, key: string): Uint8Array {
  const encrypted = encrypt(amount.toString(), key);
  return new TextEncoder().encode(encrypted);
}

/**
 * Decrypt a number
 */
export function decryptAmount(encryptedAmount: Uint8Array, key: string): number {
  const encryptedStr = new TextDecoder().decode(encryptedAmount);
  const decrypted = decrypt(encryptedStr, key);
  return parseFloat(decrypted);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function bytesToBigInt(bytes: Uint8Array): bigint {
  let result = BigInt(0);
  for (let i = 0; i < bytes.length; i++) {
    result = (result << BigInt(8)) | BigInt(bytes[i]);
  }
  return result;
}

export function bigIntToBytes(num: bigint, length = 32): Uint8Array {
  const bytes = new Uint8Array(length);
  let temp = num;
  for (let i = length - 1; i >= 0; i--) {
    bytes[i] = Number(temp & BigInt(0xff));
    temp = temp >> BigInt(8);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Generate random bigint for use as blinding factor or nonce
 */
export function generateRandomness(): bigint {
  const bytes = randomBytes(32);
  return bytesToBigInt(bytes) % BN128_PRIME;
}

/**
 * Derive a key from password and salt using PBKDF2-like approach
 */
export async function deriveKey(password: string, salt: string): Promise<Uint8Array> {
  const combined = `${password}:${salt}`;
  return sha256String(combined);
}

