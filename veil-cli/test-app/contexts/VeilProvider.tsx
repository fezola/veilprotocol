"use client";

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
      `Veil Login: ${Date.now()}`
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
