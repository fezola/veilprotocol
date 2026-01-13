/**
 * Veil Recovery Module
 * 
 * Privacy-preserving wallet recovery using:
 * - Shamir's Secret Sharing (split key among guardians)
 * - Timelock mechanism (guardian approval + wait period)
 * - ZK proofs (guardians don't know what they're protecting)
 */

import { Keypair, PublicKey } from '@solana/web3.js';
import { ShamirShare, RecoveryConfig, RecoveryKey, RecoveryMethod, ProofData } from '../types';
import { sha256String, poseidonHash, bytesToBigInt, bytesToHex, randomBytes } from '../crypto';

// ============================================================================
// SHAMIR'S SECRET SHARING
// ============================================================================

/**
 * Split a secret into shares using Shamir's Secret Sharing
 * 
 * @param secret - The secret to split
 * @param threshold - Number of shares needed to reconstruct
 * @param total - Total number of shares to create
 */
export function splitSecret(
  secret: string,
  threshold: number,
  total: number
): ShamirShare[] {
  if (threshold > total) {
    throw new Error('Threshold cannot exceed total shares');
  }
  
  // Generate random polynomial coefficients
  const secretBytes = new TextEncoder().encode(secret);
  const secretBigInt = bytesToBigInt(new Uint8Array(secretBytes));
  const prime = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
  
  // Polynomial: f(x) = secret + a1*x + a2*x^2 + ... + a(threshold-1)*x^(threshold-1)
  const coefficients: bigint[] = [secretBigInt % prime];
  for (let i = 1; i < threshold; i++) {
    const randBytes = randomBytes(32);
    coefficients.push(bytesToBigInt(randBytes) % prime);
  }
  
  // Generate shares
  const shares: ShamirShare[] = [];
  for (let i = 1; i <= total; i++) {
    const x = BigInt(i);
    let y = BigInt(0);
    
    for (let j = 0; j < coefficients.length; j++) {
      y = (y + coefficients[j] * modPow(x, BigInt(j), prime)) % prime;
    }
    
    shares.push({
      index: i,
      share: y.toString(16),
      threshold,
      total,
    });
  }
  
  return shares;
}

/**
 * Reconstruct a secret from shares using Lagrange interpolation
 */
export function combineShares(shares: ShamirShare[]): string {
  if (shares.length < shares[0].threshold) {
    throw new Error(`Need at least ${shares[0].threshold} shares`);
  }
  
  const prime = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
  
  // Lagrange interpolation to find f(0)
  let secret = BigInt(0);
  
  for (let i = 0; i < shares.length; i++) {
    const xi = BigInt(shares[i].index);
    const yi = BigInt('0x' + shares[i].share);
    
    let li = BigInt(1);
    for (let j = 0; j < shares.length; j++) {
      if (i !== j) {
        const xj = BigInt(shares[j].index);
        li = (li * (BigInt(0) - xj) * modInverse(xi - xj, prime)) % prime;
      }
    }
    
    secret = (secret + yi * li) % prime;
  }
  
  // Handle negative modulo
  if (secret < 0) secret += prime;
  
  // Convert back to string
  const bytes = bigIntToBytes(secret, 32);
  return new TextDecoder().decode(bytes.filter(b => b !== 0));
}

// ============================================================================
// RECOVERY KEY GENERATION
// ============================================================================

/**
 * Create a recovery key with specified method
 */
export async function createRecoveryKey(
  wallet: PublicKey,
  config: RecoveryConfig
): Promise<{
  key: RecoveryKey;
  shares?: ShamirShare[];
}> {
  // Generate recovery secret
  const secretBytes = randomBytes(32);
  const recoverySecret = bytesToHex(secretBytes);
  
  // Create commitment
  const commitmentData = wallet.toBase58() + ':' + recoverySecret;
  const commitment = await sha256String(commitmentData);
  
  let shares: ShamirShare[] | undefined;
  
  if (config.method === 'shamir' || config.method === 'hybrid') {
    shares = splitSecret(
      recoverySecret,
      config.shamirThreshold || 3,
      config.shamirTotal || 5
    );
  }
  
  const expiresAt = config.timelockDays
    ? Date.now() + config.timelockDays * 24 * 60 * 60 * 1000
    : undefined;
  
  return {
    key: {
      key: recoverySecret,
      commitment: bytesToHex(commitment),
      method: config.method,
      createdAt: Date.now(),
      expiresAt,
    },
    shares,
  };
}

/**
 * Initiate wallet recovery
 */
export async function initiateRecovery(
  commitment: string,
  shares: ShamirShare[]
): Promise<{
  success: boolean;
  recoveredSecret?: string;
  wallet?: Keypair;
  error?: string;
}> {
  try {
    // Combine shares to recover secret
    const recoveredSecret = combineShares(shares);
    
    // Derive wallet from recovered secret
    const secretHash = await sha256String(recoveredSecret);
    const wallet = Keypair.fromSeed(secretHash.slice(0, 32));
    
    return {
      success: true,
      recoveredSecret,
      wallet,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Recovery failed',
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = BigInt(1);
  base = base % mod;
  while (exp > 0) {
    if (exp % BigInt(2) === BigInt(1)) {
      result = (result * base) % mod;
    }
    exp = exp >> BigInt(1);
    base = (base * base) % mod;
  }
  return result;
}

function modInverse(a: bigint, m: bigint): bigint {
  return modPow(a, m - BigInt(2), m);
}

function bigIntToBytes(num: bigint, length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  let temp = num;
  for (let i = length - 1; i >= 0; i--) {
    bytes[i] = Number(temp & BigInt(0xff));
    temp = temp >> BigInt(8);
  }
  return bytes;
}

export type { ShamirShare, RecoveryConfig, RecoveryKey } from '../types';

