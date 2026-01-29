/**
 * Compliance Demo Modal
 * 
 * Demonstrates institutional compliance features:
 * 1. Add audit key for regulator
 * 2. Store KYC claim privately
 * 3. Generate ZK-KYC proof
 * 4. Create compliance attestation
 */

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Icon } from "@iconify/react";
import { Modal, DemoStep, LoadingIndicator, ErrorMessage } from "../ui/Modal";
import { useAuth } from "@/contexts/AuthContext";

interface ComplianceDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DemoStatus = "idle" | "running" | "complete" | "error";
type StepStatus = "pending" | "active" | "complete" | "error";

export function ComplianceDemoModal({ isOpen, onClose }: ComplianceDemoModalProps) {
  const { publicKey } = useWallet();
  const { commitment } = useAuth();

  const [demoStatus, setDemoStatus] = useState<DemoStatus>("idle");
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [step1Status, setStep1Status] = useState<StepStatus>("pending");
  const [step2Status, setStep2Status] = useState<StepStatus>("pending");
  const [step3Status, setStep3Status] = useState<StepStatus>("pending");
  const [step4Status, setStep4Status] = useState<StepStatus>("pending");

  const [auditKeyId, setAuditKeyId] = useState<string | null>(null);
  const [kycClaimId, setKycClaimId] = useState<string | null>(null);
  const [zkProof, setZkProof] = useState<string | null>(null);
  const [attestation, setAttestation] = useState<string | null>(null);

  const resetDemo = () => {
    setDemoStatus("idle");
    setCurrentStep(1);
    setError(null);
    setStep1Status("pending");
    setStep2Status("pending");
    setStep3Status("pending");
    setStep4Status("pending");
    setAuditKeyId(null);
    setKycClaimId(null);
    setZkProof(null);
    setAttestation(null);
  };

  const runDemo = async () => {
    if (!publicKey) {
      setError("Please connect your Solana wallet first");
      return;
    }

    setDemoStatus("running");
    setError(null);

    try {
      // Step 1: Add audit key
      setCurrentStep(1);
      setStep1Status("active");
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const mockAuditKey = "AK_" + Date.now().toString(16).slice(-8);
      setAuditKeyId(mockAuditKey);
      setStep1Status("complete");

      // Step 2: Store KYC claim
      setCurrentStep(2);
      setStep2Status("active");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockKycClaim = "KYC_" + Array(6).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)).join('');
      setKycClaimId(mockKycClaim);
      setStep2Status("complete");

      // Step 3: Generate ZK-KYC proof
      setCurrentStep(3);
      setStep3Status("active");
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      const mockProof = "ZK_KYC_PROOF_" + Date.now().toString(16);
      setZkProof(mockProof);
      setStep3Status("complete");

      // Step 4: Create attestation
      setCurrentStep(4);
      setStep4Status("active");
      await new Promise(resolve => setTimeout(resolve, 1400));
      
      const mockAttestation = "ATT_" + Date.now().toString(36);
      setAttestation(mockAttestation);
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
    <Modal isOpen={isOpen} onClose={onClose} title="Institutional Compliance Demo (ZK-KYC)">
      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <Icon icon="ph:buildings" className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-primary mb-2">Privacy-Preserving Compliance</h3>
              <p className="text-sm text-muted-foreground">
                Meet regulatory requirements without exposing personal data.
                Audit keys enable selective disclosure to authorized parties only.
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
          <div className="flex items-center gap-2 text-sm">
            <Icon icon="ph:shield-checkered" className="w-4 h-4 text-warning" />
            <span className="text-warning font-medium">Institutional-Grade Privacy</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Enables TradFi institutions to use Solana while meeting SEC, MiCA, and other regulatory requirements.
          </p>
        </div>

        {demoStatus === "idle" && (
          <button
            onClick={runDemo}
            disabled={!publicKey}
            className="w-full px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Icon icon="ph:play" className="w-5 h-5" />
            Run Compliance Demo
          </button>
        )}

        {demoStatus !== "idle" && (
          <div className="space-y-4">
            <DemoStep
              step={1}
              totalSteps={4}
              currentStep={currentStep}
              title="Add Audit Key"
              description="Register regulator's decryption key with jurisdiction scope"
              status={step1Status}
            >
              {step1Status === "active" && <LoadingIndicator message="Registering audit authority..." />}
              {auditKeyId && (
                <div className="p-2 rounded bg-secondary text-xs font-mono">
                  Audit Key ID: {auditKeyId} (Scope: US jurisdiction)
                </div>
              )}
            </DemoStep>

            <DemoStep
              step={2}
              totalSteps={4}
              currentStep={currentStep}
              title="Store KYC Claim"
              description="Encrypt and store identity claims off-chain"
              status={step2Status}
            >
              {step2Status === "active" && <LoadingIndicator message="Encrypting KYC data..." />}
              {kycClaimId && (
                <div className="p-2 rounded bg-secondary text-xs font-mono">
                  KYC Claim: {kycClaimId} (age_over_18, not_sanctioned)
                </div>
              )}
            </DemoStep>

            <DemoStep
              step={3}
              totalSteps={4}
              currentStep={currentStep}
              title="Generate ZK-KYC Proof"
              description="Create zero-knowledge proof of compliance"
              status={step3Status}
            >
              {step3Status === "active" && <LoadingIndicator message="Generating ZK proof for KYC claims..." />}
              {zkProof && (
                <div className="p-2 rounded bg-secondary text-xs font-mono">
                  ZK Proof: {zkProof}
                </div>
              )}
            </DemoStep>

            <DemoStep
              step={4}
              totalSteps={4}
              currentStep={currentStep}
              title="Create Attestation"
              description="Issue on-chain compliance attestation"
              status={step4Status}
            >
              {step4Status === "active" && <LoadingIndicator message="Creating compliance attestation..." />}
              {attestation && (
                <div className="p-2 rounded bg-secondary text-xs font-mono">
                  Attestation: {attestation} (Valid 365 days)
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
                <span className="font-semibold text-success">Compliance Setup Complete!</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>You're now compliant without exposing personal data.</p>
                <div className="mt-3 p-3 rounded bg-secondary/50 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Personal Data:</span>
                    <span className="text-destructive font-mono">NEVER on-chain ✓</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">KYC Verified:</span>
                    <span className="text-success font-mono">age_over_18, not_sanctioned ✓</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Regulator Access:</span>
                    <span className="text-primary font-mono">Via audit key only ✓</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Public Visibility:</span>
                    <span className="text-success font-mono">Zero personal info ✓</span>
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

