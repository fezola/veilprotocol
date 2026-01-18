import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import { scaffoldProject } from "./scaffold.js";

// ============================================================================
// TEMPLATE CATEGORIES
// ============================================================================

/**
 * Application template categories
 * Each category scaffolds a complete, production-ready app with full privacy stack
 */
export type TemplateCategory =
  // DeFi Templates
  | "dex"           // DEX interface with private swaps
  | "lending"       // Lending protocol with private positions
  | "yield"         // Yield farming with private stakes
  | "pool"          // Liquidity pool with private deposits
  // DApp Templates
  | "gaming"        // Gaming app with private assets
  | "nft"           // NFT marketplace with private bids
  | "social"        // Social platform with private messaging
  | "governance"    // DAO governance with private voting
  // Exchange Templates
  | "cex"           // CEX-style interface
  | "aggregator"    // DEX aggregator with private routing
  | "trading"       // Trading dashboard
  // Wallet Templates
  | "wallet"        // Multi-sig wallet with stealth signers
  | "portfolio"     // Portfolio tracker with private holdings
  | "payments"      // Payment app with ShadowPay
  // Basic template
  | "basic";        // Minimal starter

export type ShadowPayMode = "app" | "wallet" | false;
export type FrameworkChoice = "nextjs" | "vite";

// Template metadata for CLI display
export const TEMPLATE_INFO: Record<TemplateCategory, { name: string; description: string; category: string }> = {
  // DeFi
  dex: { name: "DEX Interface", description: "Private swaps via ShadowWire", category: "DeFi" },
  lending: { name: "Lending Protocol", description: "Private lending positions", category: "DeFi" },
  yield: { name: "Yield Farming", description: "Private stake amounts", category: "DeFi" },
  pool: { name: "Liquidity Pool", description: "Private LP deposits", category: "DeFi" },
  // DApp
  gaming: { name: "Gaming App", description: "Private game assets & scores", category: "DApp" },
  nft: { name: "NFT Marketplace", description: "Private bids & offers", category: "DApp" },
  social: { name: "Social Platform", description: "Private messaging & identity", category: "DApp" },
  governance: { name: "DAO Governance", description: "Private voting & proposals", category: "DApp" },
  // Exchange
  cex: { name: "Exchange Interface", description: "CEX-style with privacy", category: "Exchange" },
  aggregator: { name: "DEX Aggregator", description: "Private swap routing", category: "Exchange" },
  trading: { name: "Trading Dashboard", description: "Private order books", category: "Exchange" },
  // Wallet
  wallet: { name: "Multi-sig Wallet", description: "Stealth signers & treasury", category: "Wallet" },
  portfolio: { name: "Portfolio Tracker", description: "Private holdings view", category: "Wallet" },
  payments: { name: "Payment App", description: "Full ShadowPay integration", category: "Wallet" },
  // Basic
  basic: { name: "Basic Starter", description: "Minimal privacy-first app", category: "Starter" },
};

export interface VeilOptions {
  name?: string;
  template?: TemplateCategory;
  framework?: FrameworkChoice;
  helius?: boolean;
  shadowPay?: boolean;
  shadowPayMode?: "app" | "wallet";
  network?: "devnet" | "localnet";
}

export interface VeilConfig {
  projectName: string;
  template: TemplateCategory;
  framework: FrameworkChoice;
  helius: boolean;
  shadowPay: ShadowPayMode;
  network: "devnet" | "localnet";
  // All templates include the full privacy stack
  features: {
    identity: boolean;
    recovery: boolean;
    voting: boolean;
    staking: boolean;
    multisig: boolean;
    shadowpay: boolean;
  };
}

export async function runInit(options: VeilOptions): Promise<void> {
  const answers = await promptUser(options);
  
  const spinner = ora({
    text: "Creating your project with Veil privacy...",
    color: "cyan",
  }).start();

  try {
    await scaffoldProject(answers);
    spinner.succeed(chalk.green("Veil initialized successfully."));
    
    printNextSteps(answers.projectName);
  } catch (error) {
    spinner.fail(chalk.red("Failed to initialize project."));
    console.error(error);
    process.exit(1);
  }
}

