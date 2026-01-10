import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";

type Section = "overview" | "technology" | "privacy" | "integration";

export default function ShadowPayExplained() {
  const [activeSection, setActiveSection] = useState<Section>("overview");

  return (
    <PageLayout>
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Icon icon="ph:shield-star" className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              How ShadowPay Privacy Works
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Understanding amount privacy, zero-knowledge proofs, and confidential transactions on Solana
            </p>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {[
              { id: "overview" as Section, label: "Overview", icon: "ph:info" },
              { id: "technology" as Section, label: "Technology", icon: "ph:cpu" },
              { id: "privacy" as Section, label: "Privacy Model", icon: "ph:shield-check" },
              { id: "integration" as Section, label: "Integration", icon: "ph:code" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeSection === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                <Icon icon={tab.icon} className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Sections */}
          <div className="max-w-4xl mx-auto">
            {/* Overview Section */}
            {activeSection === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass-panel rounded-xl p-8">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <Icon icon="ph:book-open" className="w-6 h-6 text-primary" />
                    What is ShadowPay?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    ShadowPay (via ShadowWire SDK) is a privacy protocol that enables{" "}
                    <strong className="text-foreground">confidential value transfers</strong> on Solana.
                    Unlike standard Solana transactions where amounts are publicly visible on-chain,
                    ShadowPay hides the transfer amount while maintaining verifiable correctness.
                  </p>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-success/5 border border-success/10">
                      <div className="flex items-start gap-3">
                        <Icon icon="ph:check-circle" className="w-5 h-5 text-success mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1">What's Hidden</h3>
                          <p className="text-sm text-muted-foreground">
                            Transfer amounts are encrypted and hidden on-chain. Observers cannot
                            determine how much SOL or tokens were sent.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-warning/5 border border-warning/10">
                      <div className="flex items-start gap-3">
                        <Icon icon="ph:eye" className="w-5 h-5 text-warning mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1">What's Visible</h3>
                          <p className="text-sm text-muted-foreground">
                            Transaction existence, sender/recipient addresses, and token type remain
                            public. Privacy is focused on <strong>amount confidentiality</strong>.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-start gap-3">
                        <Icon icon="ph:shield-check" className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h3 className="font-semibold mb-1">Security Guarantees</h3>
                          <p className="text-sm text-muted-foreground">
                            Cryptographic proofs ensure amounts are valid (no negative balances,
                            conservation of value) without revealing the actual amount.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-xl p-8">
                  <h2 className="text-2xl font-bold mb-4">Why Amount Privacy Matters</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <Icon icon="ph:warning" className="w-4 h-4 text-destructive" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Financial Privacy</h3>
                        <p className="text-sm text-muted-foreground">
                          Public amounts reveal wealth distribution, spending patterns, and financial
                          relationships. This data can be exploited for targeted attacks, discrimination,
                          or manipulation.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                        <Icon icon="ph:users" className="w-4 h-4 text-warning" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Competitive Protection</h3>
                        <p className="text-sm text-muted-foreground">
                          Businesses and individuals need to protect transaction amounts from competitors,
                          market manipulation, and front-running attacks.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                        <Icon icon="ph:lock" className="w-4 h-4 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Personal Security</h3>
                        <p className="text-sm text-muted-foreground">
                          Hidden amounts prevent targeted phishing, social engineering, and physical
                          threats based on known wallet balances or transaction sizes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Technology Section */}
            {activeSection === "technology" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass-panel rounded-xl p-8">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <Icon icon="ph:cpu" className="w-6 h-6 text-primary" />
                    Core Technology
                  </h2>

                  <div className="space-y-6">
                    {/* Pedersen Commitments */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Icon icon="ph:function" className="w-5 h-5 text-success" />
                        1. Pedersen Commitments
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        At the core of ShadowPay is the <strong>Pedersen commitment scheme</strong>,
                        a cryptographic primitive that allows hiding a value while committing to it.
                      </p>
                      <div className="bg-secondary/50 rounded-lg p-4 border border-border font-mono text-sm">
                        <div className="text-muted-foreground mb-2">// Commitment formula</div>
                        <div>C = v·G + r·H</div>
                        <div className="text-xs text-muted-foreground mt-2">
                          where v = amount, r = random blinding factor,<br />
                          G, H = elliptic curve generator points
                        </div>
                      </div>
                      <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-primary">Key Property:</strong> Commitments are
                          computationally hiding (cannot extract v from C) and binding (cannot change
                          v after commitment).
                        </p>
                      </div>
                    </div>

                    {/* Range Proofs */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Icon icon="ph:chart-line" className="w-5 h-5 text-warning" />
                        2. Bulletproofs (Range Proofs)
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        To prevent negative amounts or overflow attacks, ShadowPay uses{" "}
                        <strong>Bulletproofs</strong> - a zero-knowledge proof that proves an encrypted
                        amount is within a valid range without revealing the amount.
                      </p>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-success/5 border border-success/10">
                          <div className="flex items-start gap-2">
                            <Icon icon="ph:check" className="w-4 h-4 text-success mt-0.5" />
                            <div className="text-sm">
                              <strong>Proves:</strong> Amount is between 0 and 2^64 - 1
                            </div>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-success/5 border border-success/10">
                          <div className="flex items-start gap-2">
                            <Icon icon="ph:check" className="w-4 h-4 text-success mt-0.5" />
                            <div className="text-sm">
                              <strong>Reveals:</strong> Nothing about the actual amount
                            </div>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-success/5 border border-success/10">
                          <div className="flex items-start gap-2">
                            <Icon icon="ph:check" className="w-4 h-4 text-success mt-0.5" />
                            <div className="text-sm">
                              <strong>Efficiency:</strong> Logarithmic proof size (compact)
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Balance Verification */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Icon icon="ph:scales" className="w-5 h-5 text-primary" />
                        3. Balance Conservation Proofs
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        ShadowPay ensures the sum of inputs equals the sum of outputs (no value
                        creation or destruction) using homomorphic properties of Pedersen commitments.
                      </p>
                      <div className="bg-secondary/50 rounded-lg p-4 border border-border font-mono text-sm">
                        <div className="text-muted-foreground mb-2">// Homomorphic property</div>
                        <div>C(v1 + v2) = C(v1) + C(v2)</div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Sum of committed values = commitment of sum
                        </div>
                      </div>
                      <div className="mt-4 p-4 rounded-lg bg-warning/5 border border-warning/10">
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-warning">Verification:</strong> Validators check
                          that input commitments - output commitments = 0 (balance conserved) without
                          seeing amounts.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-xl p-8">
                  <h2 className="text-2xl font-bold mb-4">Transaction Flow</h2>
                  <div className="space-y-4">
                    {[
                      {
                        step: 1,
                        title: "Commitment Generation",
                        description: "Sender creates Pedersen commitments for transfer amount and change",
                        icon: "ph:lock",
                        color: "primary",
                      },
                      {
                        step: 2,
                        title: "Range Proof Creation",
                        description: "Generate Bulletproofs proving amounts are valid (non-negative)",
                        icon: "ph:shield-check",
                        color: "success",
                      },
                      {
                        step: 3,
                        title: "Balance Proof",
                        description: "Prove input commitments = output commitments (no value created)",
                        icon: "ph:equals",
                        color: "warning",
                      },
                      {
                        step: 4,
                        title: "On-Chain Verification",
                        description: "Solana validators verify proofs without seeing amounts",
                        icon: "ph:check-circle",
                        color: "success",
                      },
                    ].map((item) => (
                      <div
                        key={item.step}
                        className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-${item.color}/10 flex items-center justify-center flex-shrink-0`}>
                          <Icon icon={item.icon} className={`w-5 h-5 text-${item.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">
                            Step {item.step}: {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Privacy Model Section */}
            {activeSection === "privacy" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass-panel rounded-xl p-8">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <Icon icon="ph:shield-check" className="w-6 h-6 text-primary" />
                    Privacy Model
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">What ShadowPay Protects</h3>
                      <div className="space-y-3">
                        <div className="p-4 rounded-lg bg-success/5 border border-success/10">
                          <div className="flex items-start gap-3">
                            <Icon icon="ph:shield-check" className="w-5 h-5 text-success mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-sm mb-1">Amount Confidentiality</h4>
                              <p className="text-xs text-muted-foreground">
                                Transfer amounts are cryptographically hidden using Pedersen commitments.
                                Even blockchain explorers cannot determine the value transferred.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-success/5 border border-success/10">
                          <div className="flex items-start gap-3">
                            <Icon icon="ph:shield-check" className="w-5 h-5 text-success mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-sm mb-1">Balance Privacy</h4>
                              <p className="text-xs text-muted-foreground">
                                Account balances in confidential tokens are hidden. Observers cannot
                                track accumulation or depletion of funds.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-success/5 border border-success/10">
                          <div className="flex items-start gap-3">
                            <Icon icon="ph:shield-check" className="w-5 h-5 text-success mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-sm mb-1">Financial Pattern Obfuscation</h4>
                              <p className="text-xs text-muted-foreground">
                                Without amount visibility, spending patterns, payment frequencies, and
                                financial relationships become harder to analyze.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">What Remains Public</h3>
                      <div className="space-y-3">
                        <div className="p-4 rounded-lg bg-warning/5 border border-warning/10">
                          <div className="flex items-start gap-3">
                            <Icon icon="ph:eye" className="w-5 h-5 text-warning mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-sm mb-1">Transaction Existence</h4>
                              <p className="text-xs text-muted-foreground">
                                Fact that a transaction occurred is public. Timestamp and transaction
                                signature are visible on-chain.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-warning/5 border border-warning/10">
                          <div className="flex items-start gap-3">
                            <Icon icon="ph:eye" className="w-5 h-5 text-warning mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-sm mb-1">Sender/Recipient Addresses</h4>
                              <p className="text-xs text-muted-foreground">
                                Public keys involved in the transaction are visible. ShadowPay focuses
                                on amount privacy, not address anonymity.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-warning/5 border border-warning/10">
                          <div className="flex items-start gap-3">
                            <Icon icon="ph:eye" className="w-5 h-5 text-warning mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-sm mb-1">Token Type</h4>
                              <p className="text-xs text-muted-foreground">
                                The type of token (SOL, USDC, etc.) being transferred is visible.
                                Amount privacy applies within each token type.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-xl p-8">
                  <h2 className="text-2xl font-bold mb-4">Privacy vs. Transparency Trade-offs</h2>
                  <p className="text-muted-foreground mb-6">
                    ShadowPay balances privacy with auditability and regulatory compliance.
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-start gap-3">
                        <Icon icon="ph:scales" className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-semibold mb-2">Auditability</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Users can selectively disclose amounts using view keys or proofs for:
                          </p>
                          <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                            <li>• Tax reporting and compliance</li>
                            <li>• Audits by authorized parties</li>
                            <li>• Proof of funds for loans/investments</li>
                            <li>• Regulatory investigations (with proper authorization)</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-success/5 border border-success/10">
                      <div className="flex items-start gap-3">
                        <Icon icon="ph:check-circle" className="w-5 h-5 text-success mt-0.5" />
                        <div>
                          <h4 className="font-semibold mb-2">Verifiable Correctness</h4>
                          <p className="text-sm text-muted-foreground">
                            Even with hidden amounts, the blockchain can verify:
                          </p>
                          <ul className="text-xs text-muted-foreground space-y-1 ml-4 mt-2">
                            <li>• No value is created or destroyed</li>
                            <li>• All amounts are non-negative</li>
                            <li>• Sender has sufficient balance</li>
                            <li>• Cryptographic proofs are valid</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Integration Section */}
            {activeSection === "integration" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass-panel rounded-xl p-8">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                    <Icon icon="ph:code" className="w-6 h-6 text-primary" />
                    Veil Protocol + ShadowPay Integration
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Our integration demonstrates a <strong>complete privacy stack</strong> where
                    identity, infrastructure, recovery, and transfer privacy work together.
                  </p>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon icon="ph:user-focus" className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Layer 1: Identity Privacy (Veil)</h3>
                          <p className="text-sm text-muted-foreground">
                            ZK proofs for login, email commitments, deterministic wallet derivation
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-success/5 border border-success/10">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                          <Icon icon="ph:cloud" className="w-4 h-4 text-success" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Layer 2: Infrastructure Privacy (Helius)</h3>
                          <p className="text-sm text-muted-foreground">
                            Private RPC endpoints, webhook-based monitoring, no metadata leaks
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-warning/5 border border-warning/10">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                          <Icon icon="ph:key" className="w-4 h-4 text-warning" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Layer 3: Recovery Privacy (Veil)</h3>
                          <p className="text-sm text-muted-foreground">
                            Shamir Secret Sharing, no public guardian lists, timelock protection
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-success/5 border border-success/10">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                          <Icon icon="ph:paper-plane-tilt" className="w-4 h-4 text-success" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">Layer 4: Transfer Privacy (ShadowPay)</h3>
                          <p className="text-sm text-muted-foreground">
                            Amount hiding via Pedersen commitments, Bulletproofs, balance conservation
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-xl p-8">
                  <h2 className="text-2xl font-bold mb-4">Technical Implementation</h2>
                  <div className="space-y-4">
                    <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                      <div className="text-xs text-muted-foreground mb-2 font-mono">
                        src/lib/shadowpay.ts
                      </div>
                      <pre className="text-sm font-mono overflow-x-auto">
{`import { ShadowWireClient } from '@radr/shadowwire';

// Initialize ShadowWire SDK
const client = new ShadowWireClient({
  debug: import.meta.env.DEV,
});

// Create private payment
const result = await client.transfer({
  sender: publicKey.toBase58(),
  recipient: recipientAddress,
  amount: transferAmount,
  token: 'SOL',
  type: 'internal', // Confidential transfer
  wallet: { signMessage }, // Wallet signature
});`}
                      </pre>
                    </div>

                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Icon icon="ph:info" className="w-4 h-4 text-primary" />
                        What Happens Under the Hood
                      </h3>
                      <ol className="text-sm text-muted-foreground space-y-2 ml-4">
                        <li>1. Generate Pedersen commitments for amount and change</li>
                        <li>2. Create Bulletproofs proving amounts are in valid range</li>
                        <li>3. Generate balance conservation proof (inputs = outputs)</li>
                        <li>4. Sign transaction with wallet private key</li>
                        <li>5. Submit to Solana with encrypted amounts + proofs</li>
                        <li>6. Validators verify proofs without seeing amounts</li>
                        <li>7. Transaction confirmed with amount privacy preserved</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-xl p-8">
                  <h2 className="text-2xl font-bold mb-4">Try It Yourself</h2>
                  <p className="text-muted-foreground mb-6">
                    Experience the complete privacy stack in action with our demo mode.
                  </p>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-success text-white font-medium rounded-lg hover:bg-success/90 transition-colors"
                  >
                    <Icon icon="ph:play-circle" className="w-5 h-5" />
                    Try ShadowPay Demo
                  </Link>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="mt-12 flex justify-center gap-4">
            <Link
              to="/dashboard"
              className="px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
            >
              <Icon icon="ph:arrow-left" className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <Link
              to="/guarantees"
              className="px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-colors flex items-center gap-2"
            >
              Privacy Guarantees
              <Icon icon="ph:arrow-right" className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
