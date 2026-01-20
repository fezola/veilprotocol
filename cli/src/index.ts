#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { generateConfig, generateRpcAbstraction, generatePackageJson } from './generators';

const program = new Command();

program
  .name('veil')
  .description('CLI for scaffolding Veil Protocol privacy-first Solana projects')
  .version('0.1.0');

program
  .command('init [project-name]')
  .description('Initialize a new Veil Protocol project')
  .option('--helius', 'Enable Helius RPC integration (recommended for privacy)')
  .option('--shadow-pay', 'Enable ShadowPay integration for private transfers')
  .option('--network <network>', 'Solana network: devnet or mainnet-beta', 'devnet')
  .action(async (projectName: string | undefined, options: { helius?: boolean; shadowPay?: boolean; network?: string }) => {
    console.log(chalk.cyan('\n🛡️  Veil Protocol - Privacy-First Solana Development\n'));

    // Interactive prompts if not provided
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: projectName || 'my-veil-app',
        when: !projectName,
      },
      {
        type: 'list',
        name: 'network',
        message: 'Select Solana network:',
        choices: [
          { name: 'Devnet (development/testing - free SOL from faucet)', value: 'devnet' },
          { name: 'Mainnet-beta (production - real SOL required)', value: 'mainnet-beta' },
        ],
        default: 'devnet',
        when: !options.network,
      },
      {
        type: 'confirm',
        name: 'useHelius',
        message: 'Enable Helius RPC? (recommended for privacy - reduces metadata leakage)',
        default: true,
        when: options.helius === undefined,
      },
      {
        type: 'confirm',
        name: 'useShadowPay',
        message: 'Enable ShadowPay integration? (private value transfers)',
        default: false,
        when: options.shadowPay === undefined,
      },
      {
        type: 'list',
        name: 'template',
        message: 'Choose a template:',
        choices: [
          { name: 'Basic - Identity + Recovery', value: 'basic' },
          { name: 'Governance - With Private Voting', value: 'governance' },
          { name: 'Treasury - With Stealth Multisig', value: 'treasury' },
          { name: 'Full - All Features', value: 'full' },
        ],
      },
    ]);

    const finalName = projectName || answers.projectName;
    const network = options.network ?? answers.network ?? 'devnet';
    const useHelius = options.helius ?? answers.useHelius;
    const useShadowPay = options.shadowPay ?? answers.useShadowPay;
    const template = answers.template;

    const spinner = ora('Creating project...').start();

    try {
      // Create project directory
      const projectPath = path.join(process.cwd(), finalName);
      fs.mkdirSync(projectPath, { recursive: true });

      // Create veil.config.ts
      const config = generateConfig(useHelius, useShadowPay, template);
      fs.writeFileSync(path.join(projectPath, 'veil.config.ts'), config);

      // Create basic structure
      fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });
      fs.mkdirSync(path.join(projectPath, 'src', 'lib'), { recursive: true });

      // Create RPC abstraction
      const rpcFile = generateRpcAbstraction(useHelius);
      fs.writeFileSync(path.join(projectPath, 'src', 'lib', 'rpc.ts'), rpcFile);

      // Create package.json
      const packageJson = generatePackageJson(finalName);
      fs.writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));

      spinner.succeed(chalk.green('Project created successfully!'));

      // Show network configuration
      const isDevnet = network === 'devnet';
      console.log(chalk.cyan('\n🌐 Network Configuration:'));
      console.log(chalk.white(`   Network: ${isDevnet ? chalk.blue('Devnet (Development)') : chalk.green('Mainnet-beta (Production)')}`));
      if (isDevnet) {
        console.log(chalk.gray('   Get free devnet SOL: https://faucet.solana.com'));
      } else {
        console.log(chalk.yellow('   ⚠️  Mainnet uses real SOL - test on devnet first!'));
      }

      console.log(chalk.cyan('\n📁 Project structure:'));
      console.log(`   ${finalName}/`);
      console.log('   ├── veil.config.ts      # Veil configuration');
      console.log('   ├── package.json');
      console.log('   └── src/');
      console.log('       └── lib/');
      console.log('           └── rpc.ts      # Privacy-focused RPC abstraction');

      console.log(chalk.cyan('\n🚀 Next steps:'));
      console.log(chalk.white(`   cd ${finalName}`));
      console.log(chalk.white('   npm install'));
      console.log(chalk.white('   npm run dev'));

      if (useHelius) {
        console.log(chalk.yellow('\n⚠️  Remember to set HELIUS_API_KEY in your .env file'));
        console.log(chalk.gray(`   RPC URL: https://${isDevnet ? 'devnet' : 'mainnet'}.helius-rpc.com/?api-key=YOUR_KEY`));
      }

      // Show switching networks info
      console.log(chalk.cyan('\n🔄 Switching Networks:'));
      if (isDevnet) {
        console.log(chalk.gray('   When ready for production, update .env:'));
        console.log(chalk.gray('   VITE_SOLANA_NETWORK=mainnet-beta'));
        console.log(chalk.gray('   See docs/NETWORK_CONFIGURATION.md for full guide'));
      } else {
        console.log(chalk.gray('   For testing, switch to devnet in .env:'));
        console.log(chalk.gray('   VITE_SOLANA_NETWORK=devnet'));
      }

    } catch (error) {
      spinner.fail(chalk.red('Failed to create project'));
      console.error(error);
    }
  });

