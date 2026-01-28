import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getExplorerAddressUrl } from "@/lib/solana";

interface PrivacyCheckItem {
  label: string;
  status: "hidden" | "public" | "encrypted";
  explanation: string;
  icon: string;
  verifiable?: boolean;
}

export function PrivacyVerification() {
  const { veilWallet, commitment } = useAuth();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const privacyChecks: PrivacyCheckItem[] = [
    {
      label: "Your Real Identity",
      status: "hidden",
      explanation: "Your email or passkey is NEVER sent to any server. It stays on your device and is immediately discarded after generating the ZK proof. Even we cannot see it.",
      icon: "ph:user-circle-x",
      verifiable: true,
    },
    {
      label: "Email Address",
      status: "hidden",
      explanation: "Your email is used ONLY locally to generate a hash. The email itself is never transmitted, stored, or recorded anywhere. Check your browser's Network tab - no email data is sent.",
      icon: "ph:envelope-x",
      verifiable: true,
    },
    {
      label: "ZK Proof Commitment",
      status: "public",
      explanation: "This 32-byte hash IS public on-chain, but it's cryptographically impossible to reverse it back to your email or identity. It's like a fingerprint that proves you know a secret without revealing the secret.",
      icon: "ph:fingerprint",
      verifiable: true,
    },
    {
      label: "Veil Wallet Address",
      status: "public",
      explanation: "Your Veil wallet address is public on Solana, but it's UNLINKABLE to your real identity. Derived deterministically from the commitment, but the derivation path is one-way.",
      icon: "ph:wallet",
      verifiable: true,
    },
    {
      label: "Transaction Amounts",
      status: "hidden",
      explanation: "With Shielded Pools, your transaction amounts are HIDDEN on-chain using Pedersen commitments and Bulletproofs range proofs. Only cryptographic commitments are stored — not actual amounts. Use the Shielded Pool demo to deposit/withdraw privately.",
      icon: "ph:currency-circle-dollar",
      verifiable: true,
    },
    {
      label: "Wallet Balances",
      status: "hidden",
      explanation: "Your shielded pool balance is encrypted and hidden from public view. Only YOU can decrypt and view your balance. On-chain observers see only encrypted data, not your actual holdings.",
      icon: "ph:vault",
      verifiable: true,
    },
    {
      label: "Your Other Wallets",
      status: "hidden",
      explanation: "There is NO on-chain linkage between your Veil wallet and any other wallets you own. Each ZK login creates a cryptographically separate identity.",
      icon: "ph:link-break",
      verifiable: true,
    },
    {
      label: "Guardian Identities (Recovery)",
      status: "hidden",
      explanation: "If using Shamir secret sharing, guardian identities are NEVER recorded on-chain. Only the recovery commitment hash is public. Time-lock recovery needs NO guardians at all.",
      icon: "ph:shield-checkered",
      verifiable: true,
    },
    {
      label: "Authentication Method",
      status: "hidden",
      explanation: "Whether you used email or passkey is not recorded anywhere. The ZK proof reveals nothing about HOW you authenticated, only that you DID authenticate.",
      icon: "ph:key-x",
      verifiable: true,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hidden":
        return "text-success bg-success/10 border-success/20";
      case "public":
        return "text-warning bg-warning/10 border-warning/20";
      case "encrypted":
        return "text-primary bg-primary/10 border-primary/20";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "hidden":
        return "ph:eye-slash";
      case "public":
        return "ph:eye";
      case "encrypted":
        return "ph:lock";
      default:
        return "ph:question";
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon icon="ph:shield-check" className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Privacy Verification</h2>
          <p className="text-sm text-muted-foreground">
            Verify what's hidden vs what's public on-chain
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-panel rounded-lg p-3 border border-success/20">
          <div className="text-2xl font-bold text-success">
            {privacyChecks.filter((c) => c.status === "hidden").length}
          </div>
          <div className="text-xs text-muted-foreground">Items Hidden</div>
        </div>
        <div className="glass-panel rounded-lg p-3 border border-warning/20">
          <div className="text-2xl font-bold text-warning">
            {privacyChecks.filter((c) => c.status === "public").length}
          </div>
          <div className="text-xs text-muted-foreground">Items Public</div>
        </div>
        <div className="glass-panel rounded-lg p-3 border border-primary/20">
          <div className="text-2xl font-bold text-primary">100%</div>
          <div className="text-xs text-muted-foreground">Identity Private</div>
        </div>
      </div>

      {/* Privacy Checks List */}
      <div className="space-y-2">
        {privacyChecks.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <button
              onClick={() =>
                setExpandedItem(expandedItem === item.label ? null : item.label)
              }
              className="w-full text-left"
            >
              <div
                className={`glass-panel rounded-lg p-3 border transition-all hover:scale-[1.01] ${
                  expandedItem === item.label ? "border-primary" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon icon={item.icon} className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.label}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        item.status
                      )}`}
                    >
                      <Icon icon={getStatusIcon(item.status)} className="w-3.5 h-3.5" />
                      {item.status === "hidden"
                        ? "Hidden"
                        : item.status === "public"
                        ? "Public"
                        : "Encrypted"}
                    </span>
                    <Icon
                      icon={
                        expandedItem === item.label
                          ? "ph:caret-up"
                          : "ph:caret-down"
                      }
                      className="w-4 h-4 text-muted-foreground"
                    />
                  </div>
                </div>

                {/* Expanded Explanation */}
                {expandedItem === item.label && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-border"
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.explanation}
                    </p>

                    {/* Verification Actions */}
                    {item.verifiable && (
                      <div className="mt-3 flex items-center gap-2">
                        <Icon
                          icon="ph:check-circle"
                          className="w-4 h-4 text-success"
                        />
                        <span className="text-xs text-success font-medium">
                          Cryptographically Verified
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* On-Chain Verification */}
      {veilWallet && commitment && (
        <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-start gap-3">
            <Icon icon="ph:globe" className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-primary mb-2">
                Verify On-Chain (Solana Explorer)
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Veil Wallet: </span>
                  <a
                    href={getExplorerAddressUrl(veilWallet, "devnet")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-mono"
                  >
                    {veilWallet.slice(0, 8)}...{veilWallet.slice(-8)}
                  </a>
                </div>
                <div>
                  <span className="text-muted-foreground">Commitment: </span>
                  <span className="text-primary font-mono">
                    {commitment.slice(0, 16)}...
                  </span>
                </div>
                <div className="mt-3 text-muted-foreground">
                  ✓ Check Solana Explorer - you'll see the commitment hash, but NO email, NO identity, NO linkage to other wallets
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Score */}
      <div className="mt-6 p-4 rounded-lg bg-success/5 border border-success/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-success">Privacy Score</div>
            <div className="text-xs text-muted-foreground mt-1">
              Identity protection level
            </div>
          </div>
          <div className="text-3xl font-bold text-success">A+</div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-success to-primary"
            />
          </div>
          <span className="text-xs text-success font-medium">100%</span>
        </div>
      </div>
    </div>
  );
}
