#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import gradient from "gradient-string";
import { runInit, runAdd } from "./cli.js";
import { runDemo, runIdentity } from "./sdk-commands.js";

const VEIL_ASCII = `
██╗   ██╗███████╗██╗██╗
██║   ██║██╔════╝██║██║
██║   ██║█████╗  ██║██║
╚██╗ ██╔╝██╔══╝  ██║██║
 ╚████╔╝ ███████╗██║███████╗
  ╚═══╝  ╚══════╝╚═╝╚══════╝
`;

const TAGLINE = "Veil — Privacy-first access & recovery for Solana";

const INTRO = `
Veil adds privacy to your DeFi ecosystem:
${chalk.dim("•")} dApps, DEXs, wallets, and apps
${chalk.dim("•")} Identity is never on-chain
${chalk.dim("•")} Access is verified without exposure
${chalk.dim("•")} Recovery does not leak social graphs
${chalk.dim("•")} Full SDK for shielded balances & private transfers
`;

function displayBanner(): void {
  console.log();
  console.log(gradient.vice(VEIL_ASCII));
  console.log(chalk.bold.cyan(TAGLINE));
  console.log(INTRO);
}

const program = new Command();

program
  .name("veil")
  .description("Privacy layer for DeFi — dApps, DEXs, wallets, and apps")
  .version("0.2.0");

program
  .command("init")
  .description("Create a new project with Veil privacy built-in")
  .option("-n, --name <name>", "Project name")
  .option("-t, --template <template>", "Frontend template (nextjs or vite)")
  .option("--no-helius", "Disable Helius integration")
  .option("--shadow-pay", "Enable ShadowPay integration")
  .option("--network <network>", "Network (devnet or localnet)")
  .action(async (options) => {
    displayBanner();
    await runInit(options);
  });

program
  .command("add")
  .description("Add Veil privacy to an existing project")
  .option("--shadow-pay", "Include ShadowPay integration")
  .option("--no-helius", "Disable Helius integration")
  .action(async (options) => {
    displayBanner();
    await runAdd(options);
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

// Default command shows help
if (process.argv.length === 2) {
  displayBanner();
  console.log(chalk.dim("Usage:"));
  console.log(`  ${chalk.cyan("veil init")}      — Create a new project with Veil`);
  console.log(`  ${chalk.cyan("veil add")}       — Add Veil to an existing project`);
  console.log(`  ${chalk.cyan("veil demo")}      — Interactive SDK demo`);
  console.log(`  ${chalk.cyan("veil identity")}  — Manage ZK identities`);
  console.log();
} else {
  program.parse();
}

