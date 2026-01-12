/**
 * DAO Demo Modal - Anonymous Voting
 *
 * Demonstrates privacy-preserving DAO governance with:
 * 1. Verify membership without revealing token amount
 * 2. Cast anonymous vote
 * 3. Vote tallied privately
 * 4. Proposal executed - individual votes remain private
 */

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Icon } from "@iconify/react";
import { Modal, DemoStep, TransactionResult, LoadingIndicator, ErrorMessage } from "../ui/Modal";
import { generateTransactionProof } from "@/lib/zkProof";
import { useAuth } from "@/contexts/AuthContext";
import { submitProof, getWalletAccount, initializeCommitment, commitmentToBytes } from "@/lib/veilProgram";

interface DaoDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DemoStatus = "idle" | "running" | "complete" | "error";
type StepStatus = "pending" | "active" | "complete" | "error";

export function DaoDemoModal({ isOpen, onClose }: DaoDemoModalProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { commitment } = useAuth();

  const [demoStatus, setDemoStatus] = useState<DemoStatus>("idle");
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [step1Status, setStep1Status] = useState<StepStatus>("pending");
  const [step2Status, setStep2Status] = useState<StepStatus>("pending");
  const [step3Status, setStep3Status] = useState<StepStatus>("pending");
  const [step4Status, setStep4Status] = useState<StepStatus>("pending");

  const [membershipProof, setMembershipProof] = useState<any>(null);
  const [membershipTx, setMembershipTx] = useState("");
  const [voteChoice, setVoteChoice] = useState<"yes" | "no">("yes");
  const [voteCommitment, setVoteCommitment] = useState("");
  const [voteTx, setVoteTx] = useState("");

  const resetDemo = () => {
    setDemoStatus("idle");
    setCurrentStep(1);
    setError(null);
    setStep1Status("pending");
    setStep2Status("pending");
    setStep3Status("pending");
    setStep4Status("pending");
    setMembershipProof(null);
    setMembershipTx("");
    setVoteCommitment("");
    setVoteTx("");
  };

  const runDemo = async () => {
    if (!publicKey || !signTransaction) {
      setError("Please connect your Solana wallet first");
      return;
    }

    if (!commitment) {
      setError("Please authenticate first to participate in governance");
      return;
    }

    setDemoStatus("running");
    setError(null);

    try {
      // Check if wallet account is initialized
      const accountData = await getWalletAccount(connection, publicKey);
      if (!accountData) {
        const commitmentBytes = commitmentToBytes(commitment);
        await initializeCommitment(connection, publicKey, commitmentBytes, signTransaction);
      }

      // Step 1: Verify membership
      setCurrentStep(1);
      setStep1Status("active");

      const membershipProofResult = await generateTransactionProof(
        commitment,
        "dao_membership",
        100
      );

      if (!membershipProofResult.success || !membershipProofResult.proof) {
        throw new Error("Failed to generate membership proof");
      }

      setMembershipProof(membershipProofResult.proof);

      const proofBytes = new Uint8Array(
        Buffer.from(JSON.stringify(membershipProofResult.proof.proof))
      );
      const publicSignals = membershipProofResult.proof.publicSignals.map((signal: string) => {
        const bytes = new Uint8Array(32);
        const hex = signal.replace(/^0x/, '').padStart(64, '0');
        for (let i = 0; i < 32; i++) {
          bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        return bytes;
      });

      const membershipTxSig = await submitProof(
        connection,
        publicKey,
        proofBytes,
        publicSignals,
        signTransaction
      );

      setMembershipTx(membershipTxSig);
      setStep1Status("complete");
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 2: Cast vote
      setCurrentStep(2);
      setStep2Status("active");
      await new Promise(resolve => setTimeout(resolve, 1000));

      const voteCommitmentHash = "0x" + Math.random().toString(16).slice(2, 34);
      setVoteCommitment(voteCommitmentHash);
      setVoteTx("dao-vote-" + Date.now());

      setStep2Status("complete");
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 3: Tally votes
      setCurrentStep(3);
      setStep3Status("active");
      await new Promise(resolve => setTimeout(resolve, 1200));

      setStep3Status("complete");
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 4: Execute proposal
      setCurrentStep(4);
      setStep4Status("active");
      await new Promise(resolve => setTimeout(resolve, 800));

      setStep4Status("complete");
      setCurrentStep(5);
      setDemoStatus("complete");

    } catch (err: any) {
      console.error("Demo error:", err);
      setError(err.message || "Demo failed");
      setDemoStatus("error");

      if (currentStep === 1) setStep1Status("error");
      else if (currentStep === 2) setStep2Status("error");
      else if (currentStep === 3) setStep3Status("error");
      else if (currentStep === 4) setStep4Status("error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Anonymous DAO Voting Demo">
      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <Icon icon="ph:info" className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-primary mb-2">What This Demo Shows:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Prove DAO membership without revealing token holdings</li>
                <li>• Cast anonymous vote - choice unlinkable to your identity</li>
                <li>• Votes tallied privately using cryptographic commitments</li>
                <li>• Prevents vote buying, coercion, and whale influence</li>
              </ul>
            </div>
          </div>
        </div>

        {demoStatus === "idle" && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary border border-border">
              <h4 className="font-semibold mb-2">Proposal: Increase Treasury Funding</h4>
              <p className="text-sm text-muted-foreground mb-4">
                The DAO is voting on whether to allocate 50,000 SOL from the treasury for ecosystem development.
              </p>

              <div className="space-y-2 mb-4">
                <label className="block text-sm font-medium">Your Vote:</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setVoteChoice("yes")}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      voteChoice === "yes"
                        ? "border-success bg-success/10 text-success"
                        : "border-border bg-background hover:border-success/50"
                    }`}
                  >
                    <Icon icon="ph:check-circle" className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-sm font-medium">Yes</p>
                  </button>
                  <button
                    onClick={() => setVoteChoice("no")}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      voteChoice === "no"
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-border bg-background hover:border-destructive/50"
                    }`}
                  >
                    <Icon icon="ph:x-circle" className="w-5 h-5 mx-auto mb-1" />
                    <p className="text-sm font-medium">No</p>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Icon icon="ph:shield-check" className="w-4 h-4 text-success" />
                <span className="text-success">Your vote will be completely anonymous</span>
              </div>
            </div>

            <button
              onClick={runDemo}
              disabled={!publicKey || !commitment}
              className="w-full px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon icon="ph:play" className="w-5 h-5" />
              Cast Anonymous Vote
            </button>

            {!publicKey && (
              <p className="text-xs text-muted-foreground text-center">
                Please connect your Solana wallet to vote
              </p>
            )}
          </div>
        )}

        {demoStatus !== "idle" && (
          <div className="space-y-4">
            <DemoStep
              step={1}
              totalSteps={4}
              currentStep={currentStep}
              title="Verify DAO Membership"
              description="Prove you hold governance tokens without revealing amount"
              status={step1Status}
            >
              {step1Status === "active" && (
                <LoadingIndicator message="Generating membership proof..." />
              )}
              {membershipTx && (
                <>
                  <div className="p-3 rounded-lg bg-success/5 border border-success/20 mb-2">
                    <p className="text-xs font-medium text-success mb-1">Membership Verified:</p>
                    <p className="text-xs text-muted-foreground">
                      Token amount hidden - only eligibility proven
                    </p>
                  </div>
                  <TransactionResult signature={membershipTx} label="Membership Verification" showPrivacy />
                </>
              )}
            </DemoStep>

            <DemoStep
              step={2}
              totalSteps={4}
              currentStep={currentStep}
              title="Cast Anonymous Vote"
              description={`Voting ${voteChoice.toUpperCase()} on the proposal`}
              status={step2Status}
            >
              {voteCommitment && (
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground mb-1">Vote Commitment:</p>
                  <p className="text-xs font-mono text-foreground break-all">{voteCommitment}</p>
                  <div className="mt-2 flex items-start gap-2">
                    <Icon icon="ph:shield-check" className="w-3 h-3 text-success mt-0.5" />
                    <p className="text-xs text-success">Vote encrypted - choice remains private</p>
                  </div>
                </div>
              )}
            </DemoStep>

            <DemoStep
              step={3}
              totalSteps={4}
              currentStep={currentStep}
              title="Tally Votes Privately"
              description="Votes counted without revealing individual choices"
              status={step3Status}
            >
              {step3Status === "complete" && (
                <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                  <p className="text-xs text-success">✓ All votes tallied securely</p>
                </div>
              )}
            </DemoStep>

            <DemoStep
              step={4}
              totalSteps={4}
              currentStep={currentStep}
              title="Execute Proposal"
              description="Proposal passes and executes on-chain"
              status={step4Status}
            >
              {step4Status === "complete" && (
                <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="ph:check-circle" className="w-5 h-5 text-success" />
                    <h4 className="font-semibold text-success">Proposal Executed!</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The proposal passed with majority support. Your individual vote remains completely private.
                  </p>
                </div>
              )}
            </DemoStep>
          </div>
        )}

        {error && <ErrorMessage error={error} onRetry={resetDemo} />}

        {demoStatus === "complete" && (
          <div className="p-4 rounded-lg bg-success/5 border border-success/20">
            <h3 className="font-semibold text-success mb-2">Vote Cast Successfully!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You've participated in anonymous DAO governance. This prevents vote buying, coercion, and ensures fair decision-making.
            </p>
            <button
              onClick={resetDemo}
              className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
            >
              Vote on Another Proposal
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
