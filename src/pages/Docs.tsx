import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-bash";

// Syntax-highlighted code component
function HighlightedCode({ code, language = "typescript" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-[#0d1117] code-block">
      <div className="flex items-center justify-between border-b border-border/50 bg-[#161b22] px-4 py-2">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <button
          onClick={copyToClipboard}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <Icon icon={copied ? "ph:check" : "ph:copy"} className="w-4 h-4" />
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed !bg-transparent !m-0">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}

const sections = [
  {
    id: "why-veil",
    title: "Why Veil Protocol",
    icon: "ph:trophy",
    content: {
      title: "Why Veil Protocol Stands Out",
      description: "The most complete privacy infrastructure for Solana — built for the RADR Prize Pool",
      sections: [
        {
          heading: "🏆 What Makes Us Different",
          content: [
            "While others build single-feature privacy tools, Veil Protocol delivers a COMPLETE privacy stack. We don't just hide one thing — we hide everything that matters: transaction amounts, wallet balances, vote choices, stake amounts, and identity metadata.",
            "This isn't a proof-of-concept. It's production-ready infrastructure with a deployed Solana program, published npm packages, and real working demos."
          ]
        },
        {
          heading: "The Complete Privacy Stack",
          items: [
            { label: "🔐 Shielded Pools", desc: "Private deposits & withdrawals with hidden amounts (Pedersen + Bulletproofs)" },
            { label: "🗳️ Private Voting", desc: "Commit-reveal voting where choices stay hidden until reveal phase" },
            { label: "👥 Stealth Multisig", desc: "M-of-N signatures without revealing WHO signed" },
            { label: "🪙 Private Staking", desc: "Stake with hidden amounts, claim rewards privately" },
            { label: "🔄 Social Recovery", desc: "Recover wallets without exposing guardian identities" },
            { label: "💸 Hidden Transfers", desc: "Send tokens with amounts hidden via ShadowWire integration" }
          ]
        },
        {
          heading: "Production-Ready",
          items: [
            { label: "✅ Deployed Program", desc: "Live on Solana Devnet: 5C1VaebPdHZYETnTL18cLJK2RexXmVVhkkYpnYHD5P4h" },
            { label: "✅ Published SDK", desc: "@veil-protocol/sdk v0.3.0 on npm — install and use today" },
            { label: "✅ CLI Tools", desc: "@veil-protocol/cli for scaffolding privacy-first projects" },
            { label: "✅ 136 Tests Passing", desc: "Comprehensive test coverage for all privacy features" },
            { label: "✅ Interactive Demos", desc: "Try every feature in the browser with real wallet integration" }
          ]
        },
        {
          heading: "ShadowWire + Light Protocol Integration",
          content: [
            "We're the ONLY project that deeply integrates both ShadowWire (for private transfers) AND Light Protocol (for ZK compression). This gives developers the best of both worlds: hidden transaction amounts AND 1000x cheaper state management."
          ]
        }
      ]
    }
  },
  {
    id: "introduction",
    title: "Introduction",
    icon: "ph:book-open",
    content: {
      title: "Veil Protocol Documentation",
      description: "Privacy-preserving wallet infrastructure for Solana",
      sections: [
        {
          heading: "What is Veil Protocol?",
          content: [
            "Veil Protocol is a privacy layer for Solana wallets that enables authentication and recovery without revealing user identity on-chain.",
            "Unlike traditional wallets that expose your email, social accounts, and guardian relationships, Veil uses cryptographic commitments to keep your identity private while maintaining full wallet functionality."
          ]
        },
        {
          heading: "Core Capabilities",
          items: [
            { label: "Private Authentication", desc: "Login with email or passkey without on-chain identity exposure" },
            { label: "Deterministic Wallets", desc: "Same credentials always generate the same wallet address" },
            { label: "Private Recovery", desc: "Recover access without revealing guardian identities" },
            { label: "Zero-Knowledge Proofs", desc: "Prove wallet ownership without exposing authentication method" }
          ]
        },
        {
          heading: "Use Cases",
          items: [
            { label: "DeFi Applications", desc: "Trade and lend without linking to real-world identity" },
            { label: "Private Payments", desc: "Send and receive without transaction graph analysis" },
            { label: "Anonymous Governance", desc: "Vote in DAOs without revealing token holdings" },
            { label: "Private Social", desc: "Interact on-chain without exposing social connections" }
          ]
        }
      ]
    }
  },
  {
    id: "integration",
    title: "Integration Guide",
    icon: "ph:plug",
    content: {
      title: "3 Ways to Integrate",
      description: "Choose the integration method that fits your project",
      sections: [
        {
          heading: "Option 1: SDK (Recommended)",
          content: [
            "The SDK gives you full control over all privacy features. Best for custom applications that need fine-grained control."
          ]
        },
        {
          heading: "Install the SDK",
          code: `npm install @veil-protocol/sdk

# Required peer dependencies
npm install @solana/web3.js @solana/wallet-adapter-react`,
          language: "bash"
        },
        {
          heading: "Initialize & Use",
          code: `import { ShadowWireIntegration } from '@veil-protocol/sdk';
import { Connection } from '@solana/web3.js';

// 1. Setup connection
const connection = new Connection('https://api.devnet.solana.com');
const encryptionKey = new Uint8Array(32); // Your encryption key

// 2. Initialize ShadowWire integration
const shadowWire = new ShadowWireIntegration({ connection, encryptionKey });

// 3. Create a shielded pool
const { poolAddress } = await shadowWire.createShieldedPool(
  wallet.publicKey,
  poolId,
  500,  // 5% reward rate
  1,    // 1 epoch lockup
  signTransaction
);

// 4. Private deposit (amount HIDDEN on-chain!)
const { noteCommitment } = await shadowWire.shieldDeposit(
  wallet.publicKey,
  1.5,  // 1.5 SOL - hidden via Pedersen commitment
  signTransaction,
  poolAddress
);

// 5. Check balance (only you can decrypt)
const balance = await shadowWire.getShieldedBalance(wallet.publicKey, poolAddress);

// 6. Private withdrawal
await shadowWire.shieldWithdraw(
  wallet.publicKey,
  1.0,
  recipientWallet,
  signTransaction,
  poolAddress
);`,
          language: "typescript"
        },
        {
          heading: "Option 2: CLI (Quick Start)",
          content: [
            "Use the CLI to scaffold a complete privacy-first project in seconds. Best for new projects."
          ]
        },
        {
          heading: "Scaffold a New Project",
          code: `# Install CLI globally
npm install -g @veil-protocol/cli

# Create new project with privacy features
npx create-veil-app my-private-dex

# Or use the CLI directly
veil init my-project
veil info              # Show Veil Protocol info
veil shadowwire        # Show ShadowWire architecture
veil privacy-stack     # Show full privacy stack diagram`,
          language: "bash"
        },
        {
          heading: "Option 3: Direct Program Calls",
          content: [
            "For advanced users who want to interact directly with the Solana program using Anchor."
          ]
        },
        {
          heading: "Direct Anchor Integration",
          code: `use anchor_lang::prelude::*;

// Program ID
declare_id!("5C1VaebPdHZYETnTL18cLJK2RexXmVVhkkYpnYHD5P4h");

// Create shielded pool
let ix = veil_protocol::instruction::create_shielded_pool(
    &program_id,
    &creator.pubkey(),
    pool_id,
    reward_rate_bps,
    lockup_epochs,
);

// Shield deposit
let ix = veil_protocol::instruction::shield_deposit(
    &program_id,
    &pool_address,
    &depositor.pubkey(),
    note_commitment,
    encrypted_note,
    range_proof,
);

// Shield withdraw
let ix = veil_protocol::instruction::shield_withdraw(
    &program_id,
    &pool_address,
    nullifier,
    merkle_proof,
    withdrawal_proof,
    &recipient.pubkey(),
);`,
          language: "rust"
        },
        {
          heading: "Which Should I Choose?",
          items: [
            { label: "SDK", desc: "Full control, all features, best for custom apps. Use ShadowWireIntegration class." },
            { label: "CLI", desc: "Quick scaffolding, pre-configured templates, best for new projects." },
            { label: "Direct Program", desc: "Maximum control, Rust/Anchor, best for on-chain programs." }
          ]
        }
      ]
    }
  },
  {
    id: "quickstart",
    title: "Quick Start",
    icon: "ph:rocket-launch",
    content: {
      title: "5-Minute Quick Start",
      description: "Get privacy features running in your app in 5 minutes",
      sections: [
        {
          heading: "Step 1: Install",
          code: `npm install @veil-protocol/sdk @solana/web3.js`,
          language: "bash"
        },
        {
          heading: "Step 2: Initialize",
          code: `import { VeilClient } from '@veil-protocol/sdk';
import { Connection, clusterApiUrl } from '@solana/web3.js';

const connection = new Connection(clusterApiUrl('devnet'));
const veil = new VeilClient(connection);`,
          language: "typescript"
        },
        {
          heading: "Step 3: Use Privacy Features",
          code: `// Private voting
const vote = await veil.voting.createVote(proposalId, 'yes', secret);
await veil.voting.revealVote(proposalId, 'yes', secret);

// Private staking
const stake = await veil.staking.stake(validatorPubkey, 100, signTx);
const rewards = await veil.staking.getRewards(commitment);

// Stealth multisig
const multisig = await veil.multisig.create({
  threshold: 2,
  signers: [signer1, signer2, signer3]
});`,
          language: "typescript"
        },
        {
          heading: "Configuration Options",
          items: [
            { label: "network", desc: "Solana network: 'devnet' | 'mainnet-beta' | 'testnet'" },
            { label: "rpcUrl", desc: "Custom RPC endpoint URL (optional)" },
            { label: "commitment", desc: "Transaction commitment level: 'confirmed' | 'finalized'" }
          ]
        }
      ]
    }
  },
  {
    id: "shielded-pools",
    title: "Shielded Pools",
    icon: "ph:vault",
    content: {
      title: "Shielded Pools",
      description: "Private deposits and withdrawals with hidden amounts",
      sections: [
        {
          heading: "How Shielded Pools Work",
          content: [
            "Shielded pools use Pedersen commitments and Bulletproofs range proofs to hide transaction amounts on-chain. When you deposit, only a cryptographic commitment is stored — not the actual amount.",
            "Withdrawals use a nullifier system (like Zcash) to prevent double-spending while maintaining privacy."
          ]
        },
        {
          heading: "Create a Shielded Pool",
          code: `import { ShadowWireIntegration } from '@veil-protocol/sdk';

const shadowWire = new ShadowWireIntegration({ connection, encryptionKey });

// Create a new shielded pool
const { poolAddress, signature } = await shadowWire.createShieldedPool(
  wallet.publicKey,
  poolId,           // Unique 32-byte pool identifier
  500,              // 5% reward rate (basis points)
  1,                // 1 epoch lockup period
  signTransaction
);

console.log('Pool created:', poolAddress.toString());`,
          language: "typescript"
        },
        {
          heading: "Private Deposit",
          code: `// Deposit with hidden amount
// On-chain: Only commitment visible, NOT "1.5 SOL"
const { noteCommitment, signature } = await shadowWire.shieldDeposit(
  wallet.publicKey,
  1.5,              // 1.5 SOL - hidden via Pedersen commitment!
  signTransaction,
  poolAddress
);

// What happens under the hood:
// 1. Generate random blinding factor
// 2. Create Pedersen commitment: C = amount*G + blinding*H
// 3. Generate Bulletproofs range proof (proves amount in [0, 2^64))
// 4. Store commitment + proof on-chain (amount hidden!)`,
          language: "typescript"
        },
        {
          heading: "Check Shielded Balance",
          code: `// Only YOU can decrypt your balance
const balance = await shadowWire.getShieldedBalance(
  wallet.publicKey,
  poolAddress
);

console.log('Shielded balance:', balance, 'SOL');
// On-chain observers see: encrypted data
// You see: 1.5 SOL`,
          language: "typescript"
        },
        {
          heading: "Private Withdrawal",
          code: `// Withdraw privately with nullifier protection
const { nullifier, signature } = await shadowWire.shieldWithdraw(
  wallet.publicKey,
  1.0,              // Withdraw 1 SOL (amount hidden)
  recipientWallet,  // Recipient address
  signTransaction,
  poolAddress
);

// What happens:
// 1. Compute nullifier = H(note_commitment || owner_secret)
// 2. Generate Merkle proof (proves note exists in pool)
// 3. Generate ZK proof (proves ownership without revealing identity)
// 4. Nullifier stored on-chain (prevents double-spend)
// 5. Funds sent to recipient`,
          language: "typescript"
        },
        {
          heading: "Privacy Guarantees",
          items: [
            { label: "Hidden Amounts", desc: "Deposit/withdrawal amounts hidden via Pedersen commitments" },
            { label: "Range Proofs", desc: "Bulletproofs prove amounts are valid without revealing values" },
            { label: "Double-Spend Protection", desc: "Nullifier system prevents spending same note twice" },
            { label: "Ownership Privacy", desc: "ZK proofs prove ownership without revealing identity" }
          ]
        }
      ]
    }
  },
  {
    id: "authentication",
    title: "Authentication",
    icon: "ph:fingerprint",
    content: {
      title: "Private Authentication",
      description: "How zkLogin-style authentication works in Veil Protocol",
      sections: [
        {
          heading: "Authentication Flow",
          steps: [
            { step: "1. User Input", desc: "User enters email/passkey (stays in browser, never sent to server)" },
            { step: "2. Generate Secret", desc: "Cryptographically secure random secret is generated locally" },
            { step: "3. Create Commitment", desc: "Hash identifier + secret to create commitment: C = SHA256(identifier || secret)" },
            { step: "4. Derive Wallet", desc: "Deterministically generate wallet address from commitment" },
            { step: "5. Store Commitment", desc: "Only the commitment hash is stored on-chain (identity remains private)" }
          ]
        },
        {
          heading: "Code Example",
          code: `// Authenticate with email
const result = await veil.authenticate({
  identifier: 'user@example.com',
  method: 'email'
});

// result.wallet - Solana Keypair
// result.commitment - SHA-256 hash (32 bytes)
// result.proof - ZK proof structure

// Store commitment on-chain
await veil.storeCommitment(result.commitment);`,
          language: "typescript"
        },
        {
          heading: "Privacy Guarantees",
          items: [
            { label: "Identity Never Exposed", desc: "Email/passkey never leaves browser, not stored anywhere" },
            { label: "Unlinkable Sessions", desc: "Each login creates cryptographically separate session" },
            { label: "Forward Secrecy", desc: "Past commitments don't reveal current identity" },
            { label: "Observer Resistance", desc: "On-chain observers only see commitment hash, cannot determine identity" }
          ]
        }
      ]
    }
  },
  {
    id: "recovery",
    title: "Recovery",
    icon: "ph:key",
    content: {
      title: "Private Recovery",
      description: "Recover wallet access without exposing guardian identities",
      sections: [
        {
          heading: "Recovery Methods",
          items: [
            { label: "Time-Locked Recovery", desc: "Single recovery key with time delay (no guardians needed)" },
            { label: "Shamir Secret Sharing", desc: "Split recovery key into shares, require threshold to recover" }
          ]
        },
        {
          heading: "Time-Locked Recovery",
          code: `// Setup time-locked recovery
const recovery = await veil.setupTimeLockRecovery({
  timelockDays: 7  // Wait period before recovery executes
});

// Download recovery key (store securely offline)
downloadRecoveryKey(recovery.key);

// Initiate recovery (when needed)
await veil.initiateRecovery({
  recoveryKey: recovery.key
});

// After timelock expires, execute recovery
await veil.executeRecovery();`,
          language: "typescript"
        },
        {
          heading: "Shamir Secret Sharing",
          code: `// Setup Shamir recovery (5 shares, need 3 to recover)
const recovery = await veil.setupShamirRecovery({
  totalShares: 5,
  threshold: 3
});

// Distribute shares to guardians
recovery.shares.forEach((share, index) => {
  sendToGuardian(guardians[index], share);
});

// Recover with threshold shares (collect from guardians)
const shares = [share1, share2, share3];  // Any 3 of 5
await veil.recoverWithShares(shares);`,
          language: "typescript"
        },
        {
          heading: "Privacy Features",
          items: [
            { label: "No Guardian Exposure", desc: "Guardian identities never recorded on-chain" },
            { label: "Hidden Share Distribution", desc: "Share distribution happens off-chain (email, Signal, etc.)" },
            { label: "Threshold Security", desc: "Need K of N shares, prevents single point of failure" },
            { label: "Time-Lock Protection", desc: "Delay gives owner time to cancel unauthorized recovery" }
          ]
        }
      ]
    }
  },
  {
    id: "api",
    title: "API Reference",
    icon: "ph:code",
    content: {
      title: "API Reference",
      description: "Complete API documentation for Veil Protocol SDK",
      sections: [
        {
          heading: "VeilAuth Class",
          items: [
            { label: "authenticate(options)", desc: "Authenticate user and generate wallet" },
            { label: "storeCommitment(commitment)", desc: "Store commitment hash on-chain" },
            { label: "verifyProof(proof)", desc: "Verify zero-knowledge proof validity" },
            { label: "getWallet(commitment)", desc: "Retrieve wallet from commitment" }
          ]
        },
        {
          heading: "authenticate(options)",
          code: `interface AuthOptions {
  identifier: string;        // Email or passkey
  method: 'email' | 'passkey';
}

interface AuthResult {
  wallet: Keypair;           // Solana wallet keypair
  commitment: string;        // SHA-256 hash (hex)
  proof: ZKProof;           // Zero-knowledge proof
}

const result = await veil.authenticate(options);`,
          language: "typescript"
        },
        {
          heading: "Recovery Methods",
          items: [
            { label: "setupTimeLockRecovery(options)", desc: "Create time-locked recovery" },
            { label: "setupShamirRecovery(options)", desc: "Create Shamir secret sharing recovery" },
            { label: "initiateRecovery(key)", desc: "Start recovery process" },
            { label: "cancelRecovery()", desc: "Cancel ongoing recovery" },
            { label: "executeRecovery()", desc: "Complete recovery after timelock" }
          ]
        },
        {
          heading: "Utility Functions",
          items: [
            { label: "generateProof(commitment)", desc: "Generate ZK proof for commitment" },
            { label: "verifyCommitment(commitment, identifier)", desc: "Verify commitment hash" },
            { label: "exportRecoveryKey()", desc: "Export recovery key as encrypted file" },
            { label: "importRecoveryKey(file)", desc: "Import recovery key from file" }
          ]
        }
      ]
    }
  },
  {
    id: "architecture",
    title: "Architecture",
    icon: "ph:stack",
    content: {
      title: "Technical Architecture",
      description: "System design and cryptographic primitives",
      sections: [
        {
          heading: "System Components",
          items: [
            { label: "Frontend SDK", desc: "React/TypeScript library for client-side proof generation" },
            { label: "Solana Program", desc: "On-chain program for commitment storage and recovery" },
            { label: "ZK Proof Engine", desc: "Groth16 proof generation and verification" },
            { label: "Recovery System", desc: "Time-lock and Shamir secret sharing implementation" }
          ]
        },
        {
          heading: "Data Flow",
          code: `User (Email)
  ↓
Generate Secret (browser)
  ↓
Create Commitment = SHA256(email + secret)
  ↓
Derive Wallet = derive(commitment)
  ↓
Store Commitment On-Chain
  ↓
Identity Remains Private`,
          language: "bash"
        },
        {
          heading: "Cryptographic Primitives",
          items: [
            { label: "SHA-256", desc: "Commitment hash generation (one-way function)" },
            { label: "Groth16", desc: "Zero-knowledge proof protocol (zk-SNARKs)" },
            { label: "BN128 Curve", desc: "Elliptic curve for pairing-based cryptography" },
            { label: "Shamir SSS", desc: "Secret sharing over Galois Field GF(256)" },
            { label: "Pedersen Commitments", desc: "Hide amounts: C = amount*G + blinding*H" },
            { label: "Bulletproofs", desc: "Range proofs for hidden amounts [0, 2^64)" },
            { label: "Poseidon Hash", desc: "ZK-friendly hash for Merkle trees and nullifiers" }
          ]
        },
        {
          heading: "On-Chain Storage",
          code: `pub struct WalletAccount {
    pub commitment: [u8; 32],           // SHA-256 hash
    pub recovery_commitment: [u8; 32],  // Recovery hash
    pub timelock_days: u8,              // Recovery delay
    pub recovery_active: bool,
    pub recovery_initiated_at: i64,
    // NO identity, email, or guardian data stored
}

pub struct ShieldedPool {
    pub pool_id: [u8; 32],              // Unique pool identifier
    pub merkle_root: [u8; 32],          // Root of note Merkle tree
    pub next_note_index: u32,           // Next available note slot
    pub nullifier_count: u32,           // Number of spent notes
    // Amounts are NEVER stored - only commitments!
}`,
          language: "rust"
        }
      ]
    }
  },
  {
    id: "security",
    title: "Security",
    icon: "ph:shield-check",
    content: {
      title: "Security Considerations",
      description: "Best practices and security guidelines",
      sections: [
        {
          heading: "Critical Security Practices",
          items: [
            { label: "Never Log Secrets", desc: "Never log or store user secrets, identifiers, or recovery keys" },
            { label: "Use HTTPS Only", desc: "Always serve application over HTTPS in production" },
            { label: "Secure Recovery Storage", desc: "Encrypt recovery keys, store in hardware wallet or offline" },
            { label: "Validate Inputs", desc: "Sanitize and validate all user inputs before processing" },
            { label: "Rate Limiting", desc: "Implement rate limiting on authentication endpoints" }
          ]
        },
        {
          heading: "Threat Model",
          items: [
            { label: "On-Chain Observer", desc: "Can see commitment hash, cannot determine identity" },
            { label: "Compromised Frontend", desc: "Can steal future logins, cannot recover past commitments" },
            { label: "Stolen Recovery Key", desc: "Time-lock provides window to cancel recovery" },
            { label: "Social Engineering", desc: "Guardians unknown, cannot be targeted" }
          ]
        },
        {
          heading: "Recommendations",
          items: [
            { label: "Multi-Factor Recovery", desc: "Use both time-lock and Shamir for high-value wallets" },
            { label: "Regular Testing", desc: "Test recovery flow before needing it in emergency" },
            { label: "Secure Communication", desc: "Distribute Shamir shares via encrypted channels (Signal, PGP)" },
            { label: "Audit Smart Contracts", desc: "Conduct security audits before mainnet deployment" }
          ]
        }
      ]
    }
  },
  {
    id: "confidential-transfers",
    title: "Confidential Transfers",
    icon: "ph:lock-laminated",
    content: {
      title: "SPL Token-2022 Confidential Transfers",
      description: "Hide transaction amounts using native Solana confidential transfer extension",
      sections: [
        {
          heading: "Overview",
          content: [
            "Confidential transfers use the SPL Token-2022 extension to hide transaction amounts on-chain. Balances are encrypted using ElGamal encryption, and range proofs verify amounts are valid without revealing values.",
            "This enables institutional use cases where identity can be revealed while transaction details remain private."
          ]
        },
        {
          heading: "Initialize Client",
          code: `import { ConfidentialTransferClient } from '@veil-protocol/sdk/confidential';
import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const client = new ConfidentialTransferClient(connection);

// Generate ElGamal keypair for encryption
const { publicKey, privateKey } = client.generateElGamalKeypair();`,
          language: "typescript"
        },
        {
          heading: "Configure Account",
          code: `// Configure token account for confidential transfers
const result = await client.configureAccount(
  mintAddress,      // SPL Token-2022 mint
  wallet.publicKey, // Account owner
  signTransaction   // Wallet signing function
);

console.log('Account configured:', result.signature);`,
          language: "typescript"
        },
        {
          heading: "Deposit and Transfer",
          code: `// Deposit to confidential balance (amount encrypted)
await client.deposit(mintAddress, 1000000n, signTransaction);

// Transfer with hidden amount
await client.transfer(
  mintAddress,
  500000n,                    // Amount (hidden on-chain)
  recipientElGamalPubkey,     // Recipient's encryption key
  recipientTokenAccount,      // Recipient's token account
  signTransaction
);`,
          language: "typescript"
        },
        {
          heading: "Add Audit Key",
          code: `// Allow regulator to decrypt specific transactions
const { auditKey } = await client.addAuditKey(
  regulatorPubkey,
  {
    scope: 'transactions',    // What can be decrypted
    jurisdiction: 'US',
    expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000
  }
);`,
          language: "typescript"
        },
        {
          heading: "Privacy Guarantees",
          items: [
            { label: "Hidden Amounts", desc: "Transaction amounts encrypted with ElGamal on twisted curve25519" },
            { label: "Range Proofs", desc: "Sigma protocols prove amounts in valid range [0, 2^64)" },
            { label: "Audit Keys", desc: "Optional keys for regulators to decrypt specific scopes" },
            { label: "Native Solana", desc: "Uses SPL Token-2022 extension - no external dependencies" }
          ]
        }
      ]
    }
  },
  {
    id: "compliance",
    title: "Compliance",
    icon: "ph:identification-badge",
    content: {
      title: "ZK-KYC Compliance",
      description: "Prove regulatory compliance without exposing personal data",
      sections: [
        {
          heading: "Overview",
          content: [
            "The compliance module enables institutional users to prove KYC/KYB compliance using zero-knowledge proofs. Personal data stays private while regulators can verify compliance through audit keys and attestations.",
            "This enables programmable privacy with selective transparency for institutional requirements."
          ]
        },
        {
          heading: "Initialize Compliance Client",
          code: `import { ComplianceClient } from '@veil-protocol/sdk/compliance';
import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const client = new ComplianceClient(connection);`,
          language: "typescript"
        },
        {
          heading: "Store KYC Claims",
          code: `// Store encrypted KYC claim (data never exposed)
const { claimId } = await client.storeKYCClaim({
  type: 'identity',
  data: {
    nationality: 'US',
    accredited: true,
    kycDate: Date.now()
  },
  issuer: kycProviderPubkey,
  issuedAt: Date.now()
});`,
          language: "typescript"
        },
        {
          heading: "Generate ZK-KYC Proof",
          code: `// Prove compliance without revealing data
const { proof } = await client.generateKYCProof(
  ['identity', 'accreditation'],  // Claim types to prove
  {
    minAge: 18,
    jurisdiction: 'US',
    accreditedRequired: true
  }
);

// Proof can be verified on-chain without revealing:
// - Actual age (only proves >= 18)
// - Personal details
// - Document numbers`,
          language: "typescript"
        },
        {
          heading: "Create Attestation",
          code: `// Issuer creates on-chain attestation
const { attestation } = await client.createAttestation(
  subjectPubkey,      // User being attested
  'kyc_verified',     // Compliance type
  issuerKeypair,      // Issuer's signing key
  365                 // Validity in days
);

// Attestation stored on-chain, personal data stays private`,
          language: "typescript"
        },
        {
          heading: "Compliance Features",
          items: [
            { label: "ZK-KYC Proofs", desc: "Prove identity claims without revealing personal data" },
            { label: "Audit Keys", desc: "Jurisdiction-specific keys for regulatory access" },
            { label: "Attestations", desc: "On-chain compliance certificates with expiration" },
            { label: "Selective Disclosure", desc: "Reveal only required fields to specific parties" }
          ]
        }
      ]
    }
  },
  {
    id: "anonymous-ramps",
    title: "Anonymous Ramps",
    icon: "ph:arrows-left-right",
    content: {
      title: "Anonymous Fiat On/Off Ramps",
      description: "P2P trading with stealth addresses and escrow",
      sections: [
        {
          heading: "Overview",
          content: [
            "The ramps module enables anonymous fiat-to-crypto conversion using stealth addresses and P2P escrow. Users can on-ramp and off-ramp without revealing their identity while transaction amounts remain public.",
            "This addresses the anonymity pillar - hiding identity while amounts are visible."
          ]
        },
        {
          heading: "Initialize Ramp Client",
          code: `import { RampClient } from '@veil-protocol/sdk/ramps';
import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const client = new RampClient(connection);`,
          language: "typescript"
        },
        {
          heading: "Create Stealth Address",
          code: `// Generate stealth address for anonymous deposits
const { stealthAddress, ephemeralPubkey, viewKey } =
  await client.createStealthAddress(recipientPubkey);

// Sender deposits to stealthAddress
// Recipient scans with viewKey to find funds
// Nobody else can link deposit to recipient`,
          language: "typescript"
        },
        {
          heading: "Create P2P Order",
          code: `// Create sell order (want to sell crypto for fiat)
const { orderId } = await client.createOrder({
  side: 'sell',
  amount: 100,                    // 100 USDC
  fiatCurrency: 'USD',
  fiatAmount: 100,
  paymentMethods: ['bank_transfer', 'venmo'],
  minTrade: 10,
  maxTrade: 100
});`,
          language: "typescript"
        },
        {
          heading: "Match and Execute Trade",
          code: `// Buyer matches the order
const { escrowId } = await client.matchOrder(orderId, buyerPubkey);

// Crypto locked in escrow, buyer sends fiat

// After fiat received, seller releases escrow
await client.releaseEscrow(escrowId, signTransaction);

// Buyer receives crypto at their stealth address`,
          language: "typescript"
        },
        {
          heading: "Supported Payment Methods",
          items: [
            { label: "Bank Transfer", desc: "Wire transfers, ACH, SEPA" },
            { label: "Venmo / PayPal", desc: "Popular US payment apps" },
            { label: "Wise / Revolut", desc: "International transfers" },
            { label: "Cash Deposit", desc: "In-person cash trades" }
          ]
        },
        {
          heading: "Privacy Features",
          items: [
            { label: "Stealth Addresses", desc: "DKSAP protocol for unlinkable deposits" },
            { label: "P2P Escrow", desc: "Trustless trading without centralized custody" },
            { label: "Anonymous Matching", desc: "Order book without identity requirements" },
            { label: "Multi-Currency", desc: "USD, EUR, GBP, JPY, CHF, and more" }
          ]
        }
      ]
    }
  }
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState("why-veil");

  const currentSection = sections.find((s) => s.id === activeSection);

  return (
    <PageLayout>
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-64 flex-shrink-0"
            >
              <div className="glass-panel rounded-xl p-4 sticky top-24">
                <h2 className="font-semibold mb-4 px-3 text-sm uppercase tracking-wide text-muted-foreground">
                  Documentation
                </h2>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                        activeSection === section.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <Icon icon={section.icon} className="w-4 h-4 flex-shrink-0" />
                      <span>{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </motion.aside>

            {/* Main Content */}
            <motion.main
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1 min-w-0"
            >
              <div className="glass-panel rounded-xl p-8">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon
                        icon={currentSection?.icon || "ph:book-open"}
                        className="w-5 h-5 text-primary"
                      />
                    </div>
                    <h1 className="text-3xl font-bold">{currentSection?.content.title}</h1>
                  </div>
                  <p className="text-muted-foreground">
                    {currentSection?.content.description}
                  </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-8">
                  {currentSection?.content.sections.map((section, idx) => (
                    <div key={idx}>
                      <h2 className="text-xl font-semibold mb-4">{section.heading}</h2>

                      {/* Text content */}
                      {section.content && (
                        <div className="space-y-3">
                          {section.content.map((text, i) => (
                            <p key={i} className="text-muted-foreground leading-relaxed">
                              {text}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Code blocks with syntax highlighting */}
                      {section.code && (
                        <HighlightedCode
                          code={section.code}
                          language={section.language || "typescript"}
                        />
                      )}

                      {/* Item lists */}
                      {section.items && (
                        <div className="space-y-3">
                          {section.items.map((item, i) => (
                            <div
                              key={i}
                              className="flex gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50"
                            >
                              <Icon
                                icon="ph:arrow-right"
                                className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                              />
                              <div>
                                <div className="font-mono text-sm font-medium text-foreground">
                                  {item.label}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {item.desc}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Steps */}
                      {section.steps && (
                        <div className="space-y-3">
                          {section.steps.map((step, i) => (
                            <div key={i} className="flex gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">
                                  {i + 1}
                                </span>
                              </div>
                              <div className="flex-1 pt-1">
                                <div className="font-medium text-foreground">{step.step}</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {step.desc}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.main>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
