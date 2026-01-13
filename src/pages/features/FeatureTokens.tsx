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
    code: `import { TokenPrivacyClient, KNOWN_TOKENS } from '@veil-protocol/sdk/tokens';

const client = new TokenPrivacyClient(connection, encryptionKey);

// Shield USDC tokens
await client.shieldTokens(
  wallet.publicKey,
  KNOWN_TOKENS.USDC,
  100,  // 100 USDC
  signTransaction
);

// Get shielded token balances
const balances = await client.getShieldedTokens();
console.log('USDC:', balances.get(KNOWN_TOKENS.USDC.address));`
  },
  {
    language: "rust",
    label: "Rust",
    icon: "logos:rust",
    code: `use veil_protocol::tokens::{TokenPrivacyClient, KNOWN_TOKENS};

let client = TokenPrivacyClient::new(&connection, &encryption_key);

// Shield USDC tokens
client.shield_tokens(
    &wallet.pubkey(),
    &KNOWN_TOKENS::USDC,
    100,  // 100 USDC
    &signer
).await?;

// Get shielded token balances
let balances = client.get_shielded_tokens().await?;
println!("USDC: {}", balances.get(&KNOWN_TOKENS::USDC.address));`
  },
  {
    language: "python",
    label: "Python",
    icon: "logos:python",
    code: `from veil_protocol.tokens import TokenPrivacyClient, KNOWN_TOKENS

client = TokenPrivacyClient(connection, encryption_key)

# Shield USDC tokens
await client.shield_tokens(
    wallet.public_key,
    KNOWN_TOKENS.USDC,
    100,  # 100 USDC
    sign_transaction
)

# Get shielded token balances
balances = await client.get_shielded_tokens()
print(f"USDC: {balances.get(KNOWN_TOKENS.USDC.address)}")`
  }
];

export default function FeatureTokens() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Icon icon="ph:coins" className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Token Privacy</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hide your SPL token holdings. Support for USDC, USDT, and any SPL token.
            </p>
          </motion.div>

          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Supported Tokens</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "SOL", icon: "cryptocurrency:sol" },
                { name: "USDC", icon: "cryptocurrency:usdc" },
                { name: "USDT", icon: "cryptocurrency:usdt" },
                { name: "Any SPL", icon: "ph:coins" },
              ].map((token, i) => (
                <div key={i} className="bg-secondary/30 rounded-xl p-4 text-center">
                  <Icon icon={token.icon} className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm font-medium">{token.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">SDK Usage</h2>
            <CodeBlock examples={codeExamples} title="Token Privacy" />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: "ph:eye-slash", title: "Hidden Holdings", desc: "Token balances are encrypted" },
              { icon: "ph:arrows-left-right", title: "Private Transfers", desc: "Send tokens without exposure" },
              { icon: "ph:plugs", title: "Any SPL Token", desc: "Works with all Solana tokens" },
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
              Shield Your Tokens <Icon icon="ph:arrow-right" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

