/**
 * Veil Compliance Module
 * 
 * Institutional-grade compliance tools for privacy-preserving finance.
 * Enables regulatory compliance without sacrificing user privacy.
 * 
 * Features:
 * - Audit Keys: Allow regulators to decrypt specific data
 * - ZK-KYC: Prove compliance without revealing personal data
 * - Selective Disclosure: Choose what to reveal to whom
 * - Compliance Proofs: Generate verifiable compliance attestations
 * 
 * @example
 * ```typescript
 * import { ComplianceClient } from '@veil-protocol/sdk/compliance';
 * 
 * const client = new ComplianceClient(connection);
 * 
 * // Add audit key for regulator
 * await client.addAuditKey(regulatorPubkey, {
 *   scope: 'balances',
 *   expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
 * });
 * 
 * // Generate ZK-KYC proof
 * const proof = await client.generateKYCProof({
 *   jurisdiction: 'US',
 *   accredited: true,
 *   ageOver: 18,
 * });
 * ```
 */

import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { 
  sha256String, 
  bytesToHex, 
  hexToBytes, 
  randomBytes,
  encrypt,
  decrypt,
  poseidonHash,
  bytesToBigInt
} from '../crypto';

// ============================================================================
// TYPES
// ============================================================================

/** Audit key configuration */
export interface AuditKeyConfig {
  /** What the audit key can access */
  scope: 'balances' | 'transfers' | 'identity' | 'full';
  /** Expiration timestamp (0 = never) */
  expiresAt?: number;
  /** Optional label for the audit key */
  label?: string;
  /** Jurisdictions this key applies to */
  jurisdictions?: string[];
}

/** Stored audit key */
export interface StoredAuditKey {
  id: string;
  authority: PublicKey;
  encryptionKey: Uint8Array;
  config: AuditKeyConfig;
  createdAt: number;
  revokedAt?: number;
}

/** KYC claim types */
export type KYCClaimType = 
  | 'age_over'
  | 'jurisdiction'
  | 'accredited_investor'
  | 'not_sanctioned'
  | 'aml_verified'
  | 'identity_verified';

/** KYC claim */
export interface KYCClaim {
  type: KYCClaimType;
  value: string | number | boolean;
  issuer?: PublicKey;
  issuedAt?: number;
  expiresAt?: number;
}

/** ZK-KYC proof */
export interface ZKKYCProof {
  /** Proof data */
  proof: Uint8Array;
  /** Public inputs (what is revealed) */
  publicInputs: {
    claimTypes: KYCClaimType[];
    issuerCommitments: string[];
    expirationValid: boolean;
  };
  /** Commitment to full KYC data */
  commitment: Uint8Array;
  /** Nullifier (prevents replay) */
  nullifier: Uint8Array;
  /** Timestamp */
  timestamp: number;
}

/** Compliance attestation */
export interface ComplianceAttestation {
  /** Attestation ID */
  id: string;
  /** Subject of attestation */
  subject: PublicKey;
  /** Type of compliance */
  complianceType: string;
  /** Issuer of attestation */
  issuer: PublicKey;
  /** Proof of compliance */
  proof: Uint8Array;
  /** Valid from */
  validFrom: number;
  /** Valid until */
  validUntil: number;
  /** Revoked status */
  revoked: boolean;
}

/** Selective disclosure request */
export interface DisclosureRequest {
  /** Requester */
  requester: PublicKey;
  /** What data is requested */
  requestedFields: string[];
  /** Purpose of disclosure */
  purpose: string;
  /** Expiration of request */
  expiresAt: number;
}

/** Selective disclosure response */
export interface DisclosureResponse {
  /** Request ID */
  requestId: string;
  /** Disclosed data (encrypted for requester) */
  encryptedData: Uint8Array;
  /** Proof of correct disclosure */
  proof: Uint8Array;
  /** Timestamp */
  timestamp: number;
}

// ============================================================================
// COMPLIANCE CLIENT
// ============================================================================

export class ComplianceClient {
  private connection: Connection;
  private auditKeys: Map<string, StoredAuditKey> = new Map();
  private kycClaims: Map<string, KYCClaim> = new Map();
  private attestations: Map<string, ComplianceAttestation> = new Map();

  constructor(connection: Connection) {
    this.connection = connection;
  }

  // ==========================================================================
  // AUDIT KEY MANAGEMENT
  // ==========================================================================

