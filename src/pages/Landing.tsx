import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { PrivacyBadge } from "@/components/ui/PrivacyBadge";
import { ParticleBackground } from "@/components/ui/ParticleBackground";

const features = [
  {
    icon: "ph:fingerprint",
    title: "Identity-Free Login",
    description: "Authenticate using zero-knowledge proofs. No emails, passwords, or personal data stored anywhere.",
  },
  {
    icon: "ph:wallet",
    title: "Unlinkable Wallets",
    description: "Derive wallets deterministically without connecting them to your identity or other balances.",
  },
  {
    icon: "ph:key",
    title: "Private Recovery",
    description: "Recover your wallet without exposing guardians, social graphs, or personal relationships.",
  },
  {
    icon: "ph:shield-check",
    title: "Zero Knowledge",
    description: "Prove you have access without revealing what you're accessing or who you are.",
  },
];

const stats = [
  { value: "0", label: "Identity Data Stored", icon: "ph:database-slash" },
  { value: "100%", label: "Client-Side Proofs", icon: "ph:lock-key" },
  { value: "∞", label: "Derived Addresses", icon: "ph:infinity" },
];

const howItWorks = [
  {
    step: "1",
    title: "Login Privately",
    description: "Use your email or passkey - it never leaves your browser",
    icon: "ph:user-circle",
    detail: "SHA-256 hashing creates a commitment. Only the hash goes on-chain, never your identity."
  },
  {
    step: "2",
    title: "Generate Wallet",
    description: "Deterministically derive your Solana wallet from commitment",
    icon: "ph:wallet",
    detail: "Same credentials = same wallet. But completely unlinkable to your real identity."
  },
  {
    step: "3",
    title: "Transact Privately",
    description: "Prove wallet ownership with zero-knowledge proofs",
    icon: "ph:shield-check",
    detail: "On-chain observers see proofs, not identities. Your privacy is cryptographically guaranteed."
  },
  {
    step: "4",
    title: "Recover Safely",
    description: "Time-locked or Shamir recovery - guardians stay hidden",
    icon: "ph:key",
    detail: "No social graph exposure. Recover access without revealing who can help you."
  }
];

const useCases = [
  {
    icon: "ph:chart-line",
    title: "DeFi Trading",
    description: "Trade, lend, and earn without linking positions to your identity",
    gradient: "from-blue-500/10 to-cyan-500/10",
    borderGradient: "from-blue-500/50 to-cyan-500/50"
  },
  {
    icon: "ph:hand-coins",
    title: "Private Payments",
    description: "Send and receive without transaction graph analysis",
    gradient: "from-green-500/10 to-emerald-500/10",
    borderGradient: "from-green-500/50 to-emerald-500/50"
  },
  {
    icon: "ph:vote",
    title: "Anonymous Voting",
    description: "Participate in governance without revealing holdings",
    gradient: "from-purple-500/10 to-pink-500/10",
    borderGradient: "from-purple-500/50 to-pink-500/50"
  },
  {
    icon: "ph:users-three",
    title: "Private Social",
    description: "Build reputation without exposing social connections",
    gradient: "from-orange-500/10 to-red-500/10",
    borderGradient: "from-orange-500/50 to-red-500/50"
  }
];

const techStack = [
  { name: "Groth16", desc: "ZK-SNARKs", icon: "ph:lock-key" },
  { name: "BN128", desc: "Elliptic Curve", icon: "ph:git-branch" },
  { name: "Shamir SSS", desc: "Secret Sharing", icon: "ph:key" },
  { name: "Solana", desc: "Blockchain", icon: "ph:currency-circle-dollar" }
];

