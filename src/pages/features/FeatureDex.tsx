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
    code: `import { PrivateDexClient } from '@veil-protocol/sdk/dex';

const dex = new PrivateDexClient(connection, encryptionKey);

// Private swap on Jupiter
await dex.privateSwap({
  inputMint: KNOWN_TOKENS.USDC.address,
  outputMint: 'SOL',
  amount: 100,
  slippageBps: 50,  // 0.5%
  dex: 'jupiter'
}, signTransaction);

// Get quote without revealing intent
const quote = await dex.getPrivateQuote({
  inputMint: KNOWN_TOKENS.USDC.address,
  outputMint: 'SOL',
  amount: 100
});`
  },
  {
    language: "rust",
    label: "Rust",
    icon: "logos:rust",
    code: `use veil_protocol::dex::PrivateDexClient;

let dex = PrivateDexClient::new(&connection, &encryption_key);

// Private swap on Jupiter
dex.private_swap(SwapParams {
    input_mint: KNOWN_TOKENS::USDC.address,
    output_mint: "SOL".into(),
    amount: 100,
    slippage_bps: 50,  // 0.5%
    dex: Dex::Jupiter,
}, &signer).await?;

// Get quote without revealing intent
let quote = dex.get_private_quote(QuoteParams {
    input_mint: KNOWN_TOKENS::USDC.address,
    output_mint: "SOL".into(),
    amount: 100,
}).await?;`
  },
  {
    language: "python",
    label: "Python",
    icon: "logos:python",
    code: `from veil_protocol.dex import PrivateDexClient

dex = PrivateDexClient(connection, encryption_key)

# Private swap on Jupiter
await dex.private_swap(
    input_mint=KNOWN_TOKENS.USDC.address,
    output_mint="SOL",
    amount=100,
    slippage_bps=50,  # 0.5%
    dex="jupiter",
    sign_transaction=sign_tx
)

# Get quote without revealing intent
quote = await dex.get_private_quote(
    input_mint=KNOWN_TOKENS.USDC.address,
    output_mint="SOL",
    amount=100
)`
  }
];

export default function FeatureDex() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Icon icon="ph:swap" className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Private DEX Swaps</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Swap tokens on Jupiter and Raydium without revealing your trading activity.
            </p>
          </motion.div>

          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Supported DEXs</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#00D395]/20 to-[#00D395]/5 rounded-xl p-6 text-center border border-[#00D395]/20">
                <div className="text-2xl font-bold text-[#00D395] mb-2">Jupiter</div>
                <p className="text-sm text-muted-foreground">Best price aggregation</p>
              </div>
              <div className="bg-gradient-to-br from-[#5AC4BE]/20 to-[#5AC4BE]/5 rounded-xl p-6 text-center border border-[#5AC4BE]/20">
                <div className="text-2xl font-bold text-[#5AC4BE] mb-2">Raydium</div>
                <p className="text-sm text-muted-foreground">Deep liquidity pools</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">SDK Usage</h2>
            <CodeBlock examples={codeExamples} title="Private DEX" />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: "ph:eye-slash", title: "Hidden Amounts", desc: "Swap sizes are private" },
              { icon: "ph:path", title: "Route Privacy", desc: "Trading routes concealed" },
              { icon: "ph:shield-check", title: "MEV Protection", desc: "Front-running resistant" },
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
              Swap Privately <Icon icon="ph:arrow-right" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

