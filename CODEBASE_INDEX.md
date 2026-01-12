# Aegis Shield Codebase Index

A privacy-first authentication and wallet management system using zero-knowledge proofs, Solana blockchain integration, ShadowPay for private payments, and Helius for privacy-safe infrastructure.

---

## Project Overview

**Project Name**: Aegis Shield (Veil Protocol)  
**Stack**: React + Vite + TypeScript + Tailwind CSS + Shadcn UI + Solana + Anchor  
**Blockchain**: Solana (Devnet)  
**Key Features**:
- Identity-free login using zero-knowledge proofs
- Unlinkable wallets with deterministic derivation
- Private recovery mechanisms (time-locked & Shamir secret sharing)
- Zero-knowledge proof generation and verification
- On-chain commitment storage via Anchor program
- ShadowPay integration for private payments
- Helius integration for privacy-safe RPC and observability

---

## Directory Structure

### Root Configuration Files
- [package.json](package.json) - Dependencies and scripts
- [tsconfig.json](tsconfig.json) - TypeScript configuration
- [tsconfig.app.json](tsconfig.app.json) - App-specific TypeScript config
- [tsconfig.node.json](tsconfig.node.json) - Node-specific TypeScript config
- [tailwind.config.ts](tailwind.config.ts) - Tailwind CSS styling
- [vite.config.ts](vite.config.ts) - Vite bundler configuration
- [eslint.config.js](eslint.config.js) - Linting rules
- [postcss.config.js](postcss.config.js) - CSS processing
- [components.json](components.json) - Shadcn UI configuration
- [Anchor.toml](Anchor.toml) - Anchor/Solana program configuration

### Solana Program
- [programs/veil-protocol/](programs/veil-protocol/) - Anchor program (Rust)
  - Program ID: `5C1VaebPdHZYETnTL18cLJK2RexXmVVhkkYpnYHD5P4h` (Devnet)
  - Handles on-chain commitment storage, proof verification, and recovery

### Build Artifacts
- [target/idl/veil_protocol.json](target/idl/veil_protocol.json) - Generated IDL
- [target/types/veil_protocol.ts](target/types/veil_protocol.ts) - Generated TypeScript types
- [target/deploy/](target/deploy/) - Deployment keypairs

---

## Source Code Structure

### `/src/main.tsx`
Entry point - Mounts React app to DOM

### `/src/App.tsx`
Main application component with routing:
- Sets up React Query, Tooltips, Toasters
- Wraps app with WalletProvider, AuthProvider
- Defines all route paths with ProtectedRoute guards
- Routes: Landing, About, WhyPrivacy, Login, Dashboard, Recovery, Docs, Guarantees, ShadowPayExplained

### `/src/pages/` - Page Components
Complete pages for different sections:

| File | Purpose |
|------|---------|
| [Landing.tsx](src/pages/Landing.tsx) | Homepage with feature showcase |
| [About.tsx](src/pages/About.tsx) | About page |
| [WhyPrivacy.tsx](src/pages/WhyPrivacy.tsx) | Privacy benefits explanation |
| [Login.tsx](src/pages/Login.tsx) | Authentication page with ZK proof generation |
| [Dashboard.tsx](src/pages/Dashboard.tsx) | Main user dashboard with wallet management |
| [WalletCreated.tsx](src/pages/WalletCreated.tsx) | Wallet creation confirmation |
| [RecoverySetup.tsx](src/pages/RecoverySetup.tsx) | Recovery setup flow (time-lock & Shamir) |
| [RecoveryExecute.tsx](src/pages/RecoveryExecute.tsx) | Recovery execution |
| [Guarantees.tsx](src/pages/Guarantees.tsx) | System guarantees/security |
| [Docs.tsx](src/pages/Docs.tsx) | Documentation page |
| [ShadowPayExplained.tsx](src/pages/ShadowPayExplained.tsx) | ShadowPay feature explanation |
| [NotFound.tsx](src/pages/NotFound.tsx) | 404 error page |

### `/src/components/layout/` - Layout Components
Reusable layout wrappers:

| File | Purpose |
|------|---------|
| [Header.tsx](src/components/layout/Header.tsx) | Navigation header with mobile menu |
| [Footer.tsx](src/components/layout/Footer.tsx) | Page footer |
| [PageLayout.tsx](src/components/layout/PageLayout.tsx) | Standard page layout wrapper |

