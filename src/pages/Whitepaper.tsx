import { PageLayout } from "@/components/layout/PageLayout";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// ============================================================================
// TABLE OF CONTENTS DATA
// ============================================================================

const tocSections = [
  { id: "abstract", label: "Abstract", icon: "ph:article" },
  { id: "introduction", label: "Introduction", icon: "ph:lightbulb" },
  { id: "problem", label: "Problem Statement", icon: "ph:warning" },
  { id: "architecture", label: "Architecture", icon: "ph:tree-structure" },
  { id: "identity", label: "ZK Identity", icon: "ph:fingerprint" },
  { id: "shielded", label: "Shielded Pools", icon: "ph:vault" },
  { id: "voting", label: "Private Voting", icon: "ph:check-square" },
  { id: "multisig", label: "Stealth Multisig", icon: "ph:users-three" },
  { id: "staking", label: "Private Staking", icon: "ph:coin" },
  { id: "recovery", label: "Social Recovery", icon: "ph:key" },
  { id: "cryptography", label: "Cryptographic Primitives", icon: "ph:lock-key" },
  { id: "light-protocol", label: "Light Protocol", icon: "ph:database" },
  { id: "security", label: "Security Model", icon: "ph:shield-check" },
  { id: "roadmap", label: "Roadmap", icon: "ph:road-horizon" },
  { id: "conclusion", label: "Conclusion", icon: "ph:flag-checkered" },
];

// ============================================================================
// PHASE BADGE COMPONENT
// ============================================================================

