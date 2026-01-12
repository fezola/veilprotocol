import { VeilConfig } from "../cli.js";

export function generateWalletButton(): string {
  return `"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export function WalletButton() {
  const { wallet, connect, disconnect, connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = () => {
    if (connected) {
      disconnect();
    } else if (wallet) {
      connect();
    } else {
      setVisible(true);
    }
  };

  const truncateAddress = (address: string) => {
    return \`\${address.slice(0, 4)}...\${address.slice(-4)}\`;
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 rounded-lg font-medium transition-all duration-200
                 bg-gradient-to-r from-purple-600 to-blue-600 
                 hover:from-purple-700 hover:to-blue-700
                 text-white shadow-lg hover:shadow-xl"
    >
      {connected && publicKey
        ? truncateAddress(publicKey.toBase58())
        : "Connect Wallet"}
    </button>
  );
}
`;
}

export function generatePrivacyStatus(): string {
  return `"use client";

import { useVeil } from "../../hooks/useVeil";

export function PrivacyStatus() {
  const { isAuthenticated, privacyLevel } = useVeil();

  const getStatusColor = () => {
    if (!isAuthenticated) return "bg-gray-500";
    switch (privacyLevel) {
      case "high": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    if (!isAuthenticated) return "Not Connected";
    switch (privacyLevel) {
      case "high": return "Privacy: High";
      case "medium": return "Privacy: Medium";
      case "low": return "Privacy: Low";
      default: return "Unknown";
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700">
      <div className={\`w-2 h-2 rounded-full \${getStatusColor()}\`} />
      <span className="text-sm text-gray-300">{getStatusText()}</span>
    </div>
  );
}
`;
}

export function generateVeilProvider(config: VeilConfig): string {
  return `"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { createLoginSession, isSessionValid, LoginSession } from "../privacy/login";

interface VeilContextType {
  session: LoginSession | null;
  isAuthenticated: boolean;
  privacyLevel: "high" | "medium" | "low" | null;
  login: () => Promise<void>;
  logout: () => void;
}

const VeilContext = createContext<VeilContextType | null>(null);

export function VeilProvider({ children }: { children: ReactNode }) {
  const { connected, publicKey, signMessage } = useWallet();
  const [session, setSession] = useState<LoginSession | null>(null);

  const isAuthenticated = connected && session !== null && isSessionValid(session);
  const privacyLevel = isAuthenticated ? "high" : null;

  const login = async () => {
    if (!connected || !publicKey || !signMessage) {
      throw new Error("Wallet not connected");
    }

    // Create identity proof from wallet signature
    const message = new TextEncoder().encode(
      \`Veil Login: \${Date.now()}\`
    );
    const signature = await signMessage(message);
    
    const newSession = await createLoginSession(signature);
    setSession(newSession);
  };

  const logout = () => {
    setSession(null);
  };

  // Auto-logout when wallet disconnects
  useEffect(() => {
    if (!connected) {
      setSession(null);
    }
  }, [connected]);

  return (
    <VeilContext.Provider value={{ session, isAuthenticated, privacyLevel, login, logout }}>
      {children}
    </VeilContext.Provider>
  );
}

export function useVeilContext() {
  const context = useContext(VeilContext);
  if (!context) {
    throw new Error("useVeilContext must be used within VeilProvider");
  }
  return context;
}
`;
}

export function generateVeilHooks(config: VeilConfig): string {
  return `"use client";

import { useVeilContext } from "../contexts/VeilProvider";
import { PRIVACY_GUARANTEES } from "../privacy/guarantees";

export function useVeil() {
  const context = useVeilContext();
  return context;
}

export function usePrivacyGuarantees() {
  return PRIVACY_GUARANTEES;
}

export function usePrivacyCheck() {
  const { isAuthenticated, privacyLevel } = useVeil();
  
  return {
    isPrivate: privacyLevel === "high",
    warnings: privacyLevel === "low" 
      ? ["Your session may be linkable to your identity"]
      : [],
  };
}
`;
}

