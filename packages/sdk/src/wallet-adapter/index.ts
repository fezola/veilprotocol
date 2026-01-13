/**
 * Veil Wallet Adapter
 * 
 * Integration with Solana wallet adapters (Phantom, Solflare, etc.)
 * Enables any dApp to add Veil privacy features.
 */

import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SendOptions,
  Keypair
} from '@solana/web3.js';
import { generateIdentityProof, createIdentityCommitment, deriveWallet } from '../identity';
import { createShieldedClient, ShieldedBalanceClient } from '../shielded';
import { createTransferClient, PrivateTransferClient } from '../transfer';
import { createTokenClient, PrivateTokenClient } from '../tokens';
import { IdentityInput, ProofData } from '../types';

// ============================================================================
// VEIL WALLET ADAPTER
// ============================================================================

export interface VeilWalletConfig {
  connection: Connection;
  cluster?: 'mainnet-beta' | 'devnet' | 'testnet';
  autoShield?: boolean;
}

export interface WalletState {
  connected: boolean;
  publicKey: PublicKey | null;
  commitment: Uint8Array | null;
  proof: ProofData | null;
}

export class VeilWalletAdapter {
  private connection: Connection;
  private config: VeilWalletConfig;
  private wallet: Keypair | null = null;
  private encryptionKey: string = '';
  private state: WalletState = {
    connected: false,
    publicKey: null,
    commitment: null,
    proof: null,
  };
  
  // Privacy clients
  private shieldedClient: ShieldedBalanceClient | null = null;
  private transferClient: PrivateTransferClient | null = null;
  private tokenClient: PrivateTokenClient | null = null;
  
  constructor(config: VeilWalletConfig) {
    this.connection = config.connection;
    this.config = config;
  }
  
  /**
   * Connect with Veil identity (anonymous login)
   */
  async connect(identity: IdentityInput): Promise<{
    success: boolean;
    publicKey?: PublicKey;
    error?: string;
  }> {
    try {
      // Generate identity proof and derive wallet
      const result = await generateIdentityProof(identity);
      
      if (!result.success) {
        return { success: false, error: result.error };
      }
      
      // Derive encryption key from identity
      const commitment = await createIdentityCommitment(identity);
      this.encryptionKey = Buffer.from(commitment).toString('hex');
      
      // Initialize wallet
      this.wallet = await deriveWallet(commitment);
      
      // Update state
      this.state = {
        connected: true,
        publicKey: result.wallet,
        commitment: result.commitment,
        proof: result.proof,
      };
      
      // Initialize privacy clients
      this.shieldedClient = createShieldedClient(this.connection, this.encryptionKey);
      this.transferClient = createTransferClient(this.connection);
      this.tokenClient = createTokenClient(this.connection, this.encryptionKey);
      
      return { success: true, publicKey: result.wallet };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }
  
  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.wallet = null;
    this.encryptionKey = '';
    this.shieldedClient = null;
    this.transferClient = null;
    this.tokenClient = null;
    this.state = {
      connected: false,
      publicKey: null,
      commitment: null,
      proof: null,
    };
  }
  
  /**
   * Get current wallet state
   */
  getState(): WalletState {
    return { ...this.state };
  }
  
  /**
   * Get public key
   */
  get publicKey(): PublicKey | null {
    return this.state.publicKey;
  }
  
  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.state.connected;
  }
  
  /**
   * Sign a transaction
   */
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }
    
    transaction.partialSign(this.wallet);
    return transaction;
  }
  
  /**
   * Sign and send a transaction
   */
  async signAndSendTransaction(
    transaction: Transaction,
    options?: SendOptions
  ): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not connected');
    }
    
    transaction.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = this.wallet.publicKey;
    transaction.sign(this.wallet);
    
    const signature = await this.connection.sendRawTransaction(
      transaction.serialize(),
      options
    );
    
    return signature;
  }
  
  // ========== PRIVACY METHODS ==========
  
  /**
   * Get shielded balance (private, only you can see)
   */
  async getShieldedBalance(): Promise<number> {
    if (!this.shieldedClient) {
      throw new Error('Not connected');
    }
    return this.shieldedClient.getShieldedBalance();
  }
  
  /**
   * Get public balance (visible to everyone)
   */
  async getPublicBalance(): Promise<number> {
    if (!this.state.publicKey) {
      throw new Error('Not connected');
    }
    return this.shieldedClient!.getPublicBalance(this.state.publicKey);
  }
  
  /**
   * Deposit to shielded pool
   */
  async shieldFunds(amount: number): Promise<{ success: boolean; signature?: string }> {
    if (!this.shieldedClient || !this.state.publicKey) {
      throw new Error('Not connected');
    }
    
    return this.shieldedClient.deposit(
      this.state.publicKey,
      amount,
      this.signTransaction.bind(this)
    );
  }
  
  /**
   * Private transfer
   */
  async privateTransfer(
    recipient: PublicKey,
    amount: number
  ): Promise<{ success: boolean; signature?: string }> {
    if (!this.transferClient || !this.state.publicKey) {
      throw new Error('Not connected');
    }
    
    return this.transferClient.privateTransfer(
      this.state.publicKey,
      recipient,
      amount,
      this.signTransaction.bind(this)
    );
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createVeilWalletAdapter(config: VeilWalletConfig): VeilWalletAdapter {
  return new VeilWalletAdapter(config);
}

export type { IdentityInput };

