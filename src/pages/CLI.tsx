import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";

const installSteps = [
  { command: "npx create-veil-app my-app", description: "Initialize a new Veil project" },
  { command: "cd my-app", description: "Navigate to your project" },
  { command: "pnpm install", description: "Install dependencies" },
  { command: "pnpm dev", description: "Start development server" },
];

const templates = [
  { category: "DeFi", items: ["dex", "lending", "yield", "pool"] },
  { category: "DApp", items: ["gaming", "nft", "social", "governance"] },
  { category: "Exchange", items: ["cex", "aggregator", "trading"] },
  { category: "Wallet", items: ["wallet", "portfolio", "payments"] },
  { category: "Starter", items: ["basic"] },
];

const features = [
  {
    icon: "ph:rocket-launch",
    title: "15 Templates",
    description: "DEX, Lending, NFT, Gaming, Wallet, and more — all privacy-first",
  },
  {
    icon: "ph:shield-check",
    title: "Full Privacy Stack",
    description: "Identity, Recovery, Voting, Staking, Multisig pre-configured",
  },
  {
    icon: "ph:plug",
    title: "ShadowPay Ready",
    description: "Mainnet private payments via @radr/shadowwire",
  },
  {
    icon: "ph:code",
    title: "TypeScript First",
    description: "Full type safety with Next.js or Vite templates",
  },
];

const npmPackages = [
  {
    name: "@veil-protocol/sdk",
    version: "0.3.0",
    description: "Privacy SDK with shielded pools, private deposits/withdrawals, ZK identity, voting, staking",
    install: "npm install @veil-protocol/sdk",
    link: "https://www.npmjs.com/package/@veil-protocol/sdk",
    isNew: true,
  },
  {
    name: "@veil-protocol/cli",
    version: "0.2.1",
    description: "CLI for scaffolding privacy-first Solana projects with ZK architecture docs",
    install: "npm install -g @veil-protocol/cli",
    link: "https://www.npmjs.com/package/@veil-protocol/cli",
    isNew: false,
  },
  {
    name: "create-veil-app",
    version: "0.3.2",
    description: "CLI to scaffold privacy-first Solana apps",
    install: "npx create-veil-app my-app",
    link: "https://www.npmjs.com/package/create-veil-app",
    isNew: false,
  },
];

const cliCommands = [
  { command: "veil init <name>", description: "Initialize a new Veil project with privacy features" },
  { command: "veil info", description: "Show Veil Protocol information and features" },
  { command: "veil network", description: "Display network configuration help" },
  { command: "veil shadowwire", description: "Show ShadowWire ZK proof architecture details" },
  { command: "veil compression", description: "Show Light Protocol ZK compression info" },
  { command: "veil privacy-stack", description: "Display full privacy stack architecture diagram" },
];

const sdkMethods = [
  {
    category: "Shielded Pools",
    methods: [
      { name: "createShieldedPool()", description: "Create a new privacy pool with Merkle tree" },
      { name: "shieldDeposit()", description: "Deposit funds with hidden amounts (Bulletproofs)" },
      { name: "shieldWithdraw()", description: "Withdraw privately with nullifier protection" },
      { name: "getShieldedBalance()", description: "Get your decrypted shielded balance" },
    ]
  },
  {
    category: "Private Voting",
    methods: [
      { name: "createVote()", description: "Create encrypted vote commitment" },
      { name: "revealVote()", description: "Reveal vote after voting ends" },
      { name: "getProposalResults()", description: "Get vote tally (individual votes hidden)" },
    ]
  },
  {
    category: "Private Staking",
    methods: [
      { name: "stake()", description: "Stake with hidden amount (Pedersen commitment)" },
      { name: "getRewards()", description: "Check rewards (only you can decrypt)" },
      { name: "withdraw()", description: "Withdraw with ZK proof" },
    ]
  },
  {
    category: "Stealth Multisig",
    methods: [
      { name: "createMultisig()", description: "Create M-of-N multisig with hidden signers" },
      { name: "stealthSign()", description: "Sign without revealing identity" },
      { name: "executeProposal()", description: "Execute after threshold reached" },
    ]
  },
];

