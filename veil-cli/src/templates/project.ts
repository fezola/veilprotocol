import { VeilConfig, TEMPLATE_INFO } from "../cli.js";

export function generatePackageJson(config: VeilConfig): string {
  const isNext = config.framework === "nextjs";

  const deps: Record<string, string> = {
    "@solana/web3.js": "^1.95.0",
    "@solana/wallet-adapter-base": "^0.9.23",
    "@solana/wallet-adapter-react": "^0.15.35",
    "@solana/wallet-adapter-react-ui": "^0.9.35",
    "@solana/wallet-adapter-phantom": "^0.9.24",
    "@solana/wallet-adapter-solflare": "^0.6.28",
  };

  // Add ShadowWire for mainnet private transfers
  if (config.features.shadowpay) {
    deps["@radr/shadowwire"] = "^0.1.0";
  }

  const devDeps: Record<string, string> = {
    "typescript": "^5.3.3",
    "@types/node": "^20.11.0",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.33",
    "autoprefixer": "^10.4.17",
  };

  if (isNext) {
    deps["next"] = "^14.1.0";
    deps["react"] = "^18.2.0";
    deps["react-dom"] = "^18.2.0";
    devDeps["@types/react"] = "^18.2.48";
    devDeps["@types/react-dom"] = "^18.2.18";
  } else {
    deps["react"] = "^18.2.0";
    deps["react-dom"] = "^18.2.0";
    devDeps["vite"] = "^5.0.12";
    devDeps["@vitejs/plugin-react"] = "^4.2.1";
    devDeps["@types/react"] = "^18.2.48";
    devDeps["@types/react-dom"] = "^18.2.18";
  }

  const scripts = isNext
    ? {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      }
    : {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      };

  const templateInfo = TEMPLATE_INFO[config.template];
  const pkg = {
    name: config.projectName,
    version: "0.1.0",
    description: `${templateInfo.name} - ${templateInfo.description}. Built with Veil privacy stack.`,
    private: true,
    scripts,
    dependencies: deps,
    devDependencies: devDeps,
  };

  return JSON.stringify(pkg, null, 2);
}

export function generateTsConfig(config: VeilConfig): string {
  const isNext = config.framework === "nextjs";

  if (isNext) {
    return JSON.stringify({
      compilerOptions: {
        target: "ES2017",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: { "@/*": ["./*"] },
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    }, null, 2);
  }

  return JSON.stringify({
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
    },
    include: ["src"],
    references: [{ path: "./tsconfig.node.json" }],
  }, null, 2);
}

export function generateAppEntry(config: VeilConfig): string {
  const isNext = config.template === "nextjs";

  if (isNext) {
    return `"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "./components/WalletButton";
import { PrivacyStatus } from "./components/PrivacyStatus";
import { useVeil } from "../hooks/useVeil";

export default function Home() {
  const { connected } = useWallet();
  const { isAuthenticated, login, logout } = useVeil();

  return (
    <main className="min-h-screen p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            ${config.projectName}
          </h1>
          <PrivacyStatus />
        </div>
        <WalletButton />
      </header>

      {/* Hero Section */}
      <section className="max-w-2xl mx-auto text-center mb-16">
        <h2 className="text-5xl font-bold mb-6">
          Privacy-First
          <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Solana App
          </span>
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          Built with Veil — Your identity is never on-chain.
        </p>

        {connected && !isAuthenticated && (
          <button
            onClick={login}
            className="px-8 py-3 rounded-xl font-semibold
                       bg-gradient-to-r from-purple-600 to-blue-600
                       hover:from-purple-700 hover:to-blue-700
                       transition-all duration-200 shadow-lg"
          >
            Create Private Session
          </button>
        )}

        {isAuthenticated && (
          <div className="glass rounded-xl p-6">
            <p className="text-green-400 mb-4">✅ You are privately authenticated</p>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white transition-colors"
            >
              End Session
            </button>
          </div>
        )}
      </section>

      {/* Privacy Guarantees */}
      <section className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold mb-6 text-center">Privacy Guarantees</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass rounded-xl p-6">
            <h4 className="text-green-400 font-semibold mb-2">✅ What's Private</h4>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• Your identity (never on-chain)</li>
              <li>• How you access your wallet</li>
              <li>• Who your recovery guardians are</li>
            </ul>
          </div>
          <div className="glass rounded-xl p-6">
            <h4 className="text-red-400 font-semibold mb-2">❌ What's Public (Solana)</h4>
            <ul className="text-gray-300 space-y-2 text-sm">
              <li>• Transaction amounts</li>
              <li>• Transaction recipients</li>
              <li>• Wallet balances</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
`;
  }

  // Vite version
  return `import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";

import "@solana/wallet-adapter-react-ui/styles.css";

export default function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <main style={{ padding: "2rem" }}>
            <h1>${config.projectName}</h1>
            <p>Privacy-first Solana app built with Veil</p>
          </main>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
`;
}

