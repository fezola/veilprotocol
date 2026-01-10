import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";

const sections = [
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
    id: "quickstart",
    title: "Quick Start",
    icon: "ph:rocket-launch",
    content: {
      title: "Getting Started",
      description: "Install and configure Veil Protocol in your application",
      sections: [
        {
          heading: "Installation",
          code: `npm install @veil-protocol/sdk

# or
yarn add @veil-protocol/sdk`
        },
        {
          heading: "Basic Setup",
          code: `import { VeilAuth } from '@veil-protocol/sdk';

// Initialize Veil Protocol
const veil = new VeilAuth({
  network: 'devnet',
  rpcUrl: 'https://api.devnet.solana.com'
});

// Authenticate user
const { wallet, commitment } = await veil.authenticate({
  identifier: 'user@example.com',
  method: 'email'
});

console.log('Wallet Address:', wallet.publicKey.toString());
console.log('Commitment:', commitment); // SHA-256 hash`
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
await veil.storeCommitment(result.commitment);`
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
await veil.executeRecovery();`
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
await veil.recoverWithShares(shares);`
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

const result = await veil.authenticate(options);`
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
Identity Remains Private`
        },
        {
          heading: "Cryptographic Primitives",
          items: [
            { label: "SHA-256", desc: "Commitment hash generation (one-way function)" },
            { label: "Groth16", desc: "Zero-knowledge proof protocol (zk-SNARKs)" },
            { label: "BN128 Curve", desc: "Elliptic curve for pairing-based cryptography" },
            { label: "Shamir SSS", desc: "Secret sharing over Galois Field GF(256)" }
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
}`
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
  }
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState("introduction");

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

                      {/* Code blocks */}
                      {section.code && (
                        <pre className="bg-secondary/50 rounded-lg p-4 overflow-x-auto border border-border">
                          <code className="text-sm font-mono text-foreground">
                            {section.code}
                          </code>
                        </pre>
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
