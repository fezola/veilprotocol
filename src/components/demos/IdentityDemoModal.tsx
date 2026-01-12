/**
 * Identity Demo Modal - Interactive ZK Authentication
 *
 * Demonstrates privacy-preserving identity verification with:
 * 1. Generate commitment hash from credentials
 * 2. Submit commitment to Solana devnet
 * 3. Generate ZK proof of identity
 * 4. Submit proof for verification
 *
 * Shows real transactions, Solscan links, and privacy guarantees.
 */

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Icon } from "@iconify/react";
import { Modal, DemoStep, TransactionResult, LoadingIndicator, ErrorMessage } from "../ui/Modal";
import { generateAuthProof } from "@/lib/zkProof";
import {
  initializeCommitment,
  submitProof,
  commitmentToBytes,
  getSolscanAccountLink,
  getWalletAccountPDA,
} from "@/lib/veilProgram";

interface IdentityDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DemoStatus = "idle" | "running" | "complete" | "error";
type StepStatus = "pending" | "active" | "complete" | "error";

export function IdentityDemoModal({ isOpen, onClose }: IdentityDemoModalProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [demoStatus, setDemoStatus] = useState<DemoStatus>("idle");
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Step states
  const [step1Status, setStep1Status] = useState<StepStatus>("pending");
  const [step2Status, setStep2Status] = useState<StepStatus>("pending");
  const [step3Status, setStep3Status] = useState<StepStatus>("pending");
  const [step4Status, setStep4Status] = useState<StepStatus>("pending");

  // Results
  const [commitment, setCommitment] = useState<string>("");
  const [commitmentTx, setCommitmentTx] = useState<string>("");
  const [walletPDA, setWalletPDA] = useState<string>("");
  const [proofData, setProofData] = useState<any>(null);
  const [proofTx, setProofTx] = useState<string>("");

  // Demo input
  const [email, setEmail] = useState("demo@veil.app");
  const [password, setPassword] = useState("secure-password-123");

  const resetDemo = () => {
    setDemoStatus("idle");
    setCurrentStep(1);
    setError(null);
    setStep1Status("pending");
    setStep2Status("pending");
    setStep3Status("pending");
    setStep4Status("pending");
    setCommitment("");
    setCommitmentTx("");
    setWalletPDA("");
    setProofData(null);
    setProofTx("");
  };

  const runDemo = async () => {
    if (!publicKey || !signTransaction) {
      setError("Please connect your Solana wallet first");
      return;
    }

    setDemoStatus("running");
    setError(null);

    try {
      // Step 1: Generate commitment hash
      setCurrentStep(1);
      setStep1Status("active");

      const authProof = await generateAuthProof(email, password);
      if (!authProof.success || !authProof.proof) {
        throw new Error("Failed to generate commitment: " + authProof.error);
      }

      setCommitment(authProof.proof.commitment);
      setStep1Status("complete");
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Submit commitment to blockchain
      setCurrentStep(2);
      setStep2Status("active");

      const commitmentBytes = commitmentToBytes(authProof.proof.commitment);
      const result = await initializeCommitment(
        connection,
        publicKey,
        commitmentBytes,
        signTransaction
      );

      setCommitmentTx(result.signature);
      setWalletPDA(result.walletPDA.toBase58());
      setStep2Status("complete");
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Generate ZK proof
      setCurrentStep(3);
      setStep3Status("active");

      // Proof already generated in step 1
      setProofData(authProof.proof);
      setStep3Status("complete");
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 4: Submit proof for verification
      setCurrentStep(4);
      setStep4Status("active");

      // Prepare proof data for on-chain submission
      const proofBytes = new Uint8Array(
        Buffer.from(JSON.stringify(authProof.proof.proof))
      );
      const publicSignals = authProof.proof.publicSignals.map((signal: string) => {
        const bytes = new Uint8Array(32);
        const hex = signal.replace(/^0x/, '').padStart(64, '0');
        for (let i = 0; i < 32; i++) {
          bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        return bytes;
      });

      const proofSig = await submitProof(
        connection,
        publicKey,
        proofBytes,
        publicSignals,
        signTransaction
      );

      setProofTx(proofSig);
      setStep4Status("complete");
      setCurrentStep(5);
      setDemoStatus("complete");

    } catch (err: any) {
      console.error("Demo error:", err);
      setError(err.message || "Demo failed");
      setDemoStatus("error");

      // Mark current step as error
      if (currentStep === 1) setStep1Status("error");
      else if (currentStep === 2) setStep2Status("error");
      else if (currentStep === 3) setStep3Status("error");
      else if (currentStep === 4) setStep4Status("error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Private Identity Verification Demo">
      <div className="space-y-6">
        {/* Description */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <Icon icon="ph:info" className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-primary mb-2">What This Demo Shows:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create a privacy-preserving identity commitment on Solana devnet</li>
                <li>• Generate real Groth16 ZK proof of authentication</li>
                <li>• Submit proof to on-chain verifier</li>
                <li>• Verify that only commitment hash appears on-chain (not your credentials)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Demo Controls */}
        {demoStatus === "idle" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email (for demo)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password (for demo)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none"
                placeholder="Your password"
              />
            </div>

            <button
              onClick={runDemo}
              disabled={!publicKey || !email || !password}
              className="w-full px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon icon="ph:play" className="w-5 h-5" />
              Run Identity Demo on Devnet
            </button>

            {!publicKey && (
              <p className="text-xs text-muted-foreground text-center">
                Please connect your Solana wallet to run the demo
              </p>
            )}
          </div>
        )}

        {/* Demo Steps */}
        {demoStatus !== "idle" && (
          <div className="space-y-4">
            {/* Step 1: Generate Commitment */}
            <DemoStep
              step={1}
              totalSteps={4}
              currentStep={currentStep}
              title="Generate Privacy Commitment"
              description="Create cryptographic commitment from your credentials"
              status={step1Status}
            >
              {commitment && (
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Commitment Hash:</p>
                  <p className="text-xs font-mono text-foreground break-all">{commitment}</p>
                  <div className="mt-2 flex items-start gap-2">
                    <Icon icon="ph:shield-check" className="w-3 h-3 text-success mt-0.5" />
                    <p className="text-xs text-success">Your credentials are never exposed</p>
                  </div>
                </div>
              )}
            </DemoStep>

            {/* Step 2: Submit to Blockchain */}
            <DemoStep
              step={2}
              totalSteps={4}
              currentStep={currentStep}
              title="Submit to Solana Devnet"
              description="Store commitment on-chain (identity remains private)"
              status={step2Status}
            >
              {step2Status === "active" && (
                <LoadingIndicator message="Waiting for wallet signature..." />
              )}
              {commitmentTx && (
                <>
                  <TransactionResult signature={commitmentTx} label="Commitment" showPrivacy />
                  {walletPDA && (
                    <div className="mt-2">
                      <a
                        href={getSolscanAccountLink(walletPDA)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Icon icon="ph:arrow-square-out" className="w-3 h-3" />
                        View Wallet Account on Solscan
                      </a>
                    </div>
                  )}
                </>
              )}
            </DemoStep>

            {/* Step 3: Generate ZK Proof */}
            <DemoStep
              step={3}
              totalSteps={4}
              currentStep={currentStep}
              title="Generate Zero-Knowledge Proof"
              description="Create Groth16 proof that you know the credentials"
              status={step3Status}
            >
              {proofData && (
                <div className="p-3 rounded-lg bg-secondary">
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Protocol:</span>{" "}
                      <span className="text-foreground font-mono">{proofData.proof.protocol}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Curve:</span>{" "}
                      <span className="text-foreground font-mono">{proofData.proof.curve}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Public Signals:</span>{" "}
                      <span className="text-foreground">{proofData.publicSignals.length} signals</span>
                    </div>
                  </div>
                </div>
              )}
            </DemoStep>

            {/* Step 4: Verify Proof */}
            <DemoStep
              step={4}
              totalSteps={4}
              currentStep={currentStep}
              title="Verify Proof On-Chain"
              description="Submit proof to Veil Protocol for verification"
              status={step4Status}
            >
              {step4Status === "active" && (
                <LoadingIndicator message="Submitting proof to blockchain..." />
              )}
              {proofTx && (
                <TransactionResult signature={proofTx} label="Proof Verification" showPrivacy />
              )}
            </DemoStep>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <ErrorMessage error={error} onRetry={resetDemo} />
        )}

        {/* Success Message */}
        {demoStatus === "complete" && (
          <div className="p-4 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-start gap-3">
              <Icon icon="ph:check-circle" className="w-6 h-6 text-success flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-success mb-2">Demo Complete!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You've successfully created a privacy-preserving identity on Solana devnet.
                  Check Solscan to verify that only commitment hashes are visible—your actual credentials remain completely private.
                </p>
                <button
                  onClick={resetDemo}
                  className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
                >
                  Run Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
