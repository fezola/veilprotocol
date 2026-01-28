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
} from '@solana/web3.js';

// Program ID from deployed Anchor program (deployed to devnet)
export const VEIL_PROGRAM_ID = new PublicKey('5C1VaebPdHZYETnTL18cLJK2RexXmVVhkkYpnYHD5P4h');

// Devnet connection
export const DEVNET_ENDPOINT = 'https://api.devnet.solana.com';

/**
 * Helper to send transaction with retry logic and fresh blockhash
 */
async function sendTransactionWithRetry(
  connection: Connection,
  instructions: TransactionInstruction[],
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  userPubkey: PublicKey,
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Create FRESH transaction for each attempt (important!)
      const transaction = new Transaction();
      instructions.forEach(ix => transaction.add(ix));

      // Get fresh blockhash for each attempt
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubkey;

      console.log(`Transaction attempt ${i + 1} with blockhash: ${blockhash.slice(0, 8)}...`);

      // Sign the transaction
      const signed = await signTransaction(transaction);

      // Send with skipPreflight for faster submission
      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: true, // Skip preflight to avoid "already processed" on retry
        preflightCommitment: 'confirmed',
      });

      // Wait for confirmation with timeout
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      return signature;
    } catch (err: any) {
      lastError = err;
      console.warn(`Transaction attempt ${i + 1} failed:`, err.message);

      // If transaction already processed, it succeeded - try to find it
      if (err.message?.includes('already been processed')) {
        console.log('Transaction was already processed - likely succeeded');
        // Return a placeholder, or you could query for the recent tx
        throw new Error('Transaction already processed. Please refresh and try again.');
      }

      // If it's not a retryable error, don't retry
      if (!err.message?.includes('Blockhash') &&
          !err.message?.includes('block height exceeded') &&
          !err.message?.includes('timeout')) {
        throw err;
      }

      // Wait a bit before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  throw lastError || new Error('Transaction failed after retries');
}

/**
 * Get the PDA for a user's wallet account
 */
export function getWalletAccountPDA(userPubkey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
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
  const [walletPDA] = await getWalletAccountPDA(userPubkey);

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

  const signature = await sendTransactionWithRetry(
    connection,
    [instruction],
    signTransaction,
    userPubkey
  );

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
  const [walletPDA] = getWalletAccountPDA(userPubkey);

  // Serialize the instruction data
  // Discriminator from IDL: [54, 241, 46, 84, 4, 212, 46, 94]
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

  return sendTransactionWithRetry(connection, [instruction], signTransaction, userPubkey);
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
  const [walletPDA] = getWalletAccountPDA(userPubkey);

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

  return sendTransactionWithRetry(connection, [instruction], signTransaction, userPubkey);
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
  const [walletPDA] = getWalletAccountPDA(userPubkey);

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

  return sendTransactionWithRetry(connection, [instruction], signTransaction, userPubkey);
}

/**
 * Cancel an active recovery
 */
export async function cancelRecovery(
  connection: Connection,
  userPubkey: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  const [walletPDA] = getWalletAccountPDA(userPubkey);

  const instructionData = Buffer.from([176, 23, 203, 37, 121, 251, 227, 83]); // "cancel_recovery" discriminator from IDL

  const instruction = new TransactionInstruction({
    programId: VEIL_PROGRAM_ID,
    keys: [
      { pubkey: walletPDA, isSigner: false, isWritable: true },
      { pubkey: userPubkey, isSigner: true, isWritable: false },
    ],
    data: instructionData,
  });

  return sendTransactionWithRetry(connection, [instruction], signTransaction, userPubkey);
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
  // Account structure:
  // - 8 bytes: discriminator
  // - 32 bytes: commitment (offset 8-40)
  // - 32 bytes: owner pubkey (offset 40-72)
  // - 8 bytes: created_at i64 (offset 72-80)
  // - 1 byte: recovery_active bool (offset 80)
  // - 8 bytes: recovery_unlock_at i64 (offset 81-89)
  const data = accountInfo.data;

  // Ensure we have enough data
  if (data.length < 89) {
    // Account exists but may have minimal data, return safe defaults
    return {
      commitment: data.length >= 40 ? data.subarray(8, 40) : new Uint8Array(32),
      owner: data.length >= 72 ? new PublicKey(data.subarray(40, 72)) : userPubkey,
      createdAt: Date.now(),
      recoveryActive: false,
      recoveryUnlockAt: 0,
    };
  }

  const commitment = data.subarray(8, 40);
  const owner = new PublicKey(data.subarray(40, 72));

  // Create a properly aligned buffer for reading i64 values
  const createdAtBytes = data.subarray(72, 80);
  const createdAtBuffer = new ArrayBuffer(8);
  new Uint8Array(createdAtBuffer).set(createdAtBytes);
  const createdAt = Number(new DataView(createdAtBuffer).getBigInt64(0, true));

  const recoveryActive = data[80] === 1;

  const recoveryUnlockBytes = data.subarray(81, 89);
  const recoveryUnlockBuffer = new ArrayBuffer(8);
  new Uint8Array(recoveryUnlockBuffer).set(recoveryUnlockBytes);
  const recoveryUnlockAt = Number(new DataView(recoveryUnlockBuffer).getBigInt64(0, true));

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
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16) || 0;
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
