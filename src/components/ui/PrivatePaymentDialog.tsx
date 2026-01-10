/**
 * Private Payment Dialog - Minimal UX for ShadowPay Integration
 *
 * Requirements:
 * - One private payment flow
 * - Clearly labeled as privacy feature
 * - Does NOT overload the UI
 * - Does NOT turn into a payments app
 */

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  sendPrivatePayment,
  validateRecipientAddress,
  validateAmount,
  type PrivatePaymentResult,
} from '@/lib/shadowpay';

interface PrivatePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentStage = 'input' | 'confirming' | 'submitting' | 'completed' | 'failed';

export function PrivatePaymentDialog({ isOpen, onClose }: PrivatePaymentDialogProps) {
  const { publicKey, signMessage, connected } = useWallet();
  const [stage, setStage] = useState<PaymentStage>('input');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<PrivatePaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!validateRecipientAddress(recipient)) {
      setError('Invalid recipient address');
      return;
    }

    const amountNum = parseFloat(amount);
    const amountValidation = validateAmount(amountNum);
    if (!amountValidation.valid) {
      setError(amountValidation.message || 'Invalid amount');
      return;
    }

    if (!publicKey || !signMessage) {
      setError('Wallet not connected');
      return;
    }

    // Confirmation stage
    setStage('confirming');
  };

  const handleConfirm = async () => {
    setStage('submitting');
    setError(null);

    try {
      // Demo mode simulation (for judges/testing without wallet)
      if (demoMode || !publicKey || !signMessage) {
        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simulate successful demo payment
        const demoResult: PrivatePaymentResult = {
          success: true,
          status: 'completed',
          message: 'Demo payment completed successfully (simulated)',
        };

        setResult(demoResult);
        setStage('completed');
        return;
      }

      // Real wallet payment
      const paymentResult = await sendPrivatePayment(
        {
          recipient,
          amount: parseFloat(amount),
          token: 'SOL',
        },
        publicKey,
        signMessage
      );

      setResult(paymentResult);

      if (paymentResult.success) {
        setStage('completed');
      } else {
        setStage('failed');
        setError(paymentResult.message);
      }
    } catch (err) {
      setStage('failed');
      setError(err instanceof Error ? err.message : 'Payment failed');
    }
  };

  const handleReset = () => {
    setStage('input');
    setRecipient('');
    setAmount('');
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md glass-panel rounded-2xl p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Icon icon="ph:shield-star" className="w-6 h-6 text-primary" />
                Send Privately
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Powered by ShadowPay
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Icon icon="ph:x" className="w-5 h-5" />
            </button>
          </div>

          {/* Privacy Notice with Technical Details */}
          <div className="mb-6 space-y-3">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-start gap-2">
                <Icon icon="ph:info" className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <strong className="text-primary">Privacy Feature:</strong> Amount privacy
                  via ShadowPay. Your identity and recovery data remain private.
                </div>
              </div>
            </div>

            <details className="group">
              <summary className="cursor-pointer p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium flex items-center gap-2">
                    <Icon icon="ph:question" className="w-4 h-4" />
                    How does amount hiding work?
                  </span>
                  <Icon
                    icon="ph:caret-down"
                    className="w-4 h-4 transition-transform group-open:rotate-180"
                  />
                </div>
              </summary>
              <div className="mt-3 p-4 rounded-lg bg-secondary/30 border border-border space-y-3">
                <div>
                  <h4 className="text-xs font-semibold mb-1 flex items-center gap-2">
                    <Icon icon="ph:lock" className="w-3 h-3 text-success" />
                    Pedersen Commitments
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Your payment amount is cryptographically hidden using Pedersen commitments
                    (C = v·G + r·H). Even blockchain explorers cannot determine the value transferred.
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold mb-1 flex items-center gap-2">
                    <Icon icon="ph:shield-check" className="w-3 h-3 text-primary" />
                    Range Proofs (Bulletproofs)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Zero-knowledge proofs verify the amount is valid (non-negative, within range)
                    without revealing the actual value.
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold mb-1 flex items-center gap-2">
                    <Icon icon="ph:equals" className="w-3 h-3 text-warning" />
                    Balance Conservation
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Homomorphic properties ensure input amounts equal output amounts (no value
                    created or destroyed) while keeping amounts encrypted.
                  </p>
                </div>
                <a
                  href="/shadowpay-explained"
                  target="_blank"
                  className="text-xs text-primary hover:underline flex items-center gap-1 mt-2"
                >
                  Learn more about the technology
                  <Icon icon="ph:arrow-square-out" className="w-3 h-3" />
                </a>
              </div>
            </details>
          </div>

          {/* Demo Mode Notice (when wallet not connected) */}
          {!connected && !demoMode && (
            <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-start gap-3 mb-3">
                <Icon icon="ph:play-circle" className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Demo Mode Available</h3>
                  <p className="text-xs text-muted-foreground">
                    Try the ShadowPay flow without connecting a wallet (for hackathon judges)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDemoMode(true)}
                className="w-full py-2.5 bg-success text-white font-medium rounded-lg hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
              >
                <Icon icon="ph:play-circle" className="w-5 h-5" />
                Try Demo Mode
              </button>
            </div>
          )}

          {/* Demo Mode Badge */}
          {demoMode && !connected && (
            <div className="mb-6 p-3 rounded-lg bg-success/10 border border-success/20">
              <p className="text-xs text-success flex items-center gap-2">
                <Icon icon="ph:play-circle" className="w-4 h-4" />
                <strong>Demo Mode Active:</strong> Payment will be simulated (no real transaction)
              </p>
            </div>
          )}

          {/* Input Stage */}
          {stage === 'input' && (connected || demoMode) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter Solana address"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:border-primary transition-colors font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount (SOL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-xs text-destructive flex items-center gap-2">
                    <Icon icon="ph:warning" className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Icon icon="ph:arrow-right" className="w-5 h-5" />
                Review Payment
              </button>
            </form>
          )}

          {/* Confirmation Stage */}
          {stage === 'confirming' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary border border-border space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Recipient</span>
                  <span className="font-mono text-xs">
                    {recipient.slice(0, 8)}...{recipient.slice(-6)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">{amount} SOL</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Privacy</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
                    Amount Hidden
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-xs text-warning flex items-start gap-2">
                  <Icon icon="ph:warning" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Confirm payment details. This action cannot be undone.</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStage('input')}
                  className="flex-1 py-3 border border-border font-medium rounded-lg hover:bg-secondary transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon icon="ph:check" className="w-5 h-5" />
                  Confirm
                </button>
              </div>
            </div>
          )}

          {/* Submitting Stage */}
          {stage === 'submitting' && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon icon="ph:spinner" className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h3 className="font-semibold mb-2">Processing Payment...</h3>
              <p className="text-sm text-muted-foreground">
                ShadowPay is handling your private transfer
              </p>
            </div>
          )}

          {/* Completed Stage */}
          {stage === 'completed' && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Icon icon="ph:check-circle" className="w-8 h-8 text-success" />
              </div>
              <h3 className="font-semibold mb-2">
                {demoMode ? 'Demo Payment Completed' : 'Private Payment Completed'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {result?.message || 'Transfer completed with privacy guarantees'}
              </p>

              {demoMode && (
                <div className="mb-6 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary flex items-center gap-2 justify-center">
                    <Icon icon="ph:info" className="w-4 h-4" />
                    This was a simulated demo. In production, ShadowPay would execute the real private transfer.
                  </p>
                </div>
              )}

              <div className="mb-6 p-4 rounded-lg bg-success/5 border border-success/20 text-left">
                <h4 className="text-xs font-semibold text-success mb-2 flex items-center gap-2">
                  <Icon icon="ph:shield-check" className="w-4 h-4" />
                  Privacy Preserved {demoMode && '(Demo)'}
                </h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Icon icon="ph:check" className="w-3 h-3 text-success" />
                    Amount hidden on-chain
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon="ph:check" className="w-3 h-3 text-success" />
                    Identity not leaked
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon="ph:check" className="w-3 h-3 text-success" />
                    No wallet linkage exposed
                  </li>
                </ul>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {/* Failed Stage */}
          {stage === 'failed' && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Icon icon="ph:x-circle" className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="font-semibold mb-2">Payment Failed</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {error || 'Unable to complete payment'}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 border border-border font-medium rounded-lg hover:bg-secondary transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 bg-secondary font-medium rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
