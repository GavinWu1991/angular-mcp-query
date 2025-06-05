#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { AngularDocumentationFetcher } from './fetcher.js';

const program = new Command();

program
  .name('angular-doc-fetcher')
  .description('Fetch and organize Angular documentation')
  .version('2.0.0');

interface FetchOptions {
  angularVersion: string;
  force?: boolean;
  verbose?: boolean;
}

program
  .command('fetch')
  .description('Fetch Angular documentation')
  .option('-a, --angular-version <version>', 'Angular version/branch to fetch', 'main')
  .option('-f, --force', 'Force overwrite existing version')
  .option('--verbose', 'Verbose output')
  .action(async (options: FetchOptions) => {
    try {
      const fetcher = new AngularDocumentationFetcher();
      const result = await fetcher.fetch(options.angularVersion, options);
      
      if (result.skipped) {
        console.log(chalk.yellow('⏭️  Fetch skipped'));
        console.log(chalk.gray(`Reason: ${(result as any).reason}`));
        console.log(chalk.gray(`Major Version: ${result.majorVersion}`));
        console.log(chalk.gray(`Current Version: ${result.version}`));
      } else {
        console.log(chalk.green('🎉 Fetch completed successfully!'));
        console.log(chalk.gray(`Major Version: ${result.majorVersion}`));
        console.log(chalk.gray(`Full Version: ${result.version}`));
        console.log(chalk.gray(`Duration: ${result.duration}`));
        console.log(chalk.gray(`Files processed: ${result.processed}`));
      }
    } catch (error) {
      console.error(chalk.red('❌ Fetch failed:'), (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List cached versions')
  .action(async () => {
    try {
      const fetcher = new AngularDocumentationFetcher();
      const versions = await (fetcher as any).listVersions();
      
      if (versions.length === 0) {
        console.log(chalk.yellow('No cached versions found.'));
        return;
      }
      
      console.log(chalk.cyan('📚 Cached Angular Documentation Versions:'));
      versions.forEach((v: any) => {
        console.log(chalk.green(`  ${v.majorVersion} (${v.version}, ${v.stats.processed} files, generated ${new Date(v.generatedAt).toLocaleString()})`));
      });
    } catch (error) {
      console.error(chalk.red('❌ Failed to list versions:'), (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('remove')
  .description('Remove a cached version')
  .argument('<version>', 'Version to remove')
  .action(async (version: string) => {
    try {
      const fetcher = new AngularDocumentationFetcher();
      const removed = await (fetcher as any).removeVersion(version);
      
      if (removed) {
        console.log(chalk.green(`✅ Removed version ${version}`));
      } else {
        console.log(chalk.yellow(`⚠️  Version ${version} not found`));
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to remove version:'), (error as Error).message);
      process.exit(1);
    }
  });

if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
} 