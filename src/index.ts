#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { AngularDocsMCPServer } from './mcp/index.js';
import { AngularDocumentationFetcher, FetchResult, VersionInfo } from './tools/doc-fetcher/fetcher.js';
// Dynamically import config to ensure it's initialized, especially for assetsPath
import { config as appConfig } from '../config/config.js';

const program = new Command();

program
  .name('angular-mcp-query')
  .description('Intelligent Angular documentation MCP server and document management CLI.')
  .version(appConfig.mcp.version || '0.1.0'); // Use version from config or default

// Default command: Start MCP Server
program
  .action(async () => {
    console.log(chalk.blue('Starting Angular Docs MCP Server...'));
    const server = new AngularDocsMCPServer();
    await server.start();

    // Graceful shutdown handling
    const shutdown = () => {
      console.log(chalk.yellow('\nShutting down Angular Docs MCP Server...'));
      // Perform any cleanup if necessary
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  });

const docsCommand = program.command('docs')
  .description('Manage Angular documentation assets');

interface FetchCLIArguments {
  angularVersion: string;
  force?: boolean;
  verbose?: boolean;
}

docsCommand
  .command('fetch')
  .description('Fetch Angular documentation')
  .option('-a, --angular-version <version>', 'Angular version/branch to fetch (e.g., v18, main)', 'main')
  .option('-f, --force', 'Force overwrite if version already exists')
  .option('--verbose', 'Enable verbose output during fetch')
  .action(async (options: FetchCLIArguments) => {
    try {
      const fetcher = new AngularDocumentationFetcher();
      console.log(chalk.blue(`ℹ️  Using documentation asset path: ${appConfig.storage.assetsPath}`));
      const result: FetchResult = await fetcher.fetch(options.angularVersion, {
        force: options.force,
        verbose: options.verbose,
      });

      if (result.skipped) {
        console.log(chalk.yellow('⏭️  Fetch skipped'));
        console.log(chalk.gray(`Reason: ${result.reason || 'Version already up-to-date.'}`));
        console.log(chalk.gray(`Major Version: ${result.majorVersion}`));
        console.log(chalk.gray(`Current Version: ${result.version}`));
      } else {
        console.log(chalk.green('🎉 Fetch completed successfully!'));
        console.log(chalk.gray(`Major Version: ${result.majorVersion}`));
        console.log(chalk.gray(`Full Version: ${result.version}`));
        console.log(chalk.gray(`Duration: ${result.duration}`));
        console.log(chalk.gray(`Files processed: ${result.processed}`));
        if (result.categorized && Object.keys(result.categorized).length > 0) {
            console.log(chalk.gray(`Categories: ${Object.entries(result.categorized).map(([cat, count]) => `${cat}: ${count}`).join(', ')}`));
        }
        if (result.uncategorized) {
            console.log(chalk.gray(`Uncategorized: ${result.uncategorized}`));
        }
      }
    } catch (error) {
      console.error(chalk.red('❌ Fetch failed:'), (error as Error).message);
      if ((error as Error).stack && options.verbose) {
        console.error(chalk.red((error as Error).stack));
      }
      process.exit(1);
    }
  });

docsCommand
  .command('list')
  .description('List cached Angular documentation versions')
  .action(async () => {
    try {
      const fetcher = new AngularDocumentationFetcher();
      console.log(chalk.blue(`ℹ️  Listing versions from asset path: ${appConfig.storage.assetsPath}`));
      const versions: VersionInfo[] = await fetcher.listVersions();

      if (versions.length === 0) {
        console.log(chalk.yellow(`No cached versions found in ${appConfig.storage.assetsPath}`));
        console.log(chalk.cyan(`Try running: angular-mcp-query docs fetch --angular-version <version>`));
        return;
      }

      console.log(chalk.cyan('📚 Cached Angular Documentation Versions:'));
      versions.forEach((v: VersionInfo) => {
        const statsSummary = `processed: ${v.stats.processed}, categorized: ${Object.keys(v.stats.categorized || {}).length}, uncategorized: ${v.stats.uncategorized || 0}`;
        console.log(chalk.green(`  ${v.majorVersion} (Actual: ${v.version}, Files: ${v.stats.processed || 'N/A'}, Generated: ${new Date(v.generatedAt).toLocaleString()})`));
        // console.log(chalk.gray(`    Stats: ${statsSummary}`));
      });
    } catch (error) {
      console.error(chalk.red('❌ Failed to list versions:'), (error as Error).message);
      process.exit(1);
    }
  });

docsCommand
  .command('remove')
  .description('Remove a specific cached Angular documentation version')
  .argument('<version>', 'Major version to remove (e.g., v17, v18)')
  .action(async (version: string) => {
    try {
      const fetcher = new AngularDocumentationFetcher();
      console.log(chalk.blue(`ℹ️  Removing version from asset path: ${appConfig.storage.assetsPath}`));
      const removed = await fetcher.removeVersion(version);

      if (removed) {
        console.log(chalk.green(`✅ Successfully removed documentation for ${version} from ${appConfig.storage.assetsPath}`));
      } else {
        console.log(chalk.yellow(`⚠️  Version ${version} not found in cache at ${appConfig.storage.assetsPath}`));
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to remove version:'), (error as Error).message);
      process.exit(1);
    }
  });

// Fallback for trying to run the old doc-fetcher CLI directly
if (process.argv[1].includes('doc-fetcher') && (process.argv.includes('fetch') || process.argv.includes('list') || process.argv.includes('remove'))) {
    console.warn(chalk.yellow("Warning: You might be trying to run the old 'doc-fetcher' CLI."));
    console.warn(chalk.cyan("Please use the new 'angular-mcp-query docs <command>' syntax."));
    // Potentially redirect or show help here
}


program.parseAsync(process.argv).catch(err => {
  console.error(chalk.red('An unexpected error occurred:'), err);
  process.exit(1);
});