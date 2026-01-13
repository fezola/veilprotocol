import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { CodeBlock } from "@/components/ui/CodeBlock";

interface MultisigDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const codeExamples = [
  {
    language: "typescript",
    label: "TypeScript",
    icon: "logos:typescript-icon",
    code: `import { PrivateMultisig, ThresholdConfig } from '@veil-protocol/sdk/multisig';
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');

// Create 2-of-3 private multisig
const multisig = await PrivateMultisig.create(connection, {
  threshold: 2,
  signers: [signer1, signer2, signer3],  // Public keys hidden
  encryptionKey: vaultKey
});

console.log('Vault:', multisig.vaultAddress);

// Create transaction proposal
const proposal = await multisig.createProposal({
  instructions: [transferInstruction],
  description: 'Treasury payment'  // Encrypted
});

// Sign privately (other signers can't see who signed)
await multisig.signProposal(proposal.id, myWallet);

// Execute when threshold reached
await multisig.executeProposal(proposal.id);`
  },
  {
    language: "rust",
    label: "Rust",
    icon: "logos:rust",
    code: `use veil_protocol::multisig::{PrivateMultisig, ThresholdConfig};
use solana_sdk::pubkey::Pubkey;

// Create 2-of-3 private multisig
let multisig = PrivateMultisig::create(
    &connection,
    ThresholdConfig {
        threshold: 2,
        signers: vec![signer1, signer2, signer3],
    },
    &encryption_key,
).await?;

// Create proposal
let proposal = multisig.create_proposal(
    &[transfer_ix],
    "Treasury payment",
    &proposer,
).await?;

// Sign privately
multisig.sign_proposal(&proposal.id, &my_wallet).await?;

// Execute when threshold reached
multisig.execute_proposal(&proposal.id).await?;`
  },
  {
    language: "python",
    label: "Python",
    icon: "logos:python",
    code: `from veil_protocol.multisig import PrivateMultisig, ThresholdConfig
from solana.rpc.api import Client

connection = Client("https://api.devnet.solana.com")

# Create 2-of-3 private multisig
multisig = await PrivateMultisig.create(
    connection,
    threshold=2,
    signers=[signer1, signer2, signer3],
    encryption_key=vault_key
)

# Create proposal
proposal = await multisig.create_proposal(
    instructions=[transfer_ix],
    description="Treasury payment"
)

# Sign privately
await multisig.sign_proposal(proposal.id, my_wallet)

# Execute when threshold reached
await multisig.execute_proposal(proposal.id)`
  }
];

export function MultisigDemoModal({ isOpen, onClose }: MultisigDemoModalProps) {
  const [step, setStep] = useState(0);
  const [signatures, setSignatures] = useState<number[]>([]);
  const [executed, setExecuted] = useState(false);

  const signers = [
    { id: 1, name: "Alice", icon: "ph:user-circle" },
    { id: 2, name: "Bob", icon: "ph:user-circle" },
    { id: 3, name: "Carol", icon: "ph:user-circle" }
  ];

  const addSignature = async (signerId: number) => {
    if (signatures.includes(signerId)) return;
    
    setStep(1);
    await new Promise(r => setTimeout(r, 800));
    setSignatures(prev => [...prev, signerId]);
    
    if (signatures.length + 1 >= 2) {
      setStep(2);
      await new Promise(r => setTimeout(r, 1000));
      setExecuted(true);
      setStep(3);
    }
  };

  const reset = () => {
    setStep(0);
    setSignatures([]);
    setExecuted(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Icon icon="ph:users-three" className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Private Multisig Demo</h2>
                <p className="text-sm text-muted-foreground">2-of-3 threshold signing</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
              <Icon icon="ph:x" className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Interactive Demo */}
            <div className="glass-panel rounded-xl p-6">
              <h3 className="font-semibold mb-4">Try It: Collect Signatures</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click on signers to add their signature. Need 2 of 3 to execute.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                {signers.map(signer => (
                  <button
                    key={signer.id}
                    onClick={() => addSignature(signer.id)}
                    disabled={signatures.includes(signer.id) || executed}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      signatures.includes(signer.id)
                        ? "border-success bg-success/10"
                        : "border-border hover:border-primary/50"
                    } disabled:cursor-not-allowed`}
                  >
                    <Icon 
                      icon={signatures.includes(signer.id) ? "ph:check-circle-fill" : signer.icon} 
                      className={`w-10 h-10 mx-auto mb-2 ${signatures.includes(signer.id) ? "text-success" : "text-muted-foreground"}`} 
                    />
                    <span className="font-medium">{signer.name}</span>
                    <div className="text-xs text-muted-foreground mt-1">
                      {signatures.includes(signer.id) ? "Signed ✓" : "Click to sign"}
                    </div>
                  </button>
                ))}
              </div>

              {/* Progress */}
              <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Signatures: {signatures.length}/3</span>
                    <span>Threshold: 2</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(signatures.length / 2) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {executed && (
                <div className="mt-4 p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2">
                    <Icon icon="ph:check-circle-fill" className="w-5 h-5 text-success" />
                    <span className="font-medium text-success">Transaction Executed!</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Threshold reached. Transaction executed privately.
                  </p>
                </div>
              )}

              {executed && (
                <button onClick={reset} className="w-full mt-4 py-2 bg-secondary text-foreground rounded-lg">
                  Try Again
                </button>
              )}
            </div>

            {/* Code Examples */}
            <div>
              <h3 className="font-semibold mb-4">Integration Code</h3>
              <CodeBlock examples={codeExamples} title="Private Multisig" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

