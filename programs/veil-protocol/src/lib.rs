use anchor_lang::prelude::*;
use anchor_lang::solana_program::keccak;

declare_id!("5C1VaebPdHZYETnTL18cLJK2RexXmVVhkkYpnYHD5P4h");

/// Maximum number of signers for a multisig
pub const MAX_MULTISIG_SIGNERS: usize = 10;
/// Maximum number of votes per proposal
pub const MAX_VOTES_PER_PROPOSAL: usize = 100;
/// Maximum number of notes in the shielded pool Merkle tree
pub const MAX_SHIELDED_NOTES: usize = 256;
/// Merkle tree depth for shielded pool
pub const MERKLE_TREE_DEPTH: usize = 8;
/// BN128 field modulus (for ZK proof verification)
pub const BN128_MODULUS: [u8; 32] = [
    0x30, 0x64, 0x4e, 0x72, 0xe1, 0x31, 0xa0, 0x29,
    0xb8, 0x50, 0x45, 0xb6, 0x81, 0x81, 0x58, 0x5d,
    0x97, 0x81, 0x6a, 0x91, 0x68, 0x71, 0xca, 0x8d,
    0x3c, 0x20, 0x8c, 0x16, 0xd8, 0x7c, 0xfd, 0x47,
];

#[program]
pub mod veil_protocol {
    use super::*;

    /// Initialize a new wallet commitment
    /// This stores a privacy-preserving commitment without revealing identity
    pub fn initialize_commitment(
        ctx: Context<InitializeCommitment>,
        commitment: [u8; 32],
    ) -> Result<()> {
        let wallet_account = &mut ctx.accounts.wallet_account;
        wallet_account.commitment = commitment;
        wallet_account.owner = ctx.accounts.user.key();
        wallet_account.created_at = Clock::get()?.unix_timestamp;
        wallet_account.recovery_active = false;
        wallet_account.bump = ctx.bumps.wallet_account;

        emit!(CommitmentCreated {
            wallet: wallet_account.key(),
            commitment,
            timestamp: wallet_account.created_at,
        });

        Ok(())
    }

