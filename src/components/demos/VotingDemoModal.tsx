import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { CodeBlock } from "@/components/ui/CodeBlock";

interface VotingDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const codeExamples = [
  {
    language: "typescript",
    label: "TypeScript",
    icon: "logos:typescript-icon",
    code: `import { PrivateVotingClient, VoteChoice } from '@veil-protocol/sdk/voting';
import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const voting = new PrivateVotingClient(connection, encryptionKey);

// Create encrypted vote commitment
const { commitment, secret } = await voting.createVote(
  proposalId,
  VoteChoice.YES,  // Your choice - encrypted!
  signTransaction
);

console.log('Vote commitment:', commitment);
// Output: 0x8a3f...b2c1 (hash - choice hidden)

// After voting period: reveal your vote
await voting.revealVote(proposalId, secret, signTransaction);

// Get results (individual votes still hidden)
const results = await voting.getProposalResults(proposalId);
console.log('Yes:', results.yes, 'No:', results.no);`
  },
  {
    language: "rust",
    label: "Rust",
    icon: "logos:rust",
    code: `use veil_protocol::voting::{PrivateVotingClient, VoteChoice};
use solana_sdk::pubkey::Pubkey;

let voting = PrivateVotingClient::new(&connection, &encryption_key);

// Create encrypted vote
let (commitment, secret) = voting.create_vote(
    &proposal_id,
    VoteChoice::Yes,
    &signer,
).await?;

println!("Commitment: {}", commitment);

// Reveal phase
voting.reveal_vote(&proposal_id, &secret, &signer).await?;

// Get results
let results = voting.get_proposal_results(&proposal_id).await?;
println!("Yes: {}, No: {}", results.yes, results.no);`
  },
  {
    language: "python",
    label: "Python",
    icon: "logos:python",
    code: `from veil_protocol.voting import PrivateVotingClient, VoteChoice
from solana.rpc.api import Client

connection = Client("https://api.devnet.solana.com")
voting = PrivateVotingClient(connection, encryption_key)

# Create encrypted vote
commitment, secret = await voting.create_vote(
    proposal_id=proposal_id,
    choice=VoteChoice.YES,  # Encrypted!
    signer=wallet
)

print(f"Vote commitment: {commitment}")

# Reveal phase
await voting.reveal_vote(proposal_id, secret, wallet)

# Get results
results = await voting.get_proposal_results(proposal_id)
print(f"Yes: {results.yes}, No: {results.no}")`
  }
];

export function VotingDemoModal({ isOpen, onClose }: VotingDemoModalProps) {
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [voteChoice, setVoteChoice] = useState<"yes" | "no" | null>(null);
  const [commitment, setCommitment] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const runDemo = async () => {
    if (!voteChoice) return;
    setIsRunning(true);
    setStep(1);

    // Simulate commitment
    await new Promise(r => setTimeout(r, 1000));
    const mockCommitment = "0x" + Array.from({length: 16}, () => 
      Math.floor(Math.random() * 16).toString(16)).join('');
    setCommitment(mockCommitment);
    setStep(2);

    await new Promise(r => setTimeout(r, 1500));
    setStep(3);
    setRevealed(true);
    setIsRunning(false);
  };

  const reset = () => {
    setStep(0);
    setVoteChoice(null);
    setCommitment(null);
    setRevealed(false);
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
                <Icon icon="ph:check-square" className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Private Voting Demo</h2>
                <p className="text-sm text-muted-foreground">Encrypted on-chain voting</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
              <Icon icon="ph:x" className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Interactive Demo */}
            <div className="glass-panel rounded-xl p-6">
              <h3 className="font-semibold mb-4">Try It: Cast a Private Vote</h3>
              
              {step === 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Choose your vote (it will be encrypted):</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setVoteChoice("yes")}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        voteChoice === "yes" ? "border-success bg-success/10" : "border-border hover:border-success/50"
                      }`}
                    >
                      <Icon icon="ph:thumbs-up" className="w-8 h-8 text-success mx-auto mb-2" />
                      <span className="font-medium">Vote YES</span>
                    </button>
                    <button
                      onClick={() => setVoteChoice("no")}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                        voteChoice === "no" ? "border-destructive bg-destructive/10" : "border-border hover:border-destructive/50"
                      }`}
                    >
                      <Icon icon="ph:thumbs-down" className="w-8 h-8 text-destructive mx-auto mb-2" />
                      <span className="font-medium">Vote NO</span>
                    </button>
                  </div>
                  <button
                    onClick={runDemo}
                    disabled={!voteChoice}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
                  >
                    Submit Encrypted Vote
                  </button>
                </div>
              )}

              {step >= 1 && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${step >= 1 ? "bg-success/10 border border-success/20" : "bg-secondary"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon icon={step > 1 ? "ph:check-circle" : "ph:spinner"} className={`w-5 h-5 ${step > 1 ? "text-success" : "text-primary animate-spin"}`} />
                      <span className="font-medium">Creating commitment...</span>
                    </div>
                    {commitment && <code className="text-xs text-muted-foreground">Commitment: {commitment}</code>}
                  </div>

                  {step >= 2 && (
                    <div className={`p-4 rounded-lg ${step >= 2 ? "bg-success/10 border border-success/20" : "bg-secondary"}`}>
                      <div className="flex items-center gap-2">
                        <Icon icon={step > 2 ? "ph:check-circle" : "ph:spinner"} className={`w-5 h-5 ${step > 2 ? "text-success" : "text-primary animate-spin"}`} />
                        <span className="font-medium">Submitting to blockchain...</span>
                      </div>
                    </div>
                  )}

                  {step >= 3 && (
                    <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon icon="ph:shield-check" className="w-5 h-5 text-success" />
                        <span className="font-medium text-success">Vote Cast Successfully!</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your vote ({voteChoice?.toUpperCase()}) is encrypted on-chain. 
                        Nobody can see how you voted until reveal phase.
                      </p>
                    </div>
                  )}

                  {revealed && (
                    <button onClick={reset} className="w-full py-2 bg-secondary text-foreground rounded-lg">
                      Try Again
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Code Examples */}
            <div>
              <h3 className="font-semibold mb-4">Integration Code</h3>
              <CodeBlock examples={codeExamples} title="Private Voting" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

