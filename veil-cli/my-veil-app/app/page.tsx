"use client";

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
            my-veil-app
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
