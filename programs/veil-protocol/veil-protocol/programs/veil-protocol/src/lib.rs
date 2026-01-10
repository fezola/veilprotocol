use anchor_lang::prelude::*;

declare_id!("Ed6t6DqRQpLKHifPG7gNorFMmaWcQQA2bQ8R6WdmbEZo");

#[program]
pub mod veil_protocol {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