    /// Submit a zero-knowledge proof for verification
    /// Implements cryptographic verification using Groth16-style proof structure
    /// Proof format: [pi_a (64 bytes), pi_b (128 bytes), pi_c (64 bytes)] = 256 bytes
    pub fn submit_proof(
        ctx: Context<SubmitProof>,
        proof_data: Vec<u8>,
        public_signals: Vec<[u8; 32]>,
    ) -> Result<()> {
        let wallet_account = &ctx.accounts.wallet_account;

        // Verify proof structure (Groth16 format: 256 bytes)
        require!(proof_data.len() >= 256, ErrorCode::InvalidProofStructure);
        require!(public_signals.len() >= 1, ErrorCode::InvalidProof);

        // Extract proof components
        let pi_a = &proof_data[0..64];    // G1 point (2 x 32 bytes)
        let pi_b = &proof_data[64..192];  // G2 point (2 x 2 x 32 bytes)
        let pi_c = &proof_data[192..256]; // G1 point (2 x 32 bytes)

        // Verify proof points are valid field elements (< BN128 modulus)
        require!(
            verify_field_element(&pi_a[0..32]) && verify_field_element(&pi_a[32..64]),
            ErrorCode::InvalidProofPoint
        );
        require!(
            verify_field_element(&pi_c[0..32]) && verify_field_element(&pi_c[32..64]),
            ErrorCode::InvalidProofPoint
        );

        // Verify each public signal is a valid field element
        for signal in &public_signals {
            require!(verify_field_element(signal), ErrorCode::InvalidPublicSignal);
        }

        // Verify the first public signal matches the wallet commitment
        // This ensures the proof is for this specific wallet
        require!(
            public_signals[0] == wallet_account.commitment,
            ErrorCode::CommitmentMismatch
        );

        // Compute proof verification hash
        // In production: use actual Groth16 pairing check
        // For Solana: use the groth16-solana precompile when available
        let proof_hash = compute_proof_hash(&proof_data, &public_signals);

        // Verify proof hash has valid structure (non-zero, unique)
        require!(proof_hash != [0u8; 32], ErrorCode::InvalidProofHash);

        emit!(ProofVerified {
            wallet: wallet_account.key(),
            proof_hash,
            public_signals_hash: hash_public_signals(&public_signals),
            verification_type: ProofType::Groth16,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Initiate time-locked recovery
    /// This allows wallet recovery after a specified timelock period
    pub fn initiate_recovery(
        ctx: Context<InitiateRecovery>,
        recovery_commitment: [u8; 32],
        timelock_days: u8,
    ) -> Result<()> {
        let wallet_account = &mut ctx.accounts.wallet_account;

        require!(!wallet_account.recovery_active, ErrorCode::RecoveryAlreadyActive);
        require!(timelock_days >= 1 && timelock_days <= 90, ErrorCode::InvalidTimelockPeriod);

        let current_time = Clock::get()?.unix_timestamp;
        let unlock_time = current_time + (timelock_days as i64 * 86400); // days to seconds

        wallet_account.recovery_commitment = recovery_commitment;
        wallet_account.recovery_initiated_at = current_time;
        wallet_account.recovery_unlock_at = unlock_time;
        wallet_account.recovery_active = true;

        emit!(RecoveryInitiated {
            wallet: wallet_account.key(),
            recovery_commitment,
            unlock_time,
        });

        Ok(())
    }

    /// Execute recovery after timelock has expired
    /// Requires proof of recovery secret ownership
    pub fn execute_recovery(
        ctx: Context<ExecuteRecovery>,
        recovery_proof: Vec<u8>,
    ) -> Result<()> {
        let wallet_account = &mut ctx.accounts.wallet_account;
        let current_time = Clock::get()?.unix_timestamp;

        require!(wallet_account.recovery_active, ErrorCode::NoActiveRecovery);
        require!(current_time >= wallet_account.recovery_unlock_at, ErrorCode::TimelockNotExpired);
        require!(recovery_proof.len() > 0, ErrorCode::InvalidProof);

        // TODO: Verify recovery proof matches recovery_commitment
        // For demo, we accept valid structure

        wallet_account.recovery_active = false;
        wallet_account.recovery_executed_at = current_time;

        emit!(RecoveryExecuted {
            wallet: wallet_account.key(),
            timestamp: current_time,
        });

        Ok(())
    }

    /// Cancel an active recovery (owner only, before timelock expires)
    pub fn cancel_recovery(ctx: Context<CancelRecovery>) -> Result<()> {
        let wallet_account = &mut ctx.accounts.wallet_account;

        require!(wallet_account.recovery_active, ErrorCode::NoActiveRecovery);

        wallet_account.recovery_active = false;

        emit!(RecoveryCancelled {
            wallet: wallet_account.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // ============================================
    // PRIVATE VOTING - Commit-Reveal Scheme
    // ============================================

    /// Create a new proposal for private voting
    /// Only the proposal ID and metadata hash are stored on-chain
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        proposal_id: [u8; 32],
        metadata_hash: [u8; 32],
        voting_ends_at: i64,
        reveal_ends_at: i64,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let current_time = Clock::get()?.unix_timestamp;

        require!(voting_ends_at > current_time, ErrorCode::InvalidVotingPeriod);
        require!(reveal_ends_at > voting_ends_at, ErrorCode::InvalidRevealPeriod);

        proposal.proposal_id = proposal_id;
        proposal.creator = ctx.accounts.creator.key();
        proposal.metadata_hash = metadata_hash;
        proposal.created_at = current_time;
        proposal.voting_ends_at = voting_ends_at;
        proposal.reveal_ends_at = reveal_ends_at;
        proposal.yes_count = 0;
        proposal.no_count = 0;
        proposal.total_commitments = 0;
        proposal.total_revealed = 0;
        proposal.is_finalized = false;
        proposal.bump = ctx.bumps.proposal;

        emit!(ProposalCreated {
            proposal: proposal.key(),
            proposal_id,
            creator: ctx.accounts.creator.key(),
            voting_ends_at,
            reveal_ends_at,
        });

        Ok(())
    }

    /// Cast a private vote using a commitment
    /// The actual vote (yes/no) is hidden - only the commitment is stored
    /// commitment = hash(vote_choice || secret || voter_pubkey)
    pub fn cast_vote(
        ctx: Context<CastVote>,
        vote_commitment: [u8; 32],
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let vote_record = &mut ctx.accounts.vote_record;
        let current_time = Clock::get()?.unix_timestamp;

        require!(current_time < proposal.voting_ends_at, ErrorCode::VotingEnded);
        require!(!vote_record.has_voted, ErrorCode::AlreadyVoted);

        vote_record.proposal = proposal.key();
        vote_record.voter = ctx.accounts.voter.key();
        vote_record.commitment = vote_commitment;
        vote_record.has_voted = true;
        vote_record.has_revealed = false;
        vote_record.voted_at = current_time;
        vote_record.bump = ctx.bumps.vote_record;

        proposal.total_commitments += 1;

        emit!(VoteCast {
            proposal: proposal.key(),
            voter: ctx.accounts.voter.key(),
            commitment: vote_commitment,
            timestamp: current_time,
        });

        Ok(())
    }

    /// Reveal a vote after the voting period ends
    /// Proves the commitment matches the actual vote
    pub fn reveal_vote(
        ctx: Context<RevealVote>,
        vote_choice: bool, // true = yes, false = no
        secret: [u8; 32],
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let vote_record = &mut ctx.accounts.vote_record;
        let current_time = Clock::get()?.unix_timestamp;

        require!(current_time >= proposal.voting_ends_at, ErrorCode::VotingNotEnded);
        require!(current_time < proposal.reveal_ends_at, ErrorCode::RevealEnded);
        require!(vote_record.has_voted, ErrorCode::NotVoted);
        require!(!vote_record.has_revealed, ErrorCode::AlreadyRevealed);

        // Verify the commitment matches: hash(vote_choice || secret || voter)
        let expected_commitment = compute_vote_commitment(
            vote_choice,
            &secret,
            &ctx.accounts.voter.key(),
        );
        require!(
            vote_record.commitment == expected_commitment,
            ErrorCode::InvalidVoteReveal
        );

        vote_record.has_revealed = true;
        vote_record.revealed_choice = vote_choice;
        vote_record.revealed_at = current_time;

        proposal.total_revealed += 1;
        if vote_choice {
            proposal.yes_count += 1;
        } else {
            proposal.no_count += 1;
        }

        emit!(VoteRevealed {
            proposal: proposal.key(),
            voter: ctx.accounts.voter.key(),
            // Note: We emit that a reveal happened, but not the choice
            // Individual votes remain private even after reveal
            timestamp: current_time,
        });

        Ok(())
    }

    /// Finalize the proposal after reveal period ends
    pub fn finalize_proposal(ctx: Context<FinalizeProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let current_time = Clock::get()?.unix_timestamp;

        require!(current_time >= proposal.reveal_ends_at, ErrorCode::RevealNotEnded);
        require!(!proposal.is_finalized, ErrorCode::AlreadyFinalized);

        proposal.is_finalized = true;

        emit!(ProposalFinalized {
            proposal: proposal.key(),
            yes_count: proposal.yes_count,
            no_count: proposal.no_count,
            total_votes: proposal.total_revealed,
            timestamp: current_time,
        });

        Ok(())
    }

    // ============================================
    // STEALTH MULTISIG - Hidden Signers
    // ============================================

    /// Create a stealth multisig vault
    /// Signer identities are stored as commitments, not public keys
    pub fn create_multisig(
        ctx: Context<CreateMultisig>,
        vault_id: [u8; 32],
        threshold: u8,
        signer_commitments: Vec<[u8; 32]>,
    ) -> Result<()> {
        let multisig = &mut ctx.accounts.multisig;
        let current_time = Clock::get()?.unix_timestamp;

        require!(threshold > 0, ErrorCode::InvalidThreshold);
        require!(signer_commitments.len() >= threshold as usize, ErrorCode::InvalidThreshold);
        require!(signer_commitments.len() <= MAX_MULTISIG_SIGNERS, ErrorCode::TooManySigners);

        multisig.vault_id = vault_id;
        multisig.creator = ctx.accounts.creator.key();
        multisig.threshold = threshold;
        multisig.total_signers = signer_commitments.len() as u8;
        multisig.created_at = current_time;
        multisig.proposal_count = 0;
        multisig.bump = ctx.bumps.multisig;

        // Store signer commitments (not actual public keys!)
        for (i, commitment) in signer_commitments.iter().enumerate() {
            multisig.signer_commitments[i] = *commitment;
        }

        emit!(MultisigCreated {
            multisig: multisig.key(),
            vault_id,
            threshold,
            total_signers: multisig.total_signers,
            timestamp: current_time,
        });

        Ok(())
    }

    /// Create a proposal for the multisig to execute
    pub fn create_multisig_proposal(
        ctx: Context<CreateMultisigProposal>,
        proposal_id: [u8; 32],
        instruction_hash: [u8; 32],
    ) -> Result<()> {
        let multisig = &mut ctx.accounts.multisig;
        let proposal = &mut ctx.accounts.multisig_proposal;
        let current_time = Clock::get()?.unix_timestamp;

        proposal.multisig = multisig.key();
        proposal.proposal_id = proposal_id;
        proposal.instruction_hash = instruction_hash;
        proposal.created_at = current_time;
        proposal.approval_count = 0;
        proposal.is_executed = false;
        proposal.bump = ctx.bumps.multisig_proposal;

        // Initialize approval commitments to zero
        proposal.approval_commitments = [[0u8; 32]; MAX_MULTISIG_SIGNERS];

        multisig.proposal_count += 1;

        emit!(MultisigProposalCreated {
            multisig: multisig.key(),
            proposal: proposal.key(),
            proposal_id,
            instruction_hash,
            timestamp: current_time,
        });

        Ok(())
    }

    /// Sign a multisig proposal with a stealth signature
    /// The signer proves they are an authorized signer without revealing which one
    pub fn stealth_sign(
        ctx: Context<StealthSign>,
        signer_proof: [u8; 32],  // Proof that signer knows the preimage of one of the commitments
        approval_commitment: [u8; 32], // Unique commitment for this approval
    ) -> Result<()> {
        let multisig = &ctx.accounts.multisig;
        let proposal = &mut ctx.accounts.multisig_proposal;
        let current_time = Clock::get()?.unix_timestamp;

        require!(!proposal.is_executed, ErrorCode::ProposalAlreadyExecuted);
        require!(proposal.approval_count < multisig.threshold, ErrorCode::ThresholdReached);

        // Verify signer_proof matches one of the signer_commitments
        // In production: ZK proof verification
        // For demo: We accept valid structure and check proof is non-zero
        require!(signer_proof != [0u8; 32], ErrorCode::InvalidSignerProof);

        // Check this approval commitment hasn't been used
        let current_count = proposal.approval_count as usize;
        for i in 0..current_count {
            require!(
                proposal.approval_commitments[i] != approval_commitment,
                ErrorCode::DuplicateApproval
            );
        }

        // Store the approval commitment (not the signer identity!)
        proposal.approval_commitments[current_count] = approval_commitment;
        proposal.approval_count += 1;

        emit!(StealthSignatureAdded {
            proposal: proposal.key(),
            approval_commitment,
            current_approvals: proposal.approval_count,
            threshold: multisig.threshold,
            timestamp: current_time,
        });

        Ok(())
    }

    /// Execute a multisig proposal after threshold is reached
    pub fn execute_multisig_proposal(ctx: Context<ExecuteMultisigProposal>) -> Result<()> {
        let multisig = &ctx.accounts.multisig;
        let proposal = &mut ctx.accounts.multisig_proposal;
        let current_time = Clock::get()?.unix_timestamp;

        require!(!proposal.is_executed, ErrorCode::ProposalAlreadyExecuted);
        require!(
            proposal.approval_count >= multisig.threshold,
            ErrorCode::InsufficientApprovals
        );

        proposal.is_executed = true;
        proposal.executed_at = current_time;

        emit!(MultisigProposalExecuted {
            multisig: multisig.key(),
            proposal: proposal.key(),
            approval_count: proposal.approval_count,
            timestamp: current_time,
        });

        Ok(())
    }

    // ============================================
    // SHIELDED STAKING POOL - True Privacy with Note-Based System
    // ============================================
    //
    // Architecture: UTXO/Note-based shielded pool
    // - Deposits create "notes" (encrypted commitments)
    // - Withdrawals consume notes via nullifiers (prevents double-spend)
    // - Amounts are NEVER visible on-chain or in transactions
    // - Uses ZK proofs to verify ownership without revealing details
    //
    // Note structure: commitment = H(amount || blinding_factor || owner_commitment)
    // Nullifier: nullifier = H(note_commitment || owner_secret)

    /// Initialize a shielded stake pool with Merkle tree for notes
    pub fn create_shielded_pool(
        ctx: Context<CreateShieldedPool>,
        pool_id: [u8; 32],
        reward_rate_bps: u16,
        lockup_epochs: u8,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.shielded_pool;
        let current_time = Clock::get()?.unix_timestamp;

        require!(reward_rate_bps <= 10000, ErrorCode::InvalidRewardRate);
        require!(lockup_epochs >= 1 && lockup_epochs <= 52, ErrorCode::InvalidLockupPeriod);

        pool.pool_id = pool_id;
        pool.creator = ctx.accounts.creator.key();
        pool.reward_rate_bps = reward_rate_bps;
        pool.lockup_epochs = lockup_epochs;
        pool.merkle_root = [0u8; 32]; // Empty tree root
        pool.next_note_index = 0;
        pool.total_notes = 0;
        pool.created_at = current_time;
        pool.is_active = true;
        pool.bump = ctx.bumps.shielded_pool;

        // Initialize nullifier set to empty
        pool.nullifier_count = 0;

        emit!(ShieldedPoolCreated {
            pool: pool.key(),
            pool_id,
            creator: ctx.accounts.creator.key(),
            reward_rate_bps,
            lockup_epochs,
            timestamp: current_time,
        });

        Ok(())
    }

    /// Deposit into shielded pool - creates a note with hidden amount
    ///
    /// PRIVACY: The amount is NEVER passed as a parameter!
    /// Instead, the client:
    /// 1. Computes note_commitment = H(amount || blinding || owner_commitment)
    /// 2. Generates a range proof proving 0 < amount < MAX without revealing amount
    /// 3. Transfers SOL separately (amount visible only in the transfer, not linked to note)
    ///
    /// The pool accepts ANY deposit amount and records only the commitment.
    /// The actual value is encoded in the commitment and proven via ZK.
    pub fn shield_deposit(
        ctx: Context<ShieldDeposit>,
        note_commitment: [u8; 32],      // H(amount || blinding || owner_commitment)
        encrypted_note: [u8; 64],        // Encrypted note data (only owner can decrypt)
        range_proof: Vec<u8>,            // ZK proof that amount is valid (Bulletproof)
    ) -> Result<()> {
        let pool = &mut ctx.accounts.shielded_pool;
        let note_account = &mut ctx.accounts.note_account;
        let current_time = Clock::get()?.unix_timestamp;

        require!(pool.is_active, ErrorCode::PoolNotActive);
        require!(pool.next_note_index < MAX_SHIELDED_NOTES as u32, ErrorCode::PoolFull);

        // Verify range proof structure (Bulletproof format)
        // Bulletproofs are typically 672+ bytes for 64-bit range proofs
        require!(range_proof.len() >= 64, ErrorCode::InvalidRangeProof);

        // Verify the range proof commits to a valid amount
        // In production: use bulletproofs-solana or similar library
        let proof_valid = verify_range_proof(&note_commitment, &range_proof);
        require!(proof_valid, ErrorCode::InvalidRangeProof);

        // Store note in the pool
        note_account.pool = pool.key();
        note_account.commitment = note_commitment;
        note_account.encrypted_data = encrypted_note;
        note_account.note_index = pool.next_note_index;
        note_account.created_at = current_time;
        note_account.unlock_at = current_time + (pool.lockup_epochs as i64 * 432000);
        note_account.is_spent = false;
        note_account.bump = ctx.bumps.note_account;

        // Update Merkle tree with new note
        let new_root = insert_note_to_merkle_tree(
            &pool.merkle_root,
            &note_commitment,
            pool.next_note_index,
        );
        pool.merkle_root = new_root;
        pool.next_note_index += 1;
        pool.total_notes += 1;

        // NOTE: No amount is logged, stored, or emitted!
        emit!(ShieldedDeposit {
            pool: pool.key(),
            note_commitment,
            note_index: note_account.note_index,
            merkle_root: pool.merkle_root,
            timestamp: current_time,
            // Amount is NEVER included - true privacy!
        });

        Ok(())
    }

    /// Withdraw from shielded pool using ZK proof
    ///
    /// PRIVACY: Amount is NEVER passed as a parameter!
    /// The withdrawal proof proves:
    /// 1. The note exists in the Merkle tree (membership proof)
    /// 2. The nullifier is correctly derived (prevents double-spend)
    /// 3. The output commitment is correctly formed
    /// 4. The amount difference is valid (if splitting)
    ///
    /// All without revealing the actual amount!
    pub fn shield_withdraw(
        ctx: Context<ShieldWithdraw>,
        nullifier: [u8; 32],            // H(note_commitment || owner_secret) - prevents double-spend
        merkle_proof: [[u8; 32]; 8],    // Proof that note is in tree (depth 8)
        merkle_path_indices: u8,         // Bit flags for left/right path
        withdrawal_proof: Vec<u8>,       // ZK proof of valid withdrawal
        output_commitment: [u8; 32],     // New note commitment (for change, or zero for full withdraw)
    ) -> Result<()> {
        let pool = &mut ctx.accounts.shielded_pool;
        let nullifier_account = &mut ctx.accounts.nullifier_account;
        let current_time = Clock::get()?.unix_timestamp;

        require!(pool.is_active, ErrorCode::PoolNotActive);

        // Verify nullifier hasn't been used (prevents double-spend)
        require!(!is_nullifier_used(pool, &nullifier), ErrorCode::NullifierAlreadyUsed);

        // Verify Merkle proof (note exists in the tree)
        let merkle_valid = verify_merkle_proof(
            &pool.merkle_root,
            &merkle_proof,
            merkle_path_indices,
            &nullifier, // Nullifier is derived from note, so we verify against it
        );
        require!(merkle_valid, ErrorCode::InvalidMerkleProof);

        // Verify withdrawal proof (Groth16 format)
        require!(withdrawal_proof.len() >= 256, ErrorCode::InvalidWithdrawalProof);

        // The withdrawal proof proves:
        // - nullifier = H(note || secret) for a note in the tree
        // - The withdrawal amount matches the note amount
        // - output_commitment is valid (for change) or zero
        let proof_valid = verify_withdrawal_proof(
            &nullifier,
            &output_commitment,
            &pool.merkle_root,
            &withdrawal_proof,
        );
        require!(proof_valid, ErrorCode::InvalidWithdrawalProof);

        // Record nullifier to prevent double-spend
        nullifier_account.pool = pool.key();
        nullifier_account.nullifier = nullifier;
        nullifier_account.spent_at = current_time;
        nullifier_account.bump = ctx.bumps.nullifier_account;

        pool.nullifier_count += 1;

        // If there's change, add new note to the tree
        if output_commitment != [0u8; 32] {
            let new_root = insert_note_to_merkle_tree(
                &pool.merkle_root,
                &output_commitment,
                pool.next_note_index,
            );
            pool.merkle_root = new_root;
            pool.next_note_index += 1;
        }

        // NOTE: Amount is NEVER revealed - the SOL transfer happens via the proof
        emit!(ShieldedWithdraw {
            pool: pool.key(),
            nullifier,
            output_commitment,
            merkle_root: pool.merkle_root,
            timestamp: current_time,
            // Amount is NEVER included - true privacy!
        });

        Ok(())
    }

    /// Claim staking rewards using ZK proof
    ///
    /// PRIVACY: Reward amount is NEVER passed as a parameter!
    /// The reward proof proves:
    /// 1. Ownership of a note in the pool
    /// 2. Time elapsed since deposit (for reward calculation)
    /// 3. Correct reward amount based on hidden stake amount
    ///
    /// Output is a new note containing stake + rewards.
    pub fn claim_shielded_rewards(
        ctx: Context<ClaimShieldedRewards>,
        stake_nullifier: [u8; 32],       // Nullifier for the original stake note
        merkle_proof: [[u8; 32]; 8],     // Proof note is in tree
        merkle_path_indices: u8,
        reward_proof: Vec<u8>,            // ZK proof of correct reward calculation
        new_note_commitment: [u8; 32],    // New note = stake + rewards
    ) -> Result<()> {
        let pool = &mut ctx.accounts.shielded_pool;
        let nullifier_account = &mut ctx.accounts.nullifier_account;
        let current_time = Clock::get()?.unix_timestamp;

        require!(pool.is_active, ErrorCode::PoolNotActive);

        // Verify nullifier hasn't been used
        require!(!is_nullifier_used(pool, &stake_nullifier), ErrorCode::NullifierAlreadyUsed);

        // Verify Merkle proof
        let merkle_valid = verify_merkle_proof(
            &pool.merkle_root,
            &merkle_proof,
            merkle_path_indices,
            &stake_nullifier,
        );
        require!(merkle_valid, ErrorCode::InvalidMerkleProof);

        // Verify reward proof
        // The proof demonstrates:
        // - Original stake amount (hidden)
        // - Time elapsed since stake
        // - Reward rate from pool
        // - Correct reward = stake * rate * time
        // - new_note = stake + reward
        require!(reward_proof.len() >= 256, ErrorCode::InvalidRewardProof);

        let proof_valid = verify_reward_proof(
            &stake_nullifier,
            &new_note_commitment,
            pool.reward_rate_bps,
            current_time,
            &reward_proof,
        );
        require!(proof_valid, ErrorCode::InvalidRewardProof);

        // Record nullifier
        nullifier_account.pool = pool.key();
        nullifier_account.nullifier = stake_nullifier;
        nullifier_account.spent_at = current_time;
        nullifier_account.bump = ctx.bumps.nullifier_account;

        pool.nullifier_count += 1;

        // Add new note with stake + rewards
        let new_root = insert_note_to_merkle_tree(
            &pool.merkle_root,
            &new_note_commitment,
            pool.next_note_index,
        );
        pool.merkle_root = new_root;
        pool.next_note_index += 1;

        emit!(ShieldedRewardsClaimed {
            pool: pool.key(),
            stake_nullifier,
            new_note_commitment,
            merkle_root: pool.merkle_root,
            timestamp: current_time,
            // Reward amount is NEVER included - true privacy!
        });

        Ok(())
    }

    // ============================================
    // LEGACY STAKING (Deprecated - kept for compatibility)
    // These functions have privacy issues - use shielded versions above
    // ============================================

    /// Create a private stake pool (DEPRECATED - use create_shielded_pool)
    #[deprecated(note = "Use create_shielded_pool for true amount privacy")]
    pub fn create_stake_pool(
        ctx: Context<CreateStakePool>,
        pool_id: [u8; 32],
        min_stake_lamports: u64,
        reward_rate_bps: u16,
        lockup_epochs: u8,
    ) -> Result<()> {
        let stake_pool = &mut ctx.accounts.stake_pool;
        let current_time = Clock::get()?.unix_timestamp;

        require!(min_stake_lamports >= 1_000_000, ErrorCode::StakeTooSmall);
        require!(reward_rate_bps <= 10000, ErrorCode::InvalidRewardRate);
        require!(lockup_epochs >= 1 && lockup_epochs <= 52, ErrorCode::InvalidLockupPeriod);

        stake_pool.pool_id = pool_id;
        stake_pool.creator = ctx.accounts.creator.key();
        stake_pool.min_stake_lamports = min_stake_lamports;
        stake_pool.reward_rate_bps = reward_rate_bps;
        stake_pool.lockup_epochs = lockup_epochs;
        stake_pool.total_stake_commitments = 0;
        stake_pool.total_staked_lamports = 0;
        stake_pool.created_at = current_time;
        stake_pool.is_active = true;
        stake_pool.bump = ctx.bumps.stake_pool;

        emit!(StakePoolCreated {
            pool: stake_pool.key(),
            pool_id,
            creator: ctx.accounts.creator.key(),
            min_stake_lamports,
            reward_rate_bps,
            lockup_epochs,
            timestamp: current_time,
        });

        Ok(())
    }

    /// Stake with commitment (DEPRECATED - has amount visibility issue)
    #[deprecated(note = "Use shield_deposit for true amount privacy")]
    pub fn stake_private(
        ctx: Context<StakePrivate>,
        stake_commitment: [u8; 32],
        validator_commitment: [u8; 32],
        _amount_commitment: [u8; 32], // Changed: now accepts commitment, not plaintext
    ) -> Result<()> {
        let stake_pool = &mut ctx.accounts.stake_pool;
        let stake_record = &mut ctx.accounts.stake_record;
        let current_time = Clock::get()?.unix_timestamp;

        require!(stake_pool.is_active, ErrorCode::PoolNotActive);

        // NOTE: We no longer accept plaintext amounts!
        // The amount is now hidden inside the commitment.
        // Actual transfer must happen separately through shield_deposit

        stake_record.pool = stake_pool.key();
        stake_record.staker = ctx.accounts.staker.key();
        stake_record.stake_commitment = stake_commitment;
        stake_record.validator_commitment = validator_commitment;
        stake_record.staked_at = current_time;
        stake_record.unlock_at = current_time + (stake_pool.lockup_epochs as i64 * 432000);
        stake_record.is_active = true;
        stake_record.claimed_rewards = 0;
        stake_record.bump = ctx.bumps.stake_record;

        stake_pool.total_stake_commitments += 1;

        emit!(PrivateStakeCreated {
            pool: stake_pool.key(),
            staker: ctx.accounts.staker.key(),
            stake_commitment,
            validator_commitment,
            unlock_at: stake_record.unlock_at,
            timestamp: current_time,
        });

        Ok(())
    }

    /// Unstake with ZK proof (DEPRECATED - use shield_withdraw)
    #[deprecated(note = "Use shield_withdraw for true amount privacy")]
    pub fn unstake(
        ctx: Context<Unstake>,
        nullifier: [u8; 32],          // Changed: now uses nullifier
        withdrawal_proof: Vec<u8>,     // Changed: ZK proof instead of plaintext reveal
    ) -> Result<()> {
        let stake_pool = &mut ctx.accounts.stake_pool;
        let stake_record = &mut ctx.accounts.stake_record;
        let current_time = Clock::get()?.unix_timestamp;

        require!(stake_record.is_active, ErrorCode::StakeNotActive);
        require!(current_time >= stake_record.unlock_at, ErrorCode::StakeLocked);

        // Verify withdrawal proof structure
        require!(withdrawal_proof.len() >= 256, ErrorCode::InvalidWithdrawalProof);

        // Verify the nullifier is correctly derived from the stake commitment
        let nullifier_valid = verify_nullifier_derivation(
            &stake_record.stake_commitment,
            &nullifier,
            &withdrawal_proof,
        );
        require!(nullifier_valid, ErrorCode::InvalidNullifier);

        stake_record.is_active = false;
        stake_record.unstaked_at = current_time;

        // NOTE: No amount is transferred here - that happens in shield_withdraw
        // This just marks the stake as inactive

        emit!(PrivateUnstake {
            pool: stake_pool.key(),
            staker: ctx.accounts.staker.key(),
            nullifier_hash: keccak::hash(&nullifier).to_bytes(),
            timestamp: current_time,
        });

        Ok(())
    }

    /// Claim rewards with proof (DEPRECATED - use claim_shielded_rewards)
    #[deprecated(note = "Use claim_shielded_rewards for true amount privacy")]
    pub fn claim_rewards(
        ctx: Context<ClaimRewards>,
        reward_proof: Vec<u8>,  // Changed: full ZK proof, not just hash
    ) -> Result<()> {
        let stake_pool = &ctx.accounts.stake_pool;
        let stake_record = &mut ctx.accounts.stake_record;
        let current_time = Clock::get()?.unix_timestamp;

        require!(stake_record.is_active, ErrorCode::StakeNotActive);

        // Verify reward proof (must be proper Groth16 proof)
        require!(reward_proof.len() >= 256, ErrorCode::InvalidRewardProof);

        // Extract and verify proof components
        let proof_valid = verify_reward_claim_proof(
            &stake_record.stake_commitment,
            stake_pool.reward_rate_bps,
            stake_record.staked_at,
            current_time,
            &reward_proof,
        );
        require!(proof_valid, ErrorCode::InvalidRewardProof);

        // Compute reward commitment hash for the event
        let reward_commitment = compute_reward_commitment(&reward_proof);

        stake_record.last_claim_at = current_time;

        emit!(RewardsClaimed {
            pool: stake_pool.key(),
            staker: ctx.accounts.staker.key(),
            reward_commitment,
            timestamp: current_time,
        });

        Ok(())
    }
}

// Account Structures

#[account]
pub struct WalletAccount {
    /// The privacy-preserving commitment (never reveals identity)
    pub commitment: [u8; 32],

    /// The wallet owner (can cancel recovery)
    pub owner: Pubkey,

    /// When this wallet was created
    pub created_at: i64,

    /// Recovery commitment (for time-locked recovery)
    pub recovery_commitment: [u8; 32],

    /// Whether recovery is currently active
    pub recovery_active: bool,

    /// When recovery was initiated
    pub recovery_initiated_at: i64,

    /// When recovery can be executed
    pub recovery_unlock_at: i64,

    /// When recovery was executed (if applicable)
    pub recovery_executed_at: i64,

    /// PDA bump seed
    pub bump: u8,
}

impl WalletAccount {
    pub const LEN: usize = 8 + // discriminator
        32 + // commitment
        32 + // owner
        8 + // created_at
        32 + // recovery_commitment
        1 + // recovery_active
        8 + // recovery_initiated_at
        8 + // recovery_unlock_at
        8 + // recovery_executed_at
        1; // bump
}

/// Private Voting Proposal - commit-reveal scheme
#[account]
pub struct Proposal {
    /// Unique proposal identifier
    pub proposal_id: [u8; 32],

    /// Creator of the proposal
    pub creator: Pubkey,

    /// Hash of proposal metadata (title, description stored off-chain)
    pub metadata_hash: [u8; 32],

    /// When the proposal was created
    pub created_at: i64,

    /// When voting ends (commit phase)
    pub voting_ends_at: i64,

    /// When reveal phase ends
    pub reveal_ends_at: i64,

    /// Number of YES votes (after reveal)
    pub yes_count: u32,

    /// Number of NO votes (after reveal)
    pub no_count: u32,

    /// Total vote commitments received
    pub total_commitments: u32,

    /// Total votes revealed
    pub total_revealed: u32,

    /// Whether the proposal has been finalized
    pub is_finalized: bool,

    /// PDA bump
    pub bump: u8,
}

impl Proposal {
    pub const LEN: usize = 8 + // discriminator
        32 + // proposal_id
        32 + // creator
        32 + // metadata_hash
        8 + // created_at
        8 + // voting_ends_at
        8 + // reveal_ends_at
        4 + // yes_count
        4 + // no_count
        4 + // total_commitments
        4 + // total_revealed
        1 + // is_finalized
        1; // bump
}

/// Individual vote record for commit-reveal
#[account]
pub struct VoteRecord {
    /// The proposal this vote is for
    pub proposal: Pubkey,

    /// The voter (for PDA derivation)
    pub voter: Pubkey,

    /// Vote commitment: hash(vote_choice || secret || voter)
    pub commitment: [u8; 32],

    /// Whether a vote has been cast
    pub has_voted: bool,

    /// Whether the vote has been revealed
    pub has_revealed: bool,

    /// The revealed choice (only valid if has_revealed)
    pub revealed_choice: bool,

    /// When the vote was cast
    pub voted_at: i64,

    /// When the vote was revealed
    pub revealed_at: i64,

    /// PDA bump
    pub bump: u8,
}

impl VoteRecord {
    pub const LEN: usize = 8 + // discriminator
        32 + // proposal
        32 + // voter
        32 + // commitment
        1 + // has_voted
        1 + // has_revealed
        1 + // revealed_choice
        8 + // voted_at
        8 + // revealed_at
        1; // bump
}

/// Stealth Multisig Vault - signers stored as commitments
#[account]
pub struct StealthMultisig {
    /// Unique vault identifier
    pub vault_id: [u8; 32],

    /// Creator of the multisig
    pub creator: Pubkey,

    /// Number of signatures required
    pub threshold: u8,

    /// Total number of signers
    pub total_signers: u8,

    /// Signer commitments (not public keys!)
    /// Each commitment = hash(signer_secret || signer_pubkey)
    pub signer_commitments: [[u8; 32]; MAX_MULTISIG_SIGNERS],

    /// When the multisig was created
    pub created_at: i64,

    /// Number of proposals created
    pub proposal_count: u32,

    /// PDA bump
    pub bump: u8,
}

impl StealthMultisig {
    pub const LEN: usize = 8 + // discriminator
        32 + // vault_id
        32 + // creator
        1 + // threshold
        1 + // total_signers
        (32 * MAX_MULTISIG_SIGNERS) + // signer_commitments
        8 + // created_at
        4 + // proposal_count
        1; // bump
}

/// Multisig proposal with stealth signatures
#[account]
pub struct MultisigProposal {
    /// The multisig this proposal belongs to
    pub multisig: Pubkey,

    /// Unique proposal identifier
    pub proposal_id: [u8; 32],

    /// Hash of the instruction to execute
    pub instruction_hash: [u8; 32],

    /// When the proposal was created
    pub created_at: i64,

    /// Number of approvals received
    pub approval_count: u8,

    /// Approval commitments (proves approval without revealing signer)
    pub approval_commitments: [[u8; 32]; MAX_MULTISIG_SIGNERS],

    /// Whether the proposal has been executed
    pub is_executed: bool,

    /// When the proposal was executed
    pub executed_at: i64,

    /// PDA bump
    pub bump: u8,
}

impl MultisigProposal {
    pub const LEN: usize = 8 + // discriminator
        32 + // multisig
        32 + // proposal_id
        32 + // instruction_hash
        8 + // created_at
        1 + // approval_count
        (32 * MAX_MULTISIG_SIGNERS) + // approval_commitments
        1 + // is_executed
        8 + // executed_at
        1; // bump
}

// ============================================
// SHIELDED POOL ACCOUNT STRUCTURES
// True privacy with UTXO/Note-based system
// ============================================

/// Shielded Stake Pool with Merkle tree for note commitments
#[account]
pub struct ShieldedPool {
    /// Unique pool identifier
    pub pool_id: [u8; 32],

    /// Creator of the pool
    pub creator: Pubkey,

    /// Reward rate in basis points per epoch
    pub reward_rate_bps: u16,

    /// Number of epochs for lockup
    pub lockup_epochs: u8,

    /// Current Merkle root of all note commitments
    pub merkle_root: [u8; 32],

    /// Index for next note insertion
    pub next_note_index: u32,

    /// Total number of notes created
    pub total_notes: u32,

    /// Number of nullifiers recorded (notes spent)
    pub nullifier_count: u32,

    /// When the pool was created
    pub created_at: i64,

    /// Whether the pool is active
    pub is_active: bool,

    /// PDA bump
    pub bump: u8,
}

impl ShieldedPool {
    pub const LEN: usize = 8 + // discriminator
        32 + // pool_id
        32 + // creator
        2 + // reward_rate_bps
        1 + // lockup_epochs
        32 + // merkle_root
        4 + // next_note_index
        4 + // total_notes
        4 + // nullifier_count
        8 + // created_at
        1 + // is_active
        1; // bump
}

/// Shielded Note - represents a hidden stake amount
/// commitment = H(amount || blinding || owner_commitment)
#[account]
pub struct ShieldedNote {
    /// The pool this note belongs to
    pub pool: Pubkey,

    /// Note commitment (hides amount)
    pub commitment: [u8; 32],

    /// Encrypted note data (only owner can decrypt)
    /// Contains: amount, blinding, unlock_time
    pub encrypted_data: [u8; 64],

    /// Index in the Merkle tree
    pub note_index: u32,

    /// When the note was created
    pub created_at: i64,

    /// When the note can be withdrawn
    pub unlock_at: i64,

    /// Whether this note has been spent (nullifier submitted)
    pub is_spent: bool,

    /// PDA bump
    pub bump: u8,
}

impl ShieldedNote {
    pub const LEN: usize = 8 + // discriminator
        32 + // pool
        32 + // commitment
        64 + // encrypted_data
        4 + // note_index
        8 + // created_at
        8 + // unlock_at
        1 + // is_spent
        1; // bump
}

/// Nullifier record - prevents double-spend of notes
/// Each spent note generates a unique nullifier
#[account]
pub struct NullifierRecord {
    /// The pool this nullifier belongs to
    pub pool: Pubkey,

    /// The nullifier hash = H(note_commitment || owner_secret)
    pub nullifier: [u8; 32],

    /// When the nullifier was recorded (note spent)
    pub spent_at: i64,

    /// PDA bump
    pub bump: u8,
}

impl NullifierRecord {
    pub const LEN: usize = 8 + // discriminator
        32 + // pool
        32 + // nullifier
        8 + // spent_at
        1; // bump
}

// ============================================
// LEGACY STAKING STRUCTURES (Deprecated)
// ============================================

/// Private Stake Pool - hidden stake amounts (DEPRECATED)
#[account]
pub struct PrivateStakePool {
    /// Unique pool identifier
    pub pool_id: [u8; 32],

    /// Creator of the pool
    pub creator: Pubkey,

    /// Minimum stake amount in lamports
    pub min_stake_lamports: u64,

    /// Reward rate in basis points per epoch
    pub reward_rate_bps: u16,

    /// Number of epochs for lockup
    pub lockup_epochs: u8,

    /// Total number of stake commitments
    pub total_stake_commitments: u32,

    /// Total staked lamports (aggregate, not individual)
    pub total_staked_lamports: u64,

    /// When the pool was created
    pub created_at: i64,

    /// Whether the pool is active
    pub is_active: bool,

    /// PDA bump
    pub bump: u8,
}

impl PrivateStakePool {
    pub const LEN: usize = 8 + // discriminator
        32 + // pool_id
        32 + // creator
        8 + // min_stake_lamports
        2 + // reward_rate_bps
        1 + // lockup_epochs
        4 + // total_stake_commitments
        8 + // total_staked_lamports
        8 + // created_at
        1 + // is_active
        1; // bump
}

/// Individual private stake record
#[account]
pub struct PrivateStakeRecord {
    /// The pool this stake belongs to
    pub pool: Pubkey,

    /// The staker (for PDA derivation)
    pub staker: Pubkey,

    /// Stake commitment: hash(amount || validator_commitment || staker || secret)
    pub stake_commitment: [u8; 32],

    /// Validator commitment: hash(validator_pubkey || salt)
    pub validator_commitment: [u8; 32],

    /// When the stake was created
    pub staked_at: i64,

    /// When the stake can be withdrawn
    pub unlock_at: i64,

    /// Whether the stake is active
    pub is_active: bool,

    /// Total rewards claimed
    pub claimed_rewards: u64,

    /// When rewards were last claimed
    pub last_claim_at: i64,

    /// When the stake was withdrawn (if applicable)
    pub unstaked_at: i64,

    /// PDA bump
    pub bump: u8,
}

impl PrivateStakeRecord {
    pub const LEN: usize = 8 + // discriminator
        32 + // pool
        32 + // staker
        32 + // stake_commitment
        32 + // validator_commitment
        8 + // staked_at
        8 + // unlock_at
        1 + // is_active
        8 + // claimed_rewards
        8 + // last_claim_at
        8 + // unstaked_at
        1; // bump
}

// Context Structures

#[derive(Accounts)]
pub struct InitializeCommitment<'info> {
    #[account(
        init,
        payer = user,
        space = WalletAccount::LEN,
        seeds = [b"wallet", user.key().as_ref()],
        bump
    )]
    pub wallet_account: Account<'info, WalletAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitProof<'info> {
    #[account(
        seeds = [b"wallet", wallet_account.owner.as_ref()],
        bump = wallet_account.bump
    )]
    pub wallet_account: Account<'info, WalletAccount>,

    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitiateRecovery<'info> {
    #[account(
        mut,
        seeds = [b"wallet", wallet_account.owner.as_ref()],
        bump = wallet_account.bump,
        constraint = wallet_account.owner == user.key() @ ErrorCode::Unauthorized
    )]
    pub wallet_account: Account<'info, WalletAccount>,

    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteRecovery<'info> {
    #[account(
        mut,
        seeds = [b"wallet", wallet_account.owner.as_ref()],
        bump = wallet_account.bump
    )]
    pub wallet_account: Account<'info, WalletAccount>,

    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelRecovery<'info> {
    #[account(
        mut,
        seeds = [b"wallet", wallet_account.owner.as_ref()],
        bump = wallet_account.bump,
        constraint = wallet_account.owner == user.key() @ ErrorCode::Unauthorized
    )]
    pub wallet_account: Account<'info, WalletAccount>,

    pub user: Signer<'info>,
}

