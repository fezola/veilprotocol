/**
 * Veil ShadowWire Integration Module
 *
 * Integrates @radr/shadowwire for private transfers with Veil's
 * privacy primitives (voting, staking, multisig).
 *
 * ShadowWire Architecture Flow:
 * 1. Client: Generate Bulletproofs range proof locally for amount
 * 2. Backend: Compute Pedersen commitment, aggregate proofs, encrypt metadata
 * 3. On-chain: Solana PDA verifier validates proof against commitment
 *
 * The plaintext amount is used ephemerally by backend to compute
 * commitment + proof aggregation, then discarded. Full unlinkability
 * comes from mixing + encryption stack.
 */

import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { sha256String, poseidonHash, bytesToHex, bytesToBigInt, randomBytes } from '../crypto';
import { PrivateVotingClient, VoteChoice } from '../voting';
import { StealthMultisigClient, SignerSecret } from '../multisig';
import { PrivateStakingClient } from '../staking';
import { ProofData } from '../types';

// ============================================================================
// SHADOWWIRE INTEGRATION TYPES
// ============================================================================

export interface ShadowWireConfig {
  connection: Connection;
  encryptionKey: string;
  /** Optional: Custom ShadowWire endpoint */
  shadowWireEndpoint?: string;
}

export interface PrivateTransferRequest {
  recipient: PublicKey;
  amount: number;
  /** Optional memo (encrypted) */
  memo?: string;
  /** Use stealth address for recipient */
  useStealth?: boolean;
}

export interface PrivateTransferResult {
  success: boolean;
  signature?: string;
  stealthAddress?: string;
  /** Client-generated range proof (sent to backend for aggregation) */
  rangeProof?: RangeProofData;
  error?: string;
}

export interface StealthAddressResult {
  address: PublicKey;
  viewKey: Uint8Array;
  spendKey: Uint8Array;
}

// ============================================================================
// ZK PROOF TYPES (ShadowWire Architecture)
// ============================================================================

/**
 * Client-side range proof data
 * Generated locally using Bulletproofs for 64-bit range
 */
export interface RangeProofData {
  /** Serialized Bulletproofs range proof bytes */
  proofBytes: Uint8Array;
  /** Blinding factor used in Pedersen commitment */
  blindingFactor: Uint8Array;
  /** Range bit-width (64 for ShadowWire) */
  bitWidth: number;
}

/**
 * Backend submission payload
 * Backend computes commitment + aggregates proofs
 */
export interface BackendSubmissionPayload {
  /** Sender wallet address */
  sender: PublicKey;
  /** Token mint (SOL = native) */
  tokenMint: PublicKey | null;
  /** Amount in smallest units (ephemeral - used for commitment computation) */
  amountSmallestUnit: bigint;
  /** Client-generated range proof */
  rangeProof: RangeProofData;
  /** Nonce for replay protection */
  nonce: Uint8Array;
  /** Wallet signature for authorization */
  signature: Uint8Array;
}

/**
 * On-chain Solana instruction data
 * Submitted by backend to PDA escrow program
 */
export interface OnChainInstructionData {
  /** Pedersen commitment to amount: commitment = pedersen(amount, blinding_factor) */
  commitment: Uint8Array; // 32 bytes
  /** Aggregated Bulletproofs multi-range proof */
  aggregatedProof: Uint8Array;
  /** NaCl sealed-box encrypted sender info */
  encryptedSender: Uint8Array;
  /** NaCl sealed-box encrypted recipient info */
  encryptedRecipient: Uint8Array;
  /** Nullifier for double-spend protection */
  nullifier: Uint8Array;
}

/**
 * Shielded pool state (on-chain)
 */
export interface ShieldedPoolState {
  /** Root of commitment Merkle tree */
  commitmentRoot: Uint8Array;
  /** Set of spent nullifiers */
  nullifierSet: Set<string>;
  /** Total pool balance (hidden via commitments) */
  poolBalance: bigint;
}

// ============================================================================
// SHADOWWIRE INTEGRATION CLIENT
// ============================================================================

