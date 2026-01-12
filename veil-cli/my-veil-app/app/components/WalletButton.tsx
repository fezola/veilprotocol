"use client";

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
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
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
