import { Header } from "@/components/layout/Header";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { VotingDemoModal } from "@/components/demos/VotingDemoModal";

const codeExamples = [
  {
    language: "typescript",
    label: "TypeScript",
    icon: "logos:typescript-icon",
    code: `import { PrivateVotingClient, VoteChoice } from '@veil-protocol/sdk/voting';

const voting = new PrivateVotingClient(connection, encryptionKey);

// Create a private vote (encrypted)
const { commitment, secret } = await voting.createVote(
  proposalId,
  VoteChoice.YES,  // Your choice - encrypted!
  signTransaction
);

// Later: Reveal your vote (proves it matches commitment)
await voting.revealVote(proposalId, secret, signTransaction);

// Check results (individual votes still hidden)
const results = await voting.getProposalResults(proposalId);
console.log('Yes:', results.yes, 'No:', results.no);`
  },
  {
    language: "rust",
    label: "Rust",
    icon: "logos:rust",
    code: `use veil_protocol::voting::{PrivateVotingClient, VoteChoice};

let voting = PrivateVotingClient::new(&connection, &encryption_key);

// Create a private vote (encrypted)
let (commitment, secret) = voting.create_vote(
    &proposal_id,
    VoteChoice::Yes,
    &signer,
).await?;

// Reveal your vote
voting.reveal_vote(&proposal_id, &secret, &signer).await?;

// Check results
let results = voting.get_proposal_results(&proposal_id).await?;
println!("Yes: {}, No: {}", results.yes, results.no);`
  },
  {
    language: "python",
    label: "Python",
    icon: "logos:python",
    code: `from veil_protocol.voting import PrivateVotingClient, VoteChoice

voting = PrivateVotingClient(connection, encryption_key)

# Create a private vote (encrypted)
commitment, secret = await voting.create_vote(
    proposal_id,
    VoteChoice.YES,
    sign_transaction
)

# Reveal your vote
await voting.reveal_vote(proposal_id, secret, sign_transaction)

# Check results
results = await voting.get_proposal_results(proposal_id)
print(f"Yes: {results.yes}, No: {results.no}")`
  }
];

export default function FeatureVoting() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Icon icon="ph:check-square" className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Private Voting</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encrypted on-chain voting. Your vote is verified but your choice stays hidden.
            </p>
          </motion.div>

          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Why Private Voting Matters</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Icon icon="ph:warning" className="w-5 h-5 text-destructive mt-1" />
                  <div>
                    <h3 className="font-medium text-destructive">The Problem</h3>
                    <p className="text-sm text-muted-foreground">Public votes expose wallet holders to coercion, bribery, and social pressure. DAOs become vulnerable to vote buying.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Icon icon="ph:shield-check" className="w-5 h-5 text-success mt-1" />
                  <div>
                    <h3 className="font-medium text-success">The Solution</h3>
                    <p className="text-sm text-muted-foreground">Zero-knowledge proofs verify you voted without revealing your choice. True democratic privacy on-chain.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <div className="space-y-6">
              {[
                { step: "1", title: "Commit Phase", desc: "Voters encrypt their choice with a secret and submit a commitment hash. Nobody can see the vote." },
                { step: "2", title: "Reveal Phase", desc: "After voting ends, voters reveal their encrypted choice. ZK proof verifies it matches the commitment." },
                { step: "3", title: "Tally", desc: "Votes are tallied. Individual choices remain hidden—only the final count is public." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">SDK Usage</h2>
            <CodeBlock examples={codeExamples} title="Private Voting" />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: "ph:eye-slash", title: "Hidden Choices", desc: "Your vote is encrypted" },
              { icon: "ph:seal-check", title: "Verified Valid", desc: "ZK proves vote is legitimate" },
              { icon: "ph:prohibit", title: "No Coercion", desc: "Can't prove how you voted" },
            ].map((item, i) => (
              <div key={i} className="glass-panel rounded-xl p-6 text-center">
                <Icon icon={item.icon} className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowDemo(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
            >
              Try Private Voting Demo <Icon icon="ph:play" />
            </button>
          </div>
        </div>
      </main>

      <VotingDemoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />
    </div>
  );
}

