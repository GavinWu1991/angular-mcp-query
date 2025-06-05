#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .name('angular-docs-sync')
  .description('Synchronize Angular documentation from GitHub')
  .version('0.1.0');

interface SyncOptions {
  version?: string;
  force?: boolean;
  token?: string;
}

interface ListOptions {
  // No options for list command
}

interface ClearOptions {
  version?: string;
}

program
  .command('sync')
  .description('Synchronize Angular documentation')
  .option('-v, --version <version>', 'Specific Angular version to sync')
  .option('-f, --force', 'Force refresh even if cache is valid')
  .option('--token <token>', 'GitHub API token (or set GITHUB_TOKEN env var)')
  .action(async (options: SyncOptions) => {
    try {
      console.log(chalk.blue('🚀 Starting Angular documentation sync...'));
      
      // TODO: Implement GitHubClient and DocumentProcessor when available
      console.log(chalk.yellow('⚠️  Sync functionality is not implemented in TypeScript version yet.'));
      console.log(chalk.gray('This feature needs GitHubClient and DocumentProcessor to be converted.'));
      
    } catch (error) {
      console.error(chalk.red('❌ Sync failed:'), (error as Error).message);
      if ((error as Error).message.includes('rate limit')) {
        console.log(chalk.yellow('\n💡 Tip: Set GITHUB_TOKEN environment variable to increase rate limits'));
      }
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List cached documentation versions')
  .action(async (options: ListOptions) => {
    try {
      // TODO: Implement DocumentProcessor when available
      console.log(chalk.yellow('⚠️  List functionality is not implemented in TypeScript version yet.'));
      console.log(chalk.gray('This feature needs DocumentProcessor to be converted.'));
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to list versions:'), (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('clear')
  .description('Clear documentation cache')
  .option('-v, --version <version>', 'Clear specific version (clears all if not specified)')
  .action(async (options: ClearOptions) => {
    try {
      if (options.version) {
        // Clear specific version
        const fs = await import('fs-extra');
        const path = await import('path');
        const versionPath = path.join('./assets/angular-docs', options.version);
        
        if (await fs.pathExists(versionPath)) {
          await fs.remove(versionPath);
          console.log(chalk.green(`✅ Cleared cache for version ${options.version}`));
        } else {
          console.log(chalk.yellow(`⚠️  No cache found for version ${options.version}`));
        }
      } else {
        // Clear all cache
        const fs = await import('fs-extra');
        const assetsPath = './assets/angular-docs';
        
        if (await fs.pathExists(assetsPath)) {
          await fs.remove(assetsPath);
          console.log(chalk.green('✅ Cleared all documentation cache'));
        } else {
          console.log(chalk.yellow('⚠️  No cache found'));
        }
      }
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to clear cache:'), (error as Error).message);
      process.exit(1);
    }
  });

program.parse(); 