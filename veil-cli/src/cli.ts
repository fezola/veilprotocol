import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import { scaffoldProject } from "./scaffold.js";

export type ShadowPayMode = "app" | "wallet" | false;

export interface VeilOptions {
  name?: string;
  template?: "nextjs" | "vite";
  helius?: boolean;
  shadowPay?: boolean;
  shadowPayMode?: "app" | "wallet";
  network?: "devnet" | "localnet";
}

export interface VeilConfig {
  projectName: string;
  template: "nextjs" | "vite";
  helius: boolean;
  shadowPay: ShadowPayMode;
  network: "devnet" | "localnet";
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
  // Check if all required options are provided (non-interactive mode)
  const hasAllOptions = options.name && options.template && options.network && options.helius !== undefined;

  if (hasAllOptions) {
    let shadowPayMode: ShadowPayMode = false;
    if (options.shadowPay && options.shadowPayMode) {
      shadowPayMode = options.shadowPayMode;
    }
    return {
      projectName: options.name!,
      template: options.template!,
      helius: options.helius ?? true,
      shadowPay: shadowPayMode,
      network: options.network!,
    };
  }

  const questions = [];

  if (!options.name) {
    questions.push({
      type: "input",
      name: "projectName",
      message: "Project name:",
      default: "veil-app",
      validate: (input: string) => {
        if (/^[a-z0-9-]+$/.test(input)) return true;
        return "Project name must be lowercase with hyphens only";
      },
    });
  }

  if (!options.template) {
    questions.push({
      type: "list",
      name: "template",
      message: "Frontend framework:",
      choices: [
        { name: "Next.js (recommended)", value: "nextjs" },
        { name: "Vite + React", value: "vite" },
      ],
      default: "nextjs",
    });
  }

  if (options.helius === undefined) {
    questions.push({
      type: "confirm",
      name: "helius",
      message: "Enable Helius RPC & webhooks? (recommended)",
      default: true,
    });
  }

  if (options.shadowPay === undefined) {
    questions.push({
      type: "confirm",
      name: "enableShadowPay",
      message: "Enable ShadowPay private payments?",
      default: false,
    });
  }

  if (!options.network) {
    questions.push({
      type: "list",
      name: "network",
      message: "Network:",
      choices: [
        { name: "Devnet (recommended)", value: "devnet" },
        { name: "Localnet", value: "localnet" },
      ],
      default: "devnet",
    });
  }

  const answers = await inquirer.prompt(questions);

  // If ShadowPay is enabled, ask for mode
  let shadowPayMode: ShadowPayMode = false;
  const wantsShadowPay = options.shadowPay ?? answers.enableShadowPay;

  if (wantsShadowPay) {
    const shadowPayAnswer = await inquirer.prompt([
      {
        type: "list",
        name: "shadowPayMode",
        message: "What are you building?",
        choices: [
          {
            name: "App — Receive private payments from users",
            value: "app"
          },
          {
            name: "Wallet — Send private payments to apps/users",
            value: "wallet"
          },
        ],
      },
    ]);
    shadowPayMode = shadowPayAnswer.shadowPayMode;
  }

  return {
    projectName: options.name || answers.projectName,
    template: options.template || answers.template,
    helius: options.helius ?? answers.helius ?? true,
    shadowPay: shadowPayMode,
    network: options.network || answers.network,
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

    // Privacy module
    { path: "privacy/login.ts", content: generateLoginTs() },
    { path: "privacy/recovery.ts", content: generateRecoveryTs() },
    { path: "privacy/access.ts", content: generateAccessTs() },
    { path: "privacy/guarantees.ts", content: generateGuaranteesTs() },
    { path: "privacy/index.ts", content: `export * from "./login.js";\nexport * from "./recovery.js";\nexport * from "./access.js";\nexport * from "./guarantees.js";\n` },

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