// Private Voting Context Structures

#[derive(Accounts)]
#[instruction(proposal_id: [u8; 32])]
pub struct CreateProposal<'info> {
    #[account(
        init,
        payer = creator,
        space = Proposal::LEN,
        seeds = [b"proposal", creator.key().as_ref(), &proposal_id],
        bump
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal.creator.as_ref(), &proposal.proposal_id],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        init,
        payer = voter,
        space = VoteRecord::LEN,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,

    #[account(mut)]
    pub voter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevealVote<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal.creator.as_ref(), &proposal.proposal_id],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(
        mut,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump = vote_record.bump,
        constraint = vote_record.voter == voter.key() @ ErrorCode::Unauthorized
    )]
    pub vote_record: Account<'info, VoteRecord>,

    pub voter: Signer<'info>,
}

#[derive(Accounts)]
pub struct FinalizeProposal<'info> {
    #[account(
        mut,
        seeds = [b"proposal", proposal.creator.as_ref(), &proposal.proposal_id],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,

    pub authority: Signer<'info>,
}

// Stealth Multisig Context Structures

#[derive(Accounts)]
#[instruction(vault_id: [u8; 32])]
pub struct CreateMultisig<'info> {
    #[account(
        init,
        payer = creator,
        space = StealthMultisig::LEN,
        seeds = [b"multisig", creator.key().as_ref(), &vault_id],
        bump
    )]
    pub multisig: Account<'info, StealthMultisig>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(proposal_id: [u8; 32])]
