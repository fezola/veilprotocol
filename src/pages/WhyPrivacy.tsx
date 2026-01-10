import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";

const threats = [
  {
    icon: "ph:eye",
    title: "Balance Surveillance",
    description: "Once someone knows your wallet address, they can track every transaction you make and every token you hold. Forever.",
  },
  {
    icon: "ph:user-list",
    title: "Social Graph Exposure",
    description: "Traditional wallet recovery requires guardians—people you trust. This creates a permanent record of your closest relationships.",
  },
  {
    icon: "ph:link-break",
    title: "Address Linkability",
    description: "Even using multiple wallets, on-chain analysis can often link them back to a single identity through transaction patterns.",
  },
  {
    icon: "ph:identification-card",
    title: "Identity Leakage",
    description: "One KYC exchange interaction can permanently tie your real identity to all your crypto activities.",
  },
];

const principles = [
  {
    number: "01",
    title: "Zero Knowledge by Default",
    description: "Never reveal more than the minimum required. If you don't need to show your identity, don't.",
  },
  {
    number: "02",
    title: "Client-Side Everything",
    description: "All sensitive operations happen on your device. We never see your secrets.",
  },
  {
    number: "03",
    title: "No Linkable State",
    description: "Your wallets, transactions, and recovery paths remain cryptographically unlinkable.",
  },
  {
    number: "04",
    title: "Verify, Don't Trust",
    description: "All privacy guarantees are mathematically provable, not policy-based.",
  },
];

export default function WhyPrivacy() {
  return (
    <PageLayout>
      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Why Privacy <span className="text-primary">Matters</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              In a world of permanent, public ledgers, privacy isn't a feature—it's a necessity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Threat Model */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">The Threat Model</h2>
            <p className="text-muted-foreground max-w-2xl">
              Understanding what you're protecting against is the first step to meaningful privacy.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {threats.map((threat, index) => (
              <motion.div
                key={threat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-panel rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <Icon icon={threat.icon} className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{threat.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {threat.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Principles */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Privacy Principles</h2>
            <p className="text-muted-foreground max-w-2xl">
              These aren't marketing promises. They're engineering constraints.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {principles.map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6"
              >
                <span className="text-5xl font-bold text-primary/20">{principle.number}</span>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{principle.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel rounded-2xl p-8 md:p-12 max-w-4xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              What Makes Veil Different
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon icon="ph:code" className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Not Just Private Payments</h3>
                <p className="text-sm text-muted-foreground">
                  We're building privacy infrastructure, not another mixing service.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon icon="ph:shield-checkered" className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Full Lifecycle Privacy</h3>
                <p className="text-sm text-muted-foreground">
                  From login to recovery, every step is designed for privacy.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon icon="ph:plugs-connected" className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Composable Layer</h3>
                <p className="text-sm text-muted-foreground">
                  Sits on top of existing wallets. No migration required.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Ready to experience true privacy?
            </h2>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Icon icon="ph:shield-check" className="w-5 h-5" />
              Start Private Session
            </Link>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
}
