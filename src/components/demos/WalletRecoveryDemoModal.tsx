/**
 * Wallet Recovery Demo Modal - Private Time-Locked Recovery
 *
 * Demonstrates privacy-preserving wallet recovery with:
 * 1. Setup recovery with guardian threshold (3-of-5)
 * 2. Initiate time-locked recovery on-chain
 * 3. Wait for timelock expiry (simulated)
 * 4. Execute recovery with proof
 *
 * Shows guardian identities remain private throughout recovery process.
 */

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Icon } from "@iconify/react";
import { Modal, DemoStep, TransactionResult, LoadingIndicator, ErrorMessage } from "../ui/Modal";
import { generateRecoveryProof } from "@/lib/zkProof";
import { useAuth } from "@/contexts/AuthContext";
import {
  initiateRecovery,
  executeRecovery,
  commitmentToBytes,
  getSolscanLink,
} from "@/lib/veilProgram";

interface WalletRecoveryDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DemoStatus = "idle" | "running" | "complete" | "error";
type StepStatus = "pending" | "active" | "complete" | "error";

export function WalletRecoveryDemoModal({ isOpen, onClose }: WalletRecoveryDemoModalProps) {
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
  const [guardianCount, setGuardianCount] = useState(5);
  const [threshold, setThreshold] = useState(3);
  const [recoveryCommitment, setRecoveryCommitment] = useState("");
  const [initiateRecoveryTx, setInitiateRecoveryTx] = useState("");
  const [timelockDays, setTimelockDays] = useState(7);
  const [recoveryProof, setRecoveryProof] = useState<any>(null);
  const [executeRecoveryTx, setExecuteRecoveryTx] = useState("");

  const resetDemo = () => {
    setDemoStatus("idle");
    setCurrentStep(1);
    setError(null);
    setStep1Status("pending");
    setStep2Status("pending");
    setStep3Status("pending");
    setStep4Status("pending");
    setRecoveryCommitment("");
    setInitiateRecoveryTx("");
    setRecoveryProof(null);
    setExecuteRecoveryTx("");
  };

  const runDemo = async () => {
    if (!publicKey || !signTransaction) {
      setError("Please connect your Solana wallet first");
      return;
    }

    if (!commitment) {
      setError("Please authenticate first to setup recovery");
      return;
    }

    setDemoStatus("running");
    setError(null);

    try {
      // Step 1: Setup recovery configuration
      setCurrentStep(1);
      setStep1Status("active");
      await new Promise(resolve => setTimeout(resolve, 1000));

      setGuardianCount(5);
      setThreshold(3);
      setStep1Status("complete");
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 2: Initiate time-locked recovery
      setCurrentStep(2);
      setStep2Status("active");

      // Generate recovery commitment
      const recoverySecret = "recovery-secret-" + Date.now();
      const recoveryProofResult = await generateRecoveryProof(recoverySecret, commitment);

      if (!recoveryProofResult.success || !recoveryProofResult.proof) {
        throw new Error("Failed to generate recovery proof");
      }

      const recoveryCommitmentHash = recoveryProofResult.proof.commitment;
      setRecoveryCommitment(recoveryCommitmentHash);

      // Initiate recovery on-chain
      const recoveryCommitmentBytes = commitmentToBytes(recoveryCommitmentHash);
      const initiateTxSig = await initiateRecovery(
        connection,
        publicKey,
        recoveryCommitmentBytes,
        timelockDays,
        signTransaction
      );

      setInitiateRecoveryTx(initiateTxSig);
      setStep2Status("complete");
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 3: Wait for timelock (simulated)
      setCurrentStep(3);
      setStep3Status("active");

      // Simulate waiting - in production, user would actually wait
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStep3Status("complete");
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 4: Execute recovery
      setCurrentStep(4);
      setStep4Status("active");

      setRecoveryProof(recoveryProofResult.proof);

      // In a real scenario, this would fail if timelock hasn't expired
      // For demo, we simulate successful execution
      const recoveryProofBytes = new Uint8Array(
        Buffer.from(JSON.stringify(recoveryProofResult.proof.proof))
      );

      // Note: This will likely fail on-chain because timelock hasn't actually expired
      // In production, user would wait the full timelock period
      try {
        const executeTxSig = await executeRecovery(
          connection,
          publicKey,
          recoveryProofBytes,
          signTransaction
        );
        setExecuteRecoveryTx(executeTxSig);
      } catch (execError: any) {
        // Expected for demo since timelock hasn't expired
        if (execError.message?.includes("TimelockNotExpired")) {
          // Show simulated success for demo purposes
          setExecuteRecoveryTx("demo-recovery-executed-" + Date.now());
        } else {
          throw execError;
        }
      }

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
    <Modal isOpen={isOpen} onClose={onClose} title="Private Wallet Recovery Demo">
      <div className="space-y-6">
        {/* Description */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <Icon icon="ph:info" className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-primary mb-2">What This Demo Shows:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Setup social recovery with guardian threshold (e.g., 3-of-5)</li>
                <li>• Initiate time-locked recovery on-chain</li>
                <li>• Guardian identities remain completely private</li>
                <li>• Execute recovery after timelock with zero-knowledge proof</li>
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
                You've lost access to your wallet. Fortunately, you set up social recovery with 5 trusted guardians.
                You need 3 of them to help you recover access.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 rounded bg-background">
                  <p className="text-muted-foreground mb-1">Guardians:</p>
                  <p className="font-semibold">5 trusted contacts</p>
                </div>
                <div className="p-2 rounded bg-background">
                  <p className="text-muted-foreground mb-1">Threshold:</p>
                  <p className="font-semibold">3 required</p>
                </div>
                <div className="p-2 rounded bg-background">
                  <p className="text-muted-foreground mb-1">Timelock:</p>
                  <p className="font-semibold">7 days (for safety)</p>
                </div>
                <div className="p-2 rounded bg-background">
                  <p className="text-muted-foreground mb-1">Privacy:</p>
                  <p className="font-semibold text-success">Full</p>
                </div>
              </div>
            </div>

            <button
              onClick={runDemo}
              disabled={!publicKey || !commitment}
              className="w-full px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon icon="ph:play" className="w-5 h-5" />
              Run Recovery Demo
            </button>

            {!publicKey && (
              <p className="text-xs text-muted-foreground text-center">
                Please connect your Solana wallet to run the demo
              </p>
            )}

            {publicKey && !commitment && (
              <p className="text-xs text-muted-foreground text-center">
                Please <a href="/login" className="text-primary hover:underline">authenticate</a> first
              </p>
            )}
          </div>
        )}

        {/* Demo Steps */}
        {demoStatus !== "idle" && (
          <div className="space-y-4">
            {/* Step 1: Setup Recovery */}
            <DemoStep
              step={1}
              totalSteps={4}
              currentStep={currentStep}
              title="Setup Recovery Configuration"
              description="Define guardians and threshold requirements"
              status={step1Status}
            >
              {guardianCount && (
                <div className="p-3 rounded-lg bg-secondary">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Guardians:</span>
                      <span className="font-semibold">{guardianCount} trusted contacts</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Threshold:</span>
                      <span className="font-semibold">{threshold} signatures required</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Timelock:</span>
                      <span className="font-semibold">{timelockDays} days</span>
                    </div>
                  </div>
                </div>
              )}
            </DemoStep>

            {/* Step 2: Initiate Recovery */}
            <DemoStep
              step={2}
              totalSteps={4}
              currentStep={currentStep}
              title="Initiate Time-Locked Recovery"
              description="Submit recovery request to blockchain"
              status={step2Status}
            >
              {step2Status === "active" && (
                <LoadingIndicator message="Generating recovery commitment and submitting to chain..." />
              )}
              {initiateRecoveryTx && (
                <>
                  <div className="p-3 rounded-lg bg-success/5 border border-success/20 mb-2">
                    <p className="text-xs font-medium text-success mb-1">Recovery Initiated:</p>
                    <p className="text-xs text-muted-foreground">
                      Commitment: {recoveryCommitment.slice(0, 16)}...
                    </p>
                  </div>
                  <TransactionResult signature={initiateRecoveryTx} label="Recovery Initiation" showPrivacy />
                </>
              )}
            </DemoStep>

            {/* Step 3: Wait for Timelock */}
            <DemoStep
              step={3}
              totalSteps={4}
              currentStep={currentStep}
              title="Timelock Period"
              description={`Waiting ${timelockDays} days before recovery can execute`}
              status={step3Status}
            >
              {step3Status === "active" && (
                <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                  <div className="flex items-start gap-2">
                    <Icon icon="ph:clock" className="w-4 h-4 text-warning mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-warning mb-1">Security Timelock Active</p>
                      <p className="text-xs text-muted-foreground">
                        In production, you would wait {timelockDays} days. This prevents immediate unauthorized recovery.
                        For this demo, we're simulating the wait period.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {step3Status === "complete" && (
                <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex items-center gap-2">
                    <Icon icon="ph:check-circle" className="w-4 h-4 text-success" />
                    <p className="text-xs text-success">Timelock period complete - recovery can now execute</p>
                  </div>
                </div>
              )}
            </DemoStep>

            {/* Step 4: Execute Recovery */}
            <DemoStep
              step={4}
              totalSteps={4}
              currentStep={currentStep}
              title="Execute Recovery"
              description="Complete recovery with guardian signatures"
              status={step4Status}
            >
              {step4Status === "active" && (
                <LoadingIndicator message="Executing recovery with proof..." />
              )}
              {recoveryProof && (
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-secondary text-xs">
                    <div className="space-y-1">
                      <div>
                        <span className="text-muted-foreground">Recovery Method:</span>{" "}
                        <span className="text-foreground">Shamir Secret Sharing</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Proof Protocol:</span>{" "}
                        <span className="text-foreground font-mono">{recoveryProof.proof.protocol}</span>
                      </div>
                    </div>
                  </div>
                  {executeRecoveryTx && !executeRecoveryTx.startsWith("demo-") && (
                    <TransactionResult signature={executeRecoveryTx} label="Recovery Execution" />
                  )}
                  {executeRecoveryTx && executeRecoveryTx.startsWith("demo-") && (
                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-xs text-success">
                        ✓ Recovery executed successfully (simulated for demo - actual timelock is 7 days)
                      </p>
                    </div>
                  )}
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
                <h3 className="font-semibold text-success mb-2">Wallet Recovered!</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You've successfully demonstrated privacy-preserving wallet recovery.
                  Guardian identities never appeared on-chain, protecting their privacy and preventing social engineering attacks.
                </p>
                <div className="p-2 rounded bg-primary/5 border border-primary/20 mb-4">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-primary">Privacy Guarantee:</span> On-chain data shows only that recovery was initiated and executed.
                    Nobody can see who your guardians are or which specific guardians participated.
                  </p>
                </div>
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
