import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import idl from '../../target/idl/veil_protocol.json';

// Program ID from deployment
export const VEIL_PROGRAM_ID = new PublicKey('5C1VaebPdHZYETnTL18cLJK2RexXmVVhkkYpnYHD5P4h');

// Devnet RPC endpoint
export const DEVNET_ENDPOINT = 'https://api.devnet.solana.com';

/**
 * Get a connection to Solana devnet
 */
export function getConnection(): Connection {
  return new Connection(DEVNET_ENDPOINT, 'confirmed');
}

/**
 * Get the PDA for a wallet account
 */
export function getWalletAccountPDA(userPublicKey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('wallet'), userPublicKey.toBuffer()],
    VEIL_PROGRAM_ID
  );
}

/**
 * Initialize a commitment on-chain
 */
export async function initializeCommitment(
  wallet: any,
  commitment: Uint8Array
): Promise<string> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const connection = getConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  const program = new Program(idl as Idl, provider);

  const [walletAccountPDA] = getWalletAccountPDA(wallet.publicKey);

  try {
    const tx = await program.methods
      .initializeCommitment(Array.from(commitment))
      .accounts({
        walletAccount: walletAccountPDA,
        user: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('Commitment initialized:', tx);
    return tx;
  } catch (error) {
    console.error('Error initializing commitment:', error);
    throw error;
  }
}

/**
 * Submit a zero-knowledge proof on-chain
 */
export async function submitProof(
  wallet: any,
  proofData: Uint8Array,
  publicSignals: Uint8Array[]
): Promise<string> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const connection = getConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  const program = new Program(idl as Idl, provider);

  const [walletAccountPDA] = getWalletAccountPDA(wallet.publicKey);

  try {
    const tx = await program.methods
      .submitProof(
        Array.from(proofData),
        publicSignals.map(sig => Array.from(sig))
      )
      .accounts({
        walletAccount: walletAccountPDA,
        user: wallet.publicKey,
      })
      .rpc();

    console.log('Proof submitted:', tx);
    return tx;
  } catch (error) {
    console.error('Error submitting proof:', error);
    throw error;
  }
}

/**
 * Initiate time-locked recovery
 */
export async function initiateRecovery(
  wallet: any,
  recoveryCommitment: Uint8Array,
  timelockDays: number
): Promise<string> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const connection = getConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  const program = new Program(idl as Idl, provider);

  const [walletAccountPDA] = getWalletAccountPDA(wallet.publicKey);

  try {
    const tx = await program.methods
      .initiateRecovery(Array.from(recoveryCommitment), timelockDays)
      .accounts({
        walletAccount: walletAccountPDA,
        user: wallet.publicKey,
      })
      .rpc();

    console.log('Recovery initiated:', tx);
    return tx;
  } catch (error) {
    console.error('Error initiating recovery:', error);
    throw error;
  }
}

/**
 * Execute recovery after timelock expires
 */
export async function executeRecovery(
  wallet: any,
  recoveryProof: Uint8Array
): Promise<string> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const connection = getConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  const program = new Program(idl as Idl, provider);

  const [walletAccountPDA] = getWalletAccountPDA(wallet.publicKey);

  try {
    const tx = await program.methods
      .executeRecovery(Array.from(recoveryProof))
      .accounts({
        walletAccount: walletAccountPDA,
        user: wallet.publicKey,
      })
      .rpc();

    console.log('Recovery executed:', tx);
    return tx;
  } catch (error) {
    console.error('Error executing recovery:', error);
    throw error;
  }
}

/**
 * Cancel an active recovery
 */
export async function cancelRecovery(wallet: any): Promise<string> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const connection = getConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  const program = new Program(idl as Idl, provider);

  const [walletAccountPDA] = getWalletAccountPDA(wallet.publicKey);

  try {
    const tx = await program.methods
      .cancelRecovery()
      .accounts({
        walletAccount: walletAccountPDA,
        user: wallet.publicKey,
      })
      .rpc();

    console.log('Recovery cancelled:', tx);
    return tx;
  } catch (error) {
    console.error('Error cancelling recovery:', error);
    throw error;
  }
}

/**
 * Fetch wallet account data from on-chain
 */
export async function fetchWalletAccount(userPublicKey: PublicKey) {
  const connection = getConnection();
  const [walletAccountPDA] = getWalletAccountPDA(userPublicKey);

  try {
    const accountInfo = await connection.getAccountInfo(walletAccountPDA);
    if (!accountInfo) {
      return null;
    }

    // Parse account data (you'll need to decode based on your account structure)
    return {
      address: walletAccountPDA.toBase58(),
      exists: true,
      data: accountInfo.data,
    };
  } catch (error) {
    console.error('Error fetching wallet account:', error);
    return null;
  }
}

/**
 * Get Solana Explorer URL for a transaction
 */
export function getExplorerUrl(signature: string, cluster: 'devnet' | 'mainnet-beta' = 'devnet'): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}

/**
 * Get Solana Explorer URL for an address
 */
export function getExplorerAddressUrl(address: string, cluster: 'devnet' | 'mainnet-beta' = 'devnet'): string {
  return `https://explorer.solana.com/address/${address}?cluster=${cluster}`;
}
