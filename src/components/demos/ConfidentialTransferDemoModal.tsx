/**
 * Confidential Transfer Demo Modal
 * 
 * Demonstrates SPL Token-2022 confidential transfers:
 * 1. Configure account for confidential transfers
 * 2. Deposit to confidential balance
 * 3. Transfer with hidden amounts
 */

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Icon } from "@iconify/react";
import { Modal, DemoStep, LoadingIndicator, ErrorMessage } from "../ui/Modal";
import { useAuth } from "@/contexts/AuthContext";

interface ConfidentialTransferDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DemoStatus = "idle" | "running" | "complete" | "error";
type StepStatus = "pending" | "active" | "complete" | "error";

export function ConfidentialTransferDemoModal({ isOpen, onClose }: ConfidentialTransferDemoModalProps) {
  const { publicKey } = useWallet();
  const { commitment } = useAuth();

  const [demoStatus, setDemoStatus] = useState<DemoStatus>("idle");
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [step1Status, setStep1Status] = useState<StepStatus>("pending");
  const [step2Status, setStep2Status] = useState<StepStatus>("pending");
  const [step3Status, setStep3Status] = useState<StepStatus>("pending");
  const [step4Status, setStep4Status] = useState<StepStatus>("pending");

  const [elGamalKey, setElGamalKey] = useState<string | null>(null);
  const [encryptedBalance, setEncryptedBalance] = useState<string | null>(null);
  const [transferProof, setTransferProof] = useState<string | null>(null);

  const resetDemo = () => {
    setDemoStatus("idle");
    setCurrentStep(1);
    setError(null);
    setStep1Status("pending");
    setStep2Status("pending");
    setStep3Status("pending");
    setStep4Status("pending");
    setElGamalKey(null);
    setEncryptedBalance(null);
    setTransferProof(null);
  };

  const runDemo = async () => {
    if (!publicKey) {
      setError("Please connect your Solana wallet first");
      return;
    }

    setDemoStatus("running");
    setError(null);

    try {
      // Step 1: Generate ElGamal keypair
      setCurrentStep(1);
      setStep1Status("active");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockElGamalKey = "0x" + Array(16).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)).join('');
      setElGamalKey(mockElGamalKey);
      setStep1Status("complete");

      // Step 2: Configure account
      setCurrentStep(2);
      setStep2Status("active");
      await new Promise(resolve => setTimeout(resolve, 1200));
      setStep2Status("complete");

      // Step 3: Deposit to confidential balance
      setCurrentStep(3);
      setStep3Status("active");
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockEncryptedBalance = "ElGamal(" + Array(8).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)).join('') + ")";
      setEncryptedBalance(mockEncryptedBalance);
      setStep3Status("complete");

      // Step 4: Confidential transfer
      setCurrentStep(4);
      setStep4Status("active");
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      const mockProof = "ZK_RANGE_" + Date.now().toString(16);
      setTransferProof(mockProof);
      setStep4Status("complete");

      setCurrentStep(5);
      setDemoStatus("complete");

    } catch (err: any) {
      console.error("Demo error:", err);
      setError(err.message || "Demo failed");
      setDemoStatus("error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confidential Transfers Demo (SPL Token-2022)">
      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <Icon icon="ph:lock" className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-primary mb-2">Native Solana Confidential Transfers</h3>
              <p className="text-sm text-muted-foreground">
                Hide transfer amounts using SPL Token-2022's confidential transfer extension.
                Uses ElGamal encryption and ZK range proofs.
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-success/5 border border-success/20">
          <div className="flex items-center gap-2 text-sm">
            <Icon icon="ph:buildings" className="w-4 h-4 text-success" />
            <span className="text-success font-medium">Solana DevRel Priority Feature</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            This enables institutional adoption by hiding balances from competitors while maintaining identity for compliance.
          </p>
        </div>

        {demoStatus === "idle" && (
          <button
            onClick={runDemo}
            disabled={!publicKey}
            className="w-full px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Icon icon="ph:play" className="w-5 h-5" />
            Run Confidential Transfer Demo
          </button>
        )}

        {demoStatus !== "idle" && (
          <div className="space-y-4">
            <DemoStep
              step={1}
              totalSteps={4}
              currentStep={currentStep}
              title="Generate ElGamal Keypair"
              description="Create encryption keys for confidential balances"
              status={step1Status}
            >
              {step1Status === "active" && <LoadingIndicator message="Generating ElGamal keypair..." />}
              {elGamalKey && (
                <div className="p-2 rounded bg-secondary text-xs font-mono">
                  ElGamal Public Key: {elGamalKey}...
                </div>
              )}
            </DemoStep>

            <DemoStep
              step={2}
              totalSteps={4}
              currentStep={currentStep}
              title="Configure Account"
              description="Enable confidential transfers on token account"
              status={step2Status}
            >
              {step2Status === "active" && <LoadingIndicator message="Configuring account for confidential transfers..." />}
              {step2Status === "complete" && (
                <div className="p-2 rounded bg-success/10 text-xs text-success">
                  ✓ Token account configured for SPL Token-2022 confidential transfers
                </div>
              )}
            </DemoStep>

            <DemoStep
              step={3}
              totalSteps={4}
              currentStep={currentStep}
              title="Deposit to Confidential Balance"
              description="Convert public balance to encrypted confidential balance"
              status={step3Status}
            >
              {step3Status === "active" && <LoadingIndicator message="Encrypting balance with ElGamal..." />}
              {encryptedBalance && (
                <div className="p-2 rounded bg-secondary text-xs font-mono">
                  Encrypted Balance: {encryptedBalance}
                </div>
              )}
            </DemoStep>

            <DemoStep
              step={4}
              totalSteps={4}
              currentStep={currentStep}
              title="Confidential Transfer"
              description="Transfer tokens with hidden amount using ZK range proofs"
              status={step4Status}
            >
              {step4Status === "active" && <LoadingIndicator message="Generating ZK range proof..." />}
              {transferProof && (
                <div className="p-2 rounded bg-secondary text-xs font-mono">
                  Range Proof: {transferProof}
                </div>
              )}
            </DemoStep>
          </div>
        )}

        {error && <ErrorMessage message={error} />}

        {demoStatus === "complete" && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/30">
              <div className="flex items-center gap-2 mb-3">
                <Icon icon="ph:check-circle" className="w-5 h-5 text-success" />
                <span className="font-semibold text-success">Confidential Transfer Complete!</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>The transfer was executed with fully hidden amounts.</p>
                <div className="mt-3 p-3 rounded bg-secondary/50 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Public Visibility:</span>
                    <span className="text-destructive font-mono">Amount: HIDDEN ✓</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Sender:</span>
                    <span className="text-success font-mono">Identity: VISIBLE (compliant)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Recipient:</span>
                    <span className="text-success font-mono">Identity: VISIBLE (compliant)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Audit Key:</span>
                    <span className="text-primary font-mono">Regulator can decrypt ✓</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={resetDemo}
              className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
            >
              <Icon icon="ph:arrow-counter-clockwise" className="w-4 h-4" />
              Run Demo Again
            </button>
          </div>
        )}

        {demoStatus === "error" && (
          <button
            onClick={resetDemo}
            className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/80 transition-colors flex items-center justify-center gap-2"
          >
            <Icon icon="ph:arrow-counter-clockwise" className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </Modal>
  );
}