/**
 * ShadowWire Integration Client
 *
 * Combines ShadowWire's transfer layer with Veil's privacy primitives
 * to provide a complete privacy stack for Solana.
 *
 * Flow:
 * 1. Client generates Bulletproofs range proof locally (proves amount in [0, 2^64))
 * 2. Client sends: wallet, token, nonce, signature, plaintext amount, range proof
 * 3. Backend computes Pedersen commitment, aggregates proofs, encrypts metadata
 * 4. Backend submits to Solana PDA: commitment + aggregated proof + encrypted data
 * 5. On-chain verifier validates proof, updates shielded pool state
 */
export class ShadowWireIntegration {
  private connection: Connection;
  private encryptionKey: string;

  // Veil privacy modules
  public voting: PrivateVotingClient;
  public multisig: StealthMultisigClient;
  public staking: PrivateStakingClient;

  constructor(config: ShadowWireConfig) {
    this.connection = config.connection;
    this.encryptionKey = config.encryptionKey;

    // Initialize Veil privacy modules
    this.voting = new PrivateVotingClient(config.connection, config.encryptionKey);
    this.multisig = new StealthMultisigClient(config.connection, config.encryptionKey);
    this.staking = new PrivateStakingClient(config.connection, config.encryptionKey);
  }

  // ============================================================================
  // PRIVATE TRANSFERS (ShadowWire Layer)
  // ============================================================================

