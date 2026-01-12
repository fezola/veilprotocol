/**
 * Veil Protocol - Solana Program SDK
 *
 * TypeScript SDK for interacting with the Veil Protocol smart contract on Solana devnet.
 * This enables real on-chain transactions for privacy-preserving identity and recovery.
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_CLOCK_PUBKEY,
} from '@solana/web3.js';
import * as borsh from '@coral-xyz/borsh';
import { AnchorProvider, BN, Program, web3 } from '@coral-xyz/anchor';

// Program ID from deployed Anchor program (deployed to devnet)
export const VEIL_PROGRAM_ID = new PublicKey('FaSJXt21yZ2WZKLoQYAV9nkTHqYNduDh95nU1uYGZP87');

// Devnet connection
export const DEVNET_ENDPOINT = 'https://api.devnet.solana.com';

/**
 * Get the PDA for a user's wallet account
 */
export async function getWalletAccountPDA(userPubkey: PublicKey): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddressSync(
    [Buffer.from('wallet'), userPubkey.toBuffer()],
    VEIL_PROGRAM_ID
  );
}

/**
 * Initialize a commitment on-chain
 * This creates a privacy-preserving wallet account with a commitment hash
 */
export async function initializeCommitment(
  connection: Connection,
  userPubkey: PublicKey,
  commitment: Uint8Array, // 32-byte commitment hash
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<{ signature: string; walletPDA: PublicKey }> {
  // Get the PDA for the wallet account
  const [walletPDA, bump] = await getWalletAccountPDA(userPubkey);

  // Check if account already exists
  const accountInfo = await connection.getAccountInfo(walletPDA);
  if (accountInfo) {
    throw new Error('Wallet account already initialized. Use existing commitment.');
  }

  // Build instruction data (instruction discriminator + commitment)
  // Discriminator from IDL: [79, 227, 189, 206, 151, 200, 0, 214]
  const instructionData = Buffer.concat([
    Buffer.from([79, 227, 189, 206, 151, 200, 0, 214]), // "initialize_commitment" discriminator
    Buffer.from(commitment),
  ]);

  // Create instruction
  const instruction = new TransactionInstruction({
    programId: VEIL_PROGRAM_ID,
    keys: [
      { pubkey: walletPDA, isSigner: false, isWritable: true },
      { pubkey: userPubkey, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: instructionData,
  });

  // Build and send transaction
  const transaction = new Transaction().add(instruction);
  transaction.feePayer = userPubkey;
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const signed = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());

  // Wait for confirmation
  await connection.confirmTransaction(signature, 'confirmed');

  return { signature, walletPDA };
}

/**
 * Submit a ZK proof to the program
 * This verifies the proof structure and emits an on-chain event
 */
export async function submitProof(
  connection: Connection,
  userPubkey: PublicKey,
  proofData: Uint8Array,
  publicSignals: Uint8Array[], // Array of 32-byte public signals
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  const [walletPDA] = await getWalletAccountPDA(userPubkey);

  // Serialize the instruction data
  // Discriminator from IDL: [54, 241, 46, 84, 4, 212, 46, 94]
  // Anchor format: discriminator + borsh-serialized args
  const proofDataBuffer = Buffer.from(proofData);
  const proofLengthBuffer = Buffer.alloc(4);
  proofLengthBuffer.writeUInt32LE(proofDataBuffer.length, 0);

  const signalsLengthBuffer = Buffer.alloc(4);
  signalsLengthBuffer.writeUInt32LE(publicSignals.length, 0);

  const instructionData = Buffer.concat([
    Buffer.from([54, 241, 46, 84, 4, 212, 46, 94]), // "submit_proof" discriminator
    proofLengthBuffer,
    proofDataBuffer,
    signalsLengthBuffer,
    ...publicSignals.map(sig => Buffer.from(sig)),
  ]);

  const instruction = new TransactionInstruction({
    programId: VEIL_PROGRAM_ID,
    keys: [
      { pubkey: walletPDA, isSigner: false, isWritable: false },
      { pubkey: userPubkey, isSigner: true, isWritable: false },
    ],
    data: instructionData,
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = userPubkey;
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const signed = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());

  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
}

/**
 * Initiate time-locked recovery
 */
export async function initiateRecovery(
  connection: Connection,
  userPubkey: PublicKey,
  recoveryCommitment: Uint8Array, // 32-byte recovery commitment
  timelockDays: number, // 1-90 days
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  const [walletPDA] = await getWalletAccountPDA(userPubkey);

  const instructionData = Buffer.concat([
    Buffer.from([132, 148, 60, 74, 49, 178, 235, 187]), // "initiate_recovery" discriminator from IDL
    Buffer.from(recoveryCommitment),
    Buffer.from([timelockDays]),
  ]);

  const instruction = new TransactionInstruction({
    programId: VEIL_PROGRAM_ID,
    keys: [
      { pubkey: walletPDA, isSigner: false, isWritable: true },
      { pubkey: userPubkey, isSigner: true, isWritable: false },
    ],
    data: instructionData,
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = userPubkey;
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const signed = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());

  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
}

/**
 * Execute recovery after timelock expires
 */
export async function executeRecovery(
  connection: Connection,
  userPubkey: PublicKey,
  recoveryProof: Uint8Array,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  const [walletPDA] = await getWalletAccountPDA(userPubkey);

  const proofLengthBuffer = Buffer.alloc(4);
  proofLengthBuffer.writeUInt32LE(recoveryProof.length, 0);

  const instructionData = Buffer.concat([
    Buffer.from([203, 133, 133, 228, 153, 121, 182, 237]), // "execute_recovery" discriminator from IDL
    proofLengthBuffer,
    Buffer.from(recoveryProof),
  ]);

  const instruction = new TransactionInstruction({
    programId: VEIL_PROGRAM_ID,
    keys: [
      { pubkey: walletPDA, isSigner: false, isWritable: true },
      { pubkey: userPubkey, isSigner: true, isWritable: false },
    ],
    data: instructionData,
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = userPubkey;
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const signed = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());

  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
}

/**
 * Cancel an active recovery
 */
export async function cancelRecovery(
  connection: Connection,
  userPubkey: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  const [walletPDA] = await getWalletAccountPDA(userPubkey);

  const instructionData = Buffer.from([176, 23, 203, 37, 121, 251, 227, 83]); // "cancel_recovery" discriminator from IDL

  const instruction = new TransactionInstruction({
    programId: VEIL_PROGRAM_ID,
    keys: [
      { pubkey: walletPDA, isSigner: false, isWritable: true },
      { pubkey: userPubkey, isSigner: true, isWritable: false },
    ],
    data: instructionData,
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = userPubkey;
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const signed = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());

  await connection.confirmTransaction(signature, 'confirmed');

  return signature;
}

/**
 * Fetch wallet account data from on-chain
 */
export async function getWalletAccount(
  connection: Connection,
  userPubkey: PublicKey
): Promise<{
  commitment: Uint8Array;
  owner: PublicKey;
  createdAt: number;
  recoveryActive: boolean;
  recoveryUnlockAt: number;
} | null> {
  const [walletPDA] = await getWalletAccountPDA(userPubkey);
  const accountInfo = await connection.getAccountInfo(walletPDA);

  if (!accountInfo) {
    return null;
  }

  // Parse account data (skip 8-byte discriminator)
  const data = accountInfo.data;
  const commitment = data.subarray(8, 40);
  const owner = new PublicKey(data.subarray(40, 72));
  const createdAt = Number(new DataView(data.buffer, 72, 8).getBigInt64(0, true));
  const recoveryActive = data[136] === 1;
  const recoveryUnlockAt = Number(new DataView(data.buffer, 145, 8).getBigInt64(0, true));

  return {
    commitment,
    owner,
    createdAt,
    recoveryActive,
    recoveryUnlockAt,
  };
}

/**
 * Helper: Convert commitment string (hex) to Uint8Array
 */
export function commitmentToBytes(commitmentHex: string): Uint8Array {
  const hex = commitmentHex.replace(/^0x/, '');
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16) || 0;
  }
  return bytes;
}

/**
 * Helper: Get Solscan link for transaction
 */
export function getSolscanLink(signature: string, cluster: 'devnet' | 'mainnet' = 'devnet'): string {
  return `https://solscan.io/tx/${signature}?cluster=${cluster}`;
}

/**
 * Helper: Get Solscan link for account
 */
export function getSolscanAccountLink(address: string, cluster: 'devnet' | 'mainnet' = 'devnet'): string {
  return `https://solscan.io/account/${address}?cluster=${cluster}`;
}
