# Aegis Shield Codebase Index

A privacy-first authentication and wallet management system using zero-knowledge proofs.

---

## Project Overview

**Project Name**: Aegis Shield (Veil)  
**Stack**: React + Vite + TypeScript + Tailwind CSS + Shadcn UI  
**Key Features**:
- Identity-free login using zero-knowledge proofs
- Unlinkable wallets with deterministic derivation
- Private recovery mechanisms without exposing guardians
- Zero-knowledge proof generation and verification

---

## Directory Structure

### Root Configuration Files
- [package.json](package.json) - Dependencies and scripts (Vite, React Router, Radix UI, TanStack Query, Framer Motion)
- [tsconfig.json](tsconfig.json) - TypeScript configuration
- [tailwind.config.ts](tailwind.config.ts) - Tailwind CSS styling
- [vite.config.ts](vite.config.ts) - Vite bundler configuration
- [eslint.config.js](eslint.config.js) - Linting rules
- [postcss.config.js](postcss.config.js) - CSS processing

### Source Code Structure

#### `/src/main.tsx`
Entry point - Mounts React app to DOM

#### `/src/App.tsx`
Main application component with routing:
- Sets up React Query, Tooltips, Toasters
- Defines all route paths
- Routes: Landing, Login, Dashboard, Recovery, Docs, Guarantees

#### `/src/pages/` - Page Components
Complete pages for different sections:

| File | Purpose |
|------|---------|
| [Landing.tsx](src/pages/Landing.tsx) | Homepage with feature showcase |
| [WhyPrivacy.tsx](src/pages/WhyPrivacy.tsx) | Privacy benefits explanation |
| [Login.tsx](src/pages/Login.tsx) | Authentication page |
| [Dashboard.tsx](src/pages/Dashboard.tsx) | Main user dashboard |
| [WalletCreated.tsx](src/pages/WalletCreated.tsx) | Wallet creation confirmation |
| [RecoverySetup.tsx](src/pages/RecoverySetup.tsx) | Recovery setup flow |
| [RecoveryExecute.tsx](src/pages/RecoveryExecute.tsx) | Recovery execution |
| [Guarantees.tsx](src/pages/Guarantees.tsx) | System guarantees/security |
| [Docs.tsx](src/pages/Docs.tsx) | Documentation page |
| [NotFound.tsx](src/pages/NotFound.tsx) | 404 error page |

#### `/src/components/layout/` - Layout Components
Reusable layout wrappers:

| File | Purpose |
|------|---------|
| [Header.tsx](src/components/layout/Header.tsx) | Navigation header with mobile menu |
| [Footer.tsx](src/components/layout/Footer.tsx) | Page footer |
| [PageLayout.tsx](src/components/layout/PageLayout.tsx) | Standard page layout wrapper |

#### `/src/components/ui/` - UI Components
Shadcn UI primitive components and custom components:

**Shadcn UI Primitives** (Raw Radix UI wrappers):
- Accordion, Alert, Avatar, Badge, Breadcrumb
- Button, Calendar, Card, Carousel, Checkbox
- Collapsible, Command, Context Menu, Dialog, Drawer
- Dropdown Menu, Form, Hover Card, Input, Label
- Menubar, Navigation Menu, Pagination, Popover
- Progress, Radio Group, Select, Separator, Sheet
- Sidebar, Skeleton, Slider, Switch, Table
- Tabs, Textarea, Toast/Toaster, Toggle
- Tooltip

**Custom Components**:
| File | Purpose |
|------|---------|
| [FeatureCard.tsx](src/components/ui/FeatureCard.tsx) | Displays feature information |
| [PrivacyBadge.tsx](src/components/ui/PrivacyBadge.tsx) | Visual privacy indicator |
| [ParticleBackground.tsx](src/components/ui/ParticleBackground.tsx) | Animated particle effect background |
| [StatusCard.tsx](src/components/ui/StatusCard.tsx) | Status display component |
| [ZKProofVisualizer.tsx](src/components/ui/ZKProofVisualizer.tsx) | Visualizes zero-knowledge proofs |

**Utilities**:
| File | Purpose |
|------|---------|
| [use-toast.ts](src/components/ui/use-toast.ts) | Toast notification hook |
| [sonner.tsx](src/components/ui/sonner.tsx) | Sonner toast library integration |

