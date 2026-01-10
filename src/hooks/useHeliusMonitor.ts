/**
 * useHeliusMonitor Hook
 *
 * React hook for privacy-safe wallet monitoring via Helius
 *
 * PURPOSE:
 * - Monitor recovery completion WITHOUT polling
 * - Provide real-time UX updates via private infrastructure
 * - Maintain privacy guarantees at infrastructure layer
 *
 * USAGE:
 * const { status, startMonitoring, stopMonitoring } = useHeliusMonitor(veilWallet);
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  WalletActivityMonitor,
  checkRecoveryStatus,
  parseTransactionPrivately,
  type WalletActivity,
  type RecoveryStatus,
} from '@/lib/helius';

export interface HeliusMonitorState {
  isMonitoring: boolean;
  lastActivity: WalletActivity | null;
  recoveryStatus: RecoveryStatus | null;
  error: string | null;
}

export function useHeliusMonitor(walletAddress: string | null) {
  const [state, setState] = useState<HeliusMonitorState>({
    isMonitoring: false,
    lastActivity: null,
    recoveryStatus: null,
    error: null,
  });

  const monitorRef = useRef<WalletActivityMonitor | null>(null);

  /**
   * Start monitoring wallet activity
   * Uses Helius private RPC websocket (no polling)
   */
  const startMonitoring = useCallback(() => {
    if (!walletAddress || monitorRef.current) return;

    try {
      const monitor = new WalletActivityMonitor(walletAddress);

      monitor.startMonitoring((activity) => {
        setState((prev) => ({
          ...prev,
          lastActivity: activity,
          isMonitoring: true,
          error: null,
        }));

        // If recovery event detected, check status
        if (activity.type === 'account_update') {
          checkRecoveryStatus(walletAddress).then((completed) => {
            if (completed) {
              setState((prev) => ({
                ...prev,
                recoveryStatus: {
                  completed: true,
                  message: 'Recovery completed',
                  timestamp: Date.now(),
                },
              }));
            }
          });
        }
      });

      monitorRef.current = monitor;
      setState((prev) => ({ ...prev, isMonitoring: true }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start monitoring',
      }));
    }
  }, [walletAddress]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (monitorRef.current) {
      monitorRef.current.stopMonitoring();
      monitorRef.current = null;
      setState((prev) => ({ ...prev, isMonitoring: false }));
    }
  }, []);

  /**
   * Check recovery status manually (privacy-safe)
   */
  const checkStatus = useCallback(async () => {
    if (!walletAddress) return;

    try {
      const completed = await checkRecoveryStatus(walletAddress);
      setState((prev) => ({
        ...prev,
        recoveryStatus: {
          completed,
          message: completed ? 'Recovery completed' : 'Recovery pending',
          timestamp: Date.now(),
        },
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Status check failed',
      }));
    }
  }, [walletAddress]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    ...state,
    startMonitoring,
    stopMonitoring,
    checkStatus,
  };
}

/**
 * useRecoveryMonitor Hook (Specialized)
 *
 * Focused hook for recovery flow monitoring
 * Automatically starts/stops based on recovery state
 */
export function useRecoveryMonitor(
  walletAddress: string | null,
  isRecoveryActive: boolean
) {
  const [recoveryDetected, setRecoveryDetected] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('Waiting for recovery...');

  const monitor = useHeliusMonitor(walletAddress);

  useEffect(() => {
    if (isRecoveryActive && walletAddress && !monitor.isMonitoring) {
      // Start monitoring when recovery is initiated
      monitor.startMonitoring();
    }

    if (!isRecoveryActive && monitor.isMonitoring) {
      // Stop monitoring when recovery completes or fails
      monitor.stopMonitoring();
    }
  }, [isRecoveryActive, walletAddress, monitor]);

  useEffect(() => {
    if (monitor.recoveryStatus?.completed) {
      setRecoveryDetected(true);
      setStatusMessage('Recovery completed - observed privately via Helius');
    } else if (monitor.lastActivity) {
      setStatusMessage('Activity detected - monitoring via private infrastructure');
    }
  }, [monitor.recoveryStatus, monitor.lastActivity]);

  return {
    recoveryDetected,
    statusMessage,
    isMonitoring: monitor.isMonitoring,
    error: monitor.error,
    checkStatus: monitor.checkStatus,
  };
}
