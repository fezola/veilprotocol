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
    code: `import { ShieldedBalanceClient } from '@veil-protocol/sdk/shielded';

const client = new ShieldedBalanceClient(connection, encryptionKey);

// Deposit 1 SOL into shielded pool
await client.deposit(wallet.publicKey, 1.0, signTransaction);

// Check shielded balance (only you can see this)
const balance = await client.getShieldedBalance();
console.log('Shielded:', balance, 'SOL');

// Public balance shows less, shielded amount is hidden
const publicBalance = await client.getPublicBalance(wallet.publicKey);
console.log('Public:', publicBalance, 'SOL');`
  },
  {
    language: "rust",
    label: "Rust",
    icon: "logos:rust",
    code: `use veil_protocol::shielded::ShieldedBalanceClient;

let client = ShieldedBalanceClient::new(&connection, &encryption_key);

// Deposit 1 SOL into shielded pool
client.deposit(&wallet.pubkey(), 1.0, &signer).await?;

// Check shielded balance (only you can see this)
let balance = client.get_shielded_balance().await?;
println!("Shielded: {} SOL", balance);

// Public balance shows less, shielded amount is hidden
let public_balance = client.get_public_balance(&wallet.pubkey()).await?;
println!("Public: {} SOL", public_balance);`
  },
  {
    language: "python",
    label: "Python",
    icon: "logos:python",
    code: `from veil_protocol.shielded import ShieldedBalanceClient

client = ShieldedBalanceClient(connection, encryption_key)

# Deposit 1 SOL into shielded pool
await client.deposit(wallet.public_key, 1.0, sign_transaction)

# Check shielded balance (only you can see this)
balance = await client.get_shielded_balance()
print(f"Shielded: {balance} SOL")

# Public balance shows less, shielded amount is hidden
public_balance = await client.get_public_balance(wallet.public_key)
print(f"Public: {public_balance} SOL")`
  }
];

export default function FeatureShielded() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Icon icon="ph:eye-slash" className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Shielded Balance</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hide your wallet balance from public view. Deposit into a shielded pool, spend privately.
            </p>
          </motion.div>

          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Deposit to Shielded Pool</h3>
                  <p className="text-sm text-muted-foreground">
                    Transfer SOL or tokens into the shielded pool. Your deposit is encrypted using Pedersen commitments.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Balance Hidden On-Chain</h3>
                  <p className="text-sm text-muted-foreground">
                    Only you can decrypt and view your shielded balance. Anyone else sees just encrypted commitments.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Spend Privately</h3>
                  <p className="text-sm text-muted-foreground">
                    Withdraw or transfer from shielded balance without revealing amounts to observers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">SDK Usage</h2>
            <CodeBlock examples={codeExamples} title="Shielded Balance" />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: "ph:lock", title: "Pedersen Commitments", desc: "Mathematically hiding amounts" },
              { icon: "ph:eye-slash", title: "Encrypted On-Chain", desc: "Only owner can decrypt" },
              { icon: "ph:shield-check", title: "Auditable", desc: "Prove balance without revealing" },
            ].map((item, i) => (
              <div key={i} className="glass-panel rounded-xl p-6 text-center">
                <Icon icon={item.icon} className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">
              Shield Your Balance <Icon icon="ph:arrow-right" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

