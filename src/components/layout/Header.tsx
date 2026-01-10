import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "About", href: "/about" },
  { label: "Why Privacy", href: "/why-privacy" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Recovery", href: "/recovery-setup" },
  { label: "Docs", href: "/docs" },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { connected } = useWallet();
  const { isAuthenticated, veilWallet, logout } = useAuth();

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
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Icon icon="ph:shield-check-fill" className="w-5 h-5 text-primary" />
          </div>
          <span className="font-semibold text-lg">Veil</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
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
