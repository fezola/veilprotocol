import { Header } from "@/components/layout/Header";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { CodeBlock } from "@/components/ui/CodeBlock";

const modules = [
  { name: "identity", icon: "ph:fingerprint", desc: "ZK identity proofs & wallet derivation" },
  { name: "shielded", icon: "ph:eye-slash", desc: "Shielded balance pools" },
  { name: "transfer", icon: "ph:arrows-left-right", desc: "Private transfers" },
  { name: "tokens", icon: "ph:coins", desc: "SPL token privacy" },
  { name: "dex", icon: "ph:swap", desc: "DEX integration" },
  { name: "recovery", icon: "ph:key", desc: "Wallet recovery" },
  { name: "wallet-adapter", icon: "ph:wallet", desc: "Wallet adapter plugin" },
];

const quickStartExamples = [
  {
    language: "typescript",
    label: "TypeScript",
    icon: "logos:typescript-icon",
    code: `import { Connection } from '@solana/web3.js';
import { generateIdentityProof } from '@veil-protocol/sdk/identity';
import { ShieldedBalanceClient } from '@veil-protocol/sdk/shielded';

// 1. Generate ZK identity and derive wallet
const identity = await generateIdentityProof({
  type: 'email',
  value: 'user@example.com'
});

console.log('Wallet:', identity.wallet.publicKey.toBase58());

// 2. Setup shielded balance client
const connection = new Connection('https://api.mainnet-beta.solana.com');
const shielded = new ShieldedBalanceClient(connection, identity.encryptionKey);

// 3. Deposit 1 SOL into shielded pool
await shielded.deposit(identity.wallet.publicKey, 1.0, signTransaction);

// 4. Check your private balance (only you can see this)
const balance = await shielded.getShieldedBalance();
console.log('Shielded balance:', balance, 'SOL');`
  },
  {
    language: "rust",
    label: "Rust",
    icon: "logos:rust",
    code: `use veil_protocol::{identity, shielded::ShieldedBalanceClient};
use solana_sdk::pubkey::Pubkey;
use solana_client::rpc_client::RpcClient;

// 1. Generate ZK identity and derive wallet
let identity = identity::generate_proof(
    identity::IdentityType::Email,
    "user@example.com"
).await?;

println!("Wallet: {}", identity.wallet.pubkey());

// 2. Setup shielded balance client
let connection = RpcClient::new("https://api.mainnet-beta.solana.com");
let shielded = ShieldedBalanceClient::new(&connection, &identity.encryption_key);

// 3. Deposit 1 SOL into shielded pool
shielded.deposit(&identity.wallet.pubkey(), 1.0, &signer).await?;

// 4. Check your private balance
let balance = shielded.get_shielded_balance().await?;
println!("Shielded balance: {} SOL", balance);`
  },
  {
    language: "python",
    label: "Python",
    icon: "logos:python",
    code: `from veil_protocol.identity import generate_identity_proof
from veil_protocol.shielded import ShieldedBalanceClient
from solana.rpc.api import Client

# 1. Generate ZK identity and derive wallet
identity = await generate_identity_proof(
    identity_type="email",
    value="user@example.com"
)

print(f"Wallet: {identity.wallet.public_key}")

# 2. Setup shielded balance client
connection = Client("https://api.mainnet-beta.solana.com")
shielded = ShieldedBalanceClient(connection, identity.encryption_key)

# 3. Deposit 1 SOL into shielded pool
await shielded.deposit(identity.wallet.public_key, 1.0, sign_transaction)

# 4. Check your private balance
balance = await shielded.get_shielded_balance()
print(f"Shielded balance: {balance} SOL")`
  }
];

export default function SDK() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Icon icon="ph:package" className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Veil Protocol SDK</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Build privacy-first Solana apps with our TypeScript SDK. 
              Zero-knowledge proofs, shielded balances, and more.
            </p>
          </motion.div>

          {/* Installation */}
          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Icon icon="ph:download" className="text-primary" /> Installation
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">npm</span>
                  <button
                    onClick={() => copyToClipboard("npm install @veil-protocol/sdk", "npm")}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Icon icon={copied === "npm" ? "ph:check" : "ph:copy"} /> {copied === "npm" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="bg-black/50 rounded-xl p-4 text-sm">
                  <code className="text-green-400">npm install @veil-protocol/sdk</code>
                </pre>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">yarn</span>
                  <button
                    onClick={() => copyToClipboard("yarn add @veil-protocol/sdk", "yarn")}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Icon icon={copied === "yarn" ? "ph:check" : "ph:copy"} /> {copied === "yarn" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="bg-black/50 rounded-xl p-4 text-sm">
                  <code className="text-green-400">yarn add @veil-protocol/sdk</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Modules */}
          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Icon icon="ph:puzzle-piece" className="text-primary" /> Modules
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {modules.map((mod) => (
                <div key={mod.name} className="bg-secondary/30 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Icon icon={mod.icon} className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <code className="text-sm font-mono text-primary">@veil-protocol/sdk/{mod.name}</code>
                    <p className="text-xs text-muted-foreground mt-1">{mod.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Start */}
          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Icon icon="ph:rocket" className="text-primary" /> Quick Start
            </h2>
            <CodeBlock examples={quickStartExamples} title="Quick Start" />
          </div>

          {/* CLI */}
          <div className="glass-panel rounded-2xl p-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Icon icon="ph:terminal" className="text-primary" /> CLI Tool
            </h2>
            <p className="text-muted-foreground mb-4">
              Scaffold new privacy-first projects instantly with our CLI:
            </p>
            <pre className="bg-black/50 rounded-xl p-4 text-sm mb-4">
              <code className="text-green-400">npx @veil-protocol/cli create my-app</code>
            </pre>
            <a href="/cli" className="text-primary hover:underline inline-flex items-center gap-1">
              Learn more about the CLI <Icon icon="ph:arrow-right" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