### `/src/components/` - Core Components

| File | Purpose |
|------|---------|
| [NavLink.tsx](src/components/NavLink.tsx) | Navigation link component |
| [WalletProvider.tsx](src/components/WalletProvider.tsx) | Solana wallet adapter provider wrapper |
| [ProtectedRoute.tsx](src/components/ProtectedRoute.tsx) | Route protection with auth checks |
| [PrivacyVerification.tsx](src/components/PrivacyVerification.tsx) | Privacy verification component |

### `/src/components/ui/` - UI Components

**Shadcn UI Primitives** (Raw Radix UI wrappers):
- accordion.tsx, alert-dialog.tsx, alert.tsx, aspect-ratio.tsx, avatar.tsx
- badge.tsx, breadcrumb.tsx, button.tsx, calendar.tsx, card.tsx
- carousel.tsx, chart.tsx, checkbox.tsx, collapsible.tsx, command.tsx
- context-menu.tsx, dialog.tsx, drawer.tsx, dropdown-menu.tsx
- form.tsx, hover-card.tsx, input-otp.tsx, input.tsx, label.tsx
- menubar.tsx, navigation-menu.tsx, pagination.tsx, popover.tsx
- progress.tsx, radio-group.tsx, resizable.tsx, scroll-area.tsx
- select.tsx, separator.tsx, sheet.tsx, sidebar.tsx, skeleton.tsx
- slider.tsx, switch.tsx, table.tsx, tabs.tsx, textarea.tsx
- toast.tsx, toaster.tsx, toggle-group.tsx, toggle.tsx, tooltip.tsx

**Custom Components**:
| File | Purpose |
|------|---------|
| [FeatureCard.tsx](src/components/ui/FeatureCard.tsx) | Displays feature information |
| [PrivacyBadge.tsx](src/components/ui/PrivacyBadge.tsx) | Visual privacy indicator |
| [ParticleBackground.tsx](src/components/ui/ParticleBackground.tsx) | Animated particle effect background |
| [StatusCard.tsx](src/components/ui/StatusCard.tsx) | Status display component |
| [ZKProofVisualizer.tsx](src/components/ui/ZKProofVisualizer.tsx) | Visualizes zero-knowledge proofs |
| [HeliusBadge.tsx](src/components/ui/HeliusBadge.tsx) | Helius integration status indicator |
| [PrivatePaymentDialog.tsx](src/components/ui/PrivatePaymentDialog.tsx) | Dialog for private payment flow |
| [PrivateStatusIndicator.tsx](src/components/ui/PrivateStatusIndicator.tsx) | Privacy status indicator |

**Utilities**:
| File | Purpose |
|------|---------|
| [use-toast.ts](src/components/ui/use-toast.ts) | Toast notification hook |
| [sonner.tsx](src/components/ui/sonner.tsx) | Sonner toast library integration |

### `/src/contexts/` - React Contexts

| File | Purpose |
|------|---------|
| [AuthContext.tsx](src/contexts/AuthContext.tsx) | Authentication state management (veil wallet, commitment, session) |

### `/src/hooks/` - Custom React Hooks

| File | Purpose |
|------|---------|
| [use-toast.ts](src/hooks/use-toast.ts) | Toast notification hook |
| [use-mobile.tsx](src/hooks/use-mobile.tsx) | Detect mobile viewport |
| [useHeliusMonitor.ts](src/hooks/useHeliusMonitor.ts) | Helius wallet activity monitoring hook |

### `/src/lib/` - Utilities & Libraries

| File | Purpose | Key Functions |
|------|---------|----------------|
| [utils.ts](src/lib/utils.ts) | General utility functions (classname merging) | `cn()` |
| [zkProof.ts](src/lib/zkProof.ts) | Zero-knowledge proof generation & verification | `poseidonHash()`, `generateProof()`, `verifyProof()` |
| [solana.ts](src/lib/solana.ts) | Solana blockchain integration (Anchor program) | `initializeCommitment()`, `submitProof()`, `initiateRecovery()`, `executeRecovery()`, `cancelRecovery()` |
| [recovery.ts](src/lib/recovery.ts) | Recovery utilities (time-lock & Shamir) | `generateTimeLockRecovery()`, `shamirSplit()`, `shamirReconstruct()`, `generateShamirRecovery()` |
| [shadowpay.ts](src/lib/shadowpay.ts) | ShadowPay integration for private payments | `sendPrivatePayment()`, `validateRecipientAddress()`, `validateAmount()` |
| [helius.ts](src/lib/helius.ts) | Helius integration for privacy-safe RPC | `getPrivateConnection()`, `WalletActivityMonitor`, `parseTransactionPrivately()`, `detectRecoveryCompletion()` |

