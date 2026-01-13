import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

interface Brand {
  name: string;
  icon: string;
  category: "wallet" | "dex" | "cex" | "protocol";
}

const brands: Brand[] = [
  // Wallets
  { name: "Phantom", icon: "simple-icons:phantom", category: "wallet" },
  { name: "Solflare", icon: "ph:sun-bold", category: "wallet" },
  { name: "Backpack", icon: "ph:backpack-bold", category: "wallet" },
  { name: "Glow", icon: "ph:sun-dim-bold", category: "wallet" },
  { name: "Ledger", icon: "simple-icons:ledger", category: "wallet" },
  { name: "Coinbase Wallet", icon: "simple-icons:coinbase", category: "wallet" },
  { name: "Brave Wallet", icon: "simple-icons:brave", category: "wallet" },
  { name: "Trust Wallet", icon: "simple-icons:trustwallet", category: "wallet" },
  // DEXs
  { name: "Jupiter", icon: "ph:planet-bold", category: "dex" },
  { name: "Raydium", icon: "ph:drop-bold", category: "dex" },
  { name: "Orca", icon: "ph:fish-bold", category: "dex" },
  { name: "Meteora", icon: "ph:shooting-star-bold", category: "dex" },
  { name: "Phoenix", icon: "ph:fire-bold", category: "dex" },
  // CEXs
  { name: "Binance", icon: "simple-icons:binance", category: "cex" },
  { name: "Coinbase", icon: "simple-icons:coinbase", category: "cex" },
  { name: "Kraken", icon: "ph:waves-bold", category: "cex" },
  { name: "OKX", icon: "ph:circle-bold", category: "cex" },
  // Protocols
  { name: "Marinade", icon: "ph:waves-bold", category: "protocol" },
  { name: "Jito", icon: "ph:lightning-bold", category: "protocol" },
  { name: "Drift", icon: "ph:trend-up-bold", category: "protocol" },
];

// Duplicate for seamless loop
const duplicatedBrands = [...brands, ...brands];

interface BrandTickerProps {
  speed?: number;
  className?: string;
}

export function BrandTicker({ speed = 30, className = "" }: BrandTickerProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="text-center mb-6">
        <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
          Integrates with your favorite platforms
        </span>
      </div>
      
      {/* First row - moves left */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
        
        <motion.div
          className="flex gap-8"
          animate={{ x: [0, -50 * brands.length] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: speed,
              ease: "linear",
            },
          }}
        >
          {duplicatedBrands.map((brand, idx) => (
            <div
              key={`${brand.name}-${idx}`}
              className="flex items-center gap-3 px-6 py-3 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 hover:bg-secondary transition-all cursor-default flex-shrink-0 group"
            >
              <Icon 
                icon={brand.icon} 
                className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" 
              />
              <span className="text-sm font-medium whitespace-nowrap">{brand.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-medium ${
                brand.category === "wallet" 
                  ? "bg-primary/10 text-primary" 
                  : brand.category === "dex"
                  ? "bg-success/10 text-success"
                  : brand.category === "cex"
                  ? "bg-warning/10 text-warning"
                  : "bg-purple-500/10 text-purple-400"
              }`}>
                {brand.category}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
      
      {/* Second row - moves right (optional, for visual interest) */}
      <div className="relative mt-4">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
        
        <motion.div
          className="flex gap-8"
          animate={{ x: [-50 * brands.length, 0] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: speed * 1.2,
              ease: "linear",
            },
          }}
        >
          {[...duplicatedBrands].reverse().map((brand, idx) => (
            <div
              key={`${brand.name}-rev-${idx}`}
              className="flex items-center gap-3 px-6 py-3 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 hover:bg-secondary transition-all cursor-default flex-shrink-0 group"
            >
              <Icon 
                icon={brand.icon} 
                className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" 
              />
              <span className="text-sm font-medium whitespace-nowrap">{brand.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

