import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { PrivacyBadge } from "@/components/ui/PrivacyBadge";

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
  { value: "0", label: "Identity Data Stored" },
  { value: "100%", label: "Client-Side Proofs" },
  { value: "∞", label: "Derived Addresses" },
];

export default function Landing() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
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
              className="text-4xl md:text-6xl lg:text-7xl font-bold mt-8 mb-6 text-balance"
            >
              Your wallet.
              <br />
              <span className="text-primary">Your privacy.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 text-balance"
            >
              Authenticate, transact, and recover wallets on Solana without exposing
              your identity, balances, or social relationships.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Icon icon="ph:shield-check" className="w-5 h-5" />
                Start Private Session
              </Link>
              <Link
                to="/why-privacy"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border font-medium rounded-lg hover:bg-secondary transition-colors"
              >
                Learn More
                <Icon icon="ph:arrow-right" className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Privacy by Design</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every component built from the ground up to protect your identity and assets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">The Problem with Current Wallets</h2>
              <p className="text-muted-foreground">
                Every transaction you make is permanently linked to your identity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-panel rounded-xl p-6 border-destructive/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Icon icon="ph:x-circle" className="w-5 h-5 text-destructive" />
                  </div>
                  <h3 className="font-semibold">Traditional Wallets</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Recovery exposes your social graph",
                    "All transactions linked to one identity",
                    "Balances visible to anyone",
                    "Login credentials stored on servers",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Icon icon="ph:x" className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-panel rounded-xl p-6 border-primary/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon icon="ph:check-circle" className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Veil Protocol</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Private recovery with no exposed relationships",
                    "Unlimited unlinkable addresses",
                    "Balances hidden from public view",
                    "Zero-knowledge authentication",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Icon icon="ph:check" className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-panel rounded-2xl p-8 md:p-12 text-center max-w-3xl mx-auto subtle-glow"
          >
            <Icon icon="ph:shield-checkered" className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to take back your privacy?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join the privacy revolution. Create your first private session in under 30 seconds.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Icon icon="ph:rocket-launch" className="w-5 h-5" />
              Launch Private Session
            </Link>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}