**zkProof.ts Details**:
- `poseidonHash()` - Hash function for ZK operations
- `deterministicRandom()` - Seeded RNG for proof generation
- `ZKProofData` interface - Proof structure (pi_a, pi_b, pi_c)
- Proof generation for authentication and transactions
- Simulated implementation for browser (production uses snarkjs)

**solana.ts Details**:
- Anchor program integration
- PDA (Program Derived Address) management
- On-chain commitment initialization
- Proof submission and verification
- Recovery initiation and execution
- Transaction signing and submission

**recovery.ts Details**:
- Time-locked recovery key generation
- Shamir secret sharing (GF(256) arithmetic)
- Share generation and reconstruction
- Recovery key storage/retrieval (localStorage for demo)
- Key formatting and download utilities

**shadowpay.ts Details**:
- ShadowWire client integration
- Private payment flow (amount privacy, transfer privacy)
- Recipient validation
- Amount validation
- Privacy-safe payment execution

**helius.ts Details**:
- Private RPC connection (no public endpoints)
- Wallet activity monitoring (websocket subscriptions)
- Privacy-aware transaction parsing
- Recovery event detection
- Webhook handling (server-side)

### `/src/` - Styling
| File | Purpose |
|------|---------|
| [index.css](src/index.css) | Global styles |
| [App.css](src/App.css) | App-level styles |
| [vite-env.d.ts](src/vite-env.d.ts) | Vite environment type definitions |

### `/public/`
Static assets:
- [robots.txt](public/robots.txt) - Search engine crawling rules
- [favicon.ico](public/favicon.ico) - Site favicon
- [placeholder.svg](public/placeholder.svg) - Placeholder image

---

## Key Dependencies

### UI Framework
- `react` (^18.3.1) - UI library
- `react-dom` (^18.3.1) - React DOM renderer
- `react-router-dom` (^6.30.1) - Routing
- `@radix-ui/*` - Headless UI components (30+ components)

### Blockchain & Solana
- `@solana/web3.js` (^1.98.4) - Solana JavaScript SDK
- `@coral-xyz/anchor` (^0.32.1) - Anchor framework
- `@solana/wallet-adapter-base` (^0.9.27) - Wallet adapter base
- `@solana/wallet-adapter-react` (^0.15.39) - React wallet adapter
- `@solana/wallet-adapter-react-ui` (^0.9.39) - Wallet adapter UI
- `@solana/wallet-adapter-wallets` (^0.19.37) - Wallet implementations

### Privacy & Payments
- `@radr/shadowwire` (^1.1.1) - ShadowPay/ShadowWire SDK
- `snarkjs` (^0.7.5) - Zero-knowledge proof library

### Styling
- `tailwindcss` (^3.4.17) - Utility-first CSS
- `tailwind-merge` (^2.6.0) - Smart Tailwind class merging
- `tailwindcss-animate` (^1.0.7) - Tailwind animations
- `clsx` (^2.1.1) - Conditional class names
- `@tailwindcss/typography` (^0.5.16) - Typography plugin

### State & Data
- `@tanstack/react-query` (^5.83.0) - Server state management
- `@hookform/resolvers` (^3.10.0) - Form validation resolvers
- `react-hook-form` (^7.61.1) - Form handling
- `zod` (^3.25.76) - Schema validation

### Animation & Motion
- `framer-motion` (^12.25.0) - Advanced animations
- `embla-carousel-react` (^8.6.0) - Carousel component