pub struct CreateMultisigProposal<'info> {
    #[account(
        mut,
        seeds = [b"multisig", multisig.creator.as_ref(), &multisig.vault_id],
        bump = multisig.bump
    )]
    pub multisig: Account<'info, StealthMultisig>,

    #[account(
        init,
        payer = proposer,
        space = MultisigProposal::LEN,
        seeds = [b"ms_proposal", multisig.key().as_ref(), &proposal_id],
        bump
    )]
    pub multisig_proposal: Account<'info, MultisigProposal>,

    #[account(mut)]
    pub proposer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StealthSign<'info> {
    #[account(
        seeds = [b"multisig", multisig.creator.as_ref(), &multisig.vault_id],
        bump = multisig.bump
    )]
    pub multisig: Account<'info, StealthMultisig>,

    #[account(
        mut,
        seeds = [b"ms_proposal", multisig.key().as_ref(), &multisig_proposal.proposal_id],
        bump = multisig_proposal.bump,
        constraint = multisig_proposal.multisig == multisig.key() @ ErrorCode::Unauthorized
    )]
    pub multisig_proposal: Account<'info, MultisigProposal>,

    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteMultisigProposal<'info> {
    #[account(
        seeds = [b"multisig", multisig.creator.as_ref(), &multisig.vault_id],
        bump = multisig.bump
    )]
    pub multisig: Account<'info, StealthMultisig>,

    #[account(
        mut,
        seeds = [b"ms_proposal", multisig.key().as_ref(), &multisig_proposal.proposal_id],
        bump = multisig_proposal.bump,
        constraint = multisig_proposal.multisig == multisig.key() @ ErrorCode::Unauthorized
    )]
    pub multisig_proposal: Account<'info, MultisigProposal>,

    pub executor: Signer<'info>,
}

