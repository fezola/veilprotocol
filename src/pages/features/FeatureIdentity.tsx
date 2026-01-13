import { Header } from "@/components/layout/Header";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CodeBlock } from "@/components/ui/CodeBlock";

const codeExamples = [
  {
    language: "typescript",
    label: "TypeScript",
    icon: "logos:typescript-icon",
    code: `import { generateIdentityProof } from '@veil-protocol/sdk/identity';

// Generate proof from email
const result = await generateIdentityProof({
  type: 'email',
  value: 'user@example.com'
});

console.log(result.wallet.publicKey.toBase58());
// => "7xKXtg2CW..."

// Proof can be verified without revealing email
console.log(result.proof);
// => { pi_a, pi_b, pi_c, protocol: "groth16" }`
  },
  {
    language: "rust",
    label: "Rust",
    icon: "logos:rust",
    code: `use veil_protocol::identity::{generate_identity_proof, IdentityType};

// Generate proof from email
let result = generate_identity_proof(
    IdentityType::Email,
    "user@example.com"
).await?;

println!("Wallet: {}", result.wallet.pubkey());
// => "7xKXtg2CW..."

// Proof can be verified without revealing email
println!("Proof: {:?}", result.proof);`
  },
  {
    language: "python",
    label: "Python",
    icon: "logos:python",
    code: `from veil_protocol.identity import generate_identity_proof

# Generate proof from email
result = await generate_identity_proof(
    identity_type="email",
    value="user@example.com"
)

print(f"Wallet: {result.wallet.public_key}")
# => "7xKXtg2CW..."

# Proof can be verified without revealing email
print(f"Proof: {result.proof}")`
  }
];

export default function FeatureIdentity() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Icon icon="ph:fingerprint" className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">ZK Identity</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Prove who you are without revealing your identity. Zero-knowledge authentication for the privacy-conscious.
            </p>
          </motion.div>

          {/* How it Works */}
          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Generate Commitment</h3>
                  <p className="text-sm text-muted-foreground">
                    Your identity (email, passkey, or custom secret) is hashed into a cryptographic commitment. 
                    Only you know the preimage.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Create ZK Proof</h3>
                  <p className="text-sm text-muted-foreground">
                    Using Groth16 SNARKs, prove you know the secret without revealing it. 
                    The proof is 192 bytes and verifies in milliseconds.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Derive Wallet</h3>
                  <p className="text-sm text-muted-foreground">
                    Your commitment deterministically derives a Solana keypair. 
                    Same identity = same wallet, always.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Code Example */}
          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">SDK Usage</h2>
            <CodeBlock examples={codeExamples} title="ZK Identity" />
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: "ph:lock-key", title: "No Seed Phrases", desc: "Your identity IS your wallet" },
              { icon: "ph:eye-slash", title: "Private Auth", desc: "No identity data stored on-chain" },
              { icon: "ph:arrows-clockwise", title: "Deterministic", desc: "Same identity = same wallet" },
            ].map((item, i) => (
              <div key={i} className="glass-panel rounded-xl p-6 text-center">
                <Icon icon={item.icon} className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
            >
              Try ZK Identity <Icon icon="ph:arrow-right" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

