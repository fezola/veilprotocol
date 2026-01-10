import CryptoJS from 'crypto-js';

/**
 * Recovery utilities for Veil Protocol
 * Implements time-locked recovery and Shamir secret sharing
 */

export interface RecoveryKey {
  key: string;
  commitment: string;
  method: 'timelock' | 'shamir';
  createdAt: number;
  metadata?: {
    timelockDays?: number;
    totalShares?: number;
    threshold?: number;
  };
}

export interface ShamirShare {
  index: number;
  share: string;
  threshold: number;
  totalShares: number;
}

/**
 * Generate a cryptographically secure recovery key
 */
export function generateRecoveryKey(): string {
  // Generate 32 bytes of random data
  const randomBytes = CryptoJS.lib.WordArray.random(32);
  return randomBytes.toString(CryptoJS.enc.Base64);
}

/**
 * Create a commitment hash from a recovery key
 */
export function createRecoveryCommitment(recoveryKey: string): string {
  return CryptoJS.SHA256(recoveryKey).toString();
}

/**
 * Generate time-locked recovery
 */
export function generateTimeLockRecovery(timelockDays: number): RecoveryKey {
  const key = generateRecoveryKey();
  const commitment = createRecoveryCommitment(key);

  return {
    key,
    commitment,
    method: 'timelock',
    createdAt: Date.now(),
    metadata: {
      timelockDays,
    },
  };
}

/**
 * Shamir Secret Sharing Implementation
 * Based on polynomial interpolation over finite field GF(256)
 */

// GF(256) arithmetic
const GF256_EXP = new Uint8Array(256);
const GF256_LOG = new Uint8Array(256);

// Initialize GF(256) lookup tables
function initGF256() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_LOG[x] = i;
    x = (x << 1) ^ (x & 0x80 ? 0x1b : 0);
  }
  GF256_EXP[255] = GF256_EXP[0];
}

initGF256();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF256_EXP[(GF256_LOG[a] + GF256_LOG[b]) % 255];
}

function gfDiv(a: number, b: number): number {
  if (a === 0) return 0;
  if (b === 0) throw new Error('Division by zero');
  return GF256_EXP[(GF256_LOG[a] - GF256_LOG[b] + 255) % 255];
}

/**
 * Split a secret into Shamir shares
 */
