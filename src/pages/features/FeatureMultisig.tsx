import { Header } from "@/components/layout/Header";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { MultisigDemoModal } from "@/components/demos/MultisigDemoModal";

const codeExamples = [
  {
    language: "typescript",
    label: "TypeScript",
    icon: "logos:typescript-icon",
    code: `import { PrivateMultisig } from '@veil-protocol/sdk/multisig';

const multisig = new PrivateMultisig(connection, encryptionKey);

// Create stealth multisig (3-of-5, signers hidden)
const { vaultAddress, signerCommitments } = await multisig.create({
  threshold: 3,
  signerPubkeys: [signer1, signer2, signer3, signer4, signer5],
  // Signers encrypted - only commitments on-chain
});

// Sign without revealing identity
await multisig.stealthSign(
  vaultAddress,
  transactionToApprove,
  myPrivateSignerKey  // Never exposed
);

// Execute when threshold reached
await multisig.execute(vaultAddress, transactionToApprove);`
  },
  {
    language: "rust",
    label: "Rust",
    icon: "logos:rust",
    code: `use veil_protocol::multisig::PrivateMultisig;

let multisig = PrivateMultisig::new(&connection, &encryption_key);

// Create stealth multisig (3-of-5, signers hidden)
let (vault_address, signer_commitments) = multisig.create(
    3,  // threshold
    &[signer1, signer2, signer3, signer4, signer5],
).await?;

// Sign without revealing identity
multisig.stealth_sign(
    &vault_address,
    &transaction_to_approve,
    &my_private_signer_key,
).await?;

// Execute when threshold reached
multisig.execute(&vault_address, &transaction_to_approve).await?;`
  },
  {
    language: "python",
    label: "Python",
    icon: "logos:python",
    code: `from veil_protocol.multisig import PrivateMultisig

multisig = PrivateMultisig(connection, encryption_key)

# Create stealth multisig (3-of-5, signers hidden)
vault_address, signer_commitments = await multisig.create(
    threshold=3,
    signer_pubkeys=[signer1, signer2, signer3, signer4, signer5]
)

# Sign without revealing identity
await multisig.stealth_sign(
    vault_address,
    transaction_to_approve,
    my_private_signer_key
)

# Execute when threshold reached
await multisig.execute(vault_address, transaction_to_approve)`
  }
];

export default function FeatureMultisig() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Icon icon="ph:users-three" className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Private Multisig</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stealth signers. Encrypt multisig participants. Make your on-chain footprint invisible.
            </p>
          </motion.div>

          {/* The Problem */}
          <div className="glass-panel rounded-2xl p-8 mb-8 border-destructive/30">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Icon icon="ph:warning" className="text-destructive" /> The Multisig Problem
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Traditional multisig wallets expose all signer addresses on-chain. This creates massive security risks:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: "ph:target", title: "Targeted Attacks", desc: "Hackers identify key holders and target them individually" },
                  { icon: "ph:chats", title: "Social Engineering", desc: "Exposed signers become victims of phishing and impersonation" },
                  { icon: "ph:currency-circle-dollar", title: "CEX Hacks", desc: "Centralized exchange hacks often exploited known multisig signers" },
                  { icon: "ph:eye", title: "Surveillance", desc: "Anyone can track who controls large treasuries" },
                ].map((item, i) => (
                  <div key={i} className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                    <Icon icon={item.icon} className="w-5 h-5 text-destructive mb-2" />
                    <h3 className="font-medium text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* The Solution */}
          <div className="glass-panel rounded-2xl p-8 mb-8 border-success/30">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Icon icon="ph:shield-check" className="text-success" /> Veil's Solution: Stealth Signers
            </h2>
            <div className="space-y-6">
              {[
                { icon: "ph:fingerprint", title: "Encrypted Signer Addresses", desc: "Signer public keys are never exposed on-chain. Only a commitment hash is visible." },
                { icon: "ph:lock-key", title: "ZK Signature Verification", desc: "Signers prove they're authorized without revealing their identity. Zero-knowledge magic." },
                { icon: "ph:graph", title: "No On-Chain Footprint", desc: "Transaction history doesn't link back to individual signers. Complete unlinkability." },
                { icon: "ph:arrows-split", title: "Threshold Signatures", desc: "M-of-N signing without exposing which M signers approved. Even co-signers don't know each other." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
                    <Icon icon={item.icon} className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">SDK Usage</h2>
            <CodeBlock examples={codeExamples} title="Private Multisig" />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: "ph:ghost", title: "Stealth Signers", desc: "Identities never on-chain" },
              { icon: "ph:lock", title: "Social Engineering Proof", desc: "Can't target what you can't see" },
              { icon: "ph:bank", title: "Treasury Protection", desc: "Secure DAO & protocol funds" },
            ].map((item, i) => (
              <div key={i} className="glass-panel rounded-xl p-6 text-center">
                <Icon icon={item.icon} className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowDemo(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
            >
              Try Private Multisig Demo <Icon icon="ph:play" />
            </button>
          </div>
        </div>
      </main>

      <MultisigDemoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />
    </div>
  );
}

