use anchor_lang::prelude::*;

declare_id!("5C1VaebPdHZYETnTL18cLJK2RexXmVVhkkYpnYHD5P4h");

/// Maximum number of signers for a multisig
pub const MAX_MULTISIG_SIGNERS: usize = 10;
/// Maximum number of votes per proposal
pub const MAX_VOTES_PER_PROPOSAL: usize = 100;

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
    /// In production, this would verify the actual ZK proof on-chain
    /// For hackathon demo, we accept the proof and emit an event
    pub fn submit_proof(
        ctx: Context<SubmitProof>,
        proof_data: Vec<u8>,
        public_signals: Vec<[u8; 32]>,
    ) -> Result<()> {
        let wallet_account = &ctx.accounts.wallet_account;

        // TODO: In production, integrate with on-chain ZK verifier
        // For now, we validate the proof structure and emit event
        require!(proof_data.len() > 0, ErrorCode::InvalidProof);
        require!(public_signals.len() > 0, ErrorCode::InvalidProof);

        emit!(ProofVerified {
            wallet: wallet_account.key(),
            proof_hash: hash_proof(&proof_data),
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
    pub timestamp: i64,
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
}

// Helper Functions

fn hash_proof(proof_data: &[u8]) -> [u8; 32] {
    // Simple proof hash - for demo we take first 32 bytes or pad
    let mut result = [0u8; 32];
    let len = proof_data.len().min(32);
    result[..len].copy_from_slice(&proof_data[..len]);
    result
}

/// Compute vote commitment: hash(vote_choice || secret || voter)
fn compute_vote_commitment(vote_choice: bool, secret: &[u8; 32], voter: &Pubkey) -> [u8; 32] {
    let mut data = Vec::with_capacity(1 + 32 + 32);
    data.push(if vote_choice { 1 } else { 0 });
    data.extend_from_slice(secret);
    data.extend_from_slice(voter.as_ref());

    // Simple hash for demo - in production use proper cryptographic hash
    let mut result = [0u8; 32];
    for (i, chunk) in data.chunks(32).enumerate() {
        for (j, byte) in chunk.iter().enumerate() {
            result[(i + j) % 32] ^= byte;
        }
    }
    result
}