export function shamirSplit(
  secret: string,
  totalShares: number,
  threshold: number
): ShamirShare[] {
  if (threshold > totalShares) {
    throw new Error('Threshold cannot exceed total shares');
  }
  if (threshold < 2) {
    throw new Error('Threshold must be at least 2');
  }

  // Convert secret to bytes
  const secretBytes = CryptoJS.enc.Base64.parse(secret);
  const secretArray = new Uint8Array(
    Array.from({ length: secretBytes.sigBytes }, (_, i) =>
      (secretBytes.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
    )
  );

  const shares: ShamirShare[] = [];

  // For each byte of the secret
  const shareData: number[][] = Array.from({ length: totalShares }, () => []);

  for (let byteIdx = 0; byteIdx < secretArray.length; byteIdx++) {
    // Generate random polynomial coefficients
    const coeffs = new Uint8Array(threshold);
    coeffs[0] = secretArray[byteIdx]; // Secret is the constant term

    for (let i = 1; i < threshold; i++) {
      coeffs[i] = Math.floor(Math.random() * 256);
    }

    // Evaluate polynomial at points 1..totalShares
    for (let x = 1; x <= totalShares; x++) {
      let y = coeffs[0];
      let xPow = 1;

      for (let i = 1; i < threshold; i++) {
        xPow = gfMul(xPow, x);
        y ^= gfMul(coeffs[i], xPow);
      }

      shareData[x - 1].push(y);
    }
  }

  // Convert share data to base64 strings
  for (let i = 0; i < totalShares; i++) {
    const shareBytes = new Uint8Array(shareData[i]);
    const shareWordArray = CryptoJS.lib.WordArray.create(
      Array.from(shareBytes) as any
    );
    const shareString = CryptoJS.enc.Base64.stringify(shareWordArray);

    shares.push({
      index: i + 1,
      share: shareString,
      threshold,
      totalShares,
    });
  }

  return shares;
}

/**
 * Reconstruct secret from Shamir shares
 */
export function shamirReconstruct(shares: ShamirShare[]): string {
  if (shares.length < shares[0].threshold) {
    throw new Error(
      `Need at least ${shares[0].threshold} shares to reconstruct`
    );
  }

  // Convert shares to byte arrays
  const shareBytes = shares.map((s) => {
    const wordArray = CryptoJS.enc.Base64.parse(s.share);
    return new Uint8Array(
      Array.from({ length: wordArray.sigBytes }, (_, i) =>
        (wordArray.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
      )
    );
  });

  const secretLength = shareBytes[0].length;
  const secret = new Uint8Array(secretLength);

  // Reconstruct each byte using Lagrange interpolation
  for (let byteIdx = 0; byteIdx < secretLength; byteIdx++) {
    let result = 0;

    for (let i = 0; i < shares.length; i++) {
      const xi = shares[i].index;
      const yi = shareBytes[i][byteIdx];

      // Compute Lagrange basis polynomial
      let basis = 1;
      for (let j = 0; j < shares.length; j++) {
        if (i !== j) {
          const xj = shares[j].index;
          const numerator = xj;
          const denominator = xi ^ xj;
          basis = gfMul(basis, gfDiv(numerator, denominator));
        }
      }

      result ^= gfMul(yi, basis);
    }

    secret[byteIdx] = result;
  }

  // Convert back to base64
  const secretWordArray = CryptoJS.lib.WordArray.create(
    Array.from(secret) as any
  );
  return CryptoJS.enc.Base64.stringify(secretWordArray);
}

/**
 * Generate Shamir-based recovery
 */
export function generateShamirRecovery(
  totalShares: number,
  threshold: number
): { recoveryKey: RecoveryKey; shares: ShamirShare[] } {
  const key = generateRecoveryKey();
  const commitment = createRecoveryCommitment(key);

  const shares = shamirSplit(key, totalShares, threshold);

  return {
    recoveryKey: {
      key,
      commitment,
      method: 'shamir',
      createdAt: Date.now(),
      metadata: {
        totalShares,
        threshold,
      },
    },
    shares,
  };
}

/**
 * Verify a recovery key matches a commitment
 */
export function verifyRecoveryKey(
  recoveryKey: string,
  commitment: string
): boolean {
  const computedCommitment = createRecoveryCommitment(recoveryKey);
  return computedCommitment === commitment;
}

/**
 * Store recovery key in localStorage (for demo purposes)
 * In production, this should be stored securely (encrypted, hardware wallet, etc.)
 */
export function storeRecoveryKey(
  walletAddress: string,
  recoveryKey: RecoveryKey
): void {
  const storageKey = `veil_recovery_${walletAddress}`;
  localStorage.setItem(storageKey, JSON.stringify(recoveryKey));
}

/**
 * Retrieve recovery key from localStorage
 */
export function getRecoveryKey(walletAddress: string): RecoveryKey | null {
  const storageKey = `veil_recovery_${walletAddress}`;
  const stored = localStorage.getItem(storageKey);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Store Shamir shares in localStorage (for demo purposes)
 * In production, shares should be distributed to guardians off-chain
 */
export function storeShamirShares(
  walletAddress: string,
  shares: ShamirShare[]
): void {
  const storageKey = `veil_shamir_shares_${walletAddress}`;
  localStorage.setItem(storageKey, JSON.stringify(shares));
}

/**
 * Retrieve Shamir shares from localStorage
 */
export function getShamirShares(walletAddress: string): ShamirShare[] | null {
  const storageKey = `veil_shamir_shares_${walletAddress}`;
  const stored = localStorage.getItem(storageKey);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Format recovery key for display (with prefix)
 */
export function formatRecoveryKey(key: string, method: 'timelock' | 'shamir'): string {
  const prefix = method === 'timelock' ? 'veil_rec_tl' : 'veil_rec_sh';
  return `${prefix}_${key.replace(/[+/=]/g, (c) => {
    return { '+': '-', '/': '_', '=': '' }[c] || c;
  })}`;
}

/**
 * Download recovery key as file
 */
export function downloadRecoveryKey(recoveryKey: RecoveryKey): void {
  const formattedKey = formatRecoveryKey(recoveryKey.key, recoveryKey.method);
  const content = `Veil Protocol Recovery Key

Method: ${recoveryKey.method === 'timelock' ? 'Time-Locked' : 'Shamir Secret Sharing'}
Created: ${new Date(recoveryKey.createdAt).toLocaleString()}
${recoveryKey.metadata?.timelockDays ? `Time-lock Period: ${recoveryKey.metadata.timelockDays} days` : ''}
${recoveryKey.metadata?.threshold ? `Threshold: ${recoveryKey.metadata.threshold} of ${recoveryKey.metadata.totalShares}` : ''}

Recovery Key:
${formattedKey}

Commitment Hash:
${recoveryKey.commitment}

⚠️ IMPORTANT: Store this key securely. Anyone with this key can recover your wallet.
Do NOT share this key with anyone. Keep it offline and encrypted.
`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `veil-recovery-${recoveryKey.method}-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download Shamir share as file
 */
export function downloadShamirShare(
  share: ShamirShare,
  recipientName?: string
): void {
  const content = `Veil Protocol - Shamir Recovery Share

Recipient: ${recipientName || `Guardian ${share.index}`}
Share Index: ${share.index}
Threshold: ${share.threshold} of ${share.totalShares} shares needed
Created: ${new Date().toLocaleString()}

Share Data:
${share.share}

⚠️ IMPORTANT:
- This is share ${share.index} of ${share.totalShares}
- You need ${share.threshold} shares to recover the wallet
- Store this share securely and privately
- Do NOT combine shares until recovery is needed
`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `veil-shamir-share-${share.index}-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
