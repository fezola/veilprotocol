import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Icon icon="ph:shield-check-fill" className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold text-lg">Veil Protocol</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md">
              The missing privacy layer Solana wallets should have had from day one.
              Authenticate, transact, and recover without exposing your identity.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon icon="ph:github-logo" className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon icon="ph:twitter-logo" className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon icon="ph:discord-logo" className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/why-privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Why Privacy
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/guarantees" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Guarantees
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Technical Paper
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Security Audit
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Veil Protocol. Built for privacy.
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Built on</span>
            <Icon icon="cryptocurrency:sol" className="w-4 h-4 text-primary" />
            <span>Solana</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
