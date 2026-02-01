import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

type ActiveContent =
  | "overview"
  | "connect-wallet"
  | "derive-wallet"
  | "shielded-balances"
  | "private-transfers"
  | "token-privacy"
  | "dex-integration"
  | "zk-identity"
  | "recovery"
  | "private-voting"
  | "stealth-multisig"
  | "private-staking"
  | "cli"
  | "sdk"
  | "shadowwire";

const sidebarSections = [
  {
    id: "overview",
    label: "Overview",
    icon: "ph:house",
    contentId: "overview" as ActiveContent,
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: "ph:wallet",
    items: [
      { label: "Connect Wallet", contentId: "connect-wallet" as ActiveContent, icon: "ph:plug" },
      { label: "Derive Private Wallet", contentId: "derive-wallet" as ActiveContent, icon: "ph:key" },
      { label: "Shielded Balances", contentId: "shielded-balances" as ActiveContent, icon: "ph:eye-slash" },
    ],
  },
  {
    id: "defi",
    label: "DeFi",
    icon: "ph:chart-line-up",
    items: [
      { label: "Private Transfers", contentId: "private-transfers" as ActiveContent, icon: "ph:paper-plane-tilt" },
      { label: "Token Privacy", contentId: "token-privacy" as ActiveContent, icon: "ph:coins" },
      { label: "DEX Integration", contentId: "dex-integration" as ActiveContent, icon: "ph:swap" },
    ],
  },
  {
    id: "privacy",
    label: "Privacy Features",
    icon: "ph:shield-check",
    items: [
      { label: "ZK Identity", contentId: "zk-identity" as ActiveContent, icon: "ph:fingerprint" },
      { label: "Recovery", contentId: "recovery" as ActiveContent, icon: "ph:lifebuoy" },
      { label: "Private Voting", contentId: "private-voting" as ActiveContent, icon: "ph:check-square" },
      { label: "Stealth Multisig", contentId: "stealth-multisig" as ActiveContent, icon: "ph:users-three" },
      { label: "Private Staking", contentId: "private-staking" as ActiveContent, icon: "ph:stack" },
    ],
  },
  {
    id: "developer",
    label: "Developer Tools",
    icon: "ph:code",
    items: [
      { label: "CLI Scaffolding", contentId: "cli" as ActiveContent, icon: "ph:terminal" },
      { label: "SDK Documentation", contentId: "sdk" as ActiveContent, icon: "ph:book-open" },
      { label: "ShadowWire", contentId: "shadowwire" as ActiveContent, icon: "ph:lightning" },
    ],
  },
];

const quickStartCode = `import { generateIdentityProof } from '@veil-protocol/sdk/identity';
import { ShieldedBalanceClient } from '@veil-protocol/sdk/shielded';

// 1. Generate ZK identity (no on-chain identity)
const identity = await generateIdentityProof({
  type: 'email',
  value: 'user@example.com'
});

// 2. Setup shielded balance client
const shielded = new ShieldedBalanceClient(connection, identity.encryptionKey);

// 3. Deposit into shielded pool
await shielded.deposit(identity.wallet.publicKey, 1.0, signTransaction);`;

