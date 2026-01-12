/**
 * DeFi Demo Modal - Private Eligibility Verification
 *
 * Demonstrates privacy-preserving DeFi access control with:
 * 1. User wants to access high-value DeFi protocol
 * 2. Generate ZK proof of eligibility (balance ≥ threshold)
 * 3. Submit proof to blockchain
 * 4. Access granted without revealing exact balance
 *
 * Shows that protocols can verify requirements without seeing sensitive data.
 */

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Icon } from "@iconify/react";
import { Modal, DemoStep, TransactionResult, LoadingIndicator, ErrorMessage } from "../ui/Modal";
import { generateTransactionProof } from "@/lib/zkProof";
import { useAuth } from "@/contexts/AuthContext";
import {
  submitProof,
  getSolscanLink,
} from "@/lib/veilProgram";

interface DefiDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DemoStatus = "idle" | "running" | "complete" | "error";
type StepStatus = "pending" | "active" | "complete" | "error";

export function DefiDemoModal({ isOpen, onClose }: DefiDemoModalProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { commitment } = useAuth();

  const [demoStatus, setDemoStatus] = useState<DemoStatus>("idle");
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Step states
  const [step1Status, setStep1Status] = useState<StepStatus>("pending");
  const [step2Status, setStep2Status] = useState<StepStatus>("pending");
  const [step3Status, setStep3Status] = useState<StepStatus>("pending");
  const [step4Status, setStep4Status] = useState<StepStatus>("pending");

  // Results
  const [protocolRequirement, setProtocolRequirement] = useState<number>(10000);
  const [proofData, setProofData] = useState<any>(null);
  const [proofTx, setProofTx] = useState<string>("");
  const [accessGranted, setAccessGranted] = useState(false);

  const resetDemo = () => {
    setDemoStatus("idle");
    setCurrentStep(1);
    setError(null);
    setStep1Status("pending");
    setStep2Status("pending");
    setStep3Status("pending");
    setStep4Status("pending");
    setProofData(null);
    setProofTx("");
    setAccessGranted(false);
  };

  const runDemo = async () => {
    if (!publicKey || !signTransaction) {
      setError("Please connect your Solana wallet first");
      return;
    }

    if (!commitment) {
      setError("Please authenticate first to generate proofs");
      return;
    }

    setDemoStatus("running");
    setError(null);

    try {
      // Step 1: Protocol check requirement
      setCurrentStep(1);
      setStep1Status("active");
      await new Promise(resolve => setTimeout(resolve, 800));

      setProtocolRequirement(10000);
      setStep1Status("complete");
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 2: Generate eligibility proof
      setCurrentStep(2);
      setStep2Status("active");

      const eligibilityProof = await generateTransactionProof(
        commitment,
        "defi_eligibility",
        10000
      );

      if (!eligibilityProof.success || !eligibilityProof.proof) {
        throw new Error("Failed to generate eligibility proof: " + eligibilityProof.error);
      }

      setProofData(eligibilityProof.proof);
      setStep2Status("complete");
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 3: Submit proof to protocol
      setCurrentStep(3);
      setStep3Status("active");

      const proofBytes = new Uint8Array(
        Buffer.from(JSON.stringify(eligibilityProof.proof.proof))
      );
      const publicSignals = eligibilityProof.proof.publicSignals.map((signal: string) => {
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
      setStep3Status("complete");
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 4: Access granted
      setCurrentStep(4);
      setStep4Status("active");
      await new Promise(resolve => setTimeout(resolve, 600));

      setAccessGranted(true);
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
    <Modal isOpen={isOpen} onClose={onClose} title="Private DeFi Eligibility Demo">
      <div className="space-y-6">
        {/* Description */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <Icon icon="ph:info" className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-primary mb-2">What This Demo Shows:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• High-value DeFi protocols often require minimum balances</li>
                <li>• Generate ZK proof: "My balance ≥ 10,000 SOL" without revealing exact amount</li>
                <li>• Submit proof to blockchain for verification</li>
                <li>• Access granted - protocol never learns your actual balance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Demo Controls */}
        {demoStatus === "idle" && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary border border-border">
              <h4 className="font-semibold mb-2">Scenario:</h4>
              <p className="text-sm text-muted-foreground mb-3">
                You want to access a premium DeFi protocol that requires at least <span className="font-semibold text-foreground">10,000 SOL</span>.
                Instead of exposing your entire wallet balance, you'll prove eligibility privately.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Icon icon="ph:shield-check" className="w-4 h-4 text-success" />
                <span className="text-success">Your exact balance remains completely private</span>
              </div>
            </div>

            <button
              onClick={runDemo}
              disabled={!publicKey || !commitment}
              className="w-full px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon icon="ph:play" className="w-5 h-5" />
              Run DeFi Eligibility Demo
            </button>

            {!publicKey && (
              <p className="text-xs text-muted-foreground text-center">
                Please connect your Solana wallet to run the demo
              </p>
            )}

            {publicKey && !commitment && (
              <p className="text-xs text-muted-foreground text-center">
                Please <a href="/login" className="text-primary hover:underline">authenticate</a> first to generate proofs
              </p>
            )}
          </div>
        )}

        {/* Demo Steps */}
        {demoStatus !== "idle" && (
          <div className="space-y-4">
            {/* Step 1: Protocol Requirement */}
            <DemoStep
              step={1}
              totalSteps={4}
              currentStep={currentStep}
              title="Protocol Checks Requirements"
              description="DeFi protocol requires minimum balance verification"
              status={step1Status}
            >
              {protocolRequirement && (
                <div className="p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon icon="ph:coins" className="w-4 h-4 text-primary" />
                    <p className="text-xs font-medium">Requirement:</p>
                  </div>
                  <p className="text-sm text-foreground">
                    Minimum balance: <span className="font-semibold">{protocolRequirement.toLocaleString()} SOL</span>
                  </p>
                </div>
              )}
            </DemoStep>

            {/* Step 2: Generate Proof */}
            <DemoStep
              step={2}
              totalSteps={4}
              currentStep={currentStep}
              title="Generate Eligibility Proof"
              description="Create ZK proof that balance meets requirement"
              status={step2Status}
            >
              {step2Status === "active" && (
                <LoadingIndicator message="Generating ZK proof (Groth16)..." />
              )}
              {proofData && (
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                    <div className="flex items-start gap-2">
                      <Icon icon="ph:check-circle" className="w-4 h-4 text-success mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-success mb-1">Proof Generated:</p>
                        <p className="text-xs text-foreground">"Balance ≥ {protocolRequirement.toLocaleString()} SOL" proven</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary text-xs">
                    <div className="space-y-1">
                      <div>
                        <span className="text-muted-foreground">Protocol:</span>{" "}
                        <span className="text-foreground font-mono">{proofData.proof.protocol}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Curve:</span>{" "}
                        <span className="text-foreground font-mono">{proofData.proof.curve}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DemoStep>

            {/* Step 3: Submit to Protocol */}
            <DemoStep
              step={3}
              totalSteps={4}
              currentStep={currentStep}
              title="Submit Proof to Protocol"
              description="Protocol verifies proof on-chain"
              status={step3Status}
            >
              {step3Status === "active" && (
                <LoadingIndicator message="Waiting for wallet signature..." />
              )}
              {proofTx && (
                <TransactionResult signature={proofTx} label="Proof Submission" showPrivacy />
              )}
            </DemoStep>

            {/* Step 4: Access Granted */}
            <DemoStep
              step={4}
              totalSteps={4}
              currentStep={currentStep}
              title="Access Granted"
              description="You can now use the protocol"
              status={step4Status}
            >
              {accessGranted && (
                <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                  <div className="flex items-start gap-3">
                    <Icon icon="ph:check-circle" className="w-6 h-6 text-success" />
                    <div>
                      <h4 className="font-semibold text-success mb-2">Eligibility Verified!</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        The protocol confirmed you meet the requirements. You now have access to premium features.
                      </p>
                      <div className="p-2 rounded bg-primary/5 border border-primary/20">
                        <div className="flex items-start gap-2">
                          <Icon icon="ph:shield-check" className="w-3 h-3 text-primary mt-0.5" />
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-primary">Privacy Protected:</span> The protocol only knows you're eligible. Your exact balance could be 10,000 SOL or 1,000,000 SOL - they can't tell the difference.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
                  You've successfully proven DeFi eligibility without revealing your balance.
                  This prevents whale targeting, competitive analysis, and other privacy risks.
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