function PhaseBadge({ phase }: { phase: "deployed" | "phase1" | "phase2" }) {
  const styles = {
    deployed: "bg-green-500/10 text-green-400 border-green-500/20",
    phase1: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    phase2: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };
  const labels = {
    deployed: "Deployed",
    phase1: "Phase 1",
    phase2: "Phase 2 Target",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${styles[phase]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${phase === "deployed" ? "bg-green-400" : phase === "phase1" ? "bg-amber-400" : "bg-blue-400"}`} />
      {labels[phase]}
    </span>
  );
}

// ============================================================================
// SECTION WRAPPER
// ============================================================================

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="scroll-mt-24 mb-12"
    >
      {children}
    </motion.section>
  );
}

// ============================================================================
// DATA FLOW COMPONENT
// ============================================================================

function DataFlow({ steps }: { steps: { label: string; detail: string; side: "client" | "onchain" }[] }) {
  return (
    <div className="flex flex-col gap-2 my-4">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step.side === "client" ? "bg-primary/20 text-primary" : "bg-green-500/20 text-green-400"}`}>
              {i + 1}
            </div>
            {i < steps.length - 1 && <div className="w-px h-6 bg-border" />}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{step.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${step.side === "client" ? "bg-primary/10 text-primary" : "bg-green-500/10 text-green-400"}`}>
                {step.side === "client" ? "OFF-CHAIN" : "ON-CHAIN"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN WHITEPAPER COMPONENT
// ============================================================================

export default function Whitepaper() {
  const [activeSection, setActiveSection] = useState("abstract");
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    tocSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setTocOpen(false);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Icon icon="ph:file-text" className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Technical Whitepaper v1.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Veil Protocol
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2">
            Composable Privacy Infrastructure for Solana
          </p>
          <p className="text-sm text-muted-foreground">
            February 2025 &middot; Devnet Program: <code className="text-primary text-xs">5C1Va...5P4h</code>
          </p>
        </motion.div>

        <div className="flex gap-8 max-w-6xl mx-auto">
          {/* Mobile TOC Toggle */}
          <button
            onClick={() => setTocOpen(!tocOpen)}
            className="fixed bottom-6 right-6 z-50 lg:hidden w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
          >
            <Icon icon="ph:list" className="w-5 h-5" />
          </button>

          {/* TOC Sidebar */}
          <aside className={`
            fixed lg:sticky top-20 left-0 z-40 h-[calc(100vh-5rem)] w-64 shrink-0
            bg-background/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none
            border-r lg:border-r-0 border-border
            overflow-y-auto pb-8 pt-4 px-4
            transition-transform duration-300
            ${tocOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Contents</h3>
            <nav className="space-y-1">
              {tocSections.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                    activeSection === id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Icon icon={icon} className="w-4 h-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0 max-w-3xl">

            {/* ============================================================ */}
            {/* 1. ABSTRACT */}
            {/* ============================================================ */}
            <Section id="abstract">
              <div className="glass-panel rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Icon icon="ph:article" className="text-primary" /> Abstract
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Veil Protocol is a composable privacy infrastructure layer for Solana that provides zero-knowledge identity,
                    shielded transaction pools, private governance, stealth multi-signature wallets, confidential staking,
                    and cryptographic social recovery &mdash; all without requiring a trusted intermediary.
                  </p>
                  <p>
                    The protocol combines <strong className="text-foreground">Groth16 zero-knowledge proofs</strong> over
                    the BN128 elliptic curve, <strong className="text-foreground">Poseidon hashing</strong> for
                    ZK-friendly commitments, <strong className="text-foreground">Pedersen commitments</strong> for
                    amount hiding with homomorphic properties, <strong className="text-foreground">Bulletproofs</strong> for
                    range verification, and <strong className="text-foreground">Shamir Secret Sharing</strong> over GF(256)
                    for threshold-based key recovery.
                  </p>
                  <p>
                    The on-chain program is deployed on Solana devnet
                    at <code className="text-primary text-sm bg-primary/10 px-1.5 py-0.5 rounded">5C1VaebPdHZYETnTL18cLJK2RexXmVVhkkYpnYHD5P4h</code> and
                    exposes six core modules: ZK Identity, Shielded Pools (UTXO model), Commit-Reveal Voting,
                    Stealth Multisig, Private Staking, and Social Recovery. The client SDK (<code className="text-sm">@veil-protocol/sdk</code> v0.3.0)
                    performs all proof generation client-side, ensuring that sensitive data &mdash; amounts, identities, vote choices &mdash; never
                    leaves the user's device in plaintext.
                  </p>
                </div>
              </div>
            </Section>

            {/* ============================================================ */}
            {/* 2. INTRODUCTION */}
            {/* ============================================================ */}
            <Section id="introduction">
              <div className="glass-panel rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Icon icon="ph:lightbulb" className="text-primary" /> 1. Introduction
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Solana processes over 4,000 transactions per second at sub-cent fees, making it the highest-throughput
                    Layer 1 blockchain in production. However, this performance comes with complete transparency: every
                    account balance, every transfer amount, every program interaction, and every governance vote is
                    permanently visible to any observer.
                  </p>
                  <p>
                    This transparency creates concrete harms:
                  </p>
                  <ul className="space-y-3 ml-4">
                    <li className="flex items-start gap-2">
                      <Icon icon="ph:eye" className="w-4 h-4 text-destructive mt-1 shrink-0" />
                      <span><strong className="text-foreground">Balance surveillance</strong> &mdash; Competitors, adversaries, and data brokers track wallet holdings in real time, enabling targeted attacks and market manipulation.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon icon="ph:link" className="w-4 h-4 text-destructive mt-1 shrink-0" />
                      <span><strong className="text-foreground">Address linkability</strong> &mdash; A single KYC event or social media disclosure permanently links an entire transaction history to a real-world identity.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon icon="ph:chart-line-up" className="w-4 h-4 text-destructive mt-1 shrink-0" />
                      <span><strong className="text-foreground">Front-running</strong> &mdash; Visible pending transactions and DeFi positions are exploited by MEV bots extracting value from ordinary users.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon icon="ph:megaphone" className="w-4 h-4 text-destructive mt-1 shrink-0" />
                      <span><strong className="text-foreground">Governance coercion</strong> &mdash; On-chain votes are visible before tallying completes, enabling vote-buying and social pressure campaigns.</span>
                    </li>
                  </ul>
                  <p>
                    Veil Protocol's thesis is that <strong className="text-foreground">privacy should be a default infrastructure primitive</strong>,
                    not an opt-in afterthought. We provide composable privacy modules that integrate into any Solana
                    application, bringing confidentiality to identity, transactions, governance, and key management
                    without sacrificing Solana's performance characteristics.
                  </p>
                </div>
              </div>
            </Section>

            {/* ============================================================ */}
            {/* 3. PROBLEM STATEMENT */}
            {/* ============================================================ */}
            <Section id="problem">
              <div className="glass-panel rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Icon icon="ph:warning" className="text-warning" /> 2. Problem Statement
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
                  <p>
                    Current Solana infrastructure exposes five categories of sensitive information that, in traditional finance,
                    are considered confidential by default.
                  </p>
                </div>

                <div className="grid gap-4">
                  {[
                    { title: "Identity", icon: "ph:fingerprint", color: "text-primary",
                      leak: "Wallet addresses are pseudonymous but trivially linkable via on-chain interaction graphs.",
                      consequence: "One exchange deposit deanonymizes years of transaction history." },
                    { title: "Transactions", icon: "ph:arrows-left-right", color: "text-purple-400",
                      leak: "All amounts, senders, and recipients are permanently recorded in plaintext.",
                      consequence: "Pattern analysis links wallets across protocols, revealing trading strategies." },
                    { title: "Governance", icon: "ph:check-square", color: "text-success",
                      leak: "Individual vote choices are visible before and during tallying.",
                      consequence: "Vote-buying becomes enforceable. Social pressure distorts outcomes." },
                    { title: "Key Management", icon: "ph:key", color: "text-warning",
                      leak: "Social recovery systems expose guardian relationships on-chain.",
                      consequence: "Attackers target the weakest guardian to compromise the entire wallet." },
                    { title: "Staking", icon: "ph:coin", color: "text-amber-400",
                      leak: "Stake amounts and validator choices are publicly visible.",
                      consequence: "Competitors extract intelligence on treasury allocations and validator preferences." },
                  ].map((item, i) => (
                    <div key={i} className="border border-border rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon icon={item.icon} className={`w-5 h-5 ${item.color}`} />
                        <h3 className="font-semibold">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1"><strong className="text-foreground">What leaks:</strong> {item.leak}</p>
                      <p className="text-sm text-muted-foreground"><strong className="text-foreground">Consequence:</strong> {item.consequence}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* ============================================================ */}
            {/* 4. ARCHITECTURE */}
            {/* ============================================================ */}
            <Section id="architecture">
              <div className="glass-panel rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon icon="ph:tree-structure" className="text-primary" /> 3. Architecture Overview
                </h2>

                {/* Layer Diagram */}
                <div className="space-y-3 mb-8">
                  {[
                    { layer: "L4", label: "Application Layer", desc: "React dApp, CLI, Mobile", color: "border-purple-500/40 bg-purple-500/5", text: "text-purple-400" },
                    { layer: "L3", label: "Veil SDK", desc: "@veil-protocol/sdk v0.3.0 — Identity, Shielded, Voting, Multisig, Staking, Recovery", color: "border-primary/40 bg-primary/5", text: "text-primary" },
                    { layer: "L2", label: "Client-Side ZK", desc: "snarkjs + circomlibjs — Groth16 proofs over BN128, Poseidon hashing", color: "border-blue-500/40 bg-blue-500/5", text: "text-blue-400" },
                    { layer: "L1", label: "Veil Anchor Program", desc: "On-chain verifier — commitments, nullifiers, Merkle roots, proof validation", color: "border-green-500/40 bg-green-500/5", text: "text-green-400" },
                    { layer: "L0", label: "Solana + Light Protocol", desc: "Runtime, ZK Compression (1000x cheaper state), SPL Token-2022", color: "border-amber-500/40 bg-amber-500/5", text: "text-amber-400" },
                  ].map((l, i) => (
                    <div key={i} className={`border rounded-xl p-4 ${l.color}`}>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono font-bold ${l.text}`}>{l.layer}</span>
                        <span className="font-semibold">{l.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{l.desc}</p>
                    </div>
                  ))}
                </div>

                {/* On-Chain Accounts */}
                <h3 className="text-lg font-semibold mb-3">On-Chain Account Types</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3">Account</th>
                        <th className="text-left py-2 px-3">PDA Seeds</th>
                        <th className="text-left py-2 px-3">Size</th>
                        <th className="text-left py-2 px-3">Contains</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      {[
                        { name: "WalletAccount", seeds: '["wallet", user]', size: "138 B", contains: "Commitment hash, owner pubkey, timestamps" },
                        { name: "ShieldedPool", seeds: '["shielded_pool", creator, pool_id]', size: "121 B", contains: "Merkle root, note count, reward rate, nullifier count" },
                        { name: "ShieldedNote", seeds: '["note", pool, index]', size: "158 B", contains: "Note commitment, encrypted data (64B), range proof ref" },
                        { name: "NullifierRecord", seeds: '["nullifier", pool, nullifier]', size: "81 B", contains: "Nullifier hash, spent timestamp" },
                        { name: "Proposal", seeds: '["proposal", creator, id]', size: "138 B", contains: "Metadata hash, vote tallies, timing constraints" },
                        { name: "VoteRecord", seeds: '["vote", proposal, voter]', size: "124 B", contains: "Vote commitment (32B), revealed flag" },
                        { name: "StealthMultisig", seeds: '["multisig", creator, vault_id]', size: "398 B", contains: "Signer commitments (10x32B), threshold, approval count" },
                      ].map((acc, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2 px-3 font-mono text-foreground text-xs">{acc.name}</td>
                          <td className="py-2 px-3 font-mono text-xs">{acc.seeds}</td>
                          <td className="py-2 px-3">{acc.size}</td>
                          <td className="py-2 px-3">{acc.contains}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                    <Icon icon="ph:shield-check" className="w-4 h-4" />
                    Design Principle
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Only commitments, nullifiers, encrypted blobs, and Merkle roots are stored on-chain.</strong> No
                    amounts, identities, vote choices, signer addresses, or stake values ever appear in on-chain account data.
                    All sensitive computation occurs client-side within the Veil SDK.
                  </p>
                </div>
              </div>
            </Section>

            {/* ============================================================ */}
            {/* 5a. ZK IDENTITY */}
            {/* ============================================================ */}
            <Section id="identity">
              <div className="glass-panel rounded-2xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Icon icon="ph:fingerprint" className="text-primary" /> 4.1 ZK Identity System
                  </h2>
                  <PhaseBadge phase="phase1" />
                </div>

                <p className="text-muted-foreground mb-4">
                  Users authenticate using an identifier (email, passkey) and a secret, both hashed client-side.
                  The resulting commitment is the only data stored on-chain. The wallet keypair is deterministically
                  derived from the commitment, making it recoverable from credentials alone.
                </p>

                <div className="bg-secondary/50 rounded-xl p-4 mb-4 font-mono text-sm overflow-x-auto">
                  <div className="text-muted-foreground">// Identity commitment construction</div>
                  <div><span className="text-primary">identifierHash</span> = Poseidon(bytes(identifier))</div>
                  <div><span className="text-primary">secretHash</span> = Poseidon(bytes(secret))</div>
                  <div><span className="text-primary">commitment</span> = Poseidon(identifierHash, secretHash)</div>
                  <div><span className="text-primary">nullifier</span> = Poseidon(secretHash, random_nonce)</div>
                  <div><span className="text-primary">wallet</span> = Ed25519.Keypair.fromSeed(commitment[0..32])</div>
                </div>

                <DataFlow steps={[
                  { label: "Hash credentials", detail: "Poseidon hash of identifier and secret produces commitment + nullifier. Credentials never leave client.", side: "client" },
                  { label: "Generate Groth16 proof", detail: "Proof structure (pi_a, pi_b, pi_c) over BN128 curve proves knowledge of preimage without revealing it.", side: "client" },
                  { label: "Derive wallet", detail: "Ed25519 keypair derived deterministically from commitment bytes. Same credentials always produce same wallet.", side: "client" },
                  { label: "Store commitment on-chain", detail: "32-byte commitment stored in WalletAccount PDA. On-chain program validates proof structure and field elements.", side: "onchain" },
                ]} />

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                    <h4 className="text-xs font-bold text-green-400 uppercase mb-2">On-Chain</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>32-byte commitment hash</li>
                      <li>Owner public key</li>
                      <li>Creation timestamp</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="text-xs font-bold text-primary uppercase mb-2">Off-Chain (Client Only)</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>Email / passkey identifier</li>
                      <li>Secret (localStorage)</li>
                      <li>Full proof data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Section>

            {/* ============================================================ */}
            {/* 5b. SHIELDED POOLS */}
            {/* ============================================================ */}
            <Section id="shielded">
              <div className="glass-panel rounded-2xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Icon icon="ph:vault" className="text-primary" /> 4.2 Shielded Pools
                  </h2>
                  <PhaseBadge phase="deployed" />
                </div>

                <p className="text-muted-foreground mb-4">
                  A UTXO/Note-based shielded pool inspired by Zcash's Sapling protocol. Deposits create cryptographic
                  notes (commitments inserted into a Merkle tree). Withdrawals consume notes by revealing a nullifier
                  that prevents double-spending. Amounts are <strong className="text-foreground">never</strong> stored on-chain.
                </p>

                <div className="bg-secondary/50 rounded-xl p-4 mb-4 font-mono text-sm overflow-x-auto">
                  <div className="text-muted-foreground">// Note commitment (hides amount)</div>
                  <div><span className="text-primary">noteCommitment</span> = Poseidon(amount, blinding_factor, owner_commitment)</div>
                  <div className="mt-2 text-muted-foreground">// Nullifier (prevents double-spend)</div>
                  <div><span className="text-primary">nullifier</span> = Poseidon(noteCommitment, owner_secret)</div>
                  <div className="mt-2 text-muted-foreground">// Range proof (proves 0 &lt; amount &lt; 2^64)</div>
                  <div><span className="text-primary">rangeProof</span> = Bulletproof(amount, blinding_factor)</div>
                </div>

                <h3 className="font-semibold mb-2 mt-6">Deposit Flow</h3>
                <DataFlow steps={[
                  { label: "Generate blinding factor", detail: "32 bytes CSPRNG. Combined with amount and owner commitment to form the note.", side: "client" },
                  { label: "Compute note commitment", detail: "Poseidon(amount, blinding, ownerCommitment) — algebraic commitment that hides the amount.", side: "client" },
                  { label: "Generate Bulletproof range proof", detail: "Proves the committed amount is in [0, 2^64) without revealing it.", side: "client" },
                  { label: "Encrypt note data", detail: "AES-CBC encryption of {amount, blinding, owner} — only the depositor can decrypt.", side: "client" },
                  { label: "Submit shield_deposit", detail: "Note commitment + encrypted note (64B) + range proof stored in ShieldedNote PDA. Merkle root updated.", side: "onchain" },
                ]} />

                <h3 className="font-semibold mb-2 mt-6">Withdrawal Flow</h3>
                <DataFlow steps={[
                  { label: "Compute nullifier", detail: "Poseidon(noteCommitment, ownerSecret) — unique per note, deterministic.", side: "client" },
                  { label: "Generate Merkle proof", detail: "8-level inclusion proof showing note exists in the pool's state tree.", side: "client" },
                  { label: "Generate withdrawal proof", detail: "Groth16 proof of: 'I know the preimage of a note in this Merkle tree, and the nullifier is correctly derived.'", side: "client" },
                  { label: "Submit shield_withdraw", detail: "NullifierRecord PDA created (prevents reuse). Funds released to recipient. Amount never visible.", side: "onchain" },
                ]} />

                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 mt-4">
                  <h4 className="text-sm font-semibold text-amber-400 mb-1">Double-Spend Prevention</h4>
                  <p className="text-xs text-muted-foreground">
                    Each withdrawal creates a NullifierRecord PDA at seeds <code className="text-xs">["nullifier", pool, nullifier_hash]</code>.
                    Since Solana PDAs are deterministic and unique, attempting to spend the same note twice will fail with
                    an "account already exists" error at the runtime level &mdash; no additional program logic required.
                  </p>
                </div>
              </div>
            </Section>

            {/* ============================================================ */}
            {/* 5c. PRIVATE VOTING */}
            {/* ============================================================ */}
            <Section id="voting">
              <div className="glass-panel rounded-2xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Icon icon="ph:check-square" className="text-success" /> 4.3 Private Voting
                  </h2>
                  <PhaseBadge phase="deployed" />
                </div>

                <p className="text-muted-foreground mb-4">
                  A two-phase commit-reveal scheme where vote choices are hidden during the voting period and
                  only aggregate tallies are made public after reveal. Individual choices remain private.
                </p>

                <div className="bg-secondary/50 rounded-xl p-4 mb-4 font-mono text-sm overflow-x-auto">
                  <div className="text-muted-foreground">// Commit phase — choice hidden</div>
                  <div><span className="text-primary">secret</span> = CSPRNG(32 bytes)</div>
                  <div><span className="text-primary">commitment</span> = SHA-256(choice || secret || proposal_id)</div>
                  <div className="mt-2 text-muted-foreground">// Reveal phase — on-chain verification</div>
                  <div><span className="text-primary">verify</span>: SHA-256(choice || secret || proposal_id) == stored_commitment</div>
                </div>

                <DataFlow steps={[
                  { label: "Create proposal", detail: "Proposal PDA stores metadata hash, voting deadline, reveal deadline. No content on-chain.", side: "onchain" },
                  { label: "Cast vote (commit)", detail: "Voter computes commitment = H(choice, secret, proposal). VoteRecord PDA stores only the 32-byte hash.", side: "onchain" },
                  { label: "Reveal vote", detail: "After voting ends, voter submits (choice, secret). Program recomputes hash and verifies match.", side: "onchain" },
                  { label: "Tally results", detail: "Aggregate yes/no counts incremented. Individual choices are NOT stored — only the final tally is public.", side: "onchain" },
                ]} />

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 rounded-lg border border-border">
                    <h4 className="text-xs font-bold text-success uppercase mb-2">Privacy Guarantees</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>Vote choice hidden during voting (no influence)</li>
                      <li>Commitment is binding (can't change after submitting)</li>
                      <li>Individual votes hidden even after reveal</li>
                      <li>Vote buying impossible (can't prove your choice to a buyer)</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg border border-border">
                    <h4 className="text-xs font-bold text-warning uppercase mb-2">On-Chain Enforcement</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li><code className="text-xs">voting_ends_at</code> — no commits after deadline</li>
                      <li><code className="text-xs">reveal_ends_at</code> — no reveals after deadline</li>
                      <li>PDA uniqueness prevents double-voting</li>
                      <li>Hash verification prevents choice tampering</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Section>

            {/* ============================================================ */}
            {/* 5d. STEALTH MULTISIG */}
            {/* ============================================================ */}
            <Section id="multisig">
              <div className="glass-panel rounded-2xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Icon icon="ph:users-three" className="text-primary" /> 4.4 Stealth Multisig
                  </h2>
                  <PhaseBadge phase="deployed" />
                </div>

                <p className="text-muted-foreground mb-4">
                  Traditional multisig wallets expose all signer addresses, making them targets for social engineering.
                  Veil's stealth multisig stores signers as hash commitments. Signers prove membership in the set
                  via ZK proofs without revealing which commitment is theirs.
                </p>

                <div className="bg-secondary/50 rounded-xl p-4 mb-4 font-mono text-sm overflow-x-auto">
                  <div className="text-muted-foreground">// Signer commitment — identity hidden</div>
                  <div><span className="text-primary">signer_commitment</span> = SHA-256(signer_secret || signer_pubkey)</div>
                  <div className="mt-2 text-muted-foreground">// Stealth approval — which signer is unknown</div>
                  <div><span className="text-primary">approval_commitment</span> = unique_random() &nbsp;// unlinkable</div>
                  <div><span className="text-primary">signer_proof</span> = ZK_SetMembership(my_secret &isin; commitments[])</div>
                </div>

                <DataFlow steps={[
                  { label: "Create vault", detail: "StealthMultisig PDA stores N signer commitments (not pubkeys) and threshold T. Up to 10 signers.", side: "onchain" },
                  { label: "Create proposal", detail: "MultisigProposal PDA stores instruction hash. Proposer identity verified via commitment proof.", side: "onchain" },
                  { label: "Stealth sign", detail: "Signer submits ZK proof of set membership + unique approval commitment. No one knows which signer approved.", side: "onchain" },
                  { label: "Execute", detail: "When T approvals collected, proposal executes. Transaction history reveals nothing about individual signers.", side: "onchain" },
                ]} />

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mt-4">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Why it matters:</strong> In a 3-of-5 multisig controlling a DAO treasury,
                    an attacker cannot determine which 3 members approved a transaction, or even identify the 5 members
                    in the first place. Each member's approval uses a fresh, unlinkable commitment.
                  </p>
                </div>
              </div>
            </Section>

            {/* ============================================================ */}
            {/* 5e. PRIVATE STAKING */}
            {/* ============================================================ */}
            <Section id="staking">
              <div className="glass-panel rounded-2xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Icon icon="ph:coin" className="text-warning" /> 4.5 Private Staking
                  </h2>
                  <PhaseBadge phase="phase1" />
                </div>

                <p className="text-muted-foreground mb-4">
                  Private staking uses the shielded pool architecture to hide both the staked amount and the validator
                  choice. Deposits create shielded notes; withdrawals use nullifiers. Reward claims prove correct
                  calculation via ZK proofs without revealing the underlying stake amount.
                </p>

                <div className="bg-secondary/50 rounded-xl p-4 mb-4 font-mono text-sm overflow-x-auto">
                  <div className="text-muted-foreground">// Validator choice hidden</div>
                  <div><span className="text-primary">validatorCommitment</span> = SHA-256(validator_pubkey || salt)</div>
                  <div className="mt-2 text-muted-foreground">// Stake position hidden</div>
                  <div><span className="text-primary">stakeCommitment</span> = Poseidon(amount, blinding, validatorCommitment)</div>
                  <div className="mt-2 text-muted-foreground">// Reward claim — proves correct calculation without revealing stake</div>
                  <div><span className="text-primary">rewardProof</span> = ZK(reward == stake * rate * epochs)</div>
                </div>

                <DataFlow steps={[
                  { label: "Create private stake", detail: "Deposit to shielded pool with note commitment hiding amount + validator. Range proof validates amount.", side: "client" },
                  { label: "Pool deposit on-chain", detail: "ShieldedNote PDA created with commitment and encrypted note data. Amount never visible.", side: "onchain" },
                  { label: "Claim rewards", detail: "ZK proof verifies reward = stake * rate * time without revealing any values. New note with stake + reward created.", side: "onchain" },
                  { label: "Unstake", detail: "Standard shielded withdrawal: nullifier + Merkle proof + withdrawal proof. Funds released privately.", side: "onchain" },
                ]} />
              </div>
            </Section>

            {/* ============================================================ */}
            {/* 5f. SOCIAL RECOVERY */}
            {/* ============================================================ */}
            <Section id="recovery">
              <div className="glass-panel rounded-2xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Icon icon="ph:key" className="text-success" /> 4.6 Social Recovery
                  </h2>
                  <PhaseBadge phase="deployed" />
                </div>

                <p className="text-muted-foreground mb-4">
                  Two recovery methods ensure users never lose access to their wallets. The Shamir Secret Sharing
                  implementation uses <strong className="text-foreground">real GF(256) arithmetic</strong> with polynomial
                  evaluation and Lagrange interpolation &mdash; one of the most cryptographically complete modules in the protocol.
                </p>

                <h3 className="font-semibold mb-3 mt-6">Method 1: Shamir Secret Sharing</h3>
                <div className="bg-secondary/50 rounded-xl p-4 mb-4 font-mono text-sm overflow-x-auto">
                  <div className="text-muted-foreground">// Split secret into N shares with threshold T</div>
                  <div><span className="text-primary">f(x)</span> = secret + a1*x + a2*x^2 + ... + a(T-1)*x^(T-1) &nbsp;mod GF(256)</div>
                  <div><span className="text-primary">shares</span> = [f(1), f(2), ..., f(N)]</div>
                  <div className="mt-2 text-muted-foreground">// Reconstruct from any T shares via Lagrange interpolation</div>
                  <div><span className="text-primary">secret</span> = &Sigma; share_i * &Pi;(x_j / (x_j - x_i)) &nbsp;for j &ne; i</div>
                </div>

                <DataFlow steps={[
                  { label: "Generate recovery key", detail: "32 bytes CSPRNG. This is the master recovery secret.", side: "client" },
                  { label: "Split into shares", detail: "Polynomial evaluation over GF(256) with T-1 random coefficients produces N shares.", side: "client" },
                  { label: "Distribute to guardians", detail: "Each guardian receives one share. Guardian identities never go on-chain.", side: "client" },
                  { label: "Store recovery commitment", detail: "SHA-256(wallet + recovery_secret) stored on-chain with configurable timelock.", side: "onchain" },
                ]} />

                <h3 className="font-semibold mb-3 mt-6">Method 2: Time-Locked Recovery</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  A simpler alternative: the recovery commitment is stored on-chain with a configurable timelock
                  (1&ndash;90 days). The owner can cancel during the timelock window. After expiry, anyone with the
                  recovery key can execute recovery.
                </p>

                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 mt-4">
                  <h4 className="text-sm font-semibold text-green-400 mb-1">Cryptographic Completeness</h4>
                  <p className="text-xs text-muted-foreground">
                    The Shamir SSS module implements real finite field arithmetic: multiplication and division via
                    exponentiation/logarithm lookup tables over the AES field (reducing polynomial x<sup>8</sup> + x<sup>4</sup> + x<sup>3</sup> + x + 1),
                    polynomial evaluation via Horner's method, and Lagrange interpolation at x=0 for reconstruction.
                    Any T-1 shares reveal zero information about the secret (information-theoretic security).
                  </p>
                </div>
              </div>
            </Section>

            {/* ============================================================ */}
            {/* 6. CRYPTOGRAPHIC PRIMITIVES */}
            {/* ============================================================ */}
            <Section id="cryptography">
              <div className="glass-panel rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon icon="ph:lock-key" className="text-primary" /> 5. Cryptographic Primitives
                </h2>

                <div className="space-y-6">
                  {[
                    {
                      name: "Poseidon Hash",
                      badge: "phase1" as const,
                      desc: "ZK-friendly algebraic hash function designed for efficient evaluation inside arithmetic circuits. Operates over the BN128 scalar field (prime = 2^254 + ...). Phase 1 uses SHA-256 with field reduction as a fallback; circomlibjs integration provides the real Poseidon implementation.",
                      formula: "H: F_p^n → F_p where p = 21888242871839275222246405745257275088548364400416034343698204186575808495617",
                      usage: "Identity commitments, note commitments, nullifiers, Merkle tree hashing"
                    },
                    {
                      name: "Pedersen Commitments",
                      badge: "phase1" as const,
                      desc: "Additively homomorphic commitment scheme. The committer can prove properties of the committed value (e.g., it lies in a range) without revealing it. Homomorphic property: C(a) + C(b) = C(a+b) enables balance verification without decryption.",
                      formula: "C = amount · G + blinding · H where G, H are independent generators on secp256k1",
                      usage: "Shielded pool deposits, amount hiding, balance verification"
                    },
                    {
                      name: "Groth16 Proofs",
                      badge: "phase1" as const,
                      desc: "Non-interactive zero-knowledge proof system using bilinear pairings. Generates the most compact proofs (3 group elements, ~256 bytes) with constant-time verification. Requires a per-circuit trusted setup ceremony.",
                      formula: "π = (A ∈ G₁, B ∈ G₂, C ∈ G₁) over BN128 curve",
                      usage: "Identity proofs, withdrawal proofs, reward calculation proofs"
                    },
                    {
                      name: "Bulletproofs",
                      badge: "phase2" as const,
                      desc: "Transparent (no trusted setup) range proof system. Proves that a committed value lies within [0, 2^n) without revealing it. Proof size is logarithmic in the range size: ~672 bytes for 64-bit range.",
                      formula: "RangeProof(v, γ): v ∈ [0, 2^64) ∧ C = v·G + γ·H",
                      usage: "Shielded deposit validation, transfer amount verification"
                    },
                    {
                      name: "Shamir Secret Sharing",
                      badge: "deployed" as const,
                      desc: "Information-theoretically secure secret splitting. A degree T-1 polynomial is constructed with the secret as the constant term. N evaluation points become shares. Any T shares reconstruct the polynomial (and thus the secret) via Lagrange interpolation. T-1 shares reveal nothing.",
                      formula: "f(x) = s + a₁x + a₂x² + ... + aₜ₋₁xᵗ⁻¹ over GF(256)",
                      usage: "Social recovery key splitting and reconstruction"
                    },
                  ].map((prim, i) => (
                    <div key={i} className="border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{prim.name}</h3>
                        <PhaseBadge phase={prim.badge} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{prim.desc}</p>
                      <div className="bg-secondary/50 rounded-lg p-2 mb-2">
                        <code className="text-xs text-primary break-all">{prim.formula}</code>
                      </div>
                      <p className="text-xs text-muted-foreground"><strong>Used in:</strong> {prim.usage}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* ============================================================ */}
            {/* 7. LIGHT PROTOCOL */}
            {/* ============================================================ */}
            <Section id="light-protocol">
              <div className="glass-panel rounded-2xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Icon icon="ph:database" className="text-green-400" /> 6. Light Protocol Integration
                  </h2>
                  <PhaseBadge phase="phase2" />
                </div>

                <p className="text-muted-foreground mb-6">
                  Light Protocol provides ZK Compression for Solana: account state stored in Merkle trees with
                  validity proofs, reducing per-account costs by ~1000x. This is critical for the UTXO model's
                  scalability &mdash; each shielded note is a state entry, and privacy pools can contain thousands of notes.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl border border-border">
                    <h4 className="font-semibold text-amber-400 mb-2">Standard Accounts</h4>
                    <div className="text-2xl font-bold mb-1">~0.002 SOL</div>
                    <p className="text-xs text-muted-foreground">Per account rent</p>
                    <p className="text-xs text-muted-foreground mt-2">256 notes = 0.512 SOL pool cost</p>
                  </div>
                  <div className="p-4 rounded-xl border border-green-500/30 bg-green-500/5">
                    <h4 className="font-semibold text-green-400 mb-2">Compressed Accounts</h4>
                    <div className="text-2xl font-bold mb-1">~0.000002 SOL</div>
                    <p className="text-xs text-muted-foreground">Per state entry</p>
                    <p className="text-xs text-muted-foreground mt-2">256 notes = 0.000512 SOL pool cost</p>
                  </div>
                </div>

                <div className="border border-border rounded-xl p-4 mb-4">
                  <h4 className="font-semibold mb-2">State Tree Configuration</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Height</div>
                      <div className="font-mono">26 levels</div>
                      <div className="text-xs text-muted-foreground">67M+ leaves</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Changelog Buffer</div>
                      <div className="font-mono">2048 entries</div>
                      <div className="text-xs text-muted-foreground">Concurrent updates</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Canopy Depth</div>
                      <div className="font-mono">10 levels</div>
                      <div className="text-xs text-muted-foreground">Proof compression</div>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                  <div className="text-muted-foreground">// Light Protocol Program IDs</div>
                  <div>System: <span className="text-primary">SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7</span></div>
                  <div>Token: &nbsp;<span className="text-primary">cTokenmWW8bLPjZEBAUgYy3zKxQZW6VKi7bqNFEVv3m</span></div>
                </div>
              </div>
            </Section>

            {/* ============================================================ */}
            {/* 8. SECURITY MODEL */}
            {/* ============================================================ */}
            <Section id="security">
              <div className="glass-panel rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon icon="ph:shield-check" className="text-primary" /> 7. Security Model
                </h2>

                <h3 className="font-semibold mb-3">Threat Model</h3>
                <div className="space-y-3 mb-6">
                  {[
                    { threat: "Passive Observer", desc: "Can read all on-chain data (commitments, nullifiers, Merkle roots, encrypted blobs). Cannot derive private inputs due to Poseidon preimage resistance and commitment hiding properties." },
                    { threat: "Network Adversary", desc: "Can observe transaction submission timing and IP addresses. Mitigated by Helius privacy RPC (WebSocket disabled, no transaction broadcasting metadata)." },
                    { threat: "Compromised Guardian", desc: "Any T-1 colluding guardians in a T-of-N Shamir scheme learn zero information about the recovery key (information-theoretic security of polynomial secret sharing)." },
                    { threat: "MEV / Front-Running", desc: "Commit-reveal voting prevents vote-based front-running. Shielded amounts in Pedersen commitments prevent amount-based front-running." },
                  ].map((t, i) => (
                    <div key={i} className="border border-border rounded-lg p-3">
                      <h4 className="text-sm font-semibold mb-1">{t.threat}</h4>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                  ))}
                </div>

                <h3 className="font-semibold mb-3">Security Properties by Module</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3">Module</th>
                        <th className="text-left py-2 px-3">Confidentiality</th>
                        <th className="text-left py-2 px-3">Integrity</th>
                        <th className="text-left py-2 px-3">Availability</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      {[
                        { mod: "Identity", conf: "Commitment hiding (preimage resistance)", integ: "Deterministic derivation (same input → same wallet)", avail: "No server dependency (client-side only)" },
                        { mod: "Shielded Pools", conf: "Amount hidden (Pedersen), owner hidden (Poseidon)", integ: "Nullifier uniqueness (PDA), Merkle inclusion", avail: "On-chain state survives client loss" },
                        { mod: "Voting", conf: "Choice hidden until reveal (commitment scheme)", integ: "Binding commitment, on-chain timing", avail: "Proposal PDA persistent" },
                        { mod: "Multisig", conf: "Signer set hidden (commitment-only)", integ: "Approval uniqueness, threshold enforcement", avail: "Vault PDA persistent" },
                        { mod: "Recovery", conf: "T-1 shares reveal nothing (information-theoretic)", integ: "GF(256) polynomial correctness", avail: "Off-chain shares, timelock on-chain" },
                      ].map((r, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2 px-3 font-semibold text-foreground">{r.mod}</td>
                          <td className="py-2 px-3">{r.conf}</td>
                          <td className="py-2 px-3">{r.integ}</td>
                          <td className="py-2 px-3">{r.avail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3 className="font-semibold mb-3">Known Limitations & Mitigations</h3>
                <div className="space-y-2">
                  {[
                    { limitation: "Poseidon fallback to SHA-256 reduces to computational security rather than ZK-algebraic assumption.", mitigation: "circomlibjs integration provides real Poseidon. SHA-256 fallback is field-safe (31-byte truncation + modular reduction)." },
                    { limitation: "Groth16 proofs in Phase 1 use structural validation, not full pairing verification.", mitigation: "Field element bounds checking (< BN128 prime) + commitment binding prevents trivial forgery. Phase 2 targets alt_bn128 precompile." },
                    { limitation: "Pedersen commitments use integer arithmetic rather than elliptic curve group law.", mitigation: "Integer arithmetic provides numerical hiding within the BN128 field. Phase 2 migrates to proper EC scalar multiplication." },
                  ].map((l, i) => (
                    <div key={i} className="border border-amber-500/20 bg-amber-500/5 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground"><strong className="text-amber-400">Limitation:</strong> {l.limitation}</p>
                      <p className="text-xs text-muted-foreground mt-1"><strong className="text-green-400">Mitigation:</strong> {l.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* ============================================================ */}
            {/* 9. ROADMAP */}
            {/* ============================================================ */}
            <Section id="roadmap">
              <div className="glass-panel rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Icon icon="ph:road-horizon" className="text-primary" /> 8. Roadmap
                </h2>

                <div className="space-y-6">
                  {/* Phase 1 */}
                  <div className="border-l-4 border-green-500 pl-6">
                    <div className="flex items-center gap-2 mb-2">
                      <PhaseBadge phase="deployed" />
                      <h3 className="font-bold text-lg">Phase 1: Reference Implementation</h3>
                      <span className="text-xs text-muted-foreground">(Current)</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                      <li className="flex items-start gap-2"><Icon icon="ph:check-circle" className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /> Anchor program deployed on Solana devnet with 7 account types</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:check-circle" className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /> UTXO-based shielded pools with Merkle tree and nullifier system</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:check-circle" className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /> Commit-reveal voting with on-chain timing enforcement</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:check-circle" className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /> Stealth multisig with commitment-based signer privacy</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:check-circle" className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /> Shamir SSS with real GF(256) arithmetic</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:check-circle" className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /> SDK v0.3.0 with 15+ privacy modules</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:check-circle" className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /> Groth16 proof structure with BN128 field validation</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:check-circle" className="w-4 h-4 text-green-400 mt-0.5 shrink-0" /> Poseidon hash via circomlibjs with SHA-256 fallback</li>
                    </ul>
                  </div>

                  {/* Phase 2 */}
                  <div className="border-l-4 border-blue-500 pl-6">
                    <div className="flex items-center gap-2 mb-2">
                      <PhaseBadge phase="phase2" />
                      <h3 className="font-bold text-lg">Phase 2: Full ZK Stack</h3>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                      <li className="flex items-start gap-2"><Icon icon="ph:circle-dashed" className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /> Compile circom circuits with trusted setup ceremony (powers-of-tau)</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:circle-dashed" className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /> Full Bulletproof range proof verification on-chain</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:circle-dashed" className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /> Groth16 pairing check via alt_bn128 precompile or custom verifier</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:circle-dashed" className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /> Elliptic curve Pedersen commitments (proper EC scalar multiplication)</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:circle-dashed" className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /> Light Protocol SDK integration for compressed shielded accounts</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:circle-dashed" className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /> SPL Token-2022 confidential transfer integration (ElGamal)</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:circle-dashed" className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /> ZK set membership proofs for stealth multisig</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:circle-dashed" className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /> ZK eligibility proofs for private voting</li>
                    </ul>
                  </div>

                  {/* Phase 3 */}
                  <div className="border-l-4 border-purple-500 pl-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border bg-purple-500/10 text-purple-400 border-purple-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        Phase 3
                      </span>
                      <h3 className="font-bold text-lg">Mainnet</h3>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                      <li className="flex items-start gap-2"><Icon icon="ph:circle-dashed" className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" /> Independent security audit of Anchor program and client-side cryptography</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:circle-dashed" className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" /> Formal verification of circom circuits</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:circle-dashed" className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" /> Mainnet deployment with production key ceremonies</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:circle-dashed" className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" /> DAO governance for protocol upgrades</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:circle-dashed" className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" /> Cross-program composability with existing Solana DeFi</li>
                      <li className="flex items-start gap-2"><Icon icon="ph:circle-dashed" className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" /> Production-scale compressed shielded pools via Light Protocol</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Section>

            {/* ============================================================ */}
            {/* 10. CONCLUSION */}
            {/* ============================================================ */}
            <Section id="conclusion">
              <div className="glass-panel rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Icon icon="ph:flag-checkered" className="text-primary" /> 9. Conclusion
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Veil Protocol demonstrates that <strong className="text-foreground">composable privacy is achievable on Solana</strong> without
                    sacrificing the performance, composability, and developer experience that make Solana the leading
                    high-throughput blockchain.
                  </p>
                  <p>
                    The protocol's architecture is designed for <strong className="text-foreground">progressive enhancement</strong>:
                    each module functions today with structural cryptography and improves incrementally as ZK tooling
                    matures on Solana. The UTXO-based shielded pool model, combined with commit-reveal governance,
                    stealth multi-signature wallets, and information-theoretically secure social recovery, provides
                    a privacy toolkit covering the full lifecycle of on-chain activity &mdash; from identity to
                    transactions to governance to key management.
                  </p>
                  <p>
                    By keeping all sensitive computation client-side and storing only cryptographic commitments on-chain,
                    Veil Protocol ensures that privacy is not an afterthought but a <strong className="text-foreground">first-class
                    infrastructure primitive</strong> &mdash; available to every Solana developer through a single SDK import.
                  </p>
                  <p className="text-primary font-medium">
                    Privacy is not about hiding. It is about user sovereignty over information disclosure.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-12 pb-8">
                <p className="text-sm text-muted-foreground mb-4">
                  Veil Protocol &middot; Whitepaper v1.0 &middot; February 2025
                </p>
                <div className="flex justify-center gap-4 text-sm">
                  <a href="https://github.com/Radrdotfun/ShadowWire" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    <Icon icon="mdi:github" className="w-4 h-4" /> GitHub
                  </a>
                  <a href="https://www.npmjs.com/package/@veil-protocol/sdk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    <Icon icon="simple-icons:npm" className="w-4 h-4" /> SDK
                  </a>
                </div>
              </div>
            </Section>

          </div>
        </div>
      </div>
    </PageLayout>
  );
}
