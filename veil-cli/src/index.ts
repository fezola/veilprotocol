#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import gradient from "gradient-string";
import { runInit, runAdd, TEMPLATE_INFO, TemplateCategory } from "./cli.js";
import { runDemo, runIdentity } from "./sdk-commands.js";

const VEIL_ASCII = `
██╗   ██╗███████╗██╗██╗
██║   ██║██╔════╝██║██║
██║   ██║█████╗  ██║██║
╚██╗ ██╔╝██╔══╝  ██║██║
 ╚████╔╝ ███████╗██║███████╗
  ╚═══╝  ╚══════╝╚═╝╚══════╝
`;

const TAGLINE = "Veil + ShadowWire — Complete Privacy Infrastructure for Solana";

const INTRO = `
Build privacy-first applications with full stack:
${chalk.cyan("•")} ${chalk.bold("Identity")} — ZK authentication, no PII on-chain
${chalk.cyan("•")} ${chalk.bold("Recovery")} — Shamir secret sharing, hidden guardians
${chalk.cyan("•")} ${chalk.bold("Voting")} — Commit-reveal, private choices
${chalk.cyan("•")} ${chalk.bold("Staking")} — Hidden amounts via Pedersen commitments
${chalk.cyan("•")} ${chalk.bold("Multisig")} — Stealth signers, anonymous approval
${chalk.yellow("•")} ${chalk.bold("ShadowPay")} — Private transfers via @radr/shadowwire (mainnet)
`;

function displayBanner(): void {
  console.log();
  console.log(gradient.vice(VEIL_ASCII));
  console.log(chalk.bold.cyan(TAGLINE));
  console.log(INTRO);
}

// List available templates
function displayTemplates(): void {
  console.log(chalk.bold("\nAvailable Templates:\n"));

  const categories = ["DeFi", "DApp", "Exchange", "Wallet", "Starter"];
  for (const category of categories) {
    const templates = Object.entries(TEMPLATE_INFO)
      .filter(([_, info]) => info.category === category);

    if (templates.length > 0) {
      console.log(chalk.cyan(`  ${category}:`));
      for (const [key, info] of templates) {
        console.log(`    ${chalk.dim("•")} ${chalk.white(key.padEnd(12))} ${info.description}`);
      }
      console.log();
    }
  }
}

const program = new Command();

program
  .name("create-veil-app")
  .description("Privacy infrastructure for Solana — DeFi, DApps, Exchanges, Wallets")
  .version("0.3.2")
  .argument("[name]", "Project name")
  .option("-t, --template <template>", "Template: dex, lending, yield, pool, gaming, nft, social, governance, cex, aggregator, trading, wallet, portfolio, payments, basic")
  .option("-f, --framework <framework>", "Framework: nextjs or vite")
  .option("--helius", "Enable Helius RPC (default: true)")
  .option("--no-helius", "Disable Helius RPC")
  .option("--shadow-pay", "Enable ShadowPay mainnet integration")
  .option("--no-shadow-pay", "Disable ShadowPay")
  .option("--network <network>", "Veil features network: devnet or localnet")
  .action(async (name, options) => {
    displayBanner();
    await runInit({ ...options, name });
  });

program
  .command("init [name]")
  .description("Create a new project with full Veil + ShadowWire privacy stack")
  .option("-t, --template <template>", "Template: dex, lending, yield, pool, gaming, nft, social, governance, cex, aggregator, trading, wallet, portfolio, payments, basic")
  .option("-f, --framework <framework>", "Framework: nextjs or vite")
  .option("--helius", "Enable Helius RPC (default: true)")
  .option("--no-helius", "Disable Helius RPC")
  .option("--shadow-pay", "Enable ShadowPay mainnet integration")
  .option("--no-shadow-pay", "Disable ShadowPay")
  .option("--network <network>", "Veil features network: devnet or localnet")
  .action(async (name, options) => {
    displayBanner();
    await runInit({ ...options, name });
  });

program
  .command("add")
  .description("Add Veil privacy to an existing project")
  .option("--shadowpay", "Include ShadowPay integration")
  .option("--no-helius", "Disable Helius RPC")
  .action(async (options) => {
    displayBanner();
    await runAdd(options);
  });

program
  .command("templates")
  .description("List all available project templates")
  .action(() => {
    displayBanner();
    displayTemplates();
  });

// SDK Commands
program
  .command("demo")
  .description("Run an interactive demo of the Veil SDK capabilities")
  .action(async () => {
    await runDemo();
  });

program
  .command("identity <action>")
  .description("Manage ZK identities (create, verify, recover)")
  .action(async (action) => {
    await runIdentity(action);
  });

// Default command shows help with examples
if (process.argv.length === 2) {
  displayBanner();
  console.log(chalk.bold("Quick Start:\n"));
  console.log(`  ${chalk.cyan("npx create-veil-app my-dex --template=dex")}`);
  console.log(`  ${chalk.cyan("npx create-veil-app my-wallet --template=wallet")}`);
  console.log(`  ${chalk.cyan("npx create-veil-app my-dao --template=governance")}`);
  console.log();
  console.log(chalk.dim("Usage:"));
  console.log(`  ${chalk.cyan("npx create-veil-app [name]")}           Create new project`);
  console.log(`  ${chalk.cyan("npx create-veil-app [name] -t dex")}    Use specific template`);
  console.log(`  ${chalk.cyan("npx create-veil-app init [name]")}      Alternative syntax`);
  console.log(`  ${chalk.cyan("npx create-veil-app templates")}        List all templates`);
  console.log(`  ${chalk.cyan("npx create-veil-app demo")}             Interactive SDK demo`);
  console.log();
  console.log(chalk.dim("Network Info:"));
  console.log(`  ${chalk.yellow("ShadowPay")} runs on ${chalk.bold("mainnet")} (real private transfers)`);
  console.log(`  ${chalk.cyan("Veil features")} run on ${chalk.bold("devnet")} (voting, staking, multisig)`);
  console.log();
}

program.parse();

