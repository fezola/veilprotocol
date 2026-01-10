/**
 * PrivateStatusIndicator Component
 *
 * PURPOSE: Show transaction/recovery status WITHOUT exposing sensitive metadata
 *
 * PRIVACY PRINCIPLES:
 * - No raw transaction hashes by default
 * - No explorer links by default
 * - No timing metadata that reveals patterns
 * - Human-readable messages only
 *
 * UX EMPHASIS:
 * "Observed privately via secure infrastructure"
 */

import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PrivateStatusIndicatorProps {
  status: 'idle' | 'monitoring' | 'detected' | 'completed' | 'failed';
  message: string;
  showDetails?: boolean;
  className?: string;
}

export function PrivateStatusIndicator({
  status,
  message,
  showDetails = false,
  className,
}: PrivateStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'monitoring':
        return {
          icon: 'ph:eye',
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          borderColor: 'border-primary/20',
          pulseColor: 'bg-primary',
        };
      case 'detected':
        return {
          icon: 'ph:check-circle',
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
          pulseColor: 'bg-success',
        };
      case 'completed':
        return {
          icon: 'ph:seal-check',
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
          pulseColor: 'bg-success',
        };
      case 'failed':
        return {
          icon: 'ph:warning-circle',
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/20',
          pulseColor: 'bg-destructive',
        };
      default:
        return {
          icon: 'ph:circle-dashed',
          color: 'text-muted-foreground',
          bgColor: 'bg-secondary',
          borderColor: 'border-border',
          pulseColor: 'bg-muted-foreground',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "glass-panel rounded-xl p-4 border",
          config.borderColor,
          config.bgColor,
          className
        )}
      >
        <div className="flex items-start gap-4">
          {/* Status Icon with Pulse */}
          <div className="relative flex-shrink-0">
            <Icon icon={config.icon} className={cn("w-6 h-6", config.color)} />
            {status === 'monitoring' && (
              <span className="flex h-3 w-3 absolute -top-1 -right-1">
                <span className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  config.pulseColor
                )} />
                <span className={cn(
                  "relative inline-flex rounded-full h-3 w-3",
                  config.pulseColor
                )} />
              </span>
            )}
          </div>

          {/* Status Message */}
          <div className="flex-1">
            <p className={cn("font-medium mb-1", config.color)}>
              {message}
            </p>

            {/* Privacy Emphasis */}
            {status === 'monitoring' && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Icon icon="ph:lock-key" className="w-3.5 h-3.5" />
                <span>Observed privately via secure infrastructure</span>
              </p>
            )}

            {status === 'completed' && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Icon icon="ph:shield-check" className="w-3.5 h-3.5" />
                <span>Detection completed with privacy guarantees maintained</span>
              </p>
            )}

            {/* Optional Details (collapsed by default) */}
            {showDetails && status !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 pt-3 border-t border-border/50"
              >
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Privacy-Safe Monitoring:</strong>
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-start gap-1.5">
                    <Icon icon="ph:check" className="w-3 h-3 mt-0.5 text-success flex-shrink-0" />
                    <span>No public RPC polling</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Icon icon="ph:check" className="w-3 h-3 mt-0.5 text-success flex-shrink-0" />
                    <span>Webhook-based detection</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Icon icon="ph:check" className="w-3 h-3 mt-0.5 text-success flex-shrink-0" />
                    <span>No metadata leakage</span>
                  </li>
                </ul>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * RecoveryStatusBanner
 *
 * Specialized component for recovery flow
 * Shows clear status WITHOUT exposing guardian info or timing patterns
 */
export interface RecoveryStatusBannerProps {
  isMonitoring: boolean;
  recoveryDetected: boolean;
  statusMessage: string;
  error?: string | null;
}

export function RecoveryStatusBanner({
  isMonitoring,
  recoveryDetected,
  statusMessage,
  error,
}: RecoveryStatusBannerProps) {
  if (error) {
    return (
      <PrivateStatusIndicator
        status="failed"
        message={error}
        className="mb-6"
      />
    );
  }

  if (recoveryDetected) {
    return (
      <PrivateStatusIndicator
        status="completed"
        message="Wallet Access Restored"
        showDetails={true}
        className="mb-6"
      />
    );
  }

  if (isMonitoring) {
    return (
      <PrivateStatusIndicator
        status="monitoring"
        message={statusMessage}
        className="mb-6"
      />
    );
  }

  return null;
}

/**
 * PrivacyBadge Component
 *
 * Shows that Helius is being used for privacy-safe monitoring
 */
export function HeliusPrivacyBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20">
      <div className="flex h-2 w-2 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
      </div>
      <span className="text-xs text-muted-foreground">
        <span className="text-primary font-medium">Private monitoring</span> via Helius
      </span>
      <Icon icon="ph:shield-check" className="w-3.5 h-3.5 text-primary" />
    </div>
  );
}
