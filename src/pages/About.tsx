import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { PageLayout } from "@/components/layout/PageLayout";

export default function About() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Icon icon="ph:shield-check" className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">About Veil Protocol</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Privacy-preserving wallet infrastructure for Solana that enables
            authentication and recovery without revealing your identity.
          </p>
        </motion.div>

        {/* The Problem */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Icon icon="ph:warning" className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">The Problem</h2>
              <p className="text-muted-foreground mb-4">
                Traditional blockchain wallets face a critical privacy paradox:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon icon="ph:x" className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Identity Exposure:</strong> Your wallet
                    address is linked to your email, phone, or social accounts during authentication
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="ph:x" className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Recovery Leaks:</strong> Social recovery
                    systems expose who your guardians are on-chain
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="ph:x" className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Transaction Tracking:</strong> All your
                    activity is permanently linked to your identity
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* The Solution */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Icon icon="ph:lightbulb" className="w-5 h-5 text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Our Solution</h2>
              <p className="text-muted-foreground mb-4">
                Veil Protocol uses <strong className="text-foreground">zero-knowledge cryptography</strong> to
                completely decouple your identity from your wallet:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon icon="ph:check" className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Private Authentication:</strong> Login with
                    email/social WITHOUT revealing identity on-chain
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="ph:check" className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Hidden Recovery:</strong> Time-locked or
                    Shamir-based recovery with NO guardian exposure
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="ph:check" className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Zero Knowledge:</strong> Prove wallet
                    control without revealing who you are
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Icon icon="ph:gear" className="w-6 h-6" />
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Cryptographic Hash</h3>
              <p className="text-sm text-muted-foreground">
                Your identifier (email/social) + secret is hashed using SHA-256. Only the
                one-way hash touches the blockchain.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Deterministic Wallet</h3>
              <p className="text-sm text-muted-foreground">
                The hash generates your Solana wallet. Same credentials = same wallet,
                but identity stays private.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">ZK Proofs</h3>
              <p className="text-sm text-muted-foreground">
                You prove wallet control using zero-knowledge proofs. No identity revealed,
                even to blockchain observers.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Key Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Icon icon="ph:star" className="w-6 h-6" />
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Icon icon="ph:shield-chevron" className="w-6 h-6 text-primary" />
                <h3 className="font-semibold">Privacy-Preserving Authentication</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Login with familiar identifiers (email, Google, Twitter) without exposing them
                on-chain. Only a cryptographic commitment is public.
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Hidden:</strong> Identity, email, social accounts
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Icon icon="ph:clock-clockwise" className="w-6 h-6 text-primary" />
                <h3 className="font-semibold">Time-Locked Recovery</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Generate a recovery key and store it offline. In emergencies, initiate recovery
                with a time-lock period to prevent instant unauthorized access.
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Hidden:</strong> Recovery key (only hash is public)
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Icon icon="ph:users-three" className="w-6 h-6 text-primary" />
                <h3 className="font-semibold">Shamir Secret Sharing</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Distribute recovery shares to guardians using threshold cryptography.
                Need k-of-n shares to recover, with NO on-chain guardian exposure.
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Hidden:</strong> Guardian identities, share count, relationships
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Icon icon="ph:eye-slash" className="w-6 h-6 text-primary" />
                <h3 className="font-semibold">Visual Privacy Verification</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Instantly verify your privacy guarantees with visual proof system.
                Check Solana Explorer to confirm no identity exposure.
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Verifiable:</strong> Check on-chain data yourself
              </div>
            </div>
          </div>
        </motion.section>

        {/* Privacy Guarantees */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Icon icon="ph:lock-key" className="w-6 h-6" />
            Privacy Guarantees
          </h2>
          <div className="bg-card border border-primary/20 rounded-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-destructive flex items-center gap-2">
                  <Icon icon="ph:eye-slash" className="w-5 h-5" />
                  What's Hidden
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Icon icon="ph:x" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    Your email or social identifier
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon icon="ph:x" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    Guardian identities and count
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon icon="ph:x" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    Recovery method used
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon icon="ph:x" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    Social relationships
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon icon="ph:x" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    Login provider details
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-success flex items-center gap-2">
                  <Icon icon="ph:eye" className="w-5 h-5" />
                  What's Public (By Design)
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Icon icon="ph:check" className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" />
                    Cryptographic commitment hash (one-way)
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon icon="ph:check" className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" />
                    Wallet public key (standard)
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon icon="ph:check" className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" />
                    Time-lock period (security feature)
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon icon="ph:check" className="w-4 h-4 flex-shrink-0 mt-0.5 text-success" />
                    Transaction history (like all blockchains)
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon icon="ph:info" className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                    <span className="text-xs italic">
                      Public data reveals nothing about your identity
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Use Cases */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Icon icon="ph:rocket-launch" className="w-6 h-6" />
            Use Cases
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Icon icon="ph:wallet" className="w-5 h-5 text-primary" />
                DeFi Applications
              </h3>
              <p className="text-sm text-muted-foreground">
                Trade, lend, or provide liquidity without revealing your identity to other users
                or on-chain observers.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Icon icon="ph:hand-coins" className="w-5 h-5 text-primary" />
                Private Payments
              </h3>
              <p className="text-sm text-muted-foreground">
                Send and receive payments without linking transactions to your email or social
                accounts.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Icon icon="ph:vote" className="w-5 h-5 text-primary" />
                Anonymous Voting
              </h3>
              <p className="text-sm text-muted-foreground">
                Participate in governance with verified identity but hidden voter identity.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Icon icon="ph:shield-check" className="w-5 h-5 text-primary" />
                Whistleblowing & Activism
              </h3>
              <p className="text-sm text-muted-foreground">
                Prove credential ownership or membership without revealing personal information.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Technology Stack */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Icon icon="ph:code" className="w-6 h-6" />
            Technology Stack
          </h2>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-sm">Cryptography</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Icon icon="ph:check" className="w-4 h-4 text-success" />
                    SHA-256 Hashing
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon="ph:check" className="w-4 h-4 text-success" />
                    Groth16 ZK-SNARKs
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon="ph:check" className="w-4 h-4 text-success" />
                    Shamir Secret Sharing
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon="ph:check" className="w-4 h-4 text-success" />
                    BN128 Elliptic Curve
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-sm">Blockchain</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Icon icon="ph:check" className="w-4 h-4 text-success" />
                    Solana
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon="ph:check" className="w-4 h-4 text-success" />
                    Anchor Framework
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon="ph:check" className="w-4 h-4 text-success" />
                    Wallet Adapter
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-sm">Frontend</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Icon icon="ph:check" className="w-4 h-4 text-success" />
                    React + TypeScript
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon="ph:check" className="w-4 h-4 text-success" />
                    Framer Motion
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon="ph:check" className="w-4 h-4 text-success" />
                    Tailwind CSS
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* What You Get - Consumer Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <Icon icon="ph:user-circle" className="w-6 h-6" />
            What You Get
          </h2>
          <p className="text-muted-foreground mb-6">
            Privacy tools that work out of the box. No technical knowledge required.
          </p>

          <div className="space-y-6">
            {/* Identity & Access */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Icon icon="ph:fingerprint" className="w-5 h-5 text-primary" />
                Your Identity, Your Control
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon icon="ph:check" className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Log in without giving up your email or personal info
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="ph:check" className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Recover your wallet through trusted contacts, not seed phrases
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="ph:check" className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Your credentials never touch a server
                </li>
              </ul>
            </div>

            {/* Transactions */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Icon icon="ph:paper-plane-tilt" className="w-5 h-5 text-primary" />
                Private Transactions
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon icon="ph:check" className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Send and receive without your balance showing up on block explorers
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="ph:check" className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Swap tokens without revealing what you hold
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="ph:check" className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Stake without broadcasting your position to the world
                </li>
              </ul>
            </div>

            {/* Participation */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Icon icon="ph:users-three" className="w-5 h-5 text-primary" />
                Participate Without Exposure
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon icon="ph:check" className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Vote in DAOs anonymously - no one knows how you voted or how much you hold
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="ph:check" className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Join multisig wallets where signers stay hidden
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="ph:check" className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Access DeFi by proving eligibility, not showing your full portfolio
                </li>
              </ul>
            </div>

            {/* Moving Money */}
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Icon icon="ph:vault" className="w-5 h-5 text-primary" />
                Move Money Quietly
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon icon="ph:check" className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Shielded pools for mixing funds
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="ph:check" className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Stealth addresses for receiving payments
                </li>
                <li className="flex items-start gap-2">
                  <Icon icon="ph:check" className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  Confidential transfers where amounts stay encrypted
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Institutional Privacy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <Icon icon="ph:buildings" className="w-6 h-6" />
            Institutional Privacy
          </h2>
          <p className="text-muted-foreground mb-6">
            Veil Protocol addresses all three pillars of privacy for institutional adoption:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <Icon icon="ph:lock-laminated" className="w-6 h-6 text-primary" />
                <h3 className="font-semibold">Confidentiality</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Hide balances and amounts while revealing identity. Powered by SPL Token-2022 confidential transfers with ElGamal encryption.
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Use Case:</strong> Institutional trading without revealing positions
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <Icon icon="ph:user-circle-minus" className="w-6 h-6 text-primary" />
                <h3 className="font-semibold">Anonymity</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Hide identity while amounts remain public. Stealth addresses and P2P ramps enable anonymous on/off boarding.
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Use Case:</strong> Private payroll and treasury operations
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <Icon icon="ph:sliders" className="w-6 h-6 text-primary" />
                <h3 className="font-semibold">Programmable Privacy</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Selective transparency with ZK proofs. Audit keys allow regulators to verify compliance without public exposure.
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Use Case:</strong> Regulatory compliance with ZK-KYC
              </div>
            </div>
          </div>
        </motion.section>

        {/* Get Started */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Experience privacy-preserving authentication and recovery on Solana.
              Login with your email or social account without exposing your identity.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="/login"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Icon icon="ph:sign-in" className="w-5 h-5" />
                Try Veil Protocol
              </a>
              <a
                href="/docs"
                className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary/80 transition-colors"
              >
                <Icon icon="ph:book-open" className="w-5 h-5" />
                Read Documentation
              </a>
            </div>
          </div>
        </motion.section>
      </div>
    </PageLayout>
  );
}
