/**
 * Network Status Badge
 * 
 * Shows current network configuration for ShadowPay and Veil features.
 * Important for judges to understand the mainnet/devnet hybrid approach.
 */

import { Icon } from "@iconify/react";
import { getNetworkStatus, isDemoMode, getNetworkInfo } from "@/lib/shadowpay";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NetworkStatusBadgeProps {
  showDetails?: boolean;
  className?: string;
}

export function NetworkStatusBadge({ showDetails = false, className = "" }: NetworkStatusBadgeProps) {
  const status = getNetworkStatus();
  const info = getNetworkInfo();
  const isDemo = isDemoMode();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 ${className}`}>
            {/* ShadowPay Network Badge */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
              isDemo 
                ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                : 'bg-green-500/10 text-green-500 border border-green-500/20'
            }`}>
              <Icon 
                icon={isDemo ? "ph:flask" : "ph:broadcast"} 
                className="w-3.5 h-3.5" 
              />
              <span>ShadowPay: {isDemo ? 'Demo' : 'Mainnet'}</span>
            </div>

            {/* Veil Features Badge */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Icon icon="ph:shield-check" className="w-3.5 h-3.5" />
              <span>Veil: Devnet</span>
            </div>

            {showDetails && (
              <Icon 
                icon="ph:info" 
                className="w-4 h-4 text-muted-foreground cursor-help" 
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2 text-xs">
            <div>
              <strong className="text-green-500">ShadowPay ({status.network}):</strong>
              <p className="text-muted-foreground">{info.description}</p>
              {info.warning && (
                <p className="text-yellow-500 mt-1">⚠️ {info.warning}</p>
              )}
            </div>
            <div className="pt-2 border-t border-border">
              <strong className="text-blue-500">Veil Features (Devnet):</strong>
              <p className="text-muted-foreground">
                Voting, Staking, Multisig run on devnet for hackathon testing.
              </p>
            </div>
            {status.isMainnet && (
              <div className="pt-2 border-t border-border text-yellow-500">
                <strong>Note:</strong> Private payments require {status.minSolRequired} SOL minimum on mainnet.
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Compact version for header/footer
 */
export function NetworkStatusDot({ className = "" }: { className?: string }) {
  const isDemo = isDemoMode();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1.5 ${className}`}>
            <div className={`w-2 h-2 rounded-full ${isDemo ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`} />
            <span className="text-xs text-muted-foreground">
              {isDemo ? 'Demo' : 'Live'}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">
            {isDemo 
              ? 'Demo mode - no real transactions' 
              : 'Live on mainnet - real private payments'
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

