import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "@/contexts/AuthContext";
import { NetworkStatusDot } from "@/components/ui/NetworkStatusBadge";

const featureItems = [
  { label: "ZK Identity", href: "/features/identity", icon: "ph:fingerprint", description: "Anonymous authentication with zero-knowledge proofs" },
  { label: "Shielded Balance", href: "/features/shielded", icon: "ph:eye-slash", description: "Hide your wallet balance from public view" },
  { label: "Private Transfers", href: "/features/transfers", icon: "ph:arrows-left-right", description: "Send funds without revealing amounts" },
  { label: "Private Voting", href: "/features/voting", icon: "ph:check-square", description: "Encrypted on-chain voting with hidden choices" },
  { label: "Private Multisig", href: "/features/multisig", icon: "ph:users-three", description: "Stealth signers - hide multisig participants" },
  { label: "Private Staking", href: "/features/staking", icon: "ph:coins", description: "Hidden stake amounts & rewards" },
  { label: "Token Privacy", href: "/features/tokens", icon: "ph:coins", description: "Private SPL token holdings" },
  { label: "DEX Integration", href: "/features/dex", icon: "ph:swap", description: "Private swaps on Jupiter & Raydium" },
  { label: "Recovery", href: "/features/recovery", icon: "ph:key", description: "Secure wallet recovery without seed phrases" },
];

const navItems = [
  { label: "About", href: "/about" },
  { label: "Why Privacy", href: "/why-privacy" },
  { label: "ShadowWire", href: "/shadowwire" },
  { label: "Demo", href: "/demo" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "SDK", href: "/sdk" },
  { label: "CLI", href: "/cli" },
  { label: "Docs", href: "/docs" },
  { label: "Whitepaper", href: "/whitepaper" },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);
  const { connected } = useWallet();
  const { isAuthenticated, veilWallet, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (featuresRef.current && !featuresRef.current.contains(event.target as Node)) {
        setFeaturesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Icon icon="ph:shield-check-fill" className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-lg">Veil</span>
          </Link>
          <NetworkStatusDot className="hidden sm:flex" />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`text-sm font-medium transition-colors ${
                location.pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Features Dropdown - at the end */}
          <div className="relative" ref={featuresRef}>
            <button
              onClick={() => setFeaturesOpen(!featuresOpen)}
              className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                location.pathname.startsWith("/features")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Features
              <Icon
                icon="ph:caret-down"
                className={`w-4 h-4 transition-transform ${featuresOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {featuresOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-80 bg-background/95 backdrop-blur-xl border rounded-xl shadow-xl p-2"
                >
                  {featureItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setFeaturesOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <Icon icon={item.icon} className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Veil Wallet Address */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20">
                <Icon icon="ph:shield-check" className="w-4 h-4 text-success" />
                <span className="text-xs font-mono text-success">
                  {truncateAddress(veilWallet || '')}
                </span>
              </div>

              {/* Solana Wallet Connection */}
              <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !h-9 !text-sm" />

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                title="Logout"
              >
                <Icon icon="ph:sign-out" className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2"
        >
          <Icon
            icon={mobileMenuOpen ? "ph:x" : "ph:list"}
            className="w-6 h-6"
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-t"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {/* Mobile Features Section - Collapsible */}
              <button
                onClick={() => setMobileFeaturesOpen(!mobileFeaturesOpen)}
                className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between w-full"
              >
                Features
                <Icon
                  icon="ph:caret-down"
                  className={`w-4 h-4 transition-transform ${mobileFeaturesOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {mobileFeaturesOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    {featureItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                          location.pathname === item.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary"
                        }`}
                      >
                        <Icon icon={item.icon} className="w-4 h-4" />
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="border-t border-border my-2" />

              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div className="border-t border-border my-2" />

              {isAuthenticated ? (
                <>
                  {/* Mobile Veil Wallet */}
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-success/10 border border-success/20">
                    <Icon icon="ph:shield-check" className="w-4 h-4 text-success" />
                    <span className="text-xs font-mono text-success">
                      {truncateAddress(veilWallet || '')}
                    </span>
                  </div>

                  {/* Mobile Wallet Connect */}
                  <div className="px-4 py-2">
                    <WalletMultiButton className="!w-full !bg-primary hover:!bg-primary/90" />
                  </div>

                  {/* Mobile Logout */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 text-center text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon icon="ph:sign-out" className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-center text-sm font-medium bg-primary text-primary-foreground rounded-lg"
                >
                  Get Started
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