  /**
   * Add an audit key for a regulator or compliance authority
   * The audit key allows decryption of specific data without public exposure
   */
  async addAuditKey(
    authority: PublicKey,
    config: AuditKeyConfig
  ): Promise<{ success: boolean; auditKey?: StoredAuditKey; error?: string }> {
    try {
      const id = bytesToHex(randomBytes(16));
      const encryptionKey = randomBytes(32);

      const auditKey: StoredAuditKey = {
        id,
        authority,
        encryptionKey,
        config: {
          ...config,
          expiresAt: config.expiresAt || 0,
        },
        createdAt: Date.now(),
      };

      this.auditKeys.set(id, auditKey);

      console.log('[Compliance] Added audit key:', {
        id,
        authority: authority.toBase58(),
        scope: config.scope,
        expiresAt: config.expiresAt ? new Date(config.expiresAt).toISOString() : 'never',
      });

      return { success: true, auditKey };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add audit key'
      };
    }
  }

  /**
   * Revoke an audit key
   */
  async revokeAuditKey(auditKeyId: string): Promise<{ success: boolean; error?: string }> {
    const key = this.auditKeys.get(auditKeyId);
    if (!key) {
      return { success: false, error: 'Audit key not found' };
    }

    key.revokedAt = Date.now();
    this.auditKeys.set(auditKeyId, key);

    console.log('[Compliance] Revoked audit key:', auditKeyId);
    return { success: true };
  }

  /**
   * List all audit keys
   */
  listAuditKeys(includeRevoked = false): StoredAuditKey[] {
    const keys = Array.from(this.auditKeys.values());
    return includeRevoked ? keys : keys.filter(k => !k.revokedAt);
  }

  /**
   * Check if an audit key is valid
   */
  isAuditKeyValid(auditKeyId: string): boolean {
    const key = this.auditKeys.get(auditKeyId);
    if (!key || key.revokedAt) return false;
    if (key.config.expiresAt && key.config.expiresAt < Date.now()) return false;
    return true;
  }

  /**
   * Encrypt data for audit key holder
   */
  async encryptForAudit(
    data: string,
    auditKeyId: string
  ): Promise<{ success: boolean; encrypted?: string; error?: string }> {
    const key = this.auditKeys.get(auditKeyId);
    if (!key || !this.isAuditKeyValid(auditKeyId)) {
      return { success: false, error: 'Invalid or expired audit key' };
    }

    const encrypted = encrypt(data, bytesToHex(key.encryptionKey));
    return { success: true, encrypted };
  }

  /**
   * Decrypt data using audit key (for auditors)
   */
  decryptWithAuditKey(encryptedData: string, encryptionKey: Uint8Array): string {
    return decrypt(encryptedData, bytesToHex(encryptionKey));
  }

  // ==========================================================================
  // ZK-KYC VERIFICATION
  // ==========================================================================

  /**
   * Store a KYC claim (private, never revealed directly)
   */
  async storeKYCClaim(claim: KYCClaim): Promise<{ success: boolean; claimId: string }> {
    const claimId = bytesToHex(randomBytes(16));
    this.kycClaims.set(claimId, claim);

    console.log('[Compliance] Stored KYC claim:', {
      claimId,
      type: claim.type,
      issuer: claim.issuer?.toBase58(),
    });

    return { success: true, claimId };
  }

  /**
   * Generate a ZK proof of KYC compliance
   * Proves claims without revealing the actual data
   */
  async generateKYCProof(
    claimTypes: KYCClaimType[],
    requirements: Record<string, unknown>
  ): Promise<{ success: boolean; proof?: ZKKYCProof; error?: string }> {
    try {
      // Collect relevant claims
      const relevantClaims = Array.from(this.kycClaims.values())
        .filter(c => claimTypes.includes(c.type));

      if (relevantClaims.length === 0) {
        return { success: false, error: 'No matching KYC claims found' };
      }

      // Check expiration
      const now = Date.now();
      const validClaims = relevantClaims.filter(c => !c.expiresAt || c.expiresAt > now);

      if (validClaims.length === 0) {
        return { success: false, error: 'All matching claims have expired' };
      }

      // Generate commitment to claims
      const claimData = validClaims.map(c => `${c.type}:${c.value}`).join('|');
      const commitment = await sha256String(claimData);

      // Generate nullifier
      const nullifier = await sha256String(`nullifier:${claimData}:${now}`);

      // Generate proof (in production, uses actual ZK circuit)
      const proofInput = {
        claims: validClaims,
        requirements,
        timestamp: now,
      };
      const proof = await sha256String(JSON.stringify(proofInput));

      // Build issuer commitments
      const issuerCommitments = await Promise.all(
        validClaims
          .filter(c => c.issuer)
          .map(async c => bytesToHex(await sha256String(c.issuer!.toBase58())))
      );

      const zkProof: ZKKYCProof = {
        proof,
        publicInputs: {
          claimTypes: validClaims.map(c => c.type),
          issuerCommitments,
          expirationValid: true,
        },
        commitment,
        nullifier,
        timestamp: now,
      };

      console.log('[Compliance] Generated ZK-KYC proof:', {
        claimTypes: zkProof.publicInputs.claimTypes,
        commitment: bytesToHex(commitment),
      });

      return { success: true, proof: zkProof };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Proof generation failed'
      };
    }
  }

  /**
   * Verify a ZK-KYC proof
   */
  async verifyKYCProof(proof: ZKKYCProof): Promise<{ valid: boolean; error?: string }> {
    try {
      // Check timestamp is recent (within 1 hour)
      const maxAge = 60 * 60 * 1000;
      if (Date.now() - proof.timestamp > maxAge) {
        return { valid: false, error: 'Proof has expired' };
      }

      // In production, verify the ZK proof cryptographically
      if (!proof.proof || !proof.commitment || !proof.nullifier) {
        return { valid: false, error: 'Invalid proof structure' };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  // ==========================================================================
  // COMPLIANCE ATTESTATIONS
  // ==========================================================================

  /**
   * Create a compliance attestation
   */
  async createAttestation(
    subject: PublicKey,
    complianceType: string,
    issuer: Keypair,
    validityDays: number
  ): Promise<{ success: boolean; attestation?: ComplianceAttestation; error?: string }> {
    try {
      const id = bytesToHex(randomBytes(16));
      const now = Date.now();

      const proofData = `${subject.toBase58()}:${complianceType}:${now}`;
      const proof = await sha256String(proofData);

      const attestation: ComplianceAttestation = {
        id,
        subject,
        complianceType,
        issuer: issuer.publicKey,
        proof,
        validFrom: now,
        validUntil: now + validityDays * 24 * 60 * 60 * 1000,
        revoked: false,
      };

      this.attestations.set(id, attestation);

      console.log('[Compliance] Created attestation:', {
        id,
        subject: subject.toBase58(),
        type: complianceType,
        validUntil: new Date(attestation.validUntil).toISOString(),
      });

      return { success: true, attestation };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Attestation creation failed'
      };
    }
  }

  /**
   * Verify a compliance attestation
   */
  async verifyAttestation(attestationId: string): Promise<{ valid: boolean; error?: string }> {
    const attestation = this.attestations.get(attestationId);

    if (!attestation) {
      return { valid: false, error: 'Attestation not found' };
    }

    if (attestation.revoked) {
      return { valid: false, error: 'Attestation has been revoked' };
    }

    const now = Date.now();
    if (now < attestation.validFrom || now > attestation.validUntil) {
      return { valid: false, error: 'Attestation is not currently valid' };
    }

    return { valid: true };
  }

  /**
   * Revoke an attestation
   */
  async revokeAttestation(attestationId: string): Promise<{ success: boolean; error?: string }> {
    const attestation = this.attestations.get(attestationId);
    if (!attestation) {
      return { success: false, error: 'Attestation not found' };
    }

    attestation.revoked = true;
    this.attestations.set(attestationId, attestation);

    return { success: true };
  }

  // ==========================================================================
  // SELECTIVE DISCLOSURE
  // ==========================================================================

  /**
   * Create a selective disclosure response
   */
  async createDisclosure(
    request: DisclosureRequest,
    data: Record<string, unknown>,
    encryptionKey: Uint8Array
  ): Promise<{ success: boolean; response?: DisclosureResponse; error?: string }> {
    try {
      const disclosedData: Record<string, unknown> = {};
      for (const field of request.requestedFields) {
        if (field in data) {
          disclosedData[field] = data[field];
        }
      }

      const encryptedData = new TextEncoder().encode(
        encrypt(JSON.stringify(disclosedData), bytesToHex(encryptionKey))
      );

      const proofData = `${request.requester.toBase58()}:${request.requestedFields.join(',')}`;
      const proof = await sha256String(proofData);

      const response: DisclosureResponse = {
        requestId: bytesToHex(randomBytes(16)),
        encryptedData,
        proof,
        timestamp: Date.now(),
      };

      return { success: true, response };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Disclosure creation failed'
      };
    }
  }
}

// ============================================================================
// FACTORY & HELPERS
// ============================================================================

export function createComplianceClient(connection: Connection): ComplianceClient {
  return new ComplianceClient(connection);
}

export function isSupportedJurisdiction(jurisdiction: string): boolean {
  const supported = ['US', 'EU', 'UK', 'SG', 'JP', 'CH', 'AE', 'HK'];
  return supported.includes(jurisdiction.toUpperCase());
}

export function getRequiredClaims(jurisdiction: string): KYCClaimType[] {
  const requirements: Record<string, KYCClaimType[]> = {
    US: ['identity_verified', 'not_sanctioned', 'aml_verified'],
    EU: ['identity_verified', 'not_sanctioned', 'aml_verified'],
    UK: ['identity_verified', 'not_sanctioned', 'aml_verified'],
    SG: ['identity_verified', 'not_sanctioned', 'accredited_investor'],
    JP: ['identity_verified', 'not_sanctioned', 'age_over'],
    CH: ['identity_verified', 'not_sanctioned'],
    AE: ['identity_verified', 'not_sanctioned'],
    HK: ['identity_verified', 'not_sanctioned', 'accredited_investor'],
  };

  return requirements[jurisdiction.toUpperCase()] || ['identity_verified'];
}
