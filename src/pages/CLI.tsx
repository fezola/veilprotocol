import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";

const installSteps = [
  { command: "npx veil-cli init my-app", description: "Initialize a new Veil project" },
  { command: "cd my-app", description: "Navigate to your project" },
  { command: "npm install", description: "Install dependencies" },
  { command: "npm run dev", description: "Start development server" },
];

const features = [
  {
    icon: "ph:rocket-launch",
    title: "Quick Start",
    description: "Scaffold a privacy-first Solana app in under 60 seconds",
  },
  {
    icon: "ph:shield-check",
    title: "Privacy Built-In",
    description: "All privacy modules pre-configured: login, recovery, access control",
  },
  {
    icon: "ph:plug",
    title: "ShadowPay Ready",
    description: "Optional private payments integration for apps and wallets",
  },
  {
    icon: "ph:code",
    title: "TypeScript First",
    description: "Full type safety with Next.js or Vite templates",
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

          {/* Quick Install */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
                <span className="text-cyan-400">veil-cli</span>{" "}
                <span className="text-white">init my-privacy-app</span>
              </div>
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
                  <span className="text-xs text-muted-foreground ml-2">veil init</span>
                </div>
                <div className="p-4 bg-[#1a1a2e] font-mono text-xs leading-relaxed">
                  <pre className="text-cyan-400">{`
██╗   ██╗███████╗██╗██╗     
██║   ██║██╔════╝██║██║     
██║   ██║█████╗  ██║██║     
╚██╗ ██╔╝██╔══╝  ██║██║     
 ╚████╔╝ ███████╗██║███████╗
  ╚═══╝  ╚══════╝╚═╝╚══════╝`}</pre>
                  <p className="text-purple-400 mt-2">Veil — Privacy-first access & recovery for Solana</p>
                  <div className="mt-4 space-y-1">
                    <p><span className="text-yellow-400">?</span> <span className="text-white">Project name:</span> <span className="text-green-400">my-dex</span></p>
                    <p><span className="text-yellow-400">?</span> <span className="text-white">Frontend framework:</span> <span className="text-cyan-400">Next.js (recommended)</span></p>
                    <p><span className="text-yellow-400">?</span> <span className="text-white">Enable ShadowPay?</span> <span className="text-green-400">Yes</span></p>
                    <p><span className="text-yellow-400">?</span> <span className="text-white">Network:</span> <span className="text-cyan-400">Devnet</span></p>
                    <p><span className="text-yellow-400">?</span> <span className="text-white">Building:</span> <span className="text-cyan-400">App — Receive payments</span></p>
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
                <span className="text-cyan-400">veil-cli</span>{" "}
                <span className="text-white">init my-app</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}

