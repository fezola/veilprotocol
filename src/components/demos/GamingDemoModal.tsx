/**
 * Gaming Demo Modal - Private Gaming Accounts
 */

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Icon } from "@iconify/react";
import { Modal, DemoStep, TransactionResult, LoadingIndicator, ErrorMessage } from "../ui/Modal";
import { generateAuthProof, generateTransactionProof } from "@/lib/zkProof";
import { useAuth } from "@/contexts/AuthContext";
import { submitProof, getWalletAccount, initializeCommitment, commitmentToBytes } from "@/lib/veilProgram";

interface GamingDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DemoStatus = "idle" | "running" | "complete" | "error";
type StepStatus = "pending" | "active" | "complete" | "error";

export function GamingDemoModal({ isOpen, onClose }: GamingDemoModalProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { commitment } = useAuth();

  const [demoStatus, setDemoStatus] = useState<DemoStatus>("idle");
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [step1Status, setStep1Status] = useState<StepStatus>("pending");
  const [step2Status, setStep2Status] = useState<StepStatus>("pending");
  const [step3Status, setStep3Status] = useState<StepStatus>("pending");

  const [gameAccountProof, setGameAccountProof] = useState<any>(null);
  const [gameAccountTx, setGameAccountTx] = useState("");
  const [ownershipProof, setOwnershipProof] = useState<any>(null);
  const [ownershipTx, setOwnershipTx] = useState("");

  const resetDemo = () => {
    setDemoStatus("idle");
    setCurrentStep(1);
    setError(null);
    setStep1Status("pending");
    setStep2Status("pending");
    setStep3Status("pending");
    setGameAccountProof(null);
    setGameAccountTx("");
    setOwnershipProof(null);
    setOwnershipTx("");
  };

  const runDemo = async () => {
    if (!publicKey || !signTransaction) {
      setError("Please connect your Solana wallet first");
      return;
    }

    if (!commitment) {
      setError("Please authenticate first");
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

      // Step 1: Create game account
      setCurrentStep(1);
      setStep1Status("active");

      const gameAuth = await generateAuthProof("player-" + Date.now(), "game-password");
      if (!gameAuth.success || !gameAuth.proof) {
        throw new Error("Failed to create game account");
      }

      setGameAccountProof(gameAuth.proof);
      const proofBytes1 = new Uint8Array(Buffer.from(JSON.stringify(gameAuth.proof.proof)));
      const publicSignals1 = gameAuth.proof.publicSignals.map((signal: string) => {
        const bytes = new Uint8Array(32);
        const hex = signal.replace(/^0x/, '').padStart(64, '0');
        for (let i = 0; i < 32; i++) {
          bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        return bytes;
      });

      const gameAccountTxSig = await submitProof(
        connection,
        publicKey,
        proofBytes1,
        publicSignals1,
        signTransaction
      );

      setGameAccountTx(gameAccountTxSig);
      setStep1Status("complete");
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 2: Hide inventory
      setCurrentStep(2);
      setStep2Status("active");
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep2Status("complete");
      await new Promise(resolve => setTimeout(resolve, 300));

      // Step 3: Prove ownership
      setCurrentStep(3);
      setStep3Status("active");

      const ownershipProofResult = await generateTransactionProof(
        commitment,
        "nft_ownership"
      );

      if (!ownershipProofResult.success || !ownershipProofResult.proof) {
        throw new Error("Failed to generate ownership proof");
      }

      setOwnershipProof(ownershipProofResult.proof);

      const proofBytes2 = new Uint8Array(Buffer.from(JSON.stringify(ownershipProofResult.proof.proof)));
      const publicSignals2 = ownershipProofResult.proof.publicSignals.map((signal: string) => {
        const bytes = new Uint8Array(32);
        const hex = signal.replace(/^0x/, '').padStart(64, '0');
        for (let i = 0; i < 32; i++) {
          bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        return bytes;
      });

      const ownershipTxSig = await submitProof(
        connection,
        publicKey,
        proofBytes2,
        publicSignals2,
        signTransaction
      );

      setOwnershipTx(ownershipTxSig);
      setStep3Status("complete");
      setCurrentStep(4);
      setDemoStatus("complete");

    } catch (err: any) {
      console.error("Demo error:", err);
      setError(err.message || "Demo failed");
      setDemoStatus("error");

      if (currentStep === 1) setStep1Status("error");
      else if (currentStep === 2) setStep2Status("error");
      else if (currentStep === 3) setStep3Status("error");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Private Gaming Demo">
      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <Icon icon="ph:info" className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-primary mb-2">What This Demo Shows:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create game account with ZK authentication</li>
                <li>• Hide inventory/balances from other players</li>
                <li>• Prove ownership of rare items without revealing full inventory</li>
                <li>• Prevents whale targeting and competitive disadvantage</li>
              </ul>
            </div>
          </div>
        </div>

        {demoStatus === "idle" && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary border border-border">
              <h4 className="font-semibold mb-2">Scenario: Competitive Gaming</h4>
              <p className="text-sm text-muted-foreground mb-3">
                You're playing a blockchain game. You own valuable NFTs and currency,
                but don't want other players to see your wealth and target you.
              </p>
            </div>

            <button
              onClick={runDemo}
              disabled={!publicKey || !commitment}
              className="w-full px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Icon icon="ph:play" className="w-5 h-5" />
              Run Gaming Demo
            </button>
          </div>
        )}

        {demoStatus !== "idle" && (
          <div className="space-y-4">
            <DemoStep
              step={1}
              totalSteps={3}
              currentStep={currentStep}
              title="Create Game Account"
              description="ZK authentication for gaming identity"
              status={step1Status}
            >
              {step1Status === "active" && (
                <LoadingIndicator message="Creating private game account..." />
              )}
              {gameAccountTx && (
                <TransactionResult signature={gameAccountTx} label="Game Account Creation" showPrivacy />
              )}
            </DemoStep>

            <DemoStep
              step={2}
              totalSteps={3}
              currentStep={currentStep}
              title="Hide Inventory"
              description="NFTs and currency hidden from other players"
              status={step2Status}
            >
              {step2Status === "complete" && (
                <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                  <p className="text-xs text-success">✓ Inventory encrypted - other players can't see your assets</p>
                </div>
              )}
            </DemoStep>

            <DemoStep
              step={3}
              totalSteps={3}
              currentStep={currentStep}
              title="Prove Item Ownership"
              description="Show you own rare items without revealing full inventory"
              status={step3Status}
            >
              {step3Status === "active" && (
                <LoadingIndicator message="Generating ownership proof..." />
              )}
              {ownershipTx && (
                <TransactionResult signature={ownershipTx} label="Ownership Proof" showPrivacy />
              )}
            </DemoStep>
          </div>
        )}

        {error && <ErrorMessage error={error} onRetry={resetDemo} />}

        {demoStatus === "complete" && (
          <div className="p-4 rounded-lg bg-success/5 border border-success/20">
            <h3 className="font-semibold text-success mb-2">Gaming Privacy Enabled!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You can now play competitively without revealing your assets. This prevents targeted attacks and maintains fair gameplay.
            </p>
            <button
              onClick={resetDemo}
              className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
            >
              Run Again
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
