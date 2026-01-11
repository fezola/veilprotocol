import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";

const guarantees = [
  {
    category: "Never Revealed",
    icon: "ph:eye-slash",
    iconColor: "text-success",
    bgColor: "bg-success/10",
    items: [
      { label: "Real Identity", description: "No email, name, or personal data collected" },
      { label: "Authentication Method", description: "Only cryptographic commitment stored" },
      { label: "Other Wallet Addresses", description: "No linkage to other accounts possible" },
      { label: "Recovery Guardian List", description: "No public list of trusted parties" },
      { label: "Social Graph", description: "No relationship data exposed" },
    ],
  },
  {
    category: "On-Chain (Public)",
    icon: "ph:globe",
    iconColor: "text-warning",
    bgColor: "bg-warning/10",
    items: [
      { label: "Veil Wallet Address", description: "Your derived address (unlinkable to identity)" },
      { label: "Transactions", description: "Standard Solana transaction visibility" },
      { label: "Recovery Commitment", description: "Cryptographic hash only (reveals nothing)" },
    ],
  },
  {
    category: "Proven via Zero-Knowledge",
    icon: "ph:certificate",
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
    items: [
      { label: "Ownership", description: "Prove you control an identity without revealing it" },
      { label: "Recovery Rights", description: "Prove recovery authority without exposing guardians" },
      { label: "Transaction Authorization", description: "Prove permission without linking accounts" },
    ],
  },
];

const attackerCannot = [
  "Link your Veil wallet to your identity",
  "Determine your authentication method",
  "Find your other wallet addresses",
  "Identify your recovery guardians",
  "Know a recovery is in progress",
  "Correlate transactions to real-world identity",
];

