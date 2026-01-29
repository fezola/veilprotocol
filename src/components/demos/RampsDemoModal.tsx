/**
 * Anonymous Ramps Demo Modal
 * 
 * Demonstrates privacy-preserving on/off ramps:
 * 1. Create stealth deposit address
 * 2. Create P2P sell order
 * 3. Match with buyer
 * 4. Complete escrow trade
 */

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Icon } from "@iconify/react";
import { Modal, DemoStep, LoadingIndicator, ErrorMessage } from "../ui/Modal";
import { useAuth } from "@/contexts/AuthContext";

interface RampsDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DemoStatus = "idle" | "running" | "complete" | "error";
type StepStatus = "pending" | "active" | "complete" | "error";

export function RampsDemoModal({ isOpen, onClose }: RampsDemoModalProps) {
  const { publicKey } = useWallet();
  const { commitment } = useAuth();

  const [demoStatus, setDemoStatus] = useState<DemoStatus>("idle");
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [step1Status, setStep1Status] = useState<StepStatus>("pending");
  const [step2Status, setStep2Status] = useState<StepStatus>("pending");
  const [step3Status, setStep3Status] = useState<StepStatus>("pending");
  const [step4Status, setStep4Status] = useState<StepStatus>("pending");

  const [stealthAddress, setStealthAddress] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [escrowId, setEscrowId] = useState<string | null>(null);
  const [tradeComplete, setTradeComplete] = useState(false);

  const resetDemo = () => {
    setDemoStatus("idle");
    setCurrentStep(1);
    setError(null);
    setStep1Status("pending");
    setStep2Status("pending");
    setStep3Status("pending");
    setStep4Status("pending");
    setStealthAddress(null);
    setOrderId(null);
    setEscrowId(null);
    setTradeComplete(false);
  };

  const runDemo = async () => {
    if (!publicKey) {
      setError("Please connect your Solana wallet first");
      return;
    }

    setDemoStatus("running");
    setError(null);

    try {
      // Step 1: Create stealth deposit address
      setCurrentStep(1);
      setStep1Status("active");
      await new Promise(resolve => setTimeout(resolve, 1400));
      
      const mockStealth = "STEALTH_" + Array(8).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)).join('');
      setStealthAddress(mockStealth);
      setStep1Status("complete");

      // Step 2: Create sell order
      setCurrentStep(2);
      setStep2Status("active");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockOrderId = "ORD_" + Date.now().toString(36);
      setOrderId(mockOrderId);
      setStep2Status("complete");

      // Step 3: Match with buyer
      setCurrentStep(3);
      setStep3Status("active");
      await new Promise(resolve => setTimeout(resolve, 1600));
      
      const mockEscrow = "ESC_" + Date.now().toString(16).slice(-8);
      setEscrowId(mockEscrow);
      setStep3Status("complete");

      // Step 4: Complete trade
      setCurrentStep(4);
      setStep4Status("active");
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setTradeComplete(true);
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
    <Modal isOpen={isOpen} onClose={onClose} title="Anonymous On/Off Ramps Demo">
      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <Icon icon="ph:bank" className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-primary mb-2">Privacy-Preserving Fiat Ramps</h3>
              <p className="text-sm text-muted-foreground">
                Buy and sell crypto with fiat while maintaining privacy.
                Uses stealth addresses and P2P escrow for anonymity.
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-success/5 border border-success/20">
          <div className="flex items-center gap-2 text-sm">
            <Icon icon="ph:eye-slash" className="w-4 h-4 text-success" />
            <span className="text-success font-medium">DKSAP Stealth Addresses</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Dual-Key Stealth Address Protocol ensures deposits are unlinkable to your main wallet.
          </p>
        </div>

        {demoStatus === "idle" && (
          <button
            onClick={runDemo}
            disabled={!publicKey}
            className="w-full px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Icon icon="ph:play" className="w-5 h-5" />
            Run Anonymous Ramp Demo
          </button>
        )}

        {demoStatus !== "idle" && (
          <div className="space-y-4">
            <DemoStep
              step={1}
              totalSteps={4}
              currentStep={currentStep}
              title="Create Stealth Deposit Address"
              description="Generate one-time address using DKSAP protocol"
              status={step1Status}
            >
              {step1Status === "active" && <LoadingIndicator message="Generating stealth address..." />}
              {stealthAddress && (
                <div className="p-2 rounded bg-secondary text-xs font-mono">
                  Stealth Address: {stealthAddress}...
                </div>
              )}
            </DemoStep>

            <DemoStep
              step={2}
              totalSteps={4}
              currentStep={currentStep}
              title="Create P2P Sell Order"
              description="List 100 USDC for sale at market rate"
              status={step2Status}
            >
              {step2Status === "active" && <LoadingIndicator message="Creating sell order..." />}
              {orderId && (
                <div className="p-2 rounded bg-secondary text-xs font-mono">
                  Order ID: {orderId} (100 USDC @ $0.9995)
                </div>
              )}
            </DemoStep>

            <DemoStep
              step={3}
              totalSteps={4}
              currentStep={currentStep}
              title="Match with Buyer"
              description="Buyer accepts order, funds locked in escrow"
              status={step3Status}
            >
              {step3Status === "active" && <LoadingIndicator message="Matching order and locking escrow..." />}
              {escrowId && (
                <div className="p-2 rounded bg-secondary text-xs font-mono">
                  Escrow: {escrowId} (Payment method: Venmo)
                </div>
              )}
            </DemoStep>

            <DemoStep
              step={4}
              totalSteps={4}
              currentStep={currentStep}
              title="Complete Trade"
              description="Confirm fiat received, release crypto from escrow"
              status={step4Status}
            >
              {step4Status === "active" && <LoadingIndicator message="Releasing escrow..." />}
              {tradeComplete && (
                <div className="p-2 rounded bg-success/10 text-xs text-success">
                  ✓ Trade completed! USDC released to buyer's stealth address
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
                <span className="font-semibold text-success">Anonymous Trade Complete!</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>You've completed a P2P trade with full privacy.</p>
                <div className="mt-3 p-3 rounded bg-secondary/50 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Your Identity:</span>
                    <span className="text-destructive font-mono">HIDDEN from buyer ✓</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Deposit Address:</span>
                    <span className="text-success font-mono">One-time stealth ✓</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">On-chain Link:</span>
                    <span className="text-success font-mono">Unlinkable to main wallet ✓</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Trade Amount:</span>
                    <span className="text-primary font-mono">100 USDC → $99.95 ✓</span>
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