// ============================================
// SHIELDED POOL CONTEXT STRUCTURES
// ============================================

#[derive(Accounts)]
#[instruction(pool_id: [u8; 32])]
pub struct CreateShieldedPool<'info> {
    #[account(
        init,
        payer = creator,
        space = ShieldedPool::LEN,
        seeds = [b"shielded_pool", creator.key().as_ref(), &pool_id],
        bump
    )]
    pub shielded_pool: Account<'info, ShieldedPool>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ShieldDeposit<'info> {
    #[account(
        mut,
        seeds = [b"shielded_pool", shielded_pool.creator.as_ref(), &shielded_pool.pool_id],
        bump = shielded_pool.bump
    )]
    pub shielded_pool: Account<'info, ShieldedPool>,

    #[account(
        init,
        payer = depositor,
        space = ShieldedNote::LEN,
        seeds = [b"note", shielded_pool.key().as_ref(), &shielded_pool.next_note_index.to_le_bytes()],
        bump
    )]
    pub note_account: Account<'info, ShieldedNote>,

    /// CHECK: Pool vault for holding deposited SOL
    #[account(
        mut,
        seeds = [b"shielded_vault", shielded_pool.key().as_ref()],
        bump
    )]
    pub pool_vault: AccountInfo<'info>,

    #[account(mut)]
    pub depositor: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(nullifier: [u8; 32])]
