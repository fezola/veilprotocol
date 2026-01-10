import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";

const sections = [
  {
    id: "overview",
    title: "Overview",
    icon: "ph:book-open",
    content: `
## What is Veil Protocol?

Veil Protocol is a privacy infrastructure layer for Solana wallets. It allows users to:

- **Authenticate** without revealing identity
- **Transact** without linking balances to real-world identity
- **Recover** wallets without exposing social graphs or guardians

### Not a Wallet

Veil is not a full wallet. It's a privacy layer that sits on top of existing Solana wallets, adding identity protection at every step.

### Not Private Payments

Unlike mixing services or private payment protocols, Veil focuses on the **entire wallet lifecycle**—from login to recovery.
    `,
  },
  {
    id: "architecture",
    title: "Architecture",
    icon: "ph:code",
    content: `
## Technical Architecture

### Components

1. **Frontend (React/TypeScript)**
   - Handles UI and local ZK proof generation
   - Never sends identity data to servers

2. **Wallet Derivation**
   - Deterministic address generation from ZK proof
   - Uses \`kdf(zk_proof_commitment)\` for key derivation

3. **ZK Proof Generation**
   - Client-side proof generation
   - Proves identity ownership without revealing identity

4. **Solana Program**
   - Stores commitments (not identities)
   - Manages recovery timelocks
   - Verifies ZK proofs on-chain

### Data Flow

\`\`\`
User → zkLogin Proof → Commitment → Derived Wallet
                ↓
         On-chain (public)
                ↓
    Only commitment stored (no identity)
\`\`\`
    `,
  },
  {
    id: "authentication",
    title: "Authentication",
    icon: "ph:fingerprint",
    content: `
## Private Authentication

### How zkLogin Works

1. User authenticates locally (email or passkey)
2. Client generates zero-knowledge proof
3. Only cryptographic commitment sent to chain
4. Wallet address derived from commitment

### Privacy Properties

- Email/passkey never leaves device
- No password stored anywhere
- Commitment cannot reveal identity
- Multiple authentications = unlinkable wallets
    `,
  },
  {
    id: "recovery",
    title: "Recovery",
    icon: "ph:key",
    content: `
## Private Recovery

### Time-Locked Recovery

1. Generate recovery key locally
2. Store commitment on-chain
3. If used, timelock countdown begins
4. Owner can cancel during waiting period

**Privacy:** No one knows you have a recovery key until used.

### Shamir Secret Sharing

1. Split key into N shares
2. Require K shares to recover
3. Distribute to trusted parties privately
4. Reconstruct without revealing who holds shares

**Privacy:** Guardian list never appears on-chain.
    `,
  },
  {
    id: "scope",
    title: "Hackathon Scope",
    icon: "ph:target",
    content: `
## What's Built vs. Mocked

### Real & Verifiable
- Complete UI/UX flow
- Authentication flow simulation
- Recovery setup interface
- Privacy dashboard

### Intentionally Mocked
- Actual ZK proof generation (requires cryptographic library)
- On-chain Solana program (deployed but not connected)
- Real wallet derivation (demo addresses shown)

### Not Built
- Full wallet functionality (send/receive)
- Multi-chain support
- Token balances display
- Transaction history
    `,
  },
  {
    id: "future",
    title: "Future Vision",
    icon: "ph:rocket",
    content: `
## Future Development

### Wallet SDK
Package Veil as an SDK that any Solana wallet can integrate for instant privacy.

### Privacy Standard
Propose Veil as a Solana-wide standard for private authentication and recovery.

### Composable Primitive
Enable other protocols to build on Veil's privacy guarantees.

### What We're NOT Building
- Token mixing
- Private payments (different problem space)
- AI/ML features
- Multi-chain bridges
    `,
  },
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState("overview");

  const currentSection = sections.find((s) => s.id === activeSection);

  return (
    <PageLayout>
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-64 flex-shrink-0"
            >
              <div className="glass-panel rounded-xl p-4 sticky top-24">
                <h2 className="font-semibold mb-4 px-3">Documentation</h2>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                        activeSection === section.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      <Icon icon={section.icon} className="w-4 h-4" />
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.aside>

            {/* Content */}
            <motion.main
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 min-w-0"
            >
              <div className="glass-panel rounded-xl p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon icon={currentSection?.icon || "ph:book-open"} className="w-5 h-5 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold">{currentSection?.title}</h1>
                </div>

                <div className="prose prose-invert max-w-none">
                  {currentSection?.content.split("\n").map((line, i) => {
                    if (line.startsWith("## ")) {
                      return (
                        <h2 key={i} className="text-xl font-bold mt-8 mb-4 first:mt-0">
                          {line.replace("## ", "")}
                        </h2>
                      );
                    }
                    if (line.startsWith("### ")) {
                      return (
                        <h3 key={i} className="text-lg font-semibold mt-6 mb-3">
                          {line.replace("### ", "")}
                        </h3>
                      );
                    }
                    if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ") || line.startsWith("4. ")) {
                      return (
                        <p key={i} className="text-muted-foreground my-1 pl-4">
                          {line}
                        </p>
                      );
                    }
                    if (line.startsWith("- **")) {
                      const match = line.match(/- \*\*(.+)\*\* (.+)/);
                      if (match) {
                        return (
                          <p key={i} className="text-muted-foreground my-2">
                            <strong className="text-foreground">{match[1]}</strong> {match[2]}
                          </p>
                        );
                      }
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <p key={i} className="text-muted-foreground my-1 pl-4">
                          • {line.replace("- ", "")}
                        </p>
                      );
                    }
                    if (line.startsWith("**Privacy:**")) {
                      return (
                        <div key={i} className="my-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-sm">
                            <span className="text-primary font-medium">Privacy: </span>
                            <span className="text-muted-foreground">{line.replace("**Privacy:** ", "")}</span>
                          </p>
                        </div>
                      );
                    }
                    if (line.startsWith("```")) {
                      return null; // Skip code block markers
                    }
                    if (line.includes("→")) {
                      return (
                        <pre key={i} className="my-4 p-4 rounded-lg bg-secondary font-mono text-sm overflow-x-auto">
                          {line}
                        </pre>
                      );
                    }
                    if (line.trim() === "") {
                      return <div key={i} className="h-2" />;
                    }
                    return (
                      <p key={i} className="text-muted-foreground my-2">
                        {line}
                      </p>
                    );
                  })}
                </div>
              </div>
            </motion.main>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
