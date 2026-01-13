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
    code: `import { PrivateTransferClient } from '@veil-protocol/sdk/transfer';

const client = new PrivateTransferClient(connection, encryptionKey);

// Private transfer with hidden amount
await client.transfer({
  recipient: recipientPubkey,
  amount: 1.5,
  hideAmount: true,
  hideRecipient: true  // Uses stealth address
}, signTransaction);

// Generate stealth address for receiving
const stealth = await client.generateStealthAddress(recipientPubkey);
console.log('Stealth:', stealth.address.toBase58());`
  },
  {
    language: "rust",
    label: "Rust",
    icon: "logos:rust",
    code: `use veil_protocol::transfer::PrivateTransferClient;

let client = PrivateTransferClient::new(&connection, &encryption_key);

// Private transfer with hidden amount
client.transfer(TransferParams {
    recipient: recipient_pubkey,
    amount: 1.5,
    hide_amount: true,
    hide_recipient: true,  // Uses stealth address
}, &signer).await?;

// Generate stealth address for receiving
let stealth = client.generate_stealth_address(&recipient_pubkey).await?;
println!("Stealth: {}", stealth.address);`
  },
  {
    language: "python",
    label: "Python",
    icon: "logos:python",
    code: `from veil_protocol.transfer import PrivateTransferClient

client = PrivateTransferClient(connection, encryption_key)

# Private transfer with hidden amount
await client.transfer(
    recipient=recipient_pubkey,
    amount=1.5,
    hide_amount=True,
    hide_recipient=True,  # Uses stealth address
    sign_transaction=sign_tx
)

# Generate stealth address for receiving
stealth = await client.generate_stealth_address(recipient_pubkey)
print(f"Stealth: {stealth.address}")`
  }
];

export default function FeatureTransfers() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Icon icon="ph:arrows-left-right" className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Private Transfers</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Send funds without revealing transaction amounts. Optional recipient privacy with stealth addresses.
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
                  <h3 className="font-medium mb-1">Create Transfer Commitment</h3>
                  <p className="text-sm text-muted-foreground">
                    Amount is hidden using Pedersen commitments. Only sender and recipient know the value.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Optional Stealth Address</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate one-time stealth addresses so even the recipient's identity is hidden from observers.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-medium mb-1">ZK Proof of Validity</h3>
                  <p className="text-sm text-muted-foreground">
                    Prove the transfer is valid (sufficient funds, no double-spend) without revealing amounts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">SDK Usage</h2>
            <CodeBlock examples={codeExamples} title="Private Transfers" />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: "ph:eye-slash", title: "Hidden Amounts", desc: "Nobody sees how much you sent" },
              { icon: "ph:user-circle-minus", title: "Stealth Recipients", desc: "One-time addresses" },
              { icon: "ph:check-circle", title: "Provably Valid", desc: "ZK proofs ensure correctness" },
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
              Send Privately <Icon icon="ph:arrow-right" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

