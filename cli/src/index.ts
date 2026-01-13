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
  .action(async (projectName: string | undefined, options: { helius?: boolean; shadowPay?: boolean }) => {
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

program.parse();