### Utilities
- `date-fns` (^3.6.0) - Date manipulation
- `input-otp` (^1.4.2) - OTP input handling
- `cmdk` (^1.1.1) - Command palette/search
- `class-variance-authority` (^0.7.1) - Component variant system
- `lucide-react` (^0.462.0) - Icon library
- `next-themes` (^0.3.0) - Theme management
- `recharts` (^2.15.4) - Chart library
- `sonner` (^1.7.4) - Toast notifications
- `vaul` (^0.9.9) - Drawer component
- `react-day-picker` (^8.10.1) - Date picker
- `react-resizable-panels` (^2.1.9) - Resizable panels

### Icons
- `@iconify/react` (^6.0.2) - Icon library (Phosphor icons used)

### Development
- `vite` (^5.4.19) - Build tool & dev server
- `@vitejs/plugin-react-swc` (^3.11.0) - Vite React plugin
- `typescript` (^5.8.3) - Type safety
- `eslint` (^9.32.0) - Code linting
- `typescript-eslint` (^8.38.0) - TypeScript ESLint
- `autoprefixer` (^10.4.21) - CSS autoprefixer
- `postcss` (^8.5.6) - CSS processing
- `lovable-tagger` (^1.1.13) - Lovable development tool

---

## Architecture Patterns

### Routing Structure
```
/ → Landing
/about → About
/why-privacy → WhyPrivacy
/login → Login (ProtectedRoute: requireAuth=false)
/wallet-created → WalletCreated (ProtectedRoute: requireAuth=true)
/dashboard → Dashboard (ProtectedRoute: requireAuth=true)
/recovery-setup → RecoverySetup (ProtectedRoute: requireAuth=true)
/recovery-execute → RecoveryExecute (ProtectedRoute: requireAuth=true)
/guarantees → Guarantees
/docs → Docs
/shadowpay-explained → ShadowPayExplained
/* → NotFound
```

### Component Hierarchy
```
App
├── QueryClientProvider (React Query)
├── WalletProvider (Solana wallet adapter)
│   ├── ConnectionProvider
│   ├── SolanaWalletProvider
│   └── WalletModalProvider
├── AuthProvider (Authentication context)
├── TooltipProvider
├── Toaster / Sonner (Notifications)
└── BrowserRouter
    └── Routes
        └── Route (with ProtectedRoute guards)
            └── PageLayout
                ├── Header
                ├── Page Content
                └── Footer
```

### State Management
- **Server State**: React Query (@tanstack/react-query)
- **Form State**: React Hook Form
- **UI State**: React local state + Framer Motion
- **Auth State**: AuthContext (sessionStorage persistence)
- **Wallet State**: Solana Wallet Adapter

### Privacy Architecture

**Zero-Knowledge Proofs**:
- Client-side proof generation
- On-chain proof verification
- Commitment-based authentication

**Recovery Mechanisms**:
- Time-locked recovery (delayed execution)
- Shamir secret sharing (threshold cryptography)
- Private guardian system (no on-chain exposure)

**Payment Privacy**:
- ShadowPay integration for amount privacy
- Transfer privacy via ShadowWire
- No transaction history storage

**Infrastructure Privacy**:
- Helius private RPC (no public endpoints)
- Webhook-based event detection (no polling)
- Privacy-aware transaction parsing

---

## Development Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run build:dev    # Development mode build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Anchor/Solana Commands
```bash
anchor build         # Build Solana program
anchor deploy        # Deploy to devnet
anchor test          # Run tests
```

---

## Environment Variables

Required environment variables (`.env`):
```
VITE_HELIUS_RPC_URL=<helius-rpc-endpoint>
VITE_HELIUS_API_KEY=<helius-api-key>
```

---

## Technology Highlights

### Zero-Knowledge Proofs
- Poseidon hashing simulation for browser
- Deterministic proof generation
- Support for authentication and transaction proofs
- snarkjs integration ready
- On-chain proof verification via Anchor program

### Solana Integration
- Anchor program for on-chain state
- PDA-based account management
- Transaction signing and submission
- Devnet deployment ready
- Program ID: `5C1VaebPdHZYETnTL18cLJK2RexXmVVhkkYpnYHD5P4h`

### Recovery System
- Time-locked recovery (configurable delay)
- Shamir secret sharing (GF(256) arithmetic)
- Threshold-based reconstruction
- Private guardian distribution
- On-chain recovery execution

### ShadowPay Integration
- Private payment flow
- Amount privacy
- Transfer privacy
- ShadowWire client integration
- SOL-only payments (hackathon scope)

