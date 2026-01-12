/**
 * VEIL PRIVACY GUARANTEES
 *
 * This file documents what Veil protects and what it does NOT protect.
 * Read this carefully before building your application.
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * ✅ WHAT VEIL PROTECTS (Private)
 *
 * 1. IDENTITY
 *    - Your email/passkey is never stored on-chain
 *    - No correlation between login method and wallet
 *    - Identity proof generates unlinkable wallet
 *
 * 2. ACCESS PATTERNS
 *    - Proof-based verification (not address lookup)
 *    - Session data is ephemeral
 *    - No on-chain access logs
 *
 * 3. RECOVERY SOCIAL GRAPH
 *    - Guardian identities are hidden (commitment hashes)
 *    - Recovery doesn't reveal who helped you
 *    - Timelock prevents instant unauthorized recovery
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * ❌ WHAT VEIL DOES NOT PROTECT (Public on Solana)
 *
 * 1. TRANSACTION AMOUNTS
 *    - All SOL/token amounts are visible
 *    - This is a Solana limitation, not Veil
 *
 * 2. TRANSACTION RECIPIENTS
 *    - Destination addresses are public
 *    - Anyone can see who you transact with
 *
 * 3. WALLET BALANCES
 *    - All balances are publicly queryable
 *    - Historical balance changes are visible
 *
 * 4. TRANSACTION HISTORY
 *    - All transactions are permanently recorded
 *    - Transaction graph analysis is possible
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * 🎯 VEIL'S MISSION
 *
 * "Hide the user, not the transactions."
 *
 * Veil ensures that even if someone sees your transactions,
 * they cannot link them back to your real-world identity.
 *
 * ═══════════════════════════════════════════════════════════════════
 */

export const PRIVACY_GUARANTEES = {
  identity: {
    protected: true,
    description: "Your real identity is never stored or revealed on-chain",
  },
  accessPatterns: {
    protected: true,
    description: "How you access your wallet is hidden from observers",
  },
  recoveryGuardians: {
    protected: true,
    description: "Guardian identities are hidden behind commitment hashes",
  },
  transactionAmounts: {
    protected: false,
    description: "Transaction amounts are visible on Solana",
  },
  transactionRecipients: {
    protected: false,
    description: "Transaction recipients are visible on Solana",
  },
  walletBalances: {
    protected: false,
    description: "Wallet balances are publicly queryable",
  },
} as const;

export type PrivacyGuarantee = keyof typeof PRIVACY_GUARANTEES;
