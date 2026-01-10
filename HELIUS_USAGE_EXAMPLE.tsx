/**
 * HELIUS INTEGRATION - Usage Example
 *
 * This file shows how to integrate Helius monitoring into the Recovery flow
 * Copy this code into RecoveryExecute.tsx to enable privacy-safe monitoring
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRecoveryMonitor } from "@/hooks/useHeliusMonitor";
import {
  RecoveryStatusBanner,
  HeliusPrivacyBadge,
  PrivateStatusIndicator,
} from "@/components/ui/PrivateStatusIndicator";

export default function RecoveryExecuteWithHelius() {
  const { veilWallet, login } = useAuth();
  const [isRecoveryActive, setIsRecoveryActive] = useState(false);

  // ✅ STEP 1: Use Helius monitoring hook
  const {
    recoveryDetected,
    statusMessage,
    isMonitoring,
    error,
    checkStatus,
  } = useRecoveryMonitor(veilWallet, isRecoveryActive);

  // ✅ STEP 2: Show privacy-aware status indicator
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-2xl mx-auto">
        {/* Helius Privacy Badge */}
        <div className="flex justify-center mb-6">
          <HeliusPrivacyBadge />
        </div>

        {/* Recovery Status Banner (Privacy-Safe) */}
        <RecoveryStatusBanner
          isMonitoring={isMonitoring}
          recoveryDetected={recoveryDetected}
          statusMessage={statusMessage}
          error={error}
        />

        {/* Recovery Form */}
        <form onSubmit={handleRecoverySubmit}>
          <input
            type="text"
            placeholder="Enter recovery key"
            className="w-full px-4 py-3 rounded-lg border border-border"
          />

          <button
            type="submit"
            className="w-full mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg"
          >
            Submit Recovery Key
          </button>
        </form>

        {/* Privacy Explanation */}
        <div className="mt-8 p-4 rounded-lg bg-secondary/30 border border-border">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Icon icon="ph:info" className="w-4 h-4" />
            Privacy-Safe Monitoring
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            Recovery status is monitored privately via Helius infrastructure:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li className="flex items-start gap-2">
              <Icon icon="ph:check" className="w-3.5 h-3.5 text-success mt-0.5" />
              <span>No public RPC polling</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="ph:check" className="w-3.5 h-3.5 text-success mt-0.5" />
              <span>Webhook-based detection (no client loops)</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="ph:check" className="w-3.5 h-3.5 text-success mt-0.5" />
              <span>No metadata or timing leaks</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon icon="ph:check" className="w-3.5 h-3.5 text-success mt-0.5" />
              <span>Guardian identities remain private</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  async function handleRecoverySubmit(e: React.FormEvent) {
    e.preventDefault();

    // ✅ STEP 3: Activate monitoring when recovery starts
    setIsRecoveryActive(true);

    // ... existing recovery logic ...

    // ✅ STEP 4: Check status via Helius (no polling)
    const completed = await checkStatus();

    if (completed) {
      // Recovery detected via private infrastructure
      console.log('✓ Recovery completed - detected via Helius');
      setIsRecoveryActive(false);
    }
  }
}

/**
 * ALTERNATIVE: Manual Status Check
 *
 * If you prefer manual status checking instead of automatic monitoring
 */
function ManualStatusCheckExample() {
  const { veilWallet } = useAuth();
  const [status, setStatus] = useState<string>('idle');

  const checkRecoveryManually = async () => {
    setStatus('checking');

    // Use Helius to check status (privacy-safe)
    const { checkRecoveryStatus } = await import('@/lib/helius');
    const completed = await checkRecoveryStatus(veilWallet!);

    if (completed) {
      setStatus('completed');
    } else {
      setStatus('pending');
    }
  };

  return (
    <div>
      <button onClick={checkRecoveryManually}>
        Check Recovery Status (Private)
      </button>

      {status === 'completed' && (
        <PrivateStatusIndicator
          status="completed"
          message="Recovery completed"
        />
      )}

      {status === 'checking' && (
        <PrivateStatusIndicator
          status="monitoring"
          message="Checking via private infrastructure"
        />
      )}
    </div>
  );
}

/**
 * INTEGRATION CHECKLIST
 *
 * ✅ 1. Configure .env with Helius credentials
 * ✅ 2. Import useRecoveryMonitor hook
 * ✅ 3. Add RecoveryStatusBanner component
 * ✅ 4. Start monitoring when recovery begins
 * ✅ 5. Show privacy-aware status messages
 * ✅ 6. Stop monitoring when complete
 *
 * PRIVACY GUARANTEES:
 * ✅ No public RPC polling
 * ✅ No explorer links
 * ✅ No timing metadata leaks
 * ✅ No guardian exposure
 * ✅ Webhook-based detection
 */