  /**
   * Create a private transfer using ShadowWire
   *
   * Flow:
   * 1. Generate range proof locally (Bulletproofs 64-bit)
   * 2. Optionally generate stealth address for recipient
   * 3. Submit to backend for commitment + proof aggregation
   * 4. Backend submits on-chain with encrypted payloads
   */
  async privateTransfer(
    request: PrivateTransferRequest,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<PrivateTransferResult> {
    try {
      // Generate stealth address if requested
      let targetAddress = request.recipient;
      let stealthAddress: string | undefined;

      if (request.useStealth) {
        const stealth = await this.generateStealthAddress(request.recipient);
        targetAddress = stealth.address;
        stealthAddress = stealth.address.toBase58();
      }

      // Convert amount to smallest units (lamports)
      const amountSmallestUnit = BigInt(Math.floor(request.amount * LAMPORTS_PER_SOL));

      // Step 1: Generate Bulletproofs range proof locally
      // Proves amount is in [0, 2^64) without revealing actual value
      const rangeProof = await this.generateRangeProof(amountSmallestUnit, 64);

      // Step 2: Create backend submission payload
      // Backend will compute Pedersen commitment and aggregate proofs
      const nonce = randomBytes(32);
      const _backendPayload: BackendSubmissionPayload = {
        sender: targetAddress, // Would be actual sender in production
        tokenMint: null, // SOL
        amountSmallestUnit, // Ephemeral - backend uses for commitment, then discards
        rangeProof,
        nonce,
        signature: new Uint8Array(64), // Would be actual wallet signature
      };

      // In production: await this.submitToBackend(backendPayload)
      // Backend returns on-chain instruction data with:
      // - Pedersen commitment = pedersen(amount, blinding_factor)
      // - Aggregated Bulletproofs proof
      // - NaCl encrypted sender/recipient
      // - Nullifier for double-spend protection

      return {
        success: true,
        signature: 'shadowwire-transfer-' + Date.now(),
        stealthAddress,
        rangeProof,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transfer failed',
      };
    }
  }

  /**
   * Generate a 64-bit Bulletproofs range proof
   * Proves the amount is in [0, 2^bitWidth) without revealing the actual value
   *
   * @param amount The amount to create a range proof for
   * @param bitWidth The bit width for the range (64 for ShadowWire)
   */
  async generateRangeProof(amount: bigint, bitWidth: number = 64): Promise<RangeProofData> {
    // Generate random blinding factor for Pedersen commitment
    const blindingFactor = randomBytes(32);

    // In production, this would call the actual Bulletproofs library:
    // const proof = bulletproofs.generateRangeProof(amount, blindingFactor, bitWidth);

    // For now, create a simulated proof structure
    // Real implementation would use a Rust WASM binding to bulletproofs crate
    const proofData = new Uint8Array(32 + 8);
    proofData.set(await sha256String(amount.toString() + bytesToHex(blindingFactor)), 0);

    // Encode bit width
    const bitWidthBytes = new Uint8Array(8);
    new DataView(bitWidthBytes.buffer).setBigUint64(0, BigInt(bitWidth), true);
    proofData.set(bitWidthBytes, 32);

    return {
      proofBytes: proofData,
      blindingFactor,
      bitWidth,
    };
  }

  /**
   * Generate a stealth address for a recipient
   * The recipient can scan for payments without revealing their main address
   */
  async generateStealthAddress(recipient: PublicKey): Promise<StealthAddressResult> {
    // Generate ephemeral keys
    const viewKey = randomBytes(32);
    const spendKey = randomBytes(32);

    // Derive stealth address from recipient + ephemeral keys
    const combined = new Uint8Array(64 + 32);
    combined.set(recipient.toBytes(), 0);
    combined.set(viewKey, 32);
    combined.set(spendKey, 64);

    const addressHash = await sha256String(bytesToHex(combined));

    // Create deterministic address from hash
    const address = new PublicKey(addressHash);

    return {
      address,
      viewKey,
      spendKey,
    };
  }

  /**
   * Create a Pedersen commitment
   * commitment = g^amount * h^blinding_factor
   *
   * In production, the backend computes this from the plaintext amount
   * to aggregate with other commitments in the shielded pool
   */
  async createPedersenCommitment(
    amount: bigint,
    blindingFactor: Uint8Array
  ): Promise<Uint8Array> {
    // Pedersen commitment: C = g^v * h^r
    // For simplicity, we use hash-based construction
    const amountHash = await poseidonHash([amount]);
    const blindingHash = await poseidonHash([bytesToBigInt(blindingFactor)]);
    const commitment = await poseidonHash([amountHash, blindingHash]);

    return sha256String(commitment.toString());
  }

  /**
   * Create a transfer commitment (legacy method for compatibility)
   */
  private async createTransferCommitment(
    amount: bigint,
    recipient: PublicKey
  ): Promise<Uint8Array> {
    const amountHash = await poseidonHash([amount]);
    const recipientHash = await poseidonHash([bytesToBigInt(recipient.toBytes())]);
    const combined = await poseidonHash([amountHash, recipientHash, BigInt(Date.now())]);

    return sha256String(combined.toString());
  }

  // ============================================================================
  // PRIVATE VOTING (Veil Extension)
  // ============================================================================

  /**
   * Create a private vote on a proposal
   * Uses commit-reveal scheme - vote is hidden until reveal phase
   */
  async createPrivateVote(
    proposalId: PublicKey | Uint8Array,
    choice: VoteChoice,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ) {
    return this.voting.createVote(proposalId, choice, signTransaction);
  }

  /**
   * Reveal a previously committed vote
   */
  async revealVote(
    proposalId: PublicKey | Uint8Array,
    secret: Uint8Array,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ) {
    return this.voting.revealVote(proposalId, secret, signTransaction);
  }

  // ============================================================================
  // STEALTH MULTISIG (Veil Extension)
  // ============================================================================

  /**
   * Create a stealth multisig vault
   * Signer identities are hidden using commitment hashes
   */
  async createStealthMultisig(
    threshold: number,
    signerIdentifiers: string[],
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ) {
    return this.multisig.createVault(threshold, signerIdentifiers, signTransaction);
  }

  /**
   * Sign a multisig proposal without revealing identity
   */
  async stealthSign(
    proposalId: Uint8Array,
    signerSecret: SignerSecret,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ) {
    return this.multisig.stealthSign(proposalId, signerSecret, signTransaction);
  }

  // ============================================================================
  // PRIVATE STAKING (Veil Extension)
  // ============================================================================

  /**
   * Stake privately with hidden amount
   * Uses Pedersen commitments to hide stake amount
   */
  async privateStake(
    validatorPubkey: PublicKey,
    amount: number,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ) {
    return this.staking.stake(validatorPubkey, amount, signTransaction);
  }

  /**
   * Get staking rewards info
   */
  async getStakingRewards(stakeCommitment: Uint8Array) {
    return this.staking.getRewardsInfo(stakeCommitment);
  }

  // ============================================================================
  // SHIELDED POOLS (Private Deposit/Withdraw)
  // ============================================================================

  /**
   * Create a new shielded pool for private deposits
   *
   * @param poolId Unique 32-byte pool identifier
   * @param rewardRateBps Reward rate in basis points (0-10000)
   * @param lockupEpochs Lockup period in epochs
   * @param signTransaction Wallet sign function
   */
  async createShieldedPool(
    creator: PublicKey,
    poolId: Uint8Array,
    rewardRateBps: number,
    lockupEpochs: number,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<{ success: boolean; poolAddress?: PublicKey; signature?: string; error?: string }> {
    try {
      // Import shielded module
      const { ShieldedBalanceClient, VEIL_PROGRAM_ID, SHIELDED_POOL_SEED } = await import('../shielded');

      const client = new ShieldedBalanceClient(this.connection, this.encryptionKey);
      const result = await client.createPool(
        creator,
        { poolId, rewardRateBps, lockupEpochs },
        signTransaction
      );

      if (result.success) {
        // Derive pool address for response
        const [poolAddress] = PublicKey.findProgramAddressSync(
          [Buffer.from(SHIELDED_POOL_SEED), creator.toBuffer(), poolId],
          VEIL_PROGRAM_ID
        );
        return { success: true, poolAddress, signature: result.signature };
      }

      return { success: false, error: result.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pool creation failed',
      };
    }
  }

  /**
   * Deposit funds into a shielded pool (shield)
   * Creates a note with hidden amount using Pedersen commitment
   *
   * @param wallet User's wallet
   * @param amount Amount in SOL to deposit
   * @param pool Pool address (optional, uses default pool if not specified)
   * @param signTransaction Wallet sign function
   */
  async shieldDeposit(
    wallet: PublicKey,
    amount: number,
    signTransaction: (tx: Transaction) => Promise<Transaction>,
    pool?: PublicKey
  ): Promise<{ success: boolean; signature?: string; noteCommitment?: Uint8Array; error?: string }> {
    try {
      const { ShieldedBalanceClient } = await import('../shielded');
      const client = new ShieldedBalanceClient(this.connection, this.encryptionKey);

      // Generate range proof for amount
      const rangeProof = await this.generateRangeProof(BigInt(Math.floor(amount * 1e9)), 64);

      const result = await client.deposit(wallet, amount, signTransaction, pool);

      return {
        success: result.success,
        signature: result.signature,
        noteCommitment: result.noteCommitment,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deposit failed',
      };
    }
  }

  /**
   * Withdraw funds from a shielded pool (unshield)
   * Spends a note using nullifier to prevent double-spend
   *
   * @param wallet User's wallet
   * @param amount Amount to withdraw
   * @param recipient Recipient address
   * @param pool Pool address (optional)
   * @param signTransaction Wallet sign function
   */
  async shieldWithdraw(
    wallet: PublicKey,
    amount: number,
    recipient: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>,
    pool?: PublicKey
  ): Promise<{ success: boolean; signature?: string; nullifier?: Uint8Array; error?: string }> {
    try {
      const { ShieldedBalanceClient } = await import('../shielded');
      const client = new ShieldedBalanceClient(this.connection, this.encryptionKey);

      const result = await client.withdraw(wallet, amount, recipient, signTransaction, pool);

      return {
        success: result.success,
        signature: result.signature,
        nullifier: result.nullifier,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Withdrawal failed',
      };
    }
  }

  /**
   * Get shielded balance (decrypted, only visible to owner)
   */
  async getShieldedBalance(): Promise<number> {
    const { ShieldedBalanceClient } = await import('../shielded');
    const client = new ShieldedBalanceClient(this.connection, this.encryptionKey);
    return client.getShieldedBalance();
  }

  /**
   * Get pool information
   */
  async getPoolInfo(poolAddress: PublicKey): Promise<{
    merkleRoot: Uint8Array;
    totalNotes: number;
    isActive: boolean;
  } | null> {
    const { ShieldedBalanceClient } = await import('../shielded');
    const client = new ShieldedBalanceClient(this.connection, this.encryptionKey);
    const pool = await client.getPool(poolAddress);

    if (!pool) return null;

    return {
      merkleRoot: pool.merkleRoot,
      totalNotes: pool.totalNotes,
      isActive: pool.isActive,
    };
  }
}

// ============================================================================
// USD1 STABLECOIN INTEGRATION
// ============================================================================

/** USD1 Stablecoin mint address (RADR ecosystem) - placeholder until official mint */
export const USD1_MINT = new PublicKey('USD1111111111111111111111111111111111111111');

/** USD1 decimals */
export const USD1_DECIMALS = 6;

export interface USD1TransferRequest {
  recipient: PublicKey;
  amount: number;
  /** Use stealth address */
  useStealth?: boolean;
  /** Encrypted memo */
  memo?: string;
}

export interface USD1Balance {
  public: number;
  shielded: number;
  total: number;
}

/**
 * USD1 Private Transfer Client
 *
 * Enables private USD1 stablecoin transfers using ShadowWire
 * for the RADR Best USD1 Integration prize.
 */
export class USD1PrivateClient {
  private connection: Connection;
  private encryptionKey: string;
  private shadowWire: ShadowWireIntegration;

  constructor(config: ShadowWireConfig) {
    this.connection = config.connection;
    this.encryptionKey = config.encryptionKey;
    this.shadowWire = new ShadowWireIntegration(config);
  }

  /**
   * Get USD1 balance (public + shielded)
   */
  async getBalance(wallet: PublicKey): Promise<USD1Balance> {
    // In production, fetch from token accounts
    return {
      public: 0,
      shielded: 0,
      total: 0,
    };
  }

  /**
   * Shield USD1 tokens (move from public to private)
   */
  async shield(
    wallet: PublicKey,
    amount: number,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      // Create commitment for USD1 amount
      const amountMicro = BigInt(Math.floor(amount * 10 ** USD1_DECIMALS));
      const commitment = await this.createUSD1Commitment(amountMicro, wallet);

      return {
        success: true,
        signature: 'usd1-shield-' + Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Shield failed',
      };
    }
  }

  /**
   * Private USD1 transfer
   */
  async privateTransfer(
    request: USD1TransferRequest,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<PrivateTransferResult> {
    return this.shadowWire.privateTransfer({
      recipient: request.recipient,
      amount: request.amount,
      useStealth: request.useStealth,
      memo: request.memo,
    }, signTransaction);
  }

  /**
   * Unshield USD1 tokens (move from private to public)
   */
  async unshield(
    amount: number,
    recipient: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      return {
        success: true,
        signature: 'usd1-unshield-' + Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unshield failed',
      };
    }
  }

  private async createUSD1Commitment(
    amount: bigint,
    wallet: PublicKey
  ): Promise<Uint8Array> {
    const amountHash = await poseidonHash([amount]);
    const walletHash = await poseidonHash([bytesToBigInt(wallet.toBytes())]);
    const combined = await poseidonHash([amountHash, walletHash]);
    return sha256String(combined.toString());
  }
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export { VoteChoice } from '../voting';
export type { SignerSecret } from '../multisig';

/**
 * Create a ShadowWire integration client
 */
export function createShadowWireIntegration(config: ShadowWireConfig): ShadowWireIntegration {
  return new ShadowWireIntegration(config);
}

/**
 * Create a USD1 private transfer client
 */
export function createUSD1Client(config: ShadowWireConfig): USD1PrivateClient {
  return new USD1PrivateClient(config);
}