async function promptUser(options: VeilOptions): Promise<VeilConfig> {
  // Non-interactive mode: all required options provided via CLI flags
  const hasAllOptions = options.name && options.template && options.framework && options.network;

  if (hasAllOptions) {
    const shadowPayMode: ShadowPayMode = options.shadowPay ? (options.shadowPayMode || "app") : false;
    return {
      projectName: options.name!,
      template: options.template!,
      framework: options.framework!,
      helius: options.helius ?? true,
      shadowPay: shadowPayMode,
      network: options.network!,
      features: {
        identity: true,
        recovery: true,
        voting: true,
        staking: true,
        multisig: true,
        shadowpay: !!options.shadowPay,
      },
    };
  }

  // Interactive mode: prompt for each option
  const questions: any[] = [];

  // 1. Project name
  if (!options.name) {
    questions.push({
      type: "input",
      name: "projectName",
      message: "Project name:",
      default: "my-veil-app",
      validate: (input: string) => {
        if (/^[a-z0-9-]+$/.test(input)) return true;
        return "Project name must be lowercase with hyphens only";
      },
    });
  }

  const initialAnswers = await inquirer.prompt(questions);

  // 2. Template category selection (if not provided)
  let selectedTemplate: TemplateCategory = options.template || "basic";

  if (!options.template) {
    // First, ask for category
    const categoryAnswer = await inquirer.prompt([{
      type: "list",
      name: "category",
      message: "What are you building?",
      choices: [
        { name: chalk.cyan("🏦 DeFi") + " — DEX, Lending, Yield, Pools", value: "defi" },
        { name: chalk.magenta("🎮 DApp") + " — Gaming, NFT, Social, Governance", value: "dapp" },
        { name: chalk.yellow("📊 Exchange") + " — CEX, Aggregator, Trading", value: "exchange" },
        { name: chalk.green("👛 Wallet") + " — Multisig, Portfolio, Payments", value: "wallet" },
        { name: chalk.dim("📦 Basic") + " — Minimal starter template", value: "basic" },
      ],
    }]);

    if (categoryAnswer.category === "basic") {
      selectedTemplate = "basic";
    } else {
      // Show templates for selected category
      const templateChoices = Object.entries(TEMPLATE_INFO)
        .filter(([_, info]) => info.category.toLowerCase() === categoryAnswer.category)
        .map(([key, info]) => ({
          name: `${info.name} — ${info.description}`,
          value: key,
        }));

      const templateAnswer = await inquirer.prompt([{
        type: "list",
        name: "template",
        message: "Select template:",
        choices: templateChoices,
      }]);
      selectedTemplate = templateAnswer.template as TemplateCategory;
    }
  }

  // 3. Framework choice
  let framework: FrameworkChoice = options.framework || "nextjs";
  if (!options.framework) {
    const frameworkAnswer = await inquirer.prompt([{
      type: "list",
      name: "framework",
      message: "Frontend framework:",
      choices: [
        { name: "Next.js (recommended)", value: "nextjs" },
        { name: "Vite + React", value: "vite" },
      ],
    }]);
    framework = frameworkAnswer.framework;
  }

  // 4. Helius integration
  let helius = options.helius ?? true;
  if (options.helius === undefined) {
    const heliusAnswer = await inquirer.prompt([{
      type: "confirm",
      name: "helius",
      message: "Enable Helius RPC? (recommended for production)",
      default: true,
    }]);
    helius = heliusAnswer.helius;
  }

  // 5. ShadowPay integration (mainnet private payments)
  let shadowPayMode: ShadowPayMode = false;
  const wantsShadowPay = options.shadowPay ?? true; // Default to true for full privacy

  if (wantsShadowPay) {
    console.log();
    console.log(chalk.yellow("⚡ ShadowPay uses mainnet for real private payments"));
    console.log(chalk.dim("   Veil features (voting, staking, multisig) work on devnet"));
    console.log();

    const shadowPayAnswer = await inquirer.prompt([{
      type: "list",
      name: "mode",
      message: "ShadowPay mode:",
      choices: [
        { name: "App — Receive private payments from users", value: "app" },
        { name: "Wallet — Send private payments to apps/users", value: "wallet" },
        { name: "Skip — Don't include ShadowPay", value: "skip" },
      ],
    }]);

    if (shadowPayAnswer.mode !== "skip") {
      shadowPayMode = shadowPayAnswer.mode;
    }
  }

  // 6. Network (for Veil features, not ShadowPay)
  let network: "devnet" | "localnet" = options.network || "devnet";
  if (!options.network) {
    const networkAnswer = await inquirer.prompt([{
      type: "list",
      name: "network",
      message: "Veil features network:",
      choices: [
        { name: "Devnet (recommended)", value: "devnet" },
        { name: "Localnet", value: "localnet" },
      ],
    }]);
    network = networkAnswer.network;
  }

  return {
    projectName: options.name || initialAnswers.projectName,
    template: selectedTemplate,
    framework,
    helius,
    shadowPay: shadowPayMode,
    network,
    features: {
      identity: true,
      recovery: true,
      voting: true,
      staking: true,
      multisig: true,
      shadowpay: shadowPayMode !== false,
    },
  };
}