#### `/src/hooks/` - Custom React Hooks
| File | Purpose |
|------|---------|
| [use-toast.ts](src/hooks/use-toast.ts) | Toast notification hook |
| [use-mobile.tsx](src/hooks/use-mobile.tsx) | Detect mobile viewport |

#### `/src/lib/` - Utilities & Libraries
| File | Purpose |
|------|---------|
| [utils.ts](src/lib/utils.ts) | General utility functions (likely classname merging) |
| [zkProof.ts](src/lib/zkProof.ts) | Zero-knowledge proof generation & verification (316 lines) |

**zkProof.ts Details**:
- `poseidonHash()` - Hash function for ZK operations
- `deterministicRandom()` - Seeded RNG for proof generation
- `ZKProofData` interface - Proof structure (pi_a, pi_b, pi_c)
- Proof generation for authentication and transactions
- Simulated implementation for browser (production would use snarkjs)

#### `/src/` - Styling
| File | Purpose |
|------|---------|
| [index.css](src/index.css) | Global styles |
| [App.css](src/App.css) | App-level styles |

#### `/src/components/`
| File | Purpose |
|------|---------|
| [NavLink.tsx](src/components/NavLink.tsx) | Navigation link component |

#### `/public/`
Static assets:
- [robots.txt](public/robots.txt) - Search engine crawling rules

---

## Key Dependencies

### UI Framework
- `react` - UI library
- `react-router-dom` - Routing
- `@radix-ui/*` - Headless UI components (30+ components)

### Styling
- `tailwindcss` - Utility-first CSS
- `tailwind-merge` - Smart Tailwind class merging
- `clsx` - Conditional class names

### State & Data
- `@tanstack/react-query` - Server state management
- `@hookform/resolvers` - Form validation
- `react-hook-form` - Form handling

### Animation & Motion
- `framer-motion` - Advanced animations
- `embla-carousel-react` - Carousel component

### Utilities
- `date-fns` - Date manipulation
- `input-otp` - OTP input handling
- `cmdk` - Command palette/search
- `class-variance-authority` - Component variant system

### Icons
- `@iconify/react` - Icon library (Phosphor icons used)

### Development
- `vite` - Build tool & dev server
- `typescript` - Type safety
- `eslint` - Code linting

---

## Architecture Patterns

### Routing Structure
```
/ → Landing
/why-privacy → WhyPrivacy
/login → Login
/wallet-created → WalletCreated
/dashboard → Dashboard
/recovery-setup → RecoverySetup
/recovery-execute → RecoveryExecute
/guarantees → Guarantees
/docs → Docs
/* → NotFound
```

### Component Hierarchy
```
App (with QueryProvider, TooltipProvider, BrowserRouter)
├── PageLayout (wrapper for most pages)
│   ├── Header (fixed navigation)
│   ├── Page Content
│   └── Footer
└── Toast/Sonner (notification system)
```

### State Management
- **Server State**: React Query (@tanstack/react-query)
- **Form State**: React Hook Form
- **UI State**: React local state + Framer Motion

---

## Development Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run build:dev    # Development mode build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

---

## Technology Highlights

### Zero-Knowledge Proofs
- Poseidon hashing simulation for browser
- Deterministic proof generation
- Support for authentication and transaction proofs
- Ready for snarkjs integration

### UI/UX
- Framer Motion animations
- Particle background effects
- Glass-morphism design (glass-panel classes)
- Responsive mobile-first design
- Shadcn UI components with Radix UI accessibility

### Privacy Focus
- No external API calls implied in initial structure
- Client-side proof generation
- Privacy badge indicators
- Private recovery mechanisms

---

## Configuration Files

### TypeScript Config (`tsconfig.json`)
- Strict mode enabled
- JSX support (React 17+)
- Module resolution for path aliases (@/...)

### Vite Config (`vite.config.ts`)
- React plugin enabled
- Build optimization
- Development server configuration

### Tailwind Config (`tailwind.config.ts`)
- Custom theme extending
- Color palette definition
- Animation configurations
- Plugin integrations

---

## Notes

- Project uses **Lovable** for AI-assisted development (see README)
- Production ZK proof implementation would require `snarkjs` and actual circuit files
- All UI components follow Shadcn pattern (styled Radix UI primitives)
- Mobile-responsive throughout with breakpoints at `md` (768px)
- Glass-panel styling suggests frosted glass/glassmorphism design theme

