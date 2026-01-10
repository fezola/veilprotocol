import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { PageLayout } from "@/components/layout/PageLayout";

export default function WalletCreated() {
  const navigate = useNavigate();
  const [showAddress, setShowAddress] = useState(false);
  
  // Simulated wallet address
  const walletAddress = "Vei1...x7Kp";
  const fullAddress = "Vei1Hk9mNxPqR5sT8uW2yZ3aB6cD4eF7gJ0kL1nO9pQ8rS5tU6vX7Kp";

  useEffect(() => {
    const timer = setTimeout(() => setShowAddress(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageLayout hideFooter>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center"
        >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-8 success-glow"
          >
            <Icon icon="ph:check-circle-fill" className="w-12 h-12 text-success" />
          </motion.div>

          <h1 className="text-3xl font-bold mb-4">Wallet Created</h1>
          <p className="text-muted-foreground mb-8">
            Your private wallet has been derived. No one can link this address to your identity.
          </p>

          {/* Wallet Address Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showAddress ? 1 : 0, y: showAddress ? 0 : 20 }}
            className="glass-panel rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Your Private Address</span>
              <span className="privacy-badge">
                <Icon icon="ph:shield-check" className="w-3.5 h-3.5" />
                Unlinkable
              </span>
            </div>
            
            <div className="bg-secondary rounded-lg p-4 font-mono text-sm break-all">
              {fullAddress}
            </div>

            <button
              onClick={() => navigator.clipboard.writeText(fullAddress)}
              className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
              <Icon icon="ph:copy" className="w-4 h-4" />
              Copy Address
            </button>
          </motion.div>

          {/* Privacy Guarantees */}
          <div className="glass-panel rounded-xl p-6 mb-8 text-left">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Icon icon="ph:lock" className="w-5 h-5 text-primary" />
              Privacy Guarantees
            </h3>
            <ul className="space-y-3">
              {[
                "Your email/passkey was never transmitted",
                "No linkage to other wallets you own",
                "Balance cannot be associated with your identity",
                "Recovery can be set up privately",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Icon icon="ph:check-circle" className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/dashboard"
              className="flex-1 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Icon icon="ph:layout" className="w-5 h-5" />
              Go to Dashboard
            </Link>
            <Link
              to="/recovery-setup"
              className="flex-1 py-3 border border-border font-medium rounded-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2"
            >
              <Icon icon="ph:key" className="w-5 h-5" />
              Set Up Recovery
            </Link>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
