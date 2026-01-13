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
    code: `import { RecoveryClient, splitSecret } from '@veil-protocol/sdk/recovery';

const recovery = new RecoveryClient(connection);

// Split recovery secret into 5 shares, require 3 to recover
const shares = splitSecret(recoverySecret, 5, 3);
console.log('Distribute these to guardians:', shares);

// Setup guardians with timelock
await recovery.setupGuardians(
  wallet.publicKey,
  guardianPubkeys,
  { threshold: 3, timelockDays: 7 },
  signTransaction
);

// Initiate recovery (requires K guardian approvals)
await recovery.initiateRecovery(guardianSignatures);`
  },
  {
    language: "rust",
    label: "Rust",
    icon: "logos:rust",
    code: `use veil_protocol::recovery::{RecoveryClient, split_secret};

let recovery = RecoveryClient::new(&connection);

// Split recovery secret into 5 shares, require 3 to recover
let shares = split_secret(&recovery_secret, 5, 3)?;
println!("Distribute these to guardians: {:?}", shares);

// Setup guardians with timelock
recovery.setup_guardians(
    &wallet.pubkey(),
    &guardian_pubkeys,
    GuardianConfig { threshold: 3, timelock_days: 7 },
    &signer
).await?;

// Initiate recovery (requires K guardian approvals)
recovery.initiate_recovery(&guardian_signatures).await?;`
  },
  {
    language: "python",
    label: "Python",
    icon: "logos:python",
    code: `from veil_protocol.recovery import RecoveryClient, split_secret

recovery = RecoveryClient(connection)

# Split recovery secret into 5 shares, require 3 to recover
shares = split_secret(recovery_secret, 5, 3)
print(f"Distribute these to guardians: {shares}")

# Setup guardians with timelock
await recovery.setup_guardians(
    wallet.public_key,
    guardian_pubkeys,
    threshold=3,
    timelock_days=7,
    sign_transaction=sign_tx
)

# Initiate recovery (requires K guardian approvals)
await recovery.initiate_recovery(guardian_signatures)`
  }
];

export default function FeatureRecovery() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Icon icon="ph:key" className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Secure Recovery</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Recover your wallet without seed phrases. Shamir secret sharing and timelock guardians.
            </p>
          </motion.div>

          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Recovery Methods</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon icon="ph:share-network" className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Shamir Secret Sharing</h3>
                  <p className="text-sm text-muted-foreground">
                    Split your recovery secret into N shares. Require K shares to recover (e.g., 3-of-5).
                    No single guardian can access your wallet.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon icon="ph:timer" className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Timelock Recovery</h3>
                  <p className="text-sm text-muted-foreground">
                    Set a time delay before recovery completes. You can cancel within the window
                    if the request wasn't yours.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon icon="ph:users" className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Guardian Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Add trusted friends or hardware wallets as guardians. Guardians never see your identity.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">SDK Usage</h2>
            <CodeBlock examples={codeExamples} title="Secure Recovery" />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: "ph:prohibit", title: "No Seed Phrases", desc: "Social recovery instead" },
              { icon: "ph:timer", title: "Time Protection", desc: "Cancel unauthorized recovery" },
              { icon: "ph:eye-slash", title: "Guardian Privacy", desc: "Guardians don't know each other" },
            ].map((item, i) => (
              <div key={i} className="glass-panel rounded-xl p-6 text-center">
                <Icon icon={item.icon} className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/recovery-setup" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">
              Setup Recovery <Icon icon="ph:arrow-right" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