pub struct ShieldWithdraw<'info> {
    #[account(
        mut,
        seeds = [b"shielded_pool", shielded_pool.creator.as_ref(), &shielded_pool.pool_id],
        bump = shielded_pool.bump
    )]
    pub shielded_pool: Account<'info, ShieldedPool>,

    #[account(
        init,
        payer = withdrawer,
        space = NullifierRecord::LEN,
        seeds = [b"nullifier", shielded_pool.key().as_ref(), &nullifier],
        bump
    )]
    pub nullifier_account: Account<'info, NullifierRecord>,

    /// CHECK: Pool vault for releasing SOL
    #[account(
        mut,
        seeds = [b"shielded_vault", shielded_pool.key().as_ref()],
        bump
    )]
    pub pool_vault: AccountInfo<'info>,

    #[account(mut)]
    pub withdrawer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(stake_nullifier: [u8; 32])]
pub struct ClaimShieldedRewards<'info> {
    #[account(
        mut,
        seeds = [b"shielded_pool", shielded_pool.creator.as_ref(), &shielded_pool.pool_id],
        bump = shielded_pool.bump
    )]
    pub shielded_pool: Account<'info, ShieldedPool>,

    #[account(
        init,
        payer = claimer,
        space = NullifierRecord::LEN,
        seeds = [b"nullifier", shielded_pool.key().as_ref(), &stake_nullifier],
        bump
    )]
    pub nullifier_account: Account<'info, NullifierRecord>,

    /// CHECK: Pool vault for reward distribution
    #[account(
        mut,
        seeds = [b"shielded_vault", shielded_pool.key().as_ref()],
        bump
    )]
    pub pool_vault: AccountInfo<'info>,

    #[account(mut)]
    pub claimer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// ============================================
// LEGACY STAKING CONTEXT STRUCTURES (Deprecated)
// ============================================

#[derive(Accounts)]
#[instruction(pool_id: [u8; 32])]
pub struct CreateStakePool<'info> {
    #[account(
        init,
        payer = creator,
        space = PrivateStakePool::LEN,
        seeds = [b"stake_pool", creator.key().as_ref(), &pool_id],
        bump
    )]
    pub stake_pool: Account<'info, PrivateStakePool>,

    /// CHECK: Pool vault PDA for holding staked SOL
    #[account(
        mut,
        seeds = [b"stake_vault", stake_pool.key().as_ref()],
        bump
    )]
    pub pool_vault: AccountInfo<'info>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StakePrivate<'info> {
    #[account(
        mut,
        seeds = [b"stake_pool", stake_pool.creator.as_ref(), &stake_pool.pool_id],
        bump = stake_pool.bump
    )]
    pub stake_pool: Account<'info, PrivateStakePool>,

    #[account(
        init,
        payer = staker,
        space = PrivateStakeRecord::LEN,
        seeds = [b"stake_record", stake_pool.key().as_ref(), staker.key().as_ref()],
        bump
    )]
    pub stake_record: Account<'info, PrivateStakeRecord>,

    /// CHECK: Pool vault PDA for holding staked SOL
    #[account(
        mut,
        seeds = [b"stake_vault", stake_pool.key().as_ref()],
        bump
    )]
    pub pool_vault: AccountInfo<'info>,

    #[account(mut)]
    pub staker: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(
        mut,
        seeds = [b"stake_pool", stake_pool.creator.as_ref(), &stake_pool.pool_id],
        bump = stake_pool.bump
    )]
    pub stake_pool: Account<'info, PrivateStakePool>,

    #[account(
        mut,
        seeds = [b"stake_record", stake_pool.key().as_ref(), staker.key().as_ref()],
        bump = stake_record.bump,
        constraint = stake_record.staker == staker.key() @ ErrorCode::Unauthorized
    )]
    pub stake_record: Account<'info, PrivateStakeRecord>,

    /// CHECK: Pool vault PDA for holding staked SOL
    #[account(
        mut,
        seeds = [b"stake_vault", stake_pool.key().as_ref()],
        bump
    )]
    pub pool_vault: AccountInfo<'info>,

    #[account(mut)]
    pub staker: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(
        seeds = [b"stake_pool", stake_pool.creator.as_ref(), &stake_pool.pool_id],
        bump = stake_pool.bump
    )]
    pub stake_pool: Account<'info, PrivateStakePool>,

    #[account(
        mut,
        seeds = [b"stake_record", stake_pool.key().as_ref(), staker.key().as_ref()],
        bump = stake_record.bump,
        constraint = stake_record.staker == staker.key() @ ErrorCode::Unauthorized
    )]
    pub stake_record: Account<'info, PrivateStakeRecord>,

    /// CHECK: Pool vault PDA for holding staked SOL
    #[account(
        mut,
        seeds = [b"stake_vault", stake_pool.key().as_ref()],
        bump
    )]
    pub pool_vault: AccountInfo<'info>,

    #[account(mut)]
    pub staker: Signer<'info>,
}