function printNextSteps(projectName: string): void {
  console.log();
  console.log(chalk.bold("Next steps:"));
  console.log(chalk.dim("1."), `cd ${projectName}`);
  console.log(chalk.dim("2."), "cp .env.example .env");
  console.log(chalk.dim("3."), "pnpm install");
  console.log(chalk.dim("4."), "pnpm dev");
  console.log();
  console.log(
    chalk.dim("Privacy guarantees are documented in"),
    chalk.cyan("/privacy/guarantees.ts")
  );
  console.log();
}

export interface AddOptions {
  shadowPay?: boolean;
  helius?: boolean;
}

export async function runAdd(options: AddOptions): Promise<void> {
  const fsExtra = await import("fs-extra");
  const fs = fsExtra.default;
  const path = await import("path");

  // Check if we're in a valid project
  const cwd = process.cwd();
  const packageJsonPath = path.join(cwd, "package.json");

  if (!await fs.pathExists(packageJsonPath)) {
    console.log(chalk.red("Error: No package.json found."));
    console.log(chalk.dim("Run this command from the root of your project."));
    process.exit(1);
  }

  // Detect project type
  const packageJson = await fs.readJson(packageJsonPath);
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const isNext = "next" in deps;
  const isVite = "vite" in deps;
  const hasReact = "react" in deps;

  if (!hasReact) {
    console.log(chalk.red("Error: Veil requires a React project."));
    console.log(chalk.dim("Detected packages:"), Object.keys(deps).slice(0, 5).join(", "));
    process.exit(1);
  }

  console.log(chalk.dim("Detected:"), isNext ? "Next.js" : isVite ? "Vite" : "React");

  // Prompt for options
  const answers = await inquirer.prompt([
    {
      type: "confirm",
      name: "helius",
      message: "Use Helius RPC for better reliability?",
      default: options.helius !== false,
      when: () => options.helius === undefined,
    },
    {
      type: "confirm",
      name: "shadowPay",
      message: "Add ShadowPay for privacy-preserving payments?",
      default: false,
      when: () => options.shadowPay === undefined,
    },
    {
      type: "list",
      name: "shadowPayMode",
      message: "What are you building?",
      choices: [
        { name: "App — receive payments from users", value: "app" },
        { name: "Wallet — send payments to apps/users", value: "wallet" },
      ],
      when: (ans) => ans.shadowPay || options.shadowPay,
    },
  ]);

  const config: VeilConfig = {
    projectName: packageJson.name || "my-app",
    template: isNext ? "nextjs" : "vite",
    helius: answers.helius ?? options.helius ?? true,
    shadowPay: answers.shadowPay || options.shadowPay ? (answers.shadowPayMode || "app") : false,
    network: "devnet",
  };

  const spinner = ora({
    text: "Adding Veil privacy layer...",
    color: "cyan",
  }).start();

  try {
    await addVeilToProject(cwd, config);
    spinner.succeed(chalk.green("Veil added successfully."));

    printAddNextSteps();
  } catch (error) {
    spinner.fail(chalk.red("Failed to add Veil."));
    console.error(error);
    process.exit(1);
  }
}

