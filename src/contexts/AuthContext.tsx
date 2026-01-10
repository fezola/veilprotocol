import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface AuthContextType {
  isAuthenticated: boolean;
  veilWallet: string | null;
  commitment: string | null;
  login: (wallet: string, commitment: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { publicKey, connected } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [veilWallet, setVeilWallet] = useState<string | null>(null);
  const [commitment, setCommitment] = useState<string | null>(null);

  // Load from sessionStorage on mount
  useEffect(() => {
    const savedWallet = sessionStorage.getItem('veil_wallet');
    const savedCommitment = sessionStorage.getItem('veil_commitment');

    if (savedWallet && savedCommitment) {
      setVeilWallet(savedWallet);
      setCommitment(savedCommitment);
      setIsAuthenticated(true);
    }
  }, []);

  // Sync with Solana wallet connection
  useEffect(() => {
    if (connected && publicKey && veilWallet) {
      // Wallet is connected and we have a Veil session
      setIsAuthenticated(true);
    }
  }, [connected, publicKey, veilWallet]);

  const login = (wallet: string, commitmentHash: string) => {
    setVeilWallet(wallet);
    setCommitment(commitmentHash);
    setIsAuthenticated(true);

    // Persist to sessionStorage
    sessionStorage.setItem('veil_wallet', wallet);
    sessionStorage.setItem('veil_commitment', commitmentHash);
  };

  const logout = () => {
    setVeilWallet(null);
    setCommitment(null);
    setIsAuthenticated(false);

    // Clear sessionStorage
    sessionStorage.removeItem('veil_wallet');
    sessionStorage.removeItem('veil_commitment');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, veilWallet, commitment, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
