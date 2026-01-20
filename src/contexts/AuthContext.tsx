import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface AuthContextType {
  isAuthenticated: boolean;
  veilWallet: string | null;
  commitment: string | null;
  identifier: string | null;
  login: (wallet: string, commitment: string, identifier?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { publicKey, connected } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [veilWallet, setVeilWallet] = useState<string | null>(null);
  const [commitment, setCommitment] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState<string | null>(null);

  // Load from localStorage on mount (persists across browser sessions!)
  useEffect(() => {
    const savedWallet = localStorage.getItem('veil_wallet');
    const savedCommitment = localStorage.getItem('veil_commitment');
    const savedIdentifier = localStorage.getItem('veil_identifier');

    if (savedWallet && savedCommitment) {
      setVeilWallet(savedWallet);
      setCommitment(savedCommitment);
      setIdentifier(savedIdentifier);
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

  const login = (wallet: string, commitmentHash: string, userIdentifier?: string) => {
    setVeilWallet(wallet);
    setCommitment(commitmentHash);
    setIdentifier(userIdentifier || null);
    setIsAuthenticated(true);

    // Persist to localStorage (survives browser close!)
    localStorage.setItem('veil_wallet', wallet);
    localStorage.setItem('veil_commitment', commitmentHash);
    if (userIdentifier) {
      localStorage.setItem('veil_identifier', userIdentifier);
    }
  };

  const logout = () => {
    setVeilWallet(null);
    setCommitment(null);
    setIdentifier(null);
    setIsAuthenticated(false);

    // Clear localStorage
    localStorage.removeItem('veil_wallet');
    localStorage.removeItem('veil_commitment');
    localStorage.removeItem('veil_identifier');
    // Note: We keep the secret so they can log back in with same email
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, veilWallet, commitment, identifier, login, logout }}>
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