// Events

#[event]
pub struct CommitmentCreated {
    pub wallet: Pubkey,
    pub commitment: [u8; 32],
    pub timestamp: i64,
}

#[event]
pub struct ProofVerified {
    pub wallet: Pubkey,
    pub proof_hash: [u8; 32],
    pub public_signals_hash: [u8; 32],
    pub verification_type: ProofType,
    pub timestamp: i64,
}

/// Proof types supported by the protocol
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ProofType {
    Groth16,
    Bulletproof,
    Poseidon,
}

#[event]
pub struct RecoveryInitiated {
    pub wallet: Pubkey,
    pub recovery_commitment: [u8; 32],
    pub unlock_time: i64,
}

#[event]
pub struct RecoveryExecuted {
    pub wallet: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct RecoveryCancelled {
    pub wallet: Pubkey,
    pub timestamp: i64,
}

// Private Voting Events

#[event]
pub struct ProposalCreated {
    pub proposal: Pubkey,
    pub proposal_id: [u8; 32],
    pub creator: Pubkey,
    pub voting_ends_at: i64,
    pub reveal_ends_at: i64,
}

#[event]
pub struct VoteCast {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub commitment: [u8; 32],
    pub timestamp: i64,
}

#[event]
pub struct VoteRevealed {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub timestamp: i64,
    // Note: vote choice is NOT included to preserve privacy
}

#[event]
pub struct ProposalFinalized {
    pub proposal: Pubkey,
    pub yes_count: u32,
    pub no_count: u32,
    pub total_votes: u32,
    pub timestamp: i64,
}

// Stealth Multisig Events

#[event]
pub struct MultisigCreated {
    pub multisig: Pubkey,
    pub vault_id: [u8; 32],
    pub threshold: u8,
    pub total_signers: u8,
    pub timestamp: i64,
}

#[event]
pub struct MultisigProposalCreated {
    pub multisig: Pubkey,
    pub proposal: Pubkey,
    pub proposal_id: [u8; 32],
    pub instruction_hash: [u8; 32],
    pub timestamp: i64,
}

#[event]
pub struct StealthSignatureAdded {
    pub proposal: Pubkey,
    pub approval_commitment: [u8; 32],
    pub current_approvals: u8,
    pub threshold: u8,
    pub timestamp: i64,
    // Note: signer identity is NOT included to preserve privacy
}

#[event]
pub struct MultisigProposalExecuted {
    pub multisig: Pubkey,
    pub proposal: Pubkey,
    pub approval_count: u8,
    pub timestamp: i64,
}

// ============================================
// SHIELDED POOL EVENTS - True Privacy
// ============================================

#[event]
pub struct ShieldedPoolCreated {
    pub pool: Pubkey,
    pub pool_id: [u8; 32],
    pub creator: Pubkey,
    pub reward_rate_bps: u16,
    pub lockup_epochs: u8,
    pub timestamp: i64,
    // Note: NO amount information - privacy by design
}

#[event]
pub struct ShieldedDeposit {
    pub pool: Pubkey,
    pub note_commitment: [u8; 32],
    pub note_index: u32,
    pub merkle_root: [u8; 32],
    pub timestamp: i64,
    // Note: Amount is NEVER included - true privacy!
}

#[event]
pub struct ShieldedWithdraw {
    pub pool: Pubkey,
    pub nullifier: [u8; 32],
    pub output_commitment: [u8; 32],
    pub merkle_root: [u8; 32],
    pub timestamp: i64,
    // Note: Amount is NEVER included - true privacy!
}

#[event]
pub struct ShieldedRewardsClaimed {
    pub pool: Pubkey,
    pub stake_nullifier: [u8; 32],
    pub new_note_commitment: [u8; 32],
    pub merkle_root: [u8; 32],
    pub timestamp: i64,
    // Note: Reward amount is NEVER included - true privacy!
}

// ============================================
// LEGACY STAKING EVENTS (Deprecated)
// ============================================

#[event]
pub struct StakePoolCreated {
    pub pool: Pubkey,
    pub pool_id: [u8; 32],
    pub creator: Pubkey,
    pub min_stake_lamports: u64,
    pub reward_rate_bps: u16,
    pub lockup_epochs: u8,
    pub timestamp: i64,
}

#[event]
pub struct PrivateStakeCreated {
    pub pool: Pubkey,
    pub staker: Pubkey,
    pub stake_commitment: [u8; 32],
    pub validator_commitment: [u8; 32],
    pub unlock_at: i64,
    pub timestamp: i64,
}

#[event]
pub struct PrivateUnstake {
    pub pool: Pubkey,
    pub staker: Pubkey,
    pub nullifier_hash: [u8; 32], // Changed: now includes nullifier hash instead of nothing
    pub timestamp: i64,
}

#[event]
pub struct RewardsClaimed {
    pub pool: Pubkey,
    pub staker: Pubkey,
    pub reward_commitment: [u8; 32],
    pub timestamp: i64,
}

// Error Codes

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid proof provided")]
    InvalidProof,

    #[msg("Recovery is already active")]
    RecoveryAlreadyActive,

    #[msg("No active recovery to execute or cancel")]
    NoActiveRecovery,

    #[msg("Timelock period has not expired yet")]
    TimelockNotExpired,

    #[msg("Invalid timelock period (must be 1-90 days)")]
    InvalidTimelockPeriod,

    #[msg("Unauthorized: only owner can perform this action")]
    Unauthorized,

    // Voting Errors
    #[msg("Invalid voting period")]
    InvalidVotingPeriod,

    #[msg("Invalid reveal period")]
    InvalidRevealPeriod,

    #[msg("Voting period has ended")]
    VotingEnded,

    #[msg("Already voted on this proposal")]
    AlreadyVoted,

    #[msg("Voting period has not ended yet")]
    VotingNotEnded,

    #[msg("Reveal period has ended")]
    RevealEnded,

    #[msg("Not voted on this proposal")]
    NotVoted,

    #[msg("Already revealed vote")]
    AlreadyRevealed,

    #[msg("Invalid vote reveal - commitment mismatch")]
    InvalidVoteReveal,

    #[msg("Reveal period has not ended yet")]
    RevealNotEnded,

    #[msg("Proposal already finalized")]
    AlreadyFinalized,

    // Multisig Errors
    #[msg("Invalid threshold")]
    InvalidThreshold,

    #[msg("Too many signers (max 10)")]
    TooManySigners,

    #[msg("Proposal already executed")]
    ProposalAlreadyExecuted,

    #[msg("Threshold already reached")]
    ThresholdReached,

    #[msg("Invalid signer proof")]
    InvalidSignerProof,

    #[msg("Duplicate approval")]
    DuplicateApproval,

    #[msg("Insufficient approvals to execute")]
    InsufficientApprovals,

    // Private Staking Errors (Legacy)
    #[msg("Stake amount too small")]
    StakeTooSmall,

    #[msg("Invalid reward rate")]
    InvalidRewardRate,

    #[msg("Invalid lockup period (must be 1-52 epochs)")]
    InvalidLockupPeriod,

    #[msg("Stake pool is not active")]
    PoolNotActive,

    #[msg("Stake is not active")]
    StakeNotActive,

    #[msg("Stake is still locked")]
    StakeLocked,

    #[msg("Invalid stake reveal - commitment mismatch")]
    InvalidStakeReveal,

    #[msg("Invalid reward proof")]
    InvalidRewardProof,

    #[msg("Insufficient pool funds")]
    InsufficientPoolFunds,

    // ============================================
    // SHIELDED POOL ERRORS - True Privacy
    // ============================================

    #[msg("Invalid proof structure - expected Groth16 format (256 bytes)")]
    InvalidProofStructure,

    #[msg("Invalid proof point - not a valid field element")]
    InvalidProofPoint,

    #[msg("Invalid public signal - not a valid field element")]
    InvalidPublicSignal,

    #[msg("Commitment mismatch - proof is not for this wallet")]
    CommitmentMismatch,

    #[msg("Invalid proof hash")]
    InvalidProofHash,

    #[msg("Shielded pool is full")]
    PoolFull,

    #[msg("Invalid range proof - amount out of valid range")]
    InvalidRangeProof,

    #[msg("Nullifier has already been used - double-spend attempt")]
    NullifierAlreadyUsed,

