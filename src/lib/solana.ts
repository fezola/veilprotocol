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

// ============================================================================
// PRIVATE VOTING FUNCTIONS
// ============================================================================

/**
 * Get the PDA for a proposal
 */
export function getProposalPDA(proposalId: Uint8Array): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('proposal'), Buffer.from(proposalId)],
    VEIL_PROGRAM_ID
  );
}

/**
 * Get the PDA for a vote record
 */
export function getVoteRecordPDA(proposalPDA: PublicKey, voterPublicKey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vote'), proposalPDA.toBuffer(), voterPublicKey.toBuffer()],
    VEIL_PROGRAM_ID
  );
}

/**
 * Create a new private voting proposal
 */
export async function createProposal(
  wallet: any,
  proposalId: Uint8Array,
  metadataHash: Uint8Array,
  votingEndsAt: number,
  revealEndsAt: number
): Promise<string> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const connection = getConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  const program = new Program(idl as Idl, provider);
  const [proposalPDA] = getProposalPDA(proposalId);

  try {
    const tx = await program.methods
      .createProposal(
        Array.from(proposalId),
        Array.from(metadataHash),
        { toNumber: () => votingEndsAt } as any,
        { toNumber: () => revealEndsAt } as any
      )
      .accounts({
        proposal: proposalPDA,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('Proposal created:', tx);
    return tx;
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw error;
  }
}

/**
 * Cast a private vote using a commitment (commit-reveal scheme)
 */
export async function castVote(
  wallet: any,
  proposalPDA: PublicKey,
  voteCommitment: Uint8Array
): Promise<string> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const connection = getConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  const program = new Program(idl as Idl, provider);
  const [voteRecordPDA] = getVoteRecordPDA(proposalPDA, wallet.publicKey);

  try {
    const tx = await program.methods
      .castVote(Array.from(voteCommitment))
      .accounts({
        proposal: proposalPDA,
        voteRecord: voteRecordPDA,
        voter: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('Vote cast:', tx);
    return tx;
  } catch (error) {
    console.error('Error casting vote:', error);
    throw error;
  }
}

/**
 * Reveal a previously committed vote
 */
export async function revealVote(
  wallet: any,
  proposalPDA: PublicKey,
  voteChoice: boolean,
  secret: Uint8Array
): Promise<string> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const connection = getConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  const program = new Program(idl as Idl, provider);
  const [voteRecordPDA] = getVoteRecordPDA(proposalPDA, wallet.publicKey);

  try {
    const tx = await program.methods
      .revealVote(voteChoice, Array.from(secret))
      .accounts({
        proposal: proposalPDA,
        voteRecord: voteRecordPDA,
        voter: wallet.publicKey,
      })
      .rpc();

    console.log('Vote revealed:', tx);
    return tx;
  } catch (error) {
    console.error('Error revealing vote:', error);
    throw error;
  }
}

/**
 * Finalize a proposal after reveal period ends
 */
export async function finalizeProposal(
  wallet: any,
  proposalPDA: PublicKey
): Promise<string> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const connection = getConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  const program = new Program(idl as Idl, provider);

  try {
    const tx = await program.methods
      .finalizeProposal()
      .accounts({
        proposal: proposalPDA,
        authority: wallet.publicKey,
      })
      .rpc();

    console.log('Proposal finalized:', tx);
    return tx;
  } catch (error) {
    console.error('Error finalizing proposal:', error);
    throw error;
  }
}

// ============================================================================
// STEALTH MULTISIG FUNCTIONS
// ============================================================================

/**
 * Get the PDA for a stealth multisig
 */
export function getMultisigPDA(vaultId: Uint8Array): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('multisig'), Buffer.from(vaultId)],
    VEIL_PROGRAM_ID
  );
}

/**
 * Get the PDA for a multisig proposal
 */
export function getMultisigProposalPDA(multisigPDA: PublicKey, proposalId: Uint8Array): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('multisig_proposal'), multisigPDA.toBuffer(), Buffer.from(proposalId)],
    VEIL_PROGRAM_ID
  );
}

/**
 * Create a stealth multisig with hidden signers
 */
export async function createMultisig(
  wallet: any,
  vaultId: Uint8Array,
  threshold: number,
  signerCommitments: Uint8Array[]
): Promise<string> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const connection = getConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  const program = new Program(idl as Idl, provider);
  const [multisigPDA] = getMultisigPDA(vaultId);

  try {
    const tx = await program.methods
      .createMultisig(
        Array.from(vaultId),
        threshold,
        signerCommitments.map(c => Array.from(c))
      )
      .accounts({
        multisig: multisigPDA,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('Multisig created:', tx);
    return tx;
  } catch (error) {
    console.error('Error creating multisig:', error);
    throw error;
  }
}

/**
 * Create a multisig proposal
 */
export async function createMultisigProposal(
  wallet: any,
  multisigPDA: PublicKey,
  proposalId: Uint8Array,
  instructionHash: Uint8Array
): Promise<string> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const connection = getConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  const program = new Program(idl as Idl, provider);
  const [proposalPDA] = getMultisigProposalPDA(multisigPDA, proposalId);

  try {
    const tx = await program.methods
      .createMultisigProposal(Array.from(proposalId), Array.from(instructionHash))
      .accounts({
        multisig: multisigPDA,
        multisigProposal: proposalPDA,
        proposer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('Multisig proposal created:', tx);
    return tx;
  } catch (error) {
    console.error('Error creating multisig proposal:', error);
    throw error;
  }
}

/**
 * Sign a multisig proposal with stealth proof (hidden signer identity)
 */
export async function stealthSign(
  wallet: any,
  multisigPDA: PublicKey,
  proposalPDA: PublicKey,
  signerProof: Uint8Array,
  approvalCommitment: Uint8Array
): Promise<string> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const connection = getConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  const program = new Program(idl as Idl, provider);

  try {
    const tx = await program.methods
      .stealthSign(Array.from(signerProof), Array.from(approvalCommitment))
      .accounts({
        multisig: multisigPDA,
        multisigProposal: proposalPDA,
        signer: wallet.publicKey,
      })
      .rpc();

    console.log('Stealth signature added:', tx);
    return tx;
  } catch (error) {
    console.error('Error adding stealth signature:', error);
    throw error;
  }
}

/**
 * Execute a multisig proposal after threshold is reached
 */
export async function executeMultisigProposal(
  wallet: any,
  multisigPDA: PublicKey,
  proposalPDA: PublicKey
): Promise<string> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  const connection = getConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  const program = new Program(idl as Idl, provider);

  try {
    const tx = await program.methods
      .executeMultisigProposal()
      .accounts({
        multisig: multisigPDA,
        multisigProposal: proposalPDA,
        executor: wallet.publicKey,
      })
      .rpc();

    console.log('Multisig proposal executed:', tx);
    return tx;
  } catch (error) {
    console.error('Error executing multisig proposal:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS FOR CRYPTOGRAPHY
// ============================================================================

/**
 * Generate a random 32-byte secret for vote commitment
 */
export function generateVoteSecret(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

/**
 * Create a vote commitment (hash of vote choice + secret)
 * In production, use a proper hash function like Poseidon
 */
export async function createVoteCommitment(voteChoice: boolean, secret: Uint8Array): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const voteBytes = encoder.encode(voteChoice ? 'yes' : 'no');
  const combined = new Uint8Array([...voteBytes, ...secret]);
  const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
  return new Uint8Array(hashBuffer);
}

/**
 * Generate a random vault ID for multisig
 */
export function generateVaultId(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

/**
 * Generate a random proposal ID
 */
export function generateProposalId(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}