export default function Guarantees() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/dashboard')}
            className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon icon="ph:arrow-left" className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Privacy <span className="text-primary">Guarantees</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Concrete, verifiable promises about what Veil protects. Not marketing—engineering constraints.
            </p>
          </motion.div>

          {/* Guarantee Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
            {guarantees.map((guarantee, index) => (
              <motion.div
                key={guarantee.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-panel rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-lg ${guarantee.bgColor} flex items-center justify-center`}>
                    <Icon icon={guarantee.icon} className={`w-5 h-5 ${guarantee.iconColor}`} />
                  </div>
                  <h2 className="font-semibold">{guarantee.category}</h2>
                </div>

                <ul className="space-y-4">
                  {guarantee.items.map((item) => (
                    <li key={item.label} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                      <p className="font-medium text-sm mb-1">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Privacy Boundary Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-16"
          >
            <div className="glass-panel rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon icon="ph:flow-arrow" className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-semibold text-xl">Privacy Boundary</h2>
              </div>

              <p className="text-muted-foreground mb-8">
                Understanding what crosses the boundary and what stays private:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-block px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/20 mb-3">
                      <span className="text-sm font-medium text-destructive">Your Secret</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon icon="ph:x" className="w-4 h-4 text-destructive" />
                      <span className="text-sm">Email/Identity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon icon="ph:x" className="w-4 h-4 text-destructive" />
                      <span className="text-sm">Recovery guardians</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon icon="ph:x" className="w-4 h-4 text-destructive" />
                      <span className="text-sm">Other wallets</span>
                    </div>
                  </div>
                  <div className="text-center text-xs text-muted-foreground">
                    Never leaves your device
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="text-center mb-4">
                    <div className="inline-block px-4 py-2 rounded-lg bg-success/10 border border-success/20">
                      <span className="text-sm font-medium text-success">ZK Proof</span>
                    </div>
                  </div>
                  <Icon icon="ph:arrow-right" className="w-8 h-8 text-primary mb-4" />
                  <div className="p-4 rounded-lg bg-success/5 border border-success/20 text-center">
                    <p className="text-sm font-medium mb-2">Proves validity</p>
                    <p className="text-xs text-muted-foreground">without revealing data</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-block px-4 py-2 rounded-lg bg-warning/10 border border-warning/20 mb-3">
                      <span className="text-sm font-medium text-warning">Solana Sees</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon icon="ph:check" className="w-4 h-4 text-success" />
                      <span className="text-sm">Proof is valid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon icon="ph:check" className="w-4 h-4 text-success" />
                      <span className="text-sm">Wallet address</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon icon="ph:check" className="w-4 h-4 text-success" />
                      <span className="text-sm">Transaction data</span>
                    </div>
                  </div>
                  <div className="text-center text-xs text-muted-foreground">
                    Public, but unlinkable
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm text-muted-foreground text-center">
                  <strong className="text-foreground">Key Insight:</strong> Solana verifies your rights without learning your identity.
                  The blockchain never sees your secret—only proof that you have one.
                </p>
              </div>
            </div>
          </motion.div>

          {/* What Attackers Cannot Learn */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto mb-16"
          >
            <div className="glass-panel rounded-xl p-8 border-destructive/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Icon icon="ph:shield-warning" className="w-5 h-5 text-destructive" />
                </div>
                <h2 className="font-semibold text-xl">What an Attacker Cannot Learn</h2>
              </div>

              <p className="text-muted-foreground mb-6">
                Even with full access to the Solana blockchain and Veil's public infrastructure,
                an adversary cannot determine:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attackerCannot.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5"
                  >
                    <Icon icon="ph:x-circle" className="w-5 h-5 text-destructive flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Composability Signal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-16"
          >
            <div className="glass-panel rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon icon="ph:plug" className="w-5 h-5" />
                </div>
                <h2 className="font-semibold text-xl">Infrastructure, Not Just an App</h2>
              </div>

              <p className="text-muted-foreground mb-6">
                Veil Protocol's privacy guarantees can be composed into any application requiring verified access without identity exposure:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30 border border-border opacity-60 cursor-not-allowed">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon icon="ph:users-three" className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Future</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-2">Private DAO Access</h3>
                  <p className="text-xs text-muted-foreground">
                    Verify membership without revealing voter identity
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-secondary/30 border border-border opacity-60 cursor-not-allowed">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon icon="ph:rocket-launch" className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Future</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-2">Launchpad Eligibility</h3>
                  <p className="text-xs text-muted-foreground">
                    Prove qualification without exposing holdings
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-secondary/30 border border-border opacity-60 cursor-not-allowed">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon icon="ph:game-controller" className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Future</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-2">Game Account Protection</h3>
                  <p className="text-xs text-muted-foreground">
                    Secure accounts with recoverable private access
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-secondary/30 border border-border opacity-60 cursor-not-allowed">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon icon="ph:building-office" className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Future</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-2">Institutional Wallets</h3>
                  <p className="text-xs text-muted-foreground">
                    Multi-party control without exposing signers
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-secondary/20 border border-border/50">
                <p className="text-xs text-muted-foreground text-center">
                  <Icon icon="ph:info" className="w-4 h-4 inline mr-1" />
                  These are potential use cases demonstrating Veil's reusability as privacy infrastructure, not a feature roadmap.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Technical Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="glass-panel rounded-xl p-8">
              <h2 className="font-semibold text-xl mb-6 flex items-center gap-2">
                <Icon icon="ph:code" className="w-5 h-5 text-primary" />
                Technical Summary
              </h2>

              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground mb-4">
                  Veil Protocol uses a combination of zero-knowledge proofs and deterministic 
                  key derivation to achieve privacy:
                </p>

                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Icon icon="ph:check-circle" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">zkLogin:</strong> Authentication generates a 
                      zero-knowledge proof of identity ownership, storing only a commitment on-chain.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon icon="ph:check-circle" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">Deterministic Derivation:</strong> Wallet addresses 
                      are derived from your identity proof using a one-way function, making reverse-engineering impossible.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon icon="ph:check-circle" className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span>
                      <strong className="text-foreground">Private Recovery:</strong> Time-locked recovery keys 
                      or Shamir shares are distributed without revealing guardian relationships on-chain.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row gap-4">
                <Link
                  to="/docs"
                  className="flex-1 py-3 border border-border font-medium rounded-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                >
                  <Icon icon="ph:book-open" className="w-5 h-5" />
                  Read Full Documentation
                </Link>
                <Link
                  to="/dashboard"
                  className="flex-1 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon icon="ph:layout" className="w-5 h-5" />
                  Try It Yourself
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}