program
  .command('info')
  .description('Show information about Veil Protocol')
  .action(() => {
    console.log(chalk.cyan('\n🛡️  Veil Protocol - Aegis Shield Core\n'));
    console.log(chalk.white('Privacy-preserving wallet infrastructure for Solana\n'));
    console.log(chalk.gray('What Aegis Shield protects:'));
    console.log(chalk.green('  ✓ Identity linkage'));
    console.log(chalk.green('  ✓ Access flows (multisig/voting)'));
    console.log(chalk.green('  ✓ Recovery logic'));
    console.log(chalk.green('  ✓ Security metadata'));
    console.log(chalk.gray('\nWhat it does NOT do:'));
    console.log(chalk.yellow('  ✗ Hide transactions on explorer'));
    console.log(chalk.yellow('  ✗ Anonymize Solana base layer'));
    console.log(chalk.yellow('  ✗ Replace existing wallets'));
    console.log(chalk.gray('\nLearn more: https://github.com/veil-protocol/aegis-shield'));
  });

program
  .command('network')
  .description('Show network configuration help')
  .action(() => {
    console.log(chalk.cyan('\n🌐 Veil Protocol - Network Configuration\n'));

    console.log(chalk.white('Available Networks:\n'));
    console.log(chalk.blue('  Devnet') + chalk.gray(' (Development/Testing)'));
    console.log(chalk.gray('    • Free SOL from faucet.solana.com'));
    console.log(chalk.gray('    • Perfect for development and hackathons'));
    console.log(chalk.gray('    • Data may be reset periodically'));
    console.log(chalk.gray('    • RPC: https://api.devnet.solana.com\n'));

    console.log(chalk.green('  Mainnet-beta') + chalk.gray(' (Production)'));
    console.log(chalk.gray('    • Real SOL required'));
    console.log(chalk.gray('    • Permanent transactions'));
    console.log(chalk.gray('    • Full privacy features'));
    console.log(chalk.gray('    • RPC: https://api.mainnet-beta.solana.com\n'));

    console.log(chalk.white('Configuration (.env):\n'));
    console.log(chalk.gray('  # For Devnet'));
    console.log(chalk.cyan('  VITE_SOLANA_NETWORK=devnet'));
    console.log(chalk.cyan('  VITE_HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=KEY\n'));

    console.log(chalk.gray('  # For Mainnet'));
    console.log(chalk.green('  VITE_SOLANA_NETWORK=mainnet-beta'));
    console.log(chalk.green('  VITE_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=KEY\n'));

    console.log(chalk.white('Wallet Setup:\n'));
    console.log(chalk.gray('  Phantom: Settings → Developer Settings → Testnet Mode'));
    console.log(chalk.gray('  Solflare: Settings → Network → Select network\n'));

    console.log(chalk.white('Switching to Production:\n'));
    console.log(chalk.gray('  1. Update VITE_SOLANA_NETWORK=mainnet-beta'));
    console.log(chalk.gray('  2. Update Helius RPC to mainnet endpoint'));
    console.log(chalk.gray('  3. Switch wallet to Mainnet'));
    console.log(chalk.gray('  4. Fund wallet with real SOL'));
    console.log(chalk.gray('  5. Restart application\n'));

    console.log(chalk.gray('Full documentation: docs/NETWORK_CONFIGURATION.md'));
  });

program.parse();