async function addVeilToProject(projectPath: string, config: VeilConfig): Promise<void> {
  const fsExtra = await import("fs-extra");
  const fs = fsExtra.default;
  const path = await import("path");
  const {
    generateVeilConfig,
    generateEnvExample,
    generateLoginTs,
    generateRecoveryTs,
    generateAccessTs,
    generateGuaranteesTs,
    generateVotingTs,
    generateMultisigTs,
    generateStakingTs,
    generateRpcTs,
    generateHeliusTs,
    generateVeilProvider,
    generateVeilHooks,
    generateShadowPayModule,
  } = await import("./templates/index.js");

  // Create directories
  const dirs = ["privacy", "infra", "contexts", "hooks"];
  for (const dir of dirs) {
    await fs.ensureDir(path.join(projectPath, dir));
  }

  // Files to add (won't overwrite existing)
  const files = [
    { path: "veil.config.ts", content: generateVeilConfig(config) },
    { path: ".env.example", content: generateEnvExample(config), append: true },

    // Privacy module - Core
    { path: "privacy/login.ts", content: generateLoginTs() },
    { path: "privacy/recovery.ts", content: generateRecoveryTs() },
    { path: "privacy/access.ts", content: generateAccessTs() },
    { path: "privacy/guarantees.ts", content: generateGuaranteesTs() },

    // Privacy module - Advanced (voting, multisig, staking)
    { path: "privacy/voting.ts", content: generateVotingTs() },
    { path: "privacy/multisig.ts", content: generateMultisigTs() },
    { path: "privacy/staking.ts", content: generateStakingTs() },

    { path: "privacy/index.ts", content: `export * from "./login.js";\nexport * from "./recovery.js";\nexport * from "./access.js";\nexport * from "./guarantees.js";\nexport * from "./voting.js";\nexport * from "./multisig.js";\nexport * from "./staking.js";\n` },

    // Infra module
    { path: "infra/rpc.ts", content: generateRpcTs() },
    { path: "infra/helius.ts", content: generateHeliusTs() },
    { path: "infra/index.ts", content: `export * from "./rpc.js";\nexport * from "./helius.js";\n` },

    // Contexts
    { path: "contexts/VeilProvider.tsx", content: generateVeilProvider(config) },
    { path: "contexts/index.ts", content: `export * from "./VeilProvider.js";\n` },

    // Hooks
    { path: "hooks/useVeil.ts", content: generateVeilHooks() },
    { path: "hooks/index.ts", content: `export * from "./useVeil.js";\n` },
  ];

  // Add ShadowPay if enabled
  if (config.shadowPay) {
    files.push({ path: "shadowpay/index.ts", content: generateShadowPayModule(config) });
  }

  // Write files (skip if exists, unless append mode)
  for (const file of files) {
    const filePath = path.join(projectPath, file.path);

    if (file.append && await fs.pathExists(filePath)) {
      const existing = await fs.readFile(filePath, "utf-8");
      if (!existing.includes("HELIUS")) {
        await fs.appendFile(filePath, "\n" + file.content);
      }
    } else if (!await fs.pathExists(filePath)) {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, file.content, "utf-8");
    }
  }
}

function printAddNextSteps(): void {
  console.log();
  console.log(chalk.bold("What was added:"));
  console.log(chalk.dim("•"), chalk.cyan("privacy/") + " — login, recovery, access guarantees");
  console.log(chalk.dim("•"), chalk.cyan("contexts/") + " — VeilProvider for auth state");
  console.log(chalk.dim("•"), chalk.cyan("hooks/") + " — useVeil hook");
  console.log(chalk.dim("•"), chalk.cyan("infra/") + " — RPC and Helius helpers");
  console.log();
  console.log(chalk.bold("Next steps:"));
  console.log(chalk.dim("1."), "Wrap your app with <VeilProvider>");
  console.log(chalk.dim("2."), "Use the useVeil() hook for authentication");
  console.log(chalk.dim("3."), "Review privacy/guarantees.ts");
  console.log();
}
