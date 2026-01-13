import { useMemo, useState } from 'react';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';

// Veil SDK imports
import { generateIdentityProof, IdentityInput } from '@veil-protocol/sdk/identity';
import { ShieldedBalanceClient } from '@veil-protocol/sdk/shielded';

function PrivacyWallet() {
  const { connected, publicKey } = useWallet();
  const [email, setEmail] = useState('');
  const [veilWallet, setVeilWallet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shieldedBalance, setShieldedBalance] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleGenerateIdentity = async () => {
    if (!email) return;
    setIsLoading(true);
    addLog('Generating ZK identity proof...');

    try {
      const identity: IdentityInput = { type: 'email', value: email };
      const result = await generateIdentityProof(identity);
      
      if (result.success && result.wallet) {
        setVeilWallet(result.wallet.toBase58());
        addLog(`✓ Identity proof generated!`);
        addLog(`  Commitment: ${result.commitment?.slice(0, 16)}...`);
        addLog(`  Wallet: ${result.wallet.toBase58().slice(0, 8)}...`);
      }
    } catch (err) {
      addLog(`✗ Error: ${err}`);
    }
    setIsLoading(false);
  };

  const handleCheckShieldedBalance = async () => {
    if (!publicKey) return;
    addLog('Checking shielded balance...');
    
    const connection = new Connection(clusterApiUrl('devnet'));
    const client = new ShieldedBalanceClient(connection, 'demo-key');
    const balance = await client.getShieldedBalance();
    setShieldedBalance(balance);
    addLog(`✓ Shielded balance: ${balance} SOL`);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', background: 'linear-gradient(90deg, #9945FF, #14F195)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🛡️ Veil Privacy Wallet
        </h1>
        <WalletMultiButton />
      </header>

      {/* ZK Identity Section */}
      <section style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>🔐 ZK Identity</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #333', background: '#1a1a2e', color: '#fff', marginBottom: 12 }}
        />
        <button
          onClick={handleGenerateIdentity}
          disabled={isLoading || !email}
          style={{ width: '100%', padding: 12, borderRadius: 8, background: '#9945FF', color: '#fff', border: 'none', cursor: 'pointer', opacity: isLoading || !email ? 0.5 : 1 }}
        >
          {isLoading ? 'Generating...' : 'Generate ZK Identity'}
        </button>
        {veilWallet && (
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(20, 241, 149, 0.1)', borderRadius: 8, border: '1px solid rgba(20, 241, 149, 0.3)' }}>
            <div style={{ fontSize: 12, color: '#14F195' }}>Veil Wallet</div>
            <div style={{ fontFamily: 'monospace', fontSize: 14 }}>{veilWallet}</div>
          </div>
        )}
      </section>

      {/* Shielded Balance Section */}
      <section style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>👁️‍🗨️ Shielded Balance</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: '#888' }}>Hidden from public</div>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>{shieldedBalance} SOL</div>
          </div>
          <button
            onClick={handleCheckShieldedBalance}
            disabled={!connected}
            style={{ padding: '8px 16px', borderRadius: 8, background: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Refresh
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button style={{ padding: 12, borderRadius: 8, background: '#14F195', color: '#000', border: 'none', cursor: 'pointer' }}>Shield SOL</button>
          <button style={{ padding: 12, borderRadius: 8, background: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}>Unshield</button>
        </div>
      </section>

      {/* Activity Log */}
      <section style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>📋 Activity Log</h2>
        <div style={{ maxHeight: 200, overflow: 'auto', fontFamily: 'monospace', fontSize: 12 }}>
          {logs.length === 0 ? (
            <div style={{ color: '#666' }}>No activity yet...</div>
          ) : (
            logs.map((log, i) => <div key={i} style={{ marginBottom: 4 }}>{log}</div>)
          )}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <PrivacyWallet />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