export function DeveloperPortal() {
  const { veilWallet, commitment } = useAuth();
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [activeContent, setActiveContent] = useState<ActiveContent>("overview");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["wallet", "defi", "privacy", "developer"]));

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleSidebarItemClick = (contentId: ActiveContent) => {
    if (contentId === "connect-wallet") {
      setVisible(true);
    } else {
      setActiveContent(contentId);
    }
  };

  // Get the parent section for highlighting
  const getParentSection = (contentId: ActiveContent): string => {
    if (contentId === "overview") return "overview";
    for (const section of sidebarSections) {
      if (section.contentId === contentId) return section.id;
      if (section.items?.some(item => item.contentId === contentId)) return section.id;
    }
    return "overview";
  };

  const activeParentSection = getParentSection(activeContent);

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-64 flex-shrink-0 hidden lg:block"
      >
        <div className="glass-panel rounded-xl p-4 sticky top-24">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon icon="ph:terminal" className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Developer Portal</h3>
              <p className="text-xs text-muted-foreground">Build with Veil</p>
            </div>
          </div>

          <nav className="space-y-1">
            {sidebarSections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => {
                    if (section.contentId) {
                      setActiveContent(section.contentId);
                    }
                    if (section.items) toggleSection(section.id);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeParentSection === section.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon icon={section.icon} className="w-4 h-4" />
                    <span>{section.label}</span>
                  </div>
                  {section.items && (
                    <Icon
                      icon={expandedSections.has(section.id) ? "ph:caret-down" : "ph:caret-right"}
                      className="w-3 h-3"
                    />
                  )}
                </button>

                {section.items && expandedSections.has(section.id) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {section.items.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleSidebarItemClick(item.contentId)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors text-left ${
                          activeContent === item.contentId
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                      >
                        <Icon icon={item.icon} className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                        {item.contentId === "connect-wallet" && connected && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-success" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <ContentRenderer
          activeContent={activeContent}
          veilWallet={veilWallet}
          commitment={commitment}
          quickStartCode={quickStartCode}
          connected={connected}
          publicKey={publicKey?.toBase58() || null}
        />
      </div>
    </div>
  );
}

interface ContentRendererProps {
  activeContent: ActiveContent;
  veilWallet: string | null;
  commitment: string | null;
  quickStartCode: string;
  connected: boolean;
  publicKey: string | null;
}

function ContentRenderer({ activeContent, veilWallet, commitment, quickStartCode, connected, publicKey }: ContentRendererProps) {
  if (activeContent === "overview") {
    return <OverviewSection veilWallet={veilWallet} commitment={commitment} quickStartCode={quickStartCode} />;
  }

  if (activeContent === "derive-wallet") {
    return <DeriveWalletContent veilWallet={veilWallet} connected={connected} publicKey={publicKey} />;
  }

  // For other content types, render a feature content section
  return <FeatureContentSection contentId={activeContent} />;
}

function DeriveWalletContent({ veilWallet, connected, publicKey }: { veilWallet: string | null; connected: boolean; publicKey: string | null }) {
  const { login } = useAuth();
  const [isDerivingWallet, setIsDerivingWallet] = useState(false);
  const [derivationResult, setDerivationResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleDeriveWallet = async () => {
    if (!connected || !publicKey) {
      setDerivationResult({ success: false, message: "Please connect your wallet first" });
      return;
    }

    setIsDerivingWallet(true);
    try {
      // Simulate deriving a private wallet from the connected wallet
      await login(publicKey);
      setDerivationResult({ success: true, message: "Private wallet derived successfully!" });
    } catch (error) {
      setDerivationResult({ success: false, message: "Failed to derive wallet. Please try again." });
    } finally {
      setIsDerivingWallet(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon icon="ph:key" className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Derive Private Wallet</h2>
            <p className="text-muted-foreground text-sm">
              Create a privacy-preserving wallet derived from your connected wallet
            </p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="ph:wallet" className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Connected Wallet</span>
            </div>
            <p className="text-xs font-mono text-muted-foreground">
              {connected && publicKey ? `${publicKey.slice(0, 12)}...${publicKey.slice(-8)}` : "Not connected"}
            </p>
            <span className={`mt-2 inline-flex items-center gap-1 text-xs ${connected ? "text-success" : "text-warning"}`}>
              <span className={`w-2 h-2 rounded-full ${connected ? "bg-success" : "bg-warning"}`} />
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="ph:shield-check" className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Veil Private Wallet</span>
            </div>
            <p className="text-xs font-mono text-muted-foreground">
              {veilWallet ? `${veilWallet.slice(0, 12)}...${veilWallet.slice(-8)}` : "Not derived"}
            </p>
            <span className={`mt-2 inline-flex items-center gap-1 text-xs ${veilWallet ? "text-success" : "text-muted-foreground"}`}>
              <span className={`w-2 h-2 rounded-full ${veilWallet ? "bg-success" : "bg-muted-foreground"}`} />
              {veilWallet ? "Active" : "Pending derivation"}
            </span>
          </div>
        </div>

        {/* Derive Button */}
        <button
          onClick={handleDeriveWallet}
          disabled={isDerivingWallet || !connected}
          className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDerivingWallet ? (
            <>
              <Icon icon="ph:circle-notch" className="w-5 h-5 animate-spin" />
              Deriving...
            </>
          ) : (
            <>
              <Icon icon="ph:key" className="w-5 h-5" />
              {veilWallet ? "Re-derive Wallet" : "Derive Private Wallet"}
            </>
          )}
        </button>

        {derivationResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-lg ${derivationResult.success ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
          >
            <div className="flex items-center gap-2">
              <Icon icon={derivationResult.success ? "ph:check-circle" : "ph:warning-circle"} className="w-4 h-4" />
              <span className="text-sm">{derivationResult.message}</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-xl p-6"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Icon icon="ph:info" className="w-4 h-4 text-primary" />
          How Wallet Derivation Works
        </h3>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            Veil uses a deterministic key derivation scheme to create your private wallet:
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Sign a message with your connected wallet to prove ownership</li>
            <li>The signature is hashed using Poseidon to create a commitment</li>
            <li>A new keypair is derived deterministically from this commitment</li>
            <li>Your identity is never stored on-chain - only the commitment</li>
          </ol>
        </div>
        <pre className="mt-4 p-3 rounded-lg bg-[#0d1117] text-xs font-mono overflow-x-auto">
          <code className="text-green-400">{`// Derive wallet from signature
const signature = await wallet.signMessage(message);
const commitment = poseidonHash(signature);
const veilWallet = deriveKeypair(commitment);`}</code>
        </pre>
      </motion.div>
    </div>
  );
}

function FeatureContentSection({ contentId }: { contentId: ActiveContent }) {
  const featureData = getFeatureData(contentId);

  if (!featureData) {
    return (
      <div className="glass-panel rounded-xl p-6">
        <p className="text-muted-foreground">Content coming soon for: {contentId}</p>
      </div>
    );
  }

  // Get feature-specific parameters
  const featureParams = featureData.parameters || getDefaultParametersForFeature(contentId);

  // Build code examples for CodeBlock component
  const codeExamples = [
    {
      language: "typescript",
      label: "TypeScript",
      icon: "ph:file-ts",
      code: featureData.codeExample || ""
    },
    {
      language: "javascript",
      label: "JavaScript",
      icon: "ph:file-js",
      code: featureData.jsExample || (featureData.codeExample?.replace(/: \w+(\[\])?/g, "") || "")
    },
    {
      language: "python",
      label: "Python",
      icon: "ph:file-py",
      code: featureData.pythonExample || generatePythonExample(featureData)
    },
    {
      language: "bash",
      label: "CLI",
      icon: "ph:terminal",
      code: featureData.cliExample || generateCLIExample(contentId, featureData)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <span>SDK Reference</span>
          <Icon icon="ph:caret-right" className="w-3 h-3" />
          <span>{featureData.title}</span>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold mb-2">{featureData.title}</h1>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">
                SDK
              </span>
              <code className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                @veil-protocol/sdk
              </code>
              <span className="px-2 py-0.5 rounded bg-success/10 text-success text-xs font-medium">
                CLI
              </span>
              <code className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                npx veil {contentId}
              </code>
            </div>
            <p className="text-muted-foreground">{featureData.details}</p>
          </div>
          <Link
            to="/cli"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Icon icon="ph:terminal" className="w-4 h-4" />
            Try with CLI
          </Link>
        </div>
      </motion.div>

      {/* Quick Start Flow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-panel rounded-xl p-4"
      >
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Icon icon="ph:rocket" className="w-4 h-4 text-primary" />
          Quick Start
        </h3>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span>
            <code className="font-mono">npm i @veil-protocol/sdk</code>
          </div>
          <Icon icon="ph:arrow-right" className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span>
            <code className="font-mono">import {"{"} {featureData.methods[0]?.name || "VeilClient"} {"}"}</code>
          </div>
          <Icon icon="ph:arrow-right" className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span>
            <span>Call methods</span>
          </div>
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column - Parameters & Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Methods Section */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Icon icon="ph:function" className="w-4 h-4 text-primary" />
              Available Methods
            </h3>
            <div className="space-y-4">
              {featureData.methods.map((method, idx) => (
                <div key={method.name} className={`${idx > 0 ? "pt-4 border-t border-border" : ""}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <code className="text-sm font-mono text-primary font-medium">{method.name}()</code>
                    <span className="px-2 py-0.5 rounded bg-success/10 text-success text-xs">async</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{method.desc}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Returns:</span>
                    <code className="font-mono text-primary bg-primary/5 px-2 py-0.5 rounded">{method.returns}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Parameters Section */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Icon icon="ph:sliders" className="w-4 h-4 text-primary" />
              Parameters
            </h3>
            <div className="space-y-4">
              {featureParams.map((param, idx) => (
                <div key={param.name} className={`${idx > 0 ? "pt-4 border-t border-border" : ""}`}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <code className="text-sm font-mono font-medium">{param.name}</code>
                    <span className="text-xs text-muted-foreground">{param.type}</span>
                    {param.required && (
                      <span className="px-1.5 py-0.5 rounded bg-destructive/10 text-destructive text-xs">required</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{param.description}</p>
                  {param.notes && (
                    <ul className="mt-2 space-y-1">
                      {param.notes.map((note, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Code Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Code Block with proper syntax highlighting */}
          <CodeBlock examples={codeExamples} title="Usage Example" />

          {/* Response Example */}
          <CodeBlock
            examples={[{
              language: "typescript",
              label: "Response",
              icon: "ph:code",
              code: featureData.responseExample || generateResponseExample(contentId)
            }]}
            title="Response"
          />

          {/* SDK Flow */}
          <div className="glass-panel rounded-xl p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Icon icon="ph:flow-arrow" className="w-4 h-4 text-primary" />
              Integration Flow
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                <Icon icon="ph:number-circle-one" className="w-4 h-4 text-primary" />
                <span>Install SDK: <code className="font-mono text-primary">npm i @veil-protocol/sdk</code></span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                <Icon icon="ph:number-circle-two" className="w-4 h-4 text-primary" />
                <span>Connect wallet using <code className="font-mono text-primary">useWallet()</code> hook</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                <Icon icon="ph:number-circle-three" className="w-4 h-4 text-primary" />
                <span>Derive Veil identity with <code className="font-mono text-primary">deriveIdentity()</code></span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                <Icon icon="ph:number-circle-four" className="w-4 h-4 text-primary" />
                <span>Call <code className="font-mono text-primary">{featureData.methods[0]?.name}()</code></span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function generatePythonExample(featureData: { title: string; methods: { name: string }[] }) {
  return `# ${featureData.title} - Python SDK
from veil_protocol import VeilClient, Connection

# Initialize client
connection = Connection("https://api.devnet.solana.com")
client = VeilClient(connection)

# Connect your wallet
wallet = client.connect_wallet()

# Call the method
result = await client.${featureData.methods[0]?.name || "execute"}(
    wallet=wallet.public_key,
    # Add your parameters here
)

print(f"Result: {result}")`;
}

function generateCLIExample(contentId: string, featureData: { title: string; methods: { name: string }[] }) {
  return `# ${featureData.title} - CLI Usage

# First, create a new Veil project
npx create-veil-app my-app
cd my-app

# Or add to existing project
npx veil init

# Run the ${contentId} command
npx veil ${contentId} --wallet <YOUR_WALLET>

# Interactive mode
npx veil ${contentId} --interactive`;
}

function generateResponseExample(contentId: string) {
  return `{
  "success": true,
  "data": {
    "id": "veil_${contentId.replace(/-/g, "_")}_${Math.random().toString(36).slice(2, 8)}",
    "status": "completed",
    "commitment": "0x7f3a2b...",
    "proof": {
      "type": "groth16",
      "verified": true
    }
  },
  "meta": {
    "network": "devnet",
    "slot": 123456789
  }
}`;
}

function getDefaultParametersForFeature(contentId: ActiveContent) {
  const parametersByFeature: Record<string, Array<{ name: string; type: string; required: boolean; description: string; notes?: string[] }>> = {
    "shielded-balances": [
      { name: "wallet", type: "PublicKey", required: true, description: "Your Solana wallet public key", notes: ["Must be connected via wallet adapter"] },
      { name: "amount", type: "number", required: true, description: "Amount to deposit/withdraw in SOL", notes: ["Minimum: 0.001 SOL", "Will be encrypted on-chain"] },
      { name: "encryptionKey", type: "Uint8Array", required: true, description: "Your encryption key for balance privacy", notes: ["Derived from your Veil identity", "Never shared or stored on-chain"] },
    ],
    "private-transfers": [
      { name: "recipient", type: "PublicKey", required: true, description: "Recipient's public key or stealth address", notes: ["Can be a regular Solana address or Veil stealth address"] },
      { name: "amount", type: "number", required: true, description: "Amount to transfer", notes: ["Hidden from observers using range proofs"] },
      { name: "hideAmount", type: "boolean", required: false, description: "Whether to hide the transfer amount", notes: ["Defaults to true", "Uses Bulletproofs for amount hiding"] },
    ],
    "zk-identity": [
      { name: "type", type: "'email' | 'passkey'", required: true, description: "Authentication method to use", notes: ["Email uses magic link", "Passkey uses WebAuthn"] },
      { name: "value", type: "string", required: true, description: "Email address or passkey identifier", notes: ["Never stored on-chain", "Only commitment is published"] },
      { name: "salt", type: "string", required: false, description: "Optional salt for deterministic derivation", notes: ["Use for reproducible wallet derivation"] },
    ],
    "token-privacy": [
      { name: "mint", type: "PublicKey", required: true, description: "SPL token mint address", notes: ["Any SPL token can be wrapped"] },
      { name: "amount", type: "number", required: true, description: "Amount of tokens to wrap", notes: ["In token's native decimals"] },
      { name: "private", type: "boolean", required: false, description: "Enable privacy features", notes: ["Defaults to true"] },
    ],
    "dex-integration": [
      { name: "fromToken", type: "PublicKey", required: true, description: "Token to swap from", notes: ["Must have sufficient balance"] },
      { name: "toToken", type: "PublicKey", required: true, description: "Token to receive", notes: ["Supported on major Solana DEXs"] },
      { name: "amount", type: "number", required: true, description: "Amount to swap", notes: ["Hidden from observers"] },
      { name: "slippage", type: "number", required: false, description: "Maximum slippage tolerance", notes: ["Defaults to 0.5%"] },
    ],
    "recovery": [
      { name: "guardians", type: "PublicKey[]", required: true, description: "Array of guardian public keys", notes: ["Minimum 2 guardians", "Guardian identities are hidden"] },
      { name: "threshold", type: "number", required: true, description: "Number of guardians needed for recovery", notes: ["Must be less than total guardians"] },
      { name: "timelock", type: "number", required: false, description: "Delay before recovery completes (seconds)", notes: ["Defaults to 24 hours"] },
    ],
    "private-voting": [
      { name: "proposalId", type: "string", required: true, description: "The proposal to vote on", notes: ["Must be an active proposal"] },
      { name: "choice", type: "number", required: true, description: "Your vote choice (0, 1, 2...)", notes: ["Hidden until reveal phase"] },
      { name: "salt", type: "string", required: true, description: "Random salt for commitment", notes: ["Save this - needed for reveal!"] },
    ],
    "stealth-multisig": [
      { name: "signers", type: "PublicKey[]", required: true, description: "Array of signer public keys", notes: ["Signer identities are hidden"] },
      { name: "threshold", type: "number", required: true, description: "Signatures required to execute", notes: ["e.g., 2-of-3 multisig"] },
      { name: "name", type: "string", required: false, description: "Optional name for the multisig", notes: ["Stored encrypted"] },
    ],
    "private-staking": [
      { name: "validator", type: "PublicKey", required: true, description: "Validator to stake with", notes: ["Must be an active validator"] },
      { name: "amount", type: "number", required: true, description: "Amount to stake in SOL", notes: ["Hidden from observers"] },
      { name: "hideAmount", type: "boolean", required: false, description: "Whether to hide stake amount", notes: ["Defaults to true"] },
    ],
  };

  return parametersByFeature[contentId] || [
    { name: "wallet", type: "PublicKey", required: true, description: "Your connected wallet public key", notes: ["Connect via wallet adapter"] },
    { name: "connection", type: "Connection", required: true, description: "Solana RPC connection", notes: ["Use devnet for testing"] },
  ];
}

function getFeatureData(contentId: ActiveContent) {
  const allFeatures = [...featureCards, ...institutionalFeatures, ...developerToolsFeatures];
  const contentToFeatureMap: Record<string, string> = {
    "shielded-balances": "Shielded Balances",
    "private-transfers": "Private Transfers",
    "token-privacy": "Token Privacy",
    "dex-integration": "DEX Integration",
    "zk-identity": "ZK Identity",
    "recovery": "Private Recovery",
    "private-voting": "Private Voting",
    "stealth-multisig": "Stealth Multisig",
    "private-staking": "Private Staking",
    "cli": "CLI Scaffolding",
    "sdk": "SDK Documentation",
    "shadowwire": "ShadowWire",
  };

  const featureTitle = contentToFeatureMap[contentId];
  return allFeatures.find(f => f.title === featureTitle) || null;
}

const developerToolsFeatures = [
  {
    title: "Token Privacy",
    description: "Privacy layer for any SPL token.",
    icon: "ph:coins",
    color: "warning",
    details: "Wrap any SPL token with privacy features. Enables shielded balances and private transfers for existing tokens without modifying the original token contract.",
    methods: [
      { name: "wrapToken", desc: "Wrap SPL token for privacy", returns: "WrappedToken" },
      { name: "unwrapToken", desc: "Unwrap back to original token", returns: "TransactionSignature" },
      { name: "getWrappedBalance", desc: "Get shielded balance of wrapped token", returns: "number" },
    ],
    codeExample: `const wrapped = await wrapToken(usdcMint, amount);
await wrapped.transfer(recipient, 100, { private: true });`,
  },
  {
    title: "DEX Integration",
    description: "Private swaps with hidden trade amounts.",
    icon: "ph:swap",
    color: "primary",
    details: "Execute swaps on Solana DEXs with hidden amounts. Uses range proofs to prove swap validity without revealing exact amounts traded.",
    methods: [
      { name: "privateSwap", desc: "Execute swap with hidden amounts", returns: "TransactionSignature" },
      { name: "getQuote", desc: "Get swap quote (reveals no amounts)", returns: "Quote" },
      { name: "limitOrder", desc: "Place private limit order", returns: "Order" },
    ],
    codeExample: `await dex.privateSwap({
  from: 'SOL',
  to: 'USDC',
  amount: 10,
  hideAmount: true
});`,
  },
  {
    title: "Private Staking",
    description: "Stake with hidden amounts and rewards.",
    icon: "ph:stack",
    color: "success",
    details: "Stake tokens while hiding your stake amount and earned rewards. Proves you're a staker without revealing how much you've staked.",
    methods: [
      { name: "privateStake", desc: "Stake with hidden amount", returns: "TransactionSignature" },
      { name: "claimRewards", desc: "Claim staking rewards privately", returns: "TransactionSignature" },
      { name: "getStakeProof", desc: "Generate proof of staking", returns: "StakeProof" },
    ],
    codeExample: `await staking.stake({
  amount: 1000,
  validator: validatorPubkey,
  hideAmount: true
});`,
  },
  {
    title: "CLI Scaffolding",
    description: "Scaffold privacy-first apps with npx create-veil-app.",
    icon: "ph:terminal",
    color: "primary",
    details: "Bootstrap a complete Veil-powered application with one command. Includes wallet integration, identity proofs, shielded balances, and example components.",
    methods: [
      { name: "create-veil-app", desc: "Create new Veil project", returns: "Project files" },
      { name: "veil init", desc: "Add Veil to existing project", returns: "Config files" },
      { name: "veil generate", desc: "Generate components/hooks", returns: "Source files" },
    ],
    codeExample: `npx create-veil-app my-private-app
cd my-private-app
npm run dev`,
  },
  {
    title: "SDK Documentation",
    description: "Complete SDK reference and guides.",
    icon: "ph:book-open",
    color: "success",
    details: "Comprehensive documentation for all Veil SDK modules. Includes API references, code examples, best practices, and integration guides.",
    methods: [
      { name: "@veil-protocol/sdk", desc: "Main SDK package", returns: "VeilSDK" },
      { name: "@veil-protocol/react", desc: "React hooks and components", returns: "React components" },
      { name: "@veil-protocol/cli", desc: "CLI tools for development", returns: "CLI commands" },
    ],
    codeExample: `import { VeilProvider } from '@veil-protocol/react';
import { useVeilWallet, useShieldedBalance } from '@veil-protocol/react';`,
  },
  {
    title: "ShadowWire",
    description: "Real-time private messaging and data sync.",
    icon: "ph:lightning",
    color: "warning",
    details: "End-to-end encrypted messaging and data synchronization between Veil wallets. Messages are encrypted client-side and relayed through decentralized infrastructure.",
    methods: [
      { name: "sendMessage", desc: "Send encrypted message", returns: "MessageReceipt" },
      { name: "subscribe", desc: "Subscribe to incoming messages", returns: "Subscription" },
      { name: "syncData", desc: "Sync encrypted data across devices", returns: "SyncResult" },
    ],
    codeExample: `const shadowwire = new ShadowWire(veilWallet);
await shadowwire.sendMessage(recipientPubkey, {
  content: 'Private message',
  encrypted: true
});`,
  },
];

interface OverviewSectionProps {
  veilWallet: string | null;
  commitment: string | null;
  quickStartCode: string;
}

function OverviewSection({ veilWallet, commitment, quickStartCode }: OverviewSectionProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-xl p-6 border-2 border-primary/20"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Veil Developer Portal</h2>
            <p className="text-muted-foreground">
              Privacy infrastructure for Solana. Build apps where identity stays private.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Devnet
            </span>
          </div>
        </div>

        {/* Wallet Status */}
        <div className="mt-4 p-4 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon icon="ph:wallet" className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Your Veil Wallet</p>
                <p className="text-xs font-mono text-muted-foreground">
                  {veilWallet ? `${veilWallet.slice(0, 12)}...${veilWallet.slice(-8)}` : "Not connected"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Commitment</p>
              <p className="text-xs font-mono text-primary">
                {commitment ? `${commitment.slice(0, 8)}...` : "—"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Start */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Icon icon="ph:rocket" className="w-5 h-5 text-primary" />
            Quick Start
          </h3>
          <Link
            to="/sdk"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Full SDK Docs
            <Icon icon="ph:arrow-right" className="w-3 h-3" />
          </Link>
        </div>
        <CodeBlock
          examples={[
            {
              language: "typescript",
              label: "TypeScript",
              icon: "ph:file-ts",
              code: quickStartCode
            }
          ]}
        />
        <div className="mt-4 flex gap-3">
          <Link
            to="/cli"
            className="flex-1 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Icon icon="ph:terminal" className="w-4 h-4" />
            npx create-veil-app
          </Link>
          <Link
            to="/sdk"
            className="flex-1 py-2.5 border border-border font-medium rounded-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Icon icon="ph:book-open" className="w-4 h-4" />
            Read the Docs
          </Link>
        </div>
      </motion.div>

      {/* Feature Grid */}
      <FeatureGrid />

      {/* Institutional Privacy Features */}
      <InstitutionalFeaturesSection />

      {/* SDK Modules */}
      <SDKModulesSection />
    </div>
  );
}

const featureCards = [
  {
    title: "ZK Identity",
    description: "Email/passkey → unlinkable wallet. No identity on-chain.",
    icon: "ph:fingerprint",
    color: "primary",
    details: "Generate zero-knowledge proofs from email or passkey authentication. Your identity is never stored on-chain - only a cryptographic commitment that proves you control the account.",
    methods: [
      { name: "generateIdentityProof", desc: "Create ZK proof from email/passkey", returns: "IdentityProof" },
      { name: "verifyIdentityProof", desc: "Verify a proof on-chain", returns: "boolean" },
      { name: "deriveWallet", desc: "Derive deterministic wallet from identity", returns: "Keypair" },
    ],
    codeExample: `const proof = await generateIdentityProof({
  type: 'email',
  value: 'user@example.com'
});`,
  },
  {
    title: "Shielded Balances",
    description: "Hide your holdings. Only you can see your balance.",
    icon: "ph:eye-slash",
    color: "success",
    details: "Encrypt your token balances using ElGamal encryption. Balances are stored on-chain but only visible to the owner with their encryption key.",
    methods: [
      { name: "deposit", desc: "Deposit tokens into shielded pool", returns: "TransactionSignature" },
      { name: "withdraw", desc: "Withdraw from shielded pool", returns: "TransactionSignature" },
      { name: "getBalance", desc: "Decrypt and view your balance", returns: "number" },
    ],
    codeExample: `const shielded = new ShieldedBalanceClient(connection, encryptionKey);
await shielded.deposit(wallet, 1.0, signTransaction);`,
  },
  {
    title: "Private Transfers",
    description: "Send value with hidden amounts via ShadowPay.",
    icon: "ph:paper-plane-tilt",
    color: "warning",
    details: "Transfer tokens with hidden amounts using range proofs. Recipients receive exact amounts while observers only see encrypted values.",
    methods: [
      { name: "createPrivateTransfer", desc: "Create transfer with hidden amount", returns: "Transaction" },
      { name: "claimTransfer", desc: "Claim incoming private transfer", returns: "TransactionSignature" },
      { name: "getIncomingTransfers", desc: "List pending transfers to you", returns: "Transfer[]" },
    ],
    codeExample: `await shadowPay.transfer({
  to: recipientPubkey,
  amount: 5.0,
  hideAmount: true
});`,
  },
  {
    title: "Private Recovery",
    description: "Shamir secret sharing with hidden guardians.",
    icon: "ph:lifebuoy",
    color: "primary",
    details: "Split your recovery key among trusted guardians using Shamir's Secret Sharing. Guardian identities remain hidden - only their commitments are stored.",
    methods: [
      { name: "setupRecovery", desc: "Configure guardians and threshold", returns: "RecoveryConfig" },
      { name: "initiateRecovery", desc: "Start recovery process", returns: "RecoverySession" },
      { name: "submitShare", desc: "Guardian submits their share", returns: "boolean" },
    ],
    codeExample: `await recovery.setup({
  guardians: [guardian1, guardian2, guardian3],
  threshold: 2
});`,
  },
  {
    title: "Private Voting",
    description: "Commit-reveal voting for DAOs. Hidden until reveal.",
    icon: "ph:check-square",
    color: "success",
    details: "Two-phase voting where votes are committed as hashes first, then revealed after voting ends. Prevents vote manipulation and bandwagon effects.",
    methods: [
      { name: "commitVote", desc: "Submit encrypted vote commitment", returns: "TransactionSignature" },
      { name: "revealVote", desc: "Reveal your vote after period ends", returns: "TransactionSignature" },
      { name: "tallyVotes", desc: "Count revealed votes", returns: "VoteResult" },
    ],
    codeExample: `await voting.commit(proposalId, choice, salt);
// After voting period...
await voting.reveal(proposalId, choice, salt);`,
  },
  {
    title: "Stealth Multisig",
    description: "Multi-signature with hidden signer identities.",
    icon: "ph:users-three",
    color: "warning",
    details: "Create multi-signature wallets where signer identities are hidden. Only the number of required signatures is public, not who signed.",
    methods: [
      { name: "createStealthMultisig", desc: "Create new stealth multisig", returns: "MultisigAccount" },
      { name: "proposeTransaction", desc: "Propose a transaction", returns: "Proposal" },
      { name: "signProposal", desc: "Add your signature privately", returns: "TransactionSignature" },
    ],
    codeExample: `const multisig = await createStealthMultisig({
  signers: [signer1, signer2, signer3],
  threshold: 2
});`,
  },
];

const institutionalFeatures = [
  {
    title: "Confidential Transfers",
    subtitle: "Non-Anonymous",
    description: "Hide transaction amounts using ElGamal encryption. Balances stay confidential while identity is revealed.",
    icon: "ph:lock-laminated",
    color: "primary",
    privacyType: "non-anonymous",
    details: "Built on Solana's Token-2022 standard, confidential transfers encrypt amounts while keeping sender/receiver public. Ideal for payroll, treasury management, and B2B payments where parties are known but amounts should be private.",
    methods: [
      { name: "enableConfidential", desc: "Enable confidential transfers for token", returns: "TransactionSignature" },
      { name: "confidentialTransfer", desc: "Transfer with encrypted amount", returns: "TransactionSignature" },
      { name: "decryptBalance", desc: "View your encrypted balance", returns: "number" },
    ],
    codeExample: `import { ConfidentialClient } from '@veil-protocol/sdk/confidential';

const client = new ConfidentialClient(connection);
await client.enableConfidential(tokenMint);
await client.transfer({
  to: recipientPubkey,
  amount: 1000, // Hidden from observers
  mint: tokenMint
});`,
    parameters: [
      { name: "tokenMint", type: "PublicKey", required: true, description: "The SPL Token-2022 mint address", notes: ["Must be a Token-2022 token with confidential transfer extension enabled"] },
      { name: "recipient", type: "PublicKey", required: true, description: "The recipient's public key (visible on-chain)", notes: ["Identity is NOT hidden - only amounts are encrypted"] },
      { name: "amount", type: "number", required: true, description: "Amount to transfer (will be encrypted)", notes: ["Uses ElGamal encryption", "Only sender and recipient can decrypt"] },
    ],
    responseExample: `{
  "success": true,
  "signature": "5KtP...xyz",
  "data": {
    "sender": "Abc123...xyz",
    "recipient": "Def456...uvw",
    "encryptedAmount": "0x7f3a...",
    "proofValid": true
  }
}`,
  },
  {
    title: "ZK-KYC Compliance",
    subtitle: "Identity + Audit",
    description: "Prove compliance without exposing personal data. Regulators get audit keys for selective transparency.",
    icon: "ph:identification-badge",
    color: "success",
    privacyType: "identity",
    details: "Generate ZK proofs of KYC status (age, jurisdiction, accreditation) without revealing underlying data. Auditors can be granted selective view access via audit keys. Perfect for regulated DeFi applications.",
    methods: [
      { name: "generateKYCProof", desc: "Create proof of KYC attribute", returns: "KYCProof" },
      { name: "grantAuditAccess", desc: "Give auditor view access", returns: "AuditKey" },
      { name: "revokeAuditAccess", desc: "Revoke auditor access", returns: "TransactionSignature" },
      { name: "verifyCompliance", desc: "Verify user meets compliance criteria", returns: "boolean" },
    ],
    codeExample: `import { ZKKYCClient } from '@veil-protocol/sdk/kyc';

const kyc = new ZKKYCClient(connection);

// Prove you're over 18 without revealing age
const ageProof = await kyc.generateProof({
  attribute: 'age',
  condition: 'gte',
  value: 18
});

// Grant auditor view access
await kyc.grantAuditAccess(auditorPubkey, {
  attributes: ['jurisdiction'],
  expiresAt: Date.now() + 86400000
});`,
    parameters: [
      { name: "attribute", type: "string", required: true, description: "The KYC attribute to prove (age, jurisdiction, accreditation)", notes: ["Supports: age, jurisdiction, accreditedInvestor, sanctionsCheck"] },
      { name: "condition", type: "string", required: true, description: "Comparison operator", notes: ["Supports: eq, gt, gte, lt, lte, in, notIn"] },
      { name: "auditorPubkey", type: "PublicKey", required: false, description: "Auditor's public key for selective disclosure", notes: ["Auditor can only view granted attributes", "Access can be revoked at any time"] },
    ],
    responseExample: `{
  "success": true,
  "proof": {
    "type": "groth16",
    "attribute": "age",
    "condition": "gte:18",
    "verified": true,
    "commitment": "0x8a2f..."
  }
}`,
  },
  {
    title: "Anonymous Ramps",
    subtitle: "Fully Anonymous",
    description: "Stealth addresses for deposits, P2P escrow for fiat on/off ramps. Hide identity while amounts are public.",
    icon: "ph:user-circle-minus",
    color: "warning",
    privacyType: "anonymous",
    details: "Generate one-time stealth addresses for receiving funds. Combined with P2P escrow, enables fiat on/off ramps without linking your main wallet. Amounts are visible but sender/receiver identities are completely hidden.",
    methods: [
      { name: "generateStealthAddress", desc: "Create one-time receive address", returns: "StealthAddress" },
      { name: "scanForDeposits", desc: "Scan blockchain for your deposits", returns: "Deposit[]" },
      { name: "createEscrow", desc: "Create P2P escrow contract", returns: "EscrowAccount" },
      { name: "releaseEscrow", desc: "Release funds to recipient", returns: "TransactionSignature" },
    ],
    codeExample: `import { StealthClient } from '@veil-protocol/sdk/stealth';

const stealth = new StealthClient(connection, veilWallet);

// Generate one-time address (unlinkable to your main wallet)
const stealthAddr = await stealth.generateStealthAddress();
console.log('Send funds to:', stealthAddr.address);

// Later, scan for deposits
const deposits = await stealth.scanForDeposits();

// Create P2P escrow for fiat ramp
const escrow = await stealth.createEscrow({
  amount: 100,
  counterparty: 'anonymous', // No identity required
  timeout: 3600
});`,
    parameters: [
      { name: "viewingKey", type: "Keypair", required: true, description: "Your private viewing key (never shared)", notes: ["Used to scan for incoming deposits", "Derived from your Veil identity"] },
      { name: "spendingKey", type: "Keypair", required: true, description: "Your private spending key", notes: ["Required to spend received funds", "Never leaves your device"] },
      { name: "escrowTimeout", type: "number", required: false, description: "Escrow timeout in seconds", notes: ["Defaults to 24 hours", "Funds return to sender if not completed"] },
    ],
    responseExample: `{
  "stealthAddress": {
    "address": "Stlth8x...",
    "ephemeralPubkey": "Eph7y2...",
    "viewTag": "0xa3"
  },
  "deposits": [
    { "amount": 100, "timestamp": 1706640000 }
  ]
}`,
  },
];

function FeatureGrid() {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const toggleFeature = (title: string) => {
    setExpandedFeature(expandedFeature === title ? null : title);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Icon icon="ph:squares-four" className="w-5 h-5 text-primary" />
        Privacy Features
      </h3>
      <div className="space-y-3">
        {featureCards.map((feature) => (
          <div key={feature.title} className="glass-panel rounded-xl overflow-hidden">
            <button
              onClick={() => toggleFeature(feature.title)}
              className="w-full p-4 hover:bg-secondary/50 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${feature.color}/10 flex items-center justify-center flex-shrink-0`}>
                  <Icon icon={feature.icon} className={`w-5 h-5 text-${feature.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-0.5">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
                <Icon
                  icon={expandedFeature === feature.title ? "ph:caret-up" : "ph:caret-down"}
                  className="w-5 h-5 text-muted-foreground flex-shrink-0"
                />
              </div>
            </button>

            {expandedFeature === feature.title && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border"
              >
                <div className="p-4 space-y-4">
                  {/* Explanation */}
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-sm text-muted-foreground">{feature.details}</p>
                  </div>

                  {/* API Methods Table */}
                  <div>
                    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      API Methods
                    </h5>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-secondary/50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Method</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Description</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Returns</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {feature.methods.map((method) => (
                            <tr key={method.name} className="hover:bg-secondary/30">
                              <td className="px-3 py-2">
                                <code className="text-xs font-mono text-primary">{method.name}</code>
                              </td>
                              <td className="px-3 py-2 text-xs text-muted-foreground hidden sm:table-cell">{method.desc}</td>
                              <td className="px-3 py-2">
                                <code className="text-xs font-mono text-muted-foreground">{method.returns}</code>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Code Example */}
                  <div>
                    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Quick Example
                    </h5>
                    <pre className="p-3 rounded-lg bg-[#0d1117] text-xs font-mono overflow-x-auto">
                      <code className="text-green-400">{feature.codeExample}</code>
                    </pre>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

const sdkModules = [
  { name: "identity", icon: "ph:fingerprint", desc: "ZK identity proofs" },
  { name: "shielded", icon: "ph:eye-slash", desc: "Shielded balances" },
  { name: "transfer", icon: "ph:arrows-left-right", desc: "Private transfers" },
  { name: "tokens", icon: "ph:coins", desc: "SPL token privacy" },
  { name: "dex", icon: "ph:swap", desc: "DEX integration" },
  { name: "recovery", icon: "ph:key", desc: "Wallet recovery" },
  { name: "voting", icon: "ph:check-square", desc: "Private voting" },
  { name: "multisig", icon: "ph:users-three", desc: "Stealth multisig" },
];

function SDKModulesSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-panel rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Icon icon="ph:package" className="w-5 h-5 text-primary" />
          SDK Modules
        </h3>
        <code className="text-xs px-2 py-1 rounded bg-secondary font-mono">
          @veil-protocol/sdk
        </code>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sdkModules.map((mod) => (
          <div
            key={mod.name}
            className="p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon icon={mod.icon} className="w-4 h-4 text-primary" />
              <code className="text-xs font-mono font-medium">{mod.name}</code>
            </div>
            <p className="text-xs text-muted-foreground">{mod.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Icon icon="ph:terminal" className="w-4 h-4 text-primary" />
          <span>
            Install: <code className="font-mono text-primary">npm install @veil-protocol/sdk</code>
          </span>
        </p>
      </div>
    </motion.div>
  );
}

function InstitutionalFeaturesSection() {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const toggleFeature = (title: string) => {
    setExpandedFeature(expandedFeature === title ? null : title);
  };

  const getPrivacyTypeBadge = (privacyType: string) => {
    switch (privacyType) {
      case "anonymous":
        return { bg: "bg-warning/10", text: "text-warning", label: "🔒 Anonymous", icon: "ph:eye-slash" };
      case "non-anonymous":
        return { bg: "bg-primary/10", text: "text-primary", label: "👤 Non-Anonymous", icon: "ph:user" };
      case "identity":
        return { bg: "bg-success/10", text: "text-success", label: "🆔 Identity Layer", icon: "ph:identification-card" };
      default:
        return { bg: "bg-secondary", text: "text-muted-foreground", label: privacyType, icon: "ph:info" };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon icon="ph:buildings" className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Institutional Privacy Features</h3>
      </div>

      {/* Privacy Types Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs text-muted-foreground mr-2">Privacy Types:</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-warning/10 text-warning text-xs">
          <Icon icon="ph:eye-slash" className="w-3 h-3" />
          Anonymous
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
          <Icon icon="ph:user" className="w-3 h-3" />
          Non-Anonymous
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-success/10 text-success text-xs">
          <Icon icon="ph:identification-card" className="w-3 h-3" />
          Identity Layer
        </span>
      </div>

      <div className="space-y-3">
        {institutionalFeatures.map((feature) => {
          const badge = getPrivacyTypeBadge(feature.privacyType);
          return (
            <div key={feature.title} className="glass-panel rounded-xl overflow-hidden">
              <button
                onClick={() => toggleFeature(feature.title)}
                className="w-full p-4 hover:bg-secondary/50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${feature.color}/10 flex items-center justify-center flex-shrink-0`}>
                    <Icon icon={feature.icon} className={`w-5 h-5 text-${feature.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm">{feature.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded ${badge.bg} ${badge.text} flex items-center gap-1`}>
                        <Icon icon={badge.icon} className="w-3 h-3" />
                        {feature.subtitle}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                  </div>
                  <Icon
                    icon={expandedFeature === feature.title ? "ph:caret-up" : "ph:caret-down"}
                    className="w-5 h-5 text-muted-foreground flex-shrink-0"
                  />
                </div>
              </button>

              {expandedFeature === feature.title && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border"
                >
                  <div className="p-4 space-y-4">
                    {/* Privacy Type Indicator */}
                    <div className={`p-3 rounded-lg ${badge.bg} flex items-start gap-3`}>
                      <Icon icon={badge.icon} className={`w-5 h-5 ${badge.text} flex-shrink-0 mt-0.5`} />
                      <div>
                        <p className={`text-sm font-medium ${badge.text}`}>
                          {feature.privacyType === "anonymous" && "Fully Anonymous - Identity Hidden"}
                          {feature.privacyType === "non-anonymous" && "Non-Anonymous - Identity Visible, Amounts Hidden"}
                          {feature.privacyType === "identity" && "Identity Layer - Selective Disclosure"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{feature.details}</p>
                      </div>
                    </div>

                    {/* API Methods Table */}
                    <div>
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        API Methods
                      </h5>
                      <div className="rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-secondary/50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Method</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Description</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Returns</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {feature.methods.map((method) => (
                              <tr key={method.name} className="hover:bg-secondary/30">
                                <td className="px-3 py-2">
                                  <code className="text-xs font-mono text-primary">{method.name}</code>
                                </td>
                                <td className="px-3 py-2 text-xs text-muted-foreground hidden sm:table-cell">{method.desc}</td>
                                <td className="px-3 py-2">
                                  <code className="text-xs font-mono text-muted-foreground">{method.returns}</code>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Code Example */}
                    {feature.codeExample && (
                      <div>
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Code Example
                        </h5>
                        <pre className="p-3 rounded-lg bg-[#0d1117] text-xs font-mono overflow-x-auto">
                          <code className="text-green-400">{feature.codeExample}</code>
                        </pre>
                      </div>
                    )}

                    {/* Response Example */}
                    {feature.responseExample && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Response Example
                          </h5>
                          <span className="px-2 py-0.5 rounded bg-success/10 text-success text-xs">200 OK</span>
                        </div>
                        <pre className="p-3 rounded-lg bg-[#0d1117] text-xs font-mono overflow-x-auto">
                          <code className="text-blue-400">{feature.responseExample}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs font-medium text-primary">Anonymous</p>
            <p className="text-xs text-muted-foreground">Identity hidden, amounts visible</p>
          </div>
          <div>
            <p className="text-xs font-medium text-primary">Non-Anonymous</p>
            <p className="text-xs text-muted-foreground">Identity visible, amounts hidden</p>
          </div>
          <div>
            <p className="text-xs font-medium text-primary">Identity Layer</p>
            <p className="text-xs text-muted-foreground">Selective disclosure with audit</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