export default function Landing() {
  return (
    <PageLayout>
      {/* Hero Section with Sparkles */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden">
        {/* Sparkles Particle Background */}
        <div className="absolute inset-0">
          <ParticleBackground
            particleCount={80}
            connectionDistance={150}
            speed={0.4}
          />
        </div>

        {/* Enhanced Gradient Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <PrivacyBadge icon="ph:lock-key">Privacy Infrastructure for Solana</PrivacyBadge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mt-8 mb-6 text-balance"
            >
              Your wallet.
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary">
                Your privacy.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground mb-10 text-balance leading-relaxed"
            >
              Authenticate, transact, and recover wallets on Solana without exposing
              your identity, balances, or social relationships.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            >
              <Link
                to="/login"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all hover:scale-105"
              >
                <Icon icon="ph:shield-check" className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Start Private Session
              </Link>
              <Link
                to="/why-privacy"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 border border-border font-medium rounded-lg hover:bg-secondary transition-all hover:scale-105"
              >
                Learn More
                <Icon icon="ph:arrow-right" className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* ZK Badge with enhanced animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-secondary/50 border border-border backdrop-blur-sm"
            >
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
              </span>
              <span className="text-sm text-muted-foreground">
                Powered by <span className="text-primary font-semibold">Zero-Knowledge Proofs</span>
              </span>
              <Icon icon="ph:seal-check" className="w-4 h-4 text-primary" />
            </motion.div>

            {/* Enhanced Stats with Icons */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
            >
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  className="text-center group cursor-default"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="mb-2 flex justify-center">
                    <Icon icon={stat.icon} className="w-8 h-8 text-primary/50 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-primary/60">
                    {stat.value}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-muted-foreground">Scroll to explore</span>
            <Icon icon="ph:caret-down" className="w-6 h-6 text-primary" />
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                How It Works
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Privacy in <span className="text-primary">4 Simple Steps</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Cryptographically sound privacy without complexity
              </p>
            </motion.div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {howItWorks.map((item, idx) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative glass-panel rounded-2xl p-6 hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon icon={item.icon} className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-primary">STEP {item.step}</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      <p className="text-xs text-muted-foreground/70 italic">
                        {item.detail}
                      </p>
                    </div>
                  </div>

                  {/* Connecting line (desktop only) */}
                  {idx < howItWorks.length - 2 && idx % 2 === 0 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Use Cases
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Privacy for <span className="text-primary">Every Scenario</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                From DeFi to DAOs, keep your identity protected
              </p>
            </motion.div>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, idx) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className={`group relative rounded-2xl p-6 bg-gradient-to-br ${useCase.gradient} border border-border hover:border-primary/30 transition-all duration-300 cursor-default`}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${useCase.borderGradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity`} />

                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-background/50 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon icon={useCase.icon} className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Features
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Privacy by Design</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Every component built from the ground up to protect your identity and assets
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Technology
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Built on <span className="text-primary">Production Cryptography</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Industry-standard protocols trusted by the world's most secure systems
              </p>
            </motion.div>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {techStack.map((tech, idx) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="glass-panel rounded-xl p-6 text-center group hover:border-primary/30 transition-all cursor-default"
              >
                <Icon icon={tech.icon} className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">{tech.name}</h3>
                <p className="text-xs text-muted-foreground">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-4">
                  The Problem
                </span>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Current Wallets <span className="text-destructive">Leak Your Privacy</span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  Every transaction you make is permanently linked to your identity
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-panel rounded-2xl p-8 border-destructive/30 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <Icon icon="ph:x-circle" className="w-6 h-6 text-destructive" />
                    </div>
                    <h3 className="text-xl font-bold">Traditional Wallets</h3>
                  </div>
                  <ul className="space-y-4">
                    {[
                      { text: "Recovery exposes your social graph", detail: "Guardian lists visible on-chain" },
                      { text: "All transactions linked to one identity", detail: "Complete financial history public" },
                      { text: "Balances visible to anyone", detail: "No transaction privacy" },
                      { text: "Login credentials stored on servers", detail: "Vulnerable to hacks and leaks" },
                    ].map((item, idx) => (
                      <motion.li
                        key={item.text}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <Icon icon="ph:x" className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{item.text}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-panel rounded-2xl p-8 border-primary/30 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon icon="ph:check-circle" className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Veil Protocol</h3>
                  </div>
                  <ul className="space-y-4">
                    {[
                      { text: "Private recovery with no exposed relationships", detail: "Guardians remain anonymous" },
                      { text: "Unlimited unlinkable addresses", detail: "Each session cryptographically separate" },
                      { text: "Balances hidden from public view", detail: "Zero-knowledge transaction proofs" },
                      { text: "Zero-knowledge authentication", detail: "Identity never leaves your device" },
                    ].map((item, idx) => (
                      <motion.li
                        key={item.text}
                        initial={{ opacity: 0, x: 10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <Icon icon="ph:check" className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{item.text}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-panel rounded-3xl p-8 md:p-16 text-center max-w-4xl mx-auto border-primary/20 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />

            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-8"
              >
                <Icon icon="ph:shield-checkered" className="w-full h-full text-primary" />
              </motion.div>

              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to take back <span className="text-primary">your privacy</span>?
              </h2>
              <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
                Join the privacy revolution. Create your first private session in under 30 seconds.
                No credit card, no personal information required.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/login"
                  className="group inline-flex items-center justify-center gap-2 px-10 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all hover:scale-105"
                >
                  <Icon icon="ph:rocket-launch" className="w-6 h-6 group-hover:translate-y-[-2px] transition-transform" />
                  Launch Private Session
                </Link>
                <Link
                  to="/docs"
                  className="group inline-flex items-center justify-center gap-2 px-10 py-4 border-2 border-primary/30 font-semibold rounded-lg hover:bg-primary/5 transition-all hover:scale-105"
                >
                  <Icon icon="ph:book-open" className="w-6 h-6" />
                  Read Documentation
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Icon icon="ph:shield-check" className="w-5 h-5 text-success" />
                  <span>Open Source</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="ph:lock-key" className="w-5 h-5 text-success" />
                  <span>Cryptographically Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="ph:seal-check" className="w-5 h-5 text-success" />
                  <span>Solana Native</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}
