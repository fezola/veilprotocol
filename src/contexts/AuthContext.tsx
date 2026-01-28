import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export interface RecoveryKeyData {
  version: string;
  secret: string;
  identifier: string;
  commitment: string;
  wallet: string;
  createdAt: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  veilWallet: string | null;
  commitment: string | null;
  identifier: string | null;
  recoveryKey: RecoveryKeyData | null;
  login: (wallet: string, commitment: string, identifier?: string, secret?: string) => void;
  loginWithRecoveryKey: (recoveryData: RecoveryKeyData) => boolean;
  logout: () => void;
  getRecoveryKey: () => RecoveryKeyData | null;
  downloadRecoveryKey: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate recovery key JSON file for download
function createRecoveryKeyFile(data: RecoveryKeyData): string {
  return JSON.stringify(data, null, 2);
}

// Validate recovery key structure
function isValidRecoveryKey(data: unknown): data is RecoveryKeyData {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.version === 'string' &&
    typeof obj.secret === 'string' &&
    typeof obj.identifier === 'string' &&
    typeof obj.commitment === 'string' &&
    typeof obj.wallet === 'string' &&
    typeof obj.createdAt === 'number'
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { publicKey, connected } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [veilWallet, setVeilWallet] = useState<string | null>(null);
  const [commitment, setCommitment] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState<string | null>(null);
  const [recoveryKey, setRecoveryKey] = useState<RecoveryKeyData | null>(null);

  // Load from localStorage on mount (persists across browser sessions!)
  useEffect(() => {
    const savedWallet = localStorage.getItem('veil_wallet');
    const savedCommitment = localStorage.getItem('veil_commitment');
    const savedIdentifier = localStorage.getItem('veil_identifier');
    const savedRecoveryKey = localStorage.getItem('veil_recovery_key');

    if (savedWallet && savedCommitment) {
      setVeilWallet(savedWallet);
      setCommitment(savedCommitment);
      setIdentifier(savedIdentifier);
      setIsAuthenticated(true);

      if (savedRecoveryKey) {
        try {
          const parsed = JSON.parse(savedRecoveryKey);
          if (isValidRecoveryKey(parsed)) {
            setRecoveryKey(parsed);
          }
        } catch {
          // Invalid recovery key in storage
        }
      }
    }
  }, []);

  // Sync with Solana wallet connection
  useEffect(() => {
    if (connected && publicKey && veilWallet) {
      setIsAuthenticated(true);
    }
  }, [connected, publicKey, veilWallet]);

  const login = (wallet: string, commitmentHash: string, userIdentifier?: string, secret?: string) => {
    setVeilWallet(wallet);
    setCommitment(commitmentHash);
    setIdentifier(userIdentifier || null);
    setIsAuthenticated(true);

    // Persist to localStorage
    localStorage.setItem('veil_wallet', wallet);
    localStorage.setItem('veil_commitment', commitmentHash);
    if (userIdentifier) {
      localStorage.setItem('veil_identifier', userIdentifier);
    }

    // Create and store recovery key if we have all the data
    if (secret && userIdentifier) {
      const newRecoveryKey: RecoveryKeyData = {
        version: '1.0',
        secret,
        identifier: userIdentifier,
        commitment: commitmentHash,
        wallet,
        createdAt: Date.now(),
      };
      setRecoveryKey(newRecoveryKey);
      localStorage.setItem('veil_recovery_key', JSON.stringify(newRecoveryKey));
    }
  };

  const loginWithRecoveryKey = (recoveryData: RecoveryKeyData): boolean => {
    if (!isValidRecoveryKey(recoveryData)) {
      return false;
    }

    // Restore the secret for this identifier so future logins work
    const keyHash = btoa(recoveryData.identifier).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    const storageKey = `veil_secret_${keyHash}`;
    localStorage.setItem(storageKey, recoveryData.secret);

    // Set auth state
    setVeilWallet(recoveryData.wallet);
    setCommitment(recoveryData.commitment);
    setIdentifier(recoveryData.identifier);
    setRecoveryKey(recoveryData);
    setIsAuthenticated(true);

    // Persist to localStorage
    localStorage.setItem('veil_wallet', recoveryData.wallet);
    localStorage.setItem('veil_commitment', recoveryData.commitment);
    localStorage.setItem('veil_identifier', recoveryData.identifier);
    localStorage.setItem('veil_recovery_key', JSON.stringify(recoveryData));

    return true;
  };

  const logout = () => {
    setVeilWallet(null);
    setCommitment(null);
    setIdentifier(null);
    setRecoveryKey(null);
    setIsAuthenticated(false);

    // Clear session data but KEEP the secrets so same email works
    localStorage.removeItem('veil_wallet');
    localStorage.removeItem('veil_commitment');
    localStorage.removeItem('veil_identifier');
    localStorage.removeItem('veil_recovery_key');
    // Note: We keep veil_secret_* so they can log back in with same email
  };

  const getRecoveryKey = (): RecoveryKeyData | null => {
    return recoveryKey;
  };

  const downloadRecoveryKey = () => {
    if (!recoveryKey) return;

    const fileContent = createRecoveryKeyFile(recoveryKey);
    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veil-recovery-key-${recoveryKey.wallet.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      veilWallet,
      commitment,
      identifier,
      recoveryKey,
      login,
      loginWithRecoveryKey,
      logout,
      getRecoveryKey,
      downloadRecoveryKey,
    }}>
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
