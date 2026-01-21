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

program
  .command('shadowwire')
  .description('Show ShadowWire ZK proof architecture')
  .action(() => {
    console.log(chalk.magenta('\n⚡ ShadowWire ZK Proof Architecture\n'));

    console.log(chalk.white('Private Transfer Flow:\n'));
    console.log(chalk.gray('  1. CLIENT (Veil SDK)'));
    console.log(chalk.gray('     └── Generate Bulletproofs range proof locally'));
    console.log(chalk.gray('     └── Create blinding factor for Pedersen commitment'));
    console.log(chalk.gray('     └── Generate stealth address for recipient\n'));

    console.log(chalk.gray('  2. BACKEND (ShadowWire)'));
    console.log(chalk.gray('     └── Receive: wallet, token, nonce, signature, plaintext amount'));
    console.log(chalk.gray('     └── Compute Pedersen commitment: C = g^amount * h^blinding'));
    console.log(chalk.gray('     └── Aggregate Bulletproofs into batch proof'));
    console.log(chalk.gray('     └── Encrypt metadata with NaCl sealed-box'));
    console.log(chalk.gray('     └── Plaintext amount is ephemeral - discarded after commitment\n'));

    console.log(chalk.gray('  3. ON-CHAIN (Solana PDA Verifier)'));
    console.log(chalk.gray('     └── Verify Bulletproofs against commitment'));
    console.log(chalk.gray('     └── Check nullifier for double-spend protection'));
    console.log(chalk.gray('     └── Update shielded pool state'));
    console.log(chalk.gray('     └── Release funds via mixing layer\n'));

    console.log(chalk.white('Privacy Guarantees:\n'));
    console.log(chalk.green('  ✓ Amount hidden via Pedersen commitments'));
    console.log(chalk.green('  ✓ Sender-recipient unlinking via mixing pool'));
    console.log(chalk.green('  ✓ Range proofs verify valid amounts without revealing value'));
    console.log(chalk.green('  ✓ Nullifiers prevent double-spend'));
    console.log(chalk.green('  ✓ Full unlinkability from encryption stack\n'));

    console.log(chalk.gray('SDK Package: @radr/shadowwire'));
    console.log(chalk.gray('Docs: https://shadowwire.xyz/docs'));
  });

program
  .command('compression')
  .description('Show Light Protocol ZK compression info')
  .action(() => {
    console.log(chalk.cyan('\n📦 Light Protocol - ZK Compression\n'));

    console.log(chalk.white('What is ZK Compression?\n'));
    console.log(chalk.gray('  Light Protocol compresses on-chain state using Merkle trees,'));
    console.log(chalk.gray('  reducing costs by up to 1000x while preserving privacy.\n'));

    console.log(chalk.white('Cost Comparison:\n'));
    console.log(chalk.yellow('  Standard Account:     ~0.002 SOL rent'));
    console.log(chalk.green('  Compressed Account:   ~0.00003 SOL per state'));
    console.log(chalk.gray('  → 1000x cheaper!\n'));

    console.log(chalk.white('How Veil Uses Light Protocol:\n'));
    console.log(chalk.gray('  PRIVACY POOLS'));
    console.log(chalk.gray('    └── Deposits create compressed UTXOs in state tree'));
    console.log(chalk.gray('    └── Withdrawals use nullifiers to prevent double-spend'));
    console.log(chalk.gray('    └── Merkle proofs verify inclusion without revealing position\n'));

    console.log(chalk.gray('  COMPRESSED TOKENS'));
    console.log(chalk.gray('    └── SPL tokens wrapped as compressed tokens'));
    console.log(chalk.gray('    └── Balances hidden in Merkle leaves'));
    console.log(chalk.gray('    └── Transfer proofs verify balance without revealing amount\n'));

    console.log(chalk.gray('  STATE MERKLE TREE'));
    console.log(chalk.gray('    └── 26 levels deep (67M+ leaves)'));
    console.log(chalk.gray('    └── 2048 changelog buffer for concurrent updates'));
    console.log(chalk.gray('    └── Poseidon hash for ZK-friendly proofs\n'));

    console.log(chalk.white('Enable in veil.config.ts:\n'));
    console.log(chalk.cyan('  integrations: {'));
    console.log(chalk.cyan('    lightProtocol: true,'));
    console.log(chalk.cyan('  }\n'));

    console.log(chalk.gray('SDK Packages:'));
    console.log(chalk.gray('  @lightprotocol/stateless.js'));
    console.log(chalk.gray('  @lightprotocol/compressed-token'));
    console.log(chalk.gray('Docs: https://lightprotocol.com/docs'));
  });

program
  .command('privacy-stack')
  .description('Show full privacy stack architecture')
  .action(() => {
    console.log(chalk.cyan('\n🛡️  Veil Protocol - Full Privacy Stack\n'));

    console.log(chalk.white('Architecture Layers:\n'));
    console.log(chalk.magenta('  ┌────────────────────────────────────────────────┐'));
    console.log(chalk.magenta('  │               VEIL PROTOCOL LAYER              │'));
    console.log(chalk.magenta('  │  Private Voting │ Stealth Multisig │ ZK Identity │'));
    console.log(chalk.magenta('  │  Private Staking │ Shielded Payments │ Recovery   │'));
    console.log(chalk.magenta('  └──────────────────────┬─────────────────────────┘'));
    console.log(chalk.gray('                         │'));
    console.log(chalk.blue('  ┌──────────────────────┴─────────────────────────┐'));
    console.log(chalk.blue('  │              SHADOWWIRE SDK (RADR)              │'));
    console.log(chalk.blue('  │  Bulletproofs │ Pedersen Commitments │ Poseidon  │'));
    console.log(chalk.blue('  │  Stealth Addresses │ NaCl Encryption │ Nullifiers│'));
    console.log(chalk.blue('  └──────────────────────┬─────────────────────────┘'));
    console.log(chalk.gray('                         │'));
    console.log(chalk.green('  ┌──────────────────────┴─────────────────────────┐'));
    console.log(chalk.green('  │           LIGHT PROTOCOL (ZK Compression)       │'));
    console.log(chalk.green('  │  Compressed Accounts │ Compressed Tokens        │'));
    console.log(chalk.green('  │  State Merkle Trees │ 1000x Cost Reduction      │'));
    console.log(chalk.green('  └──────────────────────┬─────────────────────────┘'));
    console.log(chalk.gray('                         │'));
    console.log(chalk.yellow('  ┌──────────────────────┴─────────────────────────┐'));
    console.log(chalk.yellow('  │                 SOLANA BLOCKCHAIN               │'));
    console.log(chalk.yellow('  └────────────────────────────────────────────────┘\n'));

    console.log(chalk.white('Enable Full Stack:\n'));
    console.log(chalk.cyan('  // veil.config.ts'));
    console.log(chalk.cyan('  integrations: {'));
    console.log(chalk.cyan('    shadowPay: true,      // ShadowWire private transfers'));
    console.log(chalk.cyan('    lightProtocol: true,  // ZK compression'));
    console.log(chalk.cyan('  }\n'));

    console.log(chalk.gray('Commands:'));
    console.log(chalk.gray('  veil shadowwire    - ShadowWire ZK proof details'));
    console.log(chalk.gray('  veil compression   - Light Protocol compression'));
    console.log(chalk.gray('  veil network       - Network configuration'));
  });

program.parse(process.argv);

