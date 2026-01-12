import { VeilConfig } from "../cli.js";

export function generateLayoutTsx(config: VeilConfig): string {
  return `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "${config.projectName}",
  description: "Privacy-first Solana app built with Veil",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
`;
}

export function generateGlobalsCss(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 255, 255, 255;
  --background-start-rgb: 10, 10, 20;
  --background-end-rgb: 20, 20, 40;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
    to bottom,
    rgb(var(--background-start-rgb)),
    rgb(var(--background-end-rgb))
  );
  min-height: 100vh;
}

/* Veil custom utilities */
.glass {
  @apply bg-white/5 backdrop-blur-xl border border-white/10;
}

.glass-hover {
  @apply hover:bg-white/10 hover:border-white/20 transition-all duration-300;
}
`;
}

export function generateTailwindConfig(config: VeilConfig): string {
  const contentPath = config.template === "nextjs" 
    ? `"./app/**/*.{js,ts,jsx,tsx,mdx}",` 
    : `"./src/**/*.{js,ts,jsx,tsx,mdx}",`;

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    ${contentPath}
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        veil: {
          purple: "#7C3AED",
          blue: "#3B82F6",
          dark: "#0A0A14",
        },
      },
    },
  },
  plugins: [],
};
`;
}

export function generatePostcssConfig(): string {
  return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
}

export function generateNextConfig(): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

module.exports = nextConfig;
`;
}

export function generateProvidersTsx(config: VeilConfig): string {
  return `"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo, ReactNode } from "react";
import { VeilProvider } from "../contexts/VeilProvider";

import "@solana/wallet-adapter-react-ui/styles.css";

export function Providers({ children }: { children: ReactNode }) {
  const network = WalletAdapterNetwork.${config.network === "devnet" ? "Devnet" : "Devnet"};
  const endpoint = useMemo(() => {
    // Use Helius if configured, otherwise default
    if (typeof window === "undefined" && process.env.HELIUS_RPC_URL) {
      return process.env.HELIUS_RPC_URL;
    }
    return clusterApiUrl(network);
  }, [network]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <VeilProvider>{children}</VeilProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
`;
}