export default function CLI() {
  return (
    <PageLayout>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Icon icon="ph:terminal" className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Developer CLI</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Build Privacy-First Apps
              <span className="block text-primary">In Minutes</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The Veil CLI scaffolds production-ready Solana applications with 
              privacy built into every layer — identity, access, and recovery.
            </p>
          </motion.div>

          {/* npm Packages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {npmPackages.map((pkg, i) => (
                <a
                  key={i}
                  href={pkg.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-panel rounded-xl p-6 border border-primary/20 hover:border-primary/40 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon icon="simple-icons:npm" className="w-6 h-6 text-red-500" />
                      <span className="font-mono font-semibold text-primary">{pkg.name}</span>
                    </div>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">v{pkg.version}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>
                  <div className="bg-black/50 rounded-lg p-3 font-mono text-xs group-hover:bg-black/70 transition-colors">
                    <span className="text-muted-foreground">$</span>{" "}
                    <span className="text-green-400">{pkg.install}</span>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Install */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="max-w-3xl mx-auto mb-16"
          >
            <div className="glass-panel rounded-xl p-6 border border-primary/20">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Icon icon="ph:lightning" className="w-5 h-5 text-primary" />
                Quick Start
              </h2>
              <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
                <span className="text-muted-foreground">$</span>{" "}
                <span className="text-green-400">npx</span>{" "}
                <span className="text-cyan-400">create-veil-app</span>{" "}
                <span className="text-white">my-privacy-app</span>
              </div>
            </div>
          </motion.div>

          {/* CLI Commands */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.17 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <h2 className="text-2xl font-bold text-center mb-8">CLI Commands</h2>
            <div className="glass-panel rounded-xl p-6 border border-purple-500/20">
              <div className="grid md:grid-cols-2 gap-4">
                {cliCommands.map((cmd, i) => (
                  <div key={i} className="bg-black/30 rounded-lg p-4 border border-border hover:border-primary/30 transition-colors">
                    <code className="text-sm font-mono text-cyan-400">{cmd.command}</code>
                    <p className="text-xs text-muted-foreground mt-2">{cmd.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Icon icon="ph:info" className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-400">New in v0.2.1</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  The <code className="text-purple-400">shadowwire</code>, <code className="text-purple-400">compression</code>, and <code className="text-purple-400">privacy-stack</code> commands provide detailed ZK proof architecture documentation directly in your terminal.
                </p>
              </div>
            </div>
          </motion.div>

          {/* SDK Methods Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-center mb-4">SDK Methods</h2>
            <p className="text-center text-muted-foreground mb-8">
              <code className="text-primary">@veil-protocol/sdk@0.3.0</code> — Full privacy stack for Solana
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {sdkMethods.map((category, i) => (
                <div key={i} className="glass-panel rounded-xl p-6 border border-primary/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon icon="ph:code" className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-primary">{category.category}</h3>
                  </div>
                  <div className="space-y-3">
                    {category.methods.map((method, j) => (
                      <div key={j} className="bg-black/30 rounded-lg p-3 border border-border">
                        <code className="text-sm font-mono text-cyan-400">{method.name}</code>
                        <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Icon icon="ph:check-circle" className="w-5 h-5 text-green-400" />
                <span className="text-sm font-semibold text-green-400">New in SDK v0.3.0</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shielded pools with private deposits, withdrawals, and nullifier-based double-spend protection.
                Full integration with ShadowWire for hidden transaction amounts.
              </p>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {features.map((feature, i) => (
              <div key={i} className="glass-panel rounded-xl p-6 border hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon icon={feature.icon} className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </motion.div>

          {/* CLI Screenshots Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-center mb-8">What You'll See</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Init Screenshot */}
              <div className="glass-panel rounded-xl overflow-hidden border">
                <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 px-4 py-3 border-b flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">npx create-veil-app</span>
                </div>
                <div className="p-4 bg-[#1a1a2e] font-mono text-xs leading-relaxed">
                  <pre className="text-cyan-400">{`
██╗   ██╗███████╗██╗██╗     
██║   ██║██╔════╝██║██║     
██║   ██║█████╗  ██║██║     
╚██╗ ██╔╝██╔══╝  ██║██║     
 ╚████╔╝ ███████╗██║███████╗
  ╚═══╝  ╚══════╝╚═╝╚══════╝`}</pre>
                  <p className="text-purple-400 mt-2">Veil + ShadowWire — Complete Privacy Infrastructure</p>
                  <div className="mt-4 space-y-1">
                    <p><span className="text-yellow-400">?</span> <span className="text-white">Project name:</span> <span className="text-green-400">my-dex</span></p>
                    <p><span className="text-yellow-400">?</span> <span className="text-white">Template:</span> <span className="text-cyan-400">DEX Interface</span></p>
                    <p><span className="text-yellow-400">?</span> <span className="text-white">Framework:</span> <span className="text-cyan-400">Next.js</span></p>
                    <p><span className="text-yellow-400">?</span> <span className="text-white">ShadowPay mode:</span> <span className="text-cyan-400">App — Receive payments</span></p>
                    <p><span className="text-yellow-400">?</span> <span className="text-white">Network:</span> <span className="text-cyan-400">Devnet</span></p>
                    <p className="text-green-400 mt-2">✔ Veil initialized successfully.</p>
                  </div>
                </div>
              </div>

              {/* Build Screenshot */}
              <div className="glass-panel rounded-xl overflow-hidden border">
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-3 border-b flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">npm run build</span>
                </div>
                <div className="p-4 bg-[#1a1a2e] font-mono text-xs leading-relaxed">
                  <p className="text-white">▲ Next.js 14.2.35</p>
                  <p className="text-muted-foreground mt-2">Creating an optimized production build ...</p>
                  <div className="mt-2 space-y-1">
                    <p><span className="text-green-400">✓</span> Compiled successfully</p>
                    <p><span className="text-green-400">✓</span> Linting and checking validity of types</p>
                    <p><span className="text-green-400">✓</span> Collecting page data</p>
                    <p><span className="text-green-400">✓</span> Generating static pages (4/4)</p>
                    <p><span className="text-green-400">✓</span> Collecting build traces</p>
                    <p><span className="text-green-400">✓</span> Finalizing page optimization</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step by Step */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-2xl font-bold text-center mb-8">Step by Step</h2>
            <div className="space-y-4">
              {installSteps.map((step, i) => (
                <div key={i} className="glass-panel rounded-lg p-4 border flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <code className="text-sm font-mono text-cyan-400">{step.command}</code>
                    <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* What's Included */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <h2 className="text-2xl font-bold text-center mb-8">What's Included</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-panel rounded-xl p-6 border text-center">
                <Icon icon="ph:fingerprint" className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Privacy Login</h3>
                <p className="text-sm text-muted-foreground">
                  Pre-built components for identity-free authentication
                </p>
              </div>
              <div className="glass-panel rounded-xl p-6 border text-center">
                <Icon icon="ph:key" className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Recovery System</h3>
                <p className="text-sm text-muted-foreground">
                  Time-locked and Shamir recovery ready to configure
                </p>
              </div>
              <div className="glass-panel rounded-xl p-6 border text-center">
                <Icon icon="ph:hand-coins" className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">ShadowPay</h3>
                <p className="text-sm text-muted-foreground">
                  Optional private payment integration for apps
                </p>
              </div>
            </div>
          </motion.div>

          {/* Templates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <h2 className="text-2xl font-bold text-center mb-8">15 Production Templates</h2>
            <div className="grid md:grid-cols-5 gap-4">
              {templates.map((cat, i) => (
                <div key={i} className="glass-panel rounded-xl p-4 border">
                  <h3 className="font-semibold text-primary text-sm mb-3">{cat.category}</h3>
                  <div className="space-y-2">
                    {cat.items.map((item, j) => (
                      <div key={j} className="text-xs font-mono bg-black/30 rounded px-2 py-1">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="glass-panel rounded-xl p-8 border border-primary/20 max-w-2xl mx-auto">
              <Icon icon="ph:terminal" className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Ready to Build?</h2>
              <p className="text-muted-foreground mb-6">
                Start building privacy-first Solana applications today.
              </p>
              <div className="bg-black/50 rounded-lg p-4 font-mono text-sm inline-block">
                <span className="text-muted-foreground">$</span>{" "}
                <span className="text-green-400">npx</span>{" "}
                <span className="text-cyan-400">create-veil-app</span>{" "}
                <span className="text-white">my-app</span>
              </div>
              <div className="mt-4 flex justify-center gap-4">
                <a
                  href="https://www.npmjs.com/package/@veil-protocol/sdk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Icon icon="simple-icons:npm" className="w-4 h-4" />
                  @veil-protocol/sdk
                </a>
                <a
                  href="https://www.npmjs.com/package/create-veil-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Icon icon="simple-icons:npm" className="w-4 h-4" />
                  create-veil-app
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}