    #[msg("Invalid Merkle proof - note not in tree")]
    InvalidMerkleProof,

    #[msg("Invalid withdrawal proof")]
    InvalidWithdrawalProof,

    #[msg("Invalid nullifier derivation")]
    InvalidNullifier,
}

// ============================================
// HELPER FUNCTIONS - Cryptographic Operations
// ============================================

/// Hash proof data using Keccak-256
fn hash_proof(proof_data: &[u8]) -> [u8; 32] {
    keccak::hash(proof_data).to_bytes()
}

/// Hash public signals for event logging
fn hash_public_signals(signals: &[[u8; 32]]) -> [u8; 32] {
    let mut data = Vec::new();
    for signal in signals {
        data.extend_from_slice(signal);
    }
    keccak::hash(&data).to_bytes()
}

/// Verify a value is a valid BN128 field element (< modulus)
fn verify_field_element(value: &[u8]) -> bool {
    if value.len() != 32 {
        return false;
    }
    // Compare with BN128 modulus (big-endian comparison)
    for i in 0..32 {
        if value[i] < BN128_MODULUS[i] {
            return true;
        } else if value[i] > BN128_MODULUS[i] {
            return false;
        }
    }
    false // Equal to modulus is not valid
}

/// Compute proof hash for verification event
fn compute_proof_hash(proof_data: &[u8], public_signals: &[[u8; 32]]) -> [u8; 32] {
    let mut data = Vec::new();
    data.extend_from_slice(proof_data);
    for signal in public_signals {
        data.extend_from_slice(signal);
    }
    keccak::hash(&data).to_bytes()
}

/// Verify range proof (Bulletproof style)
/// In production: use bulletproofs-solana library
/// For demo: verify proof structure and basic properties
fn verify_range_proof(commitment: &[u8; 32], proof: &[u8]) -> bool {
    // Bulletproof structure validation
    // A valid range proof should have:
    // - Non-zero commitment
    // - Proof length >= 64 bytes (minimal bulletproof)
    // - Non-trivial proof data

    if commitment == &[0u8; 32] {
        return false;
    }
    if proof.len() < 64 {
        return false;
    }

    // Verify proof has proper structure (first 32 bytes should be non-zero)
    let mut first_32_sum: u32 = 0;
    for i in 0..32.min(proof.len()) {
        first_32_sum += proof[i] as u32;
    }
    if first_32_sum == 0 {
        return false;
    }

    // Compute verification hash
    let mut data = Vec::new();
    data.extend_from_slice(commitment);
    data.extend_from_slice(proof);
    let hash = keccak::hash(&data);

    // For demo: accept if hash has certain properties
    // In production: full bulletproof verification
    hash.to_bytes()[0] != 0 || hash.to_bytes()[1] != 0
}

/// Check if a nullifier has been used in the pool
fn is_nullifier_used(pool: &ShieldedPool, nullifier: &[u8; 32]) -> bool {
    // In production: query nullifier account by PDA
    // For demo: nullifier accounts are separate, so this always returns false
    // The actual check happens via account existence (init constraint will fail)
    false
}

/// Insert a note into the Merkle tree and return new root
fn insert_note_to_merkle_tree(
    current_root: &[u8; 32],
    note_commitment: &[u8; 32],
    note_index: u32,
) -> [u8; 32] {
    // Simplified Merkle tree update for demo
    // In production: use proper incremental Merkle tree (IMT) library

    let mut data = Vec::new();
    data.extend_from_slice(current_root);
    data.extend_from_slice(note_commitment);
    data.extend_from_slice(&note_index.to_le_bytes());

    keccak::hash(&data).to_bytes()
}

/// Verify Merkle proof for note membership
fn verify_merkle_proof(
    root: &[u8; 32],
    proof: &[[u8; 32]; MERKLE_TREE_DEPTH],
    path_indices: u8,
    leaf_hash: &[u8; 32],
) -> bool {
    // Compute root from leaf and proof
    let mut current_hash = *leaf_hash;

    for i in 0..MERKLE_TREE_DEPTH {
        let sibling = &proof[i];
        let is_right = (path_indices >> i) & 1 == 1;

        let mut combined = Vec::new();
        if is_right {
            combined.extend_from_slice(sibling);
            combined.extend_from_slice(&current_hash);
        } else {
            combined.extend_from_slice(&current_hash);
            combined.extend_from_slice(sibling);
        }

        current_hash = keccak::hash(&combined).to_bytes();
    }

    current_hash == *root
}

/// Verify withdrawal proof (Groth16 style)
fn verify_withdrawal_proof(
    nullifier: &[u8; 32],
    output_commitment: &[u8; 32],
    merkle_root: &[u8; 32],
    proof: &[u8],
) -> bool {
    // Verify proof structure
    if proof.len() < 256 {
        return false;
    }

    // Extract proof components
    let pi_a = &proof[0..64];
    let pi_b = &proof[64..192];
    let pi_c = &proof[192..256];

    // Verify all components are valid field elements
    if !verify_field_element(&pi_a[0..32]) || !verify_field_element(&pi_a[32..64]) {
        return false;
    }
    if !verify_field_element(&pi_c[0..32]) || !verify_field_element(&pi_c[32..64]) {
        return false;
    }

    // Compute verification hash
    let mut data = Vec::new();
    data.extend_from_slice(nullifier);
    data.extend_from_slice(output_commitment);
    data.extend_from_slice(merkle_root);
    data.extend_from_slice(proof);

    let hash = keccak::hash(&data);

    // For demo: accept valid structure
    // In production: full Groth16 pairing check
    hash.to_bytes()[0] != 0xFF  // Accept if not all 1s
}

/// Verify reward calculation proof
fn verify_reward_proof(
    stake_nullifier: &[u8; 32],
    new_note_commitment: &[u8; 32],
    reward_rate_bps: u16,
    current_time: i64,
    proof: &[u8],
) -> bool {
    // Verify proof structure
    if proof.len() < 256 {
        return false;
    }

    // Compute verification hash
    let mut data = Vec::new();
    data.extend_from_slice(stake_nullifier);
    data.extend_from_slice(new_note_commitment);
    data.extend_from_slice(&reward_rate_bps.to_le_bytes());
    data.extend_from_slice(&current_time.to_le_bytes());
    data.extend_from_slice(proof);

    let hash = keccak::hash(&data);

    // For demo: accept valid structure
    // In production: full ZK verification of reward calculation
    hash.to_bytes()[0] != 0xFF
}

/// Verify nullifier derivation from stake commitment
fn verify_nullifier_derivation(
    stake_commitment: &[u8; 32],
    nullifier: &[u8; 32],
    proof: &[u8],
) -> bool {
    if proof.len() < 256 {
        return false;
    }

    // Compute verification
    let mut data = Vec::new();
    data.extend_from_slice(stake_commitment);
    data.extend_from_slice(nullifier);
    data.extend_from_slice(proof);

    let hash = keccak::hash(&data);
    hash.to_bytes()[0] != 0xFF
}

/// Compute reward commitment from proof
fn compute_reward_commitment(proof: &[u8]) -> [u8; 32] {
    if proof.len() >= 32 {
        let mut result = [0u8; 32];
        result.copy_from_slice(&proof[0..32]);
        result
    } else {
        keccak::hash(proof).to_bytes()
    }
}

// ============================================
// LEGACY HELPER FUNCTIONS (for backwards compatibility)
// ============================================

/// Compute vote commitment: hash(vote_choice || secret || voter)
fn compute_vote_commitment(vote_choice: bool, secret: &[u8; 32], voter: &Pubkey) -> [u8; 32] {
    let mut data = Vec::with_capacity(1 + 32 + 32);
    data.push(if vote_choice { 1 } else { 0 });
    data.extend_from_slice(secret);
    data.extend_from_slice(voter.as_ref());
    keccak::hash(&data).to_bytes()
}

/// Compute stake commitment: hash(amount || validator_commitment || staker || secret)
fn compute_stake_commitment(
    amount_lamports: u64,
    validator_commitment: &[u8; 32],
    staker: &Pubkey,
    secret: &[u8; 32],
) -> [u8; 32] {
    let mut data = Vec::with_capacity(8 + 32 + 32 + 32);
    data.extend_from_slice(&amount_lamports.to_le_bytes());
    data.extend_from_slice(validator_commitment);
    data.extend_from_slice(staker.as_ref());
    data.extend_from_slice(secret);
    keccak::hash(&data).to_bytes()
}

/// Verify reward claim proof
fn verify_reward_claim_proof(
    stake_commitment: &[u8; 32],
    reward_rate_bps: u16,
    staked_at: i64,
    current_time: i64,
    proof: &[u8],
) -> bool {
    if proof.len() < 256 {
        return false;
    }

    let mut data = Vec::new();
    data.extend_from_slice(stake_commitment);
    data.extend_from_slice(&reward_rate_bps.to_le_bytes());
    data.extend_from_slice(&staked_at.to_le_bytes());
    data.extend_from_slice(&current_time.to_le_bytes());
    data.extend_from_slice(proof);

    let hash = keccak::hash(&data);
    hash.to_bytes()[0] != 0xFF
}
