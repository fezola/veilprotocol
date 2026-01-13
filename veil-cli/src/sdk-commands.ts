/**
 * Veil CLI SDK Commands
 * 
 * Commands that use the @veil-protocol/sdk for privacy operations:
 * - Identity management
 * - Shielded balances
 * - Private transfers
 * - Token privacy
 * - DEX integration
 */

import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

// SDK imports (will be available after npm install)
let VeilClient: any;
let createShieldedClient: any;
let createTransferClient: any;
let createTokenClient: any;
let createDexClient: any;
let TOKENS: any;

async function loadSDK() {
  try {
    const sdk = await import("@veil-protocol/sdk");
    VeilClient = sdk.VeilClient;
    createShieldedClient = sdk.createShieldedClient;
    createTransferClient = sdk.createTransferClient;
    createTokenClient = sdk.createTokenClient;
    createDexClient = sdk.createDexClient;
    TOKENS = sdk.TOKENS;
    return true;
  } catch (error) {
    console.log(chalk.red("SDK not found. Run 'npm install' first."));
    return false;
  }
}

// ============================================================================
// DEMO COMMAND - Shows SDK capabilities
// ============================================================================

export async function runDemo(): Promise<void> {
  console.log();
  console.log(chalk.bold.cyan("🛡️  Veil Protocol SDK Demo"));
  console.log(chalk.dim("═══════════════════════════════════════"));
  console.log();

  const loaded = await loadSDK();
  if (!loaded) return;

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  console.log(chalk.yellow("📦 SDK Modules Available:"));
  console.log();
  console.log(chalk.green("  ✓"), "Identity   - ZK-based anonymous authentication");
  console.log(chalk.green("  ✓"), "Shielded   - Hide wallet balances from public view");
  console.log(chalk.green("  ✓"), "Transfer   - Private transactions with hidden amounts");
  console.log(chalk.green("  ✓"), "Tokens     - Private token holdings");
  console.log(chalk.green("  ✓"), "DEX        - Private swaps on Jupiter/Raydium");
  console.log(chalk.green("  ✓"), "Recovery   - Shamir secret sharing for wallet recovery");
  console.log(chalk.green("  ✓"), "Wallet     - Wallet adapter for dApp integration");
  console.log();

  const spinner = ora("Initializing Veil Client...").start();

  try {
    const veil = new VeilClient({ connection });
    spinner.succeed("Veil Client initialized");

    // Demo identity
    console.log();
    console.log(chalk.bold("🎭 Identity Demo:"));
    const demoSpinner = ora("Generating ZK identity proof...").start();
    
    const result = await veil.connect({
      method: 'email',
      identifier: 'demo@veil.sh',
      secret: 'demo-secret-key'
    });
    
    if (result.success) {
      demoSpinner.succeed("Identity proof generated");
      console.log(chalk.dim("  Wallet:"), chalk.cyan(veil.publicKey?.toBase58().slice(0, 20) + "..."));
      console.log(chalk.dim("  Status:"), chalk.green("Connected (anonymous)"));
    } else {
      demoSpinner.fail("Failed to generate identity");
    }

    // Show what's possible
    console.log();
    console.log(chalk.bold("💡 What you can do now:"));
    console.log();
    console.log(chalk.dim("  // Shield your balance (hide from public)"));
    console.log(chalk.cyan("  await veil.shielded.deposit(wallet, 5.0, signTx);"));
    console.log();
    console.log(chalk.dim("  // Private transfer"));
    console.log(chalk.cyan("  await veil.transfer.privateTransfer(sender, recipient, 1.0, signTx);"));
    console.log();
    console.log(chalk.dim("  // Private swap on Jupiter"));
    console.log(chalk.cyan("  await veil.dex.privateSwap(wallet, SOL, USDC, 1.0, signTx);"));
    console.log();
    console.log(chalk.dim("  // Get balances"));
    console.log(chalk.cyan("  const { public, shielded } = await veil.getBalances();"));
    console.log();

  } catch (error) {
    spinner.fail("Demo failed");
    console.error(error);
  }
}

// ============================================================================
// IDENTITY COMMAND
// ============================================================================

export async function runIdentity(action: string): Promise<void> {
  const loaded = await loadSDK();
  if (!loaded) return;

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  if (action === "create") {
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "method",
        message: "Identity method:",
        choices: [
          { name: "Email (recommended)", value: "email" },
          { name: "Passkey", value: "passkey" },
          { name: "Custom", value: "custom" },
        ],
      },
      {
        type: "input",
        name: "identifier",
        message: "Your identifier (email, username, etc.):",
      },
      {
        type: "password",
        name: "secret",
        message: "Your secret (never stored):",
      },
    ]);

    const spinner = ora("Generating ZK identity proof...").start();
    
    const veil = new VeilClient({ connection });
    const result = await veil.connect(answers);
    
    if (result.success) {
      spinner.succeed(chalk.green("Identity created successfully"));
      console.log();
      console.log(chalk.bold("Your Veil Wallet:"));
      console.log(chalk.cyan(veil.publicKey?.toBase58()));
      console.log();
      console.log(chalk.yellow("⚠️  IMPORTANT:"));
      console.log(chalk.dim("  Remember your identifier and secret."));
      console.log(chalk.dim("  They are NEVER stored anywhere."));
      console.log(chalk.dim("  Same credentials = same wallet."));
    } else {
      spinner.fail("Failed to create identity");
    }
  }
}