### Helius Integration
- Private RPC endpoints
- Wallet activity monitoring (websocket)
- Privacy-aware transaction parsing
- Recovery event detection
- Webhook support (server-side)

### UI/UX
- Framer Motion animations
- Particle background effects
- Glass-morphism design (glass-panel classes)
- Responsive mobile-first design
- Shadcn UI components with Radix UI accessibility
- Dark/light theme support

### Privacy Focus
- No public RPC usage (Helius only)
- Client-side proof generation
- Privacy badge indicators
- Private recovery mechanisms
- No guardian exposure
- Privacy-safe observability

---

## Configuration Files

### TypeScript Config (`tsconfig.json`)
- Strict mode enabled
- JSX support (React 17+)
- Module resolution for path aliases (@/...)
- Separate configs for app and node

### Vite Config (`vite.config.ts`)
- React plugin enabled
- Build optimization
- Development server configuration
- Path alias resolution

### Tailwind Config (`tailwind.config.ts`)
- Custom theme extending
- Color palette definition
- Animation configurations
- Plugin integrations

### Anchor Config (`Anchor.toml`)
- Anchor version: 0.32.1
- Devnet cluster
- Program ID configuration
- Test configuration

---

## File Organization Patterns

### Components
- Layout components in `/components/layout/`
- UI primitives in `/components/ui/`
- Feature components in `/components/`
- Context providers at root level

### Pages
- All pages in `/pages/` directory
- Route definitions in `App.tsx`
- Protected routes use `ProtectedRoute` wrapper

### Libraries
- Blockchain: `/lib/solana.ts`
- Privacy: `/lib/zkProof.ts`, `/lib/recovery.ts`
- Payments: `/lib/shadowpay.ts`
- Infrastructure: `/lib/helius.ts`
- Utilities: `/lib/utils.ts`

### Hooks
- Custom hooks in `/hooks/`
- Reusable logic extraction
- Integration with contexts

---

## Integration Points

### Solana Wallet Adapter
- Phantom and Solflare wallet support
- Auto-connect disabled (privacy)
- Connection provider setup
- Wallet modal integration

### Anchor Program
- IDL import from build artifacts
- Program instance creation
- Account management via PDAs
- Transaction building and submission

### ShadowPay/ShadowWire
- Client initialization (singleton)
- Private payment execution
- Wallet signature integration
- Error handling

### Helius
- RPC connection management
- WebSocket subscriptions
- Transaction parsing API
- Webhook handling (server-side)

---

## Security & Privacy Considerations

### Client-Side
- Session storage for auth state (not localStorage)
- No sensitive data in URLs
- Private RPC endpoints only
- Client-side proof generation

### On-Chain
- Commitment hashes (not raw secrets)
- Proof verification on-chain
- PDA-based account isolation
- Time-locked recovery enforcement

### Recovery
- Shamir shares stored off-chain
- Guardian addresses not exposed
- Recovery keys encrypted in storage
- Download utilities for secure backup

### Payments
- Amount privacy via ShadowPay
- No transaction history storage
- Privacy-safe validation
- No metadata leakage

---

## Notes

- Project uses **Lovable** for AI-assisted development
- Production ZK proof implementation uses `snarkjs` with actual circuit files
- All UI components follow Shadcn pattern (styled Radix UI primitives)
- Mobile-responsive throughout with breakpoints at `md` (768px)
- Glass-panel styling suggests frosted glass/glassmorphism design theme
- Devnet deployment for development and testing
- Recovery keys stored in localStorage for demo (production should use secure storage)
- Helius webhook handling requires backend service (not implemented client-side)

---

## Documentation Files

Additional documentation in root:
- `README.md` - Project setup and Lovable info
- `CODEBASE_INDEX.md` - This file
- `DASHBOARD_FEATURES.md` - Dashboard feature documentation
- `DEMO_INSTRUCTIONS.md` - Demo instructions
- `HELIUS_INTEGRATION.md` - Helius integration guide
- `SHADOWPAY_INTEGRATION.md` - ShadowPay integration guide
- `HOW_PRIVACY_WORKS.md` - Privacy system explanation
- And more...

---

*Last updated: Comprehensive codebase index covering all current features and integrations*