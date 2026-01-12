use anchor_lang::prelude::*;

declare_id!("FaSJXt21yZ2WZKLoQYAV9nkTHqYNduDh95nU1uYGZP87");

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
}

// Helper Functions

fn hash_proof(proof_data: &[u8]) -> [u8; 32] {
    // Simple proof hash - for demo we take first 32 bytes or pad
    let mut result = [0u8; 32];
    let len = proof_data.len().min(32);
    result[..len].copy_from_slice(&proof_data[..len]);
    result
}
