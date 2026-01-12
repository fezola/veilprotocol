/**
 * Modal Component for Interactive Demos
 *
 * Provides a consistent UI for all privacy demo interactions with:
 * - Step-by-step progress
 * - Transaction status
 * - Solscan links
 * - Real-time updates
 */

import { ReactNode, useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel rounded-2xl border-2 border-border max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-2xl font-bold">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center"
                >
                  <Icon icon="ph:x" className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Step indicator component for demo modals
interface DemoStepProps {
  step: number;
  totalSteps: number;
  currentStep: number;
  title: string;
  description: string;
  status: "pending" | "active" | "complete" | "error";
  children?: ReactNode;
}

export function DemoStep({
  step,
  totalSteps,
  currentStep,
  title,
  description,
  status,
  children,
}: DemoStepProps) {
  const isActive = step === currentStep;
  const isComplete = step < currentStep || status === "complete";
  const isError = status === "error";

  return (
    <div
      className={`relative p-4 rounded-lg border-2 transition-all ${
        isActive
          ? "border-primary/40 bg-primary/5"
          : isComplete
          ? "border-success/20 bg-success/5"
          : isError
          ? "border-destructive/20 bg-destructive/5"
          : "border-border/50 opacity-60"
      }`}
    >
      {/* Step number indicator */}
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-semibold ${
            isActive
              ? "bg-primary/20 text-primary animate-pulse"
              : isComplete
              ? "bg-success/20 text-success"
              : isError
              ? "bg-destructive/20 text-destructive"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {isComplete ? (
            <Icon icon="ph:check" className="w-5 h-5" />
          ) : isError ? (
            <Icon icon="ph:warning" className="w-5 h-5" />
          ) : (
            step
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{title}</h3>
            {isActive && (
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium animate-pulse">
                In Progress
              </span>
            )}
            {isComplete && !isError && (
              <span className="px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                Complete
              </span>
            )}
            {isError && (
              <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                Error
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>

          {/* Step content (results, links, etc.) */}
          {children && (
            <div className="mt-3">
              {children}
            </div>
          )}
        </div>
      </div>

      {/* Connecting line to next step */}
      {step < totalSteps && (
        <div
          className={`absolute left-8 top-14 w-0.5 h-8 ${
            isComplete ? "bg-success/30" : "bg-border"
          }`}
        />
      )}
    </div>
  );
}

// Transaction result component
interface TransactionResultProps {
  signature: string;
  label?: string;
  showPrivacy?: boolean;
}

export function TransactionResult({ signature, label = "Transaction", showPrivacy = false }: TransactionResultProps) {
  const solscanLink = `https://solscan.io/tx/${signature}?cluster=devnet`;

  return (
    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
      <div className="flex items-start gap-2 mb-2">
        <Icon icon="ph:check-circle" className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-medium text-success mb-1">{label} Confirmed:</p>
          <p className="text-xs font-mono text-foreground break-all">{signature}</p>
        </div>
      </div>

      <a
        href={solscanLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <Icon icon="ph:arrow-square-out" className="w-3 h-3" />
        View on Solscan (Devnet)
      </a>

      {showPrivacy && (
        <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-2">
            <Icon icon="ph:shield-check" className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-primary">Privacy Protected:</span> Only the commitment hash is visible on-chain. Your identity, balance, and sensitive data remain private.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Loading indicator component
export function LoadingIndicator({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-foreground">{message}</p>
    </div>
  );
}

// Error message component
export function ErrorMessage({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
      <div className="flex items-start gap-2 mb-2">
        <Icon icon="ph:warning" className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-medium text-destructive mb-1">Error:</p>
          <p className="text-xs text-foreground">{error}</p>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <Icon icon="ph:arrows-clockwise" className="w-3 h-3" />
          Retry
        </button>
      )}
    </div>
  );
}
