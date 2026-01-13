/**
 * SDK Integration Templates
 * 
 * Templates for integrating @veil-protocol/sdk into scaffolded projects
 */

import { VeilConfig } from "../cli.js";

export function generateSdkProvider(config: VeilConfig): string {
  return `"use client";

/**
 * VeilSDKProvider - Full SDK integration for privacy features
 * 
 * This provider wraps your app with the Veil SDK, enabling:
 * - ZK-based identity (no on-chain identity)
 * - Shielded balances (hide your holdings)
 * - Private transfers (hidden amounts)
 * - Private token operations
 * - Private DEX swaps
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { VeilClient, ShieldedClient, TransferClient, TokenClient, DexClient } from "@veil-protocol/sdk";

interface VeilSDKContextType {
  // Core client
  veil: VeilClient | null;
  
  // Sub-clients
  shielded: ShieldedClient | null;
  transfer: TransferClient | null;
  tokens: TokenClient | null;
  dex: DexClient | null;
  
  // State
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Balances
  publicBalance: number;
  shieldedBalance: number;
  
  // Actions
  refreshBalances: () => Promise<void>;
  shield: (amount: number) => Promise<string>;
  unshield: (amount: number) => Promise<string>;
  privateTransfer: (recipient: string, amount: number) => Promise<string>;
}

const VeilSDKContext = createContext<VeilSDKContextType | null>(null);

export function VeilSDKProvider({ children }: { children: ReactNode }) {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();
  
  const [veil, setVeil] = useState<VeilClient | null>(null);
  const [shielded, setShielded] = useState<ShieldedClient | null>(null);
  const [transfer, setTransfer] = useState<TransferClient | null>(null);
  const [tokens, setTokens] = useState<TokenClient | null>(null);
  const [dex, setDex] = useState<DexClient | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicBalance, setPublicBalance] = useState(0);
  const [shieldedBalance, setShieldedBalance] = useState(0);

  // Initialize SDK when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      const client = new VeilClient({ connection });
      setVeil(client);
      setShielded(client.shielded);
      setTransfer(client.transfer);
      setTokens(client.tokens);
      setDex(client.dex);
    } else {
      setVeil(null);
      setShielded(null);
      setTransfer(null);
      setTokens(null);
      setDex(null);
    }
  }, [connected, publicKey, connection]);

  const refreshBalances = useCallback(async () => {
    if (!veil || !publicKey) return;
    
    setIsLoading(true);
    try {
      const balances = await veil.getBalances(publicKey);
      setPublicBalance(balances.public);
      setShieldedBalance(balances.shielded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balances");
    } finally {
      setIsLoading(false);
    }
  }, [veil, publicKey]);

  const shield = useCallback(async (amount: number): Promise<string> => {
    if (!shielded || !publicKey || !signTransaction) {
      throw new Error("Wallet not connected");
    }
    return shielded.deposit(publicKey, amount, signTransaction);
  }, [shielded, publicKey, signTransaction]);

  const unshield = useCallback(async (amount: number): Promise<string> => {
    if (!shielded || !publicKey || !signTransaction) {
      throw new Error("Wallet not connected");
    }
    return shielded.withdraw(publicKey, amount, signTransaction);
  }, [shielded, publicKey, signTransaction]);

  const privateTransfer = useCallback(async (recipient: string, amount: number): Promise<string> => {
    if (!transfer || !publicKey || !signTransaction) {
      throw new Error("Wallet not connected");
    }
    return transfer.privateTransfer(publicKey, recipient, amount, signTransaction);
  }, [transfer, publicKey, signTransaction]);

  return (
    <VeilSDKContext.Provider value={{
      veil,
      shielded,
      transfer,
      tokens,
      dex,
      isConnected: connected && veil !== null,
      isLoading,
      error,
      publicBalance,
      shieldedBalance,
      refreshBalances,
      shield,
      unshield,
      privateTransfer,
    }}>
      {children}
    </VeilSDKContext.Provider>
  );
}

export function useVeilSDK() {
  const context = useContext(VeilSDKContext);
  if (!context) {
    throw new Error("useVeilSDK must be used within VeilSDKProvider");
  }
  return context;
}
`;
}

export function generateSdkHooks(): string {
  return `"use client";

/**
 * Veil SDK Hooks
 * 
 * Convenient hooks for common SDK operations
 */

import { useVeilSDK } from "../contexts/VeilSDKProvider";
import { useState, useCallback } from "react";

export function useShieldedBalance() {
  const { publicBalance, shieldedBalance, refreshBalances, isLoading } = useVeilSDK();
  return { publicBalance, shieldedBalance, refresh: refreshBalances, isLoading };
}

export function usePrivateTransfer() {
  const { privateTransfer } = useVeilSDK();
  const [isPending, setIsPending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (recipient: string, amount: number) => {
    setIsPending(true);
    setError(null);
    try {
      const hash = await privateTransfer(recipient, amount);
      setTxHash(hash);
      return hash;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [privateTransfer]);

  return { send, isPending, txHash, error };
}
`;
}

