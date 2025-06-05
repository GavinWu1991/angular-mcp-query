import fs from 'fs-extra';
import path from 'path';
import { Octokit } from 'octokit';
import matter from 'gray-matter';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import { config } from '../../../config/config.js';
import { VersionManager } from '../../core/version-manager.js';

export interface FetchResult {
  skipped?: boolean;
  majorVersion: string;
  version: string;
  processed: number;
  duration: string;
  categorized: Record<string, number>;
  uncategorized: number;
  reason?: string;
}

export interface FetchOptions {
  force?: boolean;
  verbose?: boolean;
}

export interface VersionInfo {
  majorVersion: string;
  version: string;
  generatedAt: string;
  stats: {
    processed: number;
    categorized: Record<string, number>;
    uncategorized: number;
  };
}

interface GitHubContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url?: string;
  content?: string;
  encoding?: string;
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
}

interface DocumentMeta {
  title?: string;
  description?: string;
  tags?: string[];
  originalPath: string;
  category: string;
  filename: string;
  [key: string]: any;
}

const execAsync = promisify(exec);

export class AngularDocumentationFetcher {
  private assetsPath: string;
  private githubConfig: any;
  private octokit: Octokit;

  constructor() {
    this.assetsPath = config.storage.assetsPath;
    this.githubConfig = config.github;
    this.octokit = new Octokit();
  }

  async fetch(version: string, options: FetchOptions = {}): Promise<FetchResult> {
    const startTime = Date.now();
    
    try {
      if (options.verbose) {
        console.log(chalk.blue(`🔍 Starting fetch for Angular version: ${version}`));
      }

      // Resolve version to actual GitHub branch/tag
      const resolvedVersion = await this.resolveGitHubVersion(version);
      const majorVersion = VersionManager.extractMajorVersion(resolvedVersion);
      
      if (options.verbose) {
        console.log(chalk.gray(`Resolved to: ${resolvedVersion} (Major: ${majorVersion})`));
      }

      // Check if version already exists and is up to date
      if (!options.force) {
        const existingVersion = await this.getExistingVersion(majorVersion);
        if (existingVersion && existingVersion.version === resolvedVersion) {
          return {
            skipped: true,
            majorVersion,
            version: resolvedVersion,
            processed: 0,
            duration: '0ms',
            categorized: {},
            uncategorized: 0,
            reason: `Version ${resolvedVersion} already exists`
          };
        }
      }

      // Create version directory
      const versionDir = path.join(this.assetsPath, majorVersion);
      await fs.ensureDir(versionDir);

      if (options.verbose) {
        console.log(chalk.blue(`📁 Created version directory: ${versionDir}`));
      }

      // Fetch documentation files
      const stats = await this.fetchDocumentationFiles(resolvedVersion, versionDir, options);

      // Generate index.json
      await this.generateIndex(versionDir, majorVersion, resolvedVersion, stats);

      const duration = `${Date.now() - startTime}ms`;
      
      if (options.verbose) {
        console.log(chalk.green(`✅ Fetch completed in ${duration}`));
      }

      return {
        majorVersion,
        version: resolvedVersion,
        processed: stats.processed,
        duration,
        categorized: stats.categorized,
        uncategorized: stats.uncategorized
      };
    } catch (error) {
      throw new Error(`Failed to fetch Angular documentation: ${(error as Error).message}`);
    }
  }

  async listVersions(): Promise<VersionInfo[]> {
    try {
      const versions: VersionInfo[] = [];
      
      if (!await fs.pathExists(this.assetsPath)) {
        return versions;
      }

      const directories = await fs.readdir(this.assetsPath);
      
      for (const dir of directories) {
        const dirPath = path.join(this.assetsPath, dir);
        const stat = await fs.stat(dirPath);
        
        if (stat.isDirectory()) {
          const indexPath = path.join(dirPath, 'index.json');
          
          if (await fs.pathExists(indexPath)) {
            try {
              const index = await fs.readJson(indexPath);
              versions.push({
                majorVersion: index.majorVersion,
                version: index.version,
                generatedAt: index.generatedAt,
                stats: {
                  processed: index.stats.processed || index.stats.totalFiles || 0,
                  categorized: index.stats.categorized || {},
                  uncategorized: index.stats.uncategorized || 0
                }
              });
            } catch (error) {
              console.warn(chalk.yellow(`⚠️  Invalid index.json in ${dir}: ${(error as Error).message}`));
            }
          }
        }
      }

      // Sort by major version (newest first)
      versions.sort((a, b) => {
        const majorA = parseInt(a.majorVersion.replace('v', '')) || 0;
        const majorB = parseInt(b.majorVersion.replace('v', '')) || 0;
        return majorB - majorA;
      });

      return versions;
    } catch (error) {
      throw new Error(`Failed to list versions: ${(error as Error).message}`);
    }
  }

  async removeVersion(version: string): Promise<boolean> {
    try {
      const majorVersion = VersionManager.extractMajorVersion(version);
      const versionPath = path.join(this.assetsPath, majorVersion);
      
      if (await fs.pathExists(versionPath)) {
        await fs.remove(versionPath);
        return true;
      }
      
      return false;
    } catch (error) {
      throw new Error(`Failed to remove version ${version}: ${(error as Error).message}`);
    }
  }

  private async resolveGitHubVersion(version: string): Promise<string> {
    // For git cloning, we can use branch names directly without API calls
    if (version === 'latest') {
      // Only use API for 'latest' to get the most recent release tag
      try {
        const releases = await this.fetchGitHubReleases();
        const latestRelease = releases.find(r => !r.prerelease && !r.draft);
        return latestRelease ? latestRelease.tag_name : 'main';
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Failed to fetch releases, using main branch: ${(error as Error).message}`));
        return 'main';
      }
    }
    
    // For any other version (including 'main'), use it directly
    return version;
  }

  private async fetchGitHubReleases(): Promise<GitHubRelease[]> {
    try {
      const response = await this.octokit.rest.repos.listReleases({
        owner: this.githubConfig.owner,
        repo: this.githubConfig.repo
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch GitHub releases: ${(error as Error).message}`);
    }
  }

  private async getExistingVersion(majorVersion: string): Promise<VersionInfo | null> {
    try {
      const versionPath = path.join(this.assetsPath, majorVersion);
      const indexPath = path.join(versionPath, 'index.json');
      
      if (await fs.pathExists(indexPath)) {
        const index = await fs.readJson(indexPath);
        return {
          majorVersion: index.majorVersion,
          version: index.version,
          generatedAt: index.generatedAt,
          stats: {
            processed: index.stats.processed || index.stats.totalFiles || 0,
            categorized: index.stats.categorized || {},
            uncategorized: index.stats.uncategorized || 0
          }
        };
      }
    } catch (error) {
      // Ignore errors when checking existing version
    }
    
    return null;
  }

  private async fetchDocumentationFiles(version: string, versionDir: string, options: FetchOptions): Promise<any> {
    const stats = {
      processed: 0,
      categorized: {} as Record<string, number>,
      uncategorized: 0
    };

    // Initialize category counters
    Object.keys(config.organization.categories).forEach(category => {
      stats.categorized[category] = 0;
    });

    if (options.verbose) {
      console.log(chalk.blue(`📥 Cloning Angular repository for version: ${version}`));
    }

    // Create temporary directory for cloning
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'angular-docs-'));
    
    try {
      // Clone the repository
      await this.cloneRepository(version, tempDir, options);
      
      // Process documentation files from the local clone
      const contentPath = path.join(tempDir, this.githubConfig.contentPath);
      
      if (await fs.pathExists(contentPath)) {
        await this.processLocalFiles(contentPath, versionDir, stats, options);
      } else {
        console.warn(chalk.yellow(`⚠️  Documentation path not found: ${this.githubConfig.contentPath}`));
      }

      if (options.verbose) {
        console.log(chalk.green(`📊 Processed ${stats.processed} files`));
        Object.entries(stats.categorized).forEach(([category, count]) => {
          if (count > 0) {
            console.log(chalk.gray(`  ${category}: ${count} files`));
          }
        });
        if (stats.uncategorized > 0) {
          console.log(chalk.gray(`  uncategorized: ${stats.uncategorized} files`));
        }
      }
    } finally {
      // Clean up temporary directory
      try {
        await fs.remove(tempDir);
        if (options.verbose) {
          console.log(chalk.gray(`🧹 Cleaned up temporary directory: ${tempDir}`));
        }
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Failed to clean up temp directory: ${(error as Error).message}`));
      }
    }

    return stats;
  }

  private async cloneRepository(version: string, tempDir: string, options: FetchOptions): Promise<void> {
    try {
      const repoUrl = `https://github.com/${this.githubConfig.owner}/${this.githubConfig.repo}.git`;
      
      if (options.verbose) {
        console.log(chalk.gray(`  Cloning from: ${repoUrl}`));
        console.log(chalk.gray(`  Branch/tag: ${version}`));
        console.log(chalk.gray(`  Target directory: ${tempDir}`));
      }

      // Clone with depth 1 for faster cloning, checking out specific version
      const cloneCmd = `git clone --depth 1 --branch ${version} ${repoUrl} ${tempDir}`;
      
      if (options.verbose) {
        console.log(chalk.gray(`  Running: ${cloneCmd}`));
      }

      const { stdout, stderr } = await execAsync(cloneCmd);
      
      if (options.verbose && stdout) {
        console.log(chalk.gray(`  Git output: ${stdout}`));
      }
      
      if (stderr && !stderr.includes('Cloning into')) {
        console.warn(chalk.yellow(`  Git warnings: ${stderr}`));
      }
      
    } catch (error) {
      throw new Error(`Failed to clone repository: ${(error as Error).message}`);
    }
  }

  private async processLocalFiles(contentPath: string, versionDir: string, stats: any, options: FetchOptions): Promise<void> {
    const processDirectory = async (dirPath: string, relativePath: string = ''): Promise<void> => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          const entryRelativePath = path.join(relativePath, entry.name);
          
          if (entry.isDirectory()) {
            // Recursively process subdirectories
            await processDirectory(fullPath, entryRelativePath);
          } else if (entry.isFile() && entry.name.endsWith('.md')) {
            try {
              // Read file content
              const fileContent = await fs.readFile(fullPath, 'utf8');
              const category = this.categorizeFile(entryRelativePath, fileContent);
              
              // Create category directory
              const categoryDir = path.join(versionDir, category);
              await fs.ensureDir(categoryDir);
              
              // Create file info object similar to GitHub API response
              const fileInfo: GitHubContent = {
                name: entry.name,
                path: entryRelativePath,
                type: 'file'
              };
              
              // Process and save the file
              await this.saveProcessedFile(categoryDir, fileInfo, fileContent, category);
              
              stats.processed++;
              if (category === 'uncategorized') {
                stats.uncategorized++;
              } else {
                stats.categorized[category]++;
              }

              if (options.verbose && stats.processed % 10 === 0) {
                console.log(chalk.gray(`  Processed ${stats.processed} files...`));
              }
            } catch (error) {
              console.warn(chalk.yellow(`⚠️  Failed to process ${entryRelativePath}: ${(error as Error).message}`));
            }
          }
        }
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Failed to read directory ${dirPath}: ${(error as Error).message}`));
      }
    };

    await processDirectory(contentPath);
  }

  private categorizeFile(filePath: string, content: string): string {
    const pathLower = filePath.toLowerCase();
    
    // Check each category's patterns
    for (const [category, categoryConfig] of Object.entries(config.organization.categories)) {
      for (const pattern of categoryConfig.patterns) {
        if (pathLower.includes(pattern.toLowerCase())) {
          return category;
        }
      }
    }
    
    // Check content for additional clues
    const contentLower = content.toLowerCase();
    if (contentLower.includes('component') || contentLower.includes('@component')) {
      return 'components';
    }
    if (contentLower.includes('ng ') || contentLower.includes('angular cli')) {
      return 'cli';
    }

    
    return 'uncategorized';
  }

  private async saveProcessedFile(categoryDir: string, item: GitHubContent, content: string, category: string): Promise<void> {
    // Parse frontmatter
    const parsed = matter(content);
    const filename = path.basename(item.name, '.md');
    
    // Create metadata
    const metadata: DocumentMeta = {
      ...parsed.data,
      originalPath: item.path,
      category,
      filename,
      title: parsed.data.title || this.extractTitleFromContent(parsed.content) || filename
    };
    
    // Save markdown file
    const markdownPath = path.join(categoryDir, item.name);
    await fs.writeFile(markdownPath, content, 'utf8');
    
    // Save metadata file
    const metaPath = path.join(categoryDir, `${filename}.meta.json`);
    await fs.writeJson(metaPath, metadata, { spaces: 2 });
  }

  private extractTitleFromContent(content: string): string | null {
    // Look for first heading
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      return headingMatch[1].trim();
    }
    
    // Look for title in first few lines
    const lines = content.split('\n').slice(0, 5);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('<')) {
        return trimmed;
      }
    }
    
    return null;
  }

  private async generateIndex(versionDir: string, majorVersion: string, version: string, stats: any): Promise<void> {
    const categories = Object.keys(config.organization.categories);
    
    // Add uncategorized if it has files
    if (stats.uncategorized > 0) {
      categories.push('uncategorized');
    }
    
    const index = {
      majorVersion,
      version,
      generatedAt: new Date().toISOString(),
      stats: {
        totalFiles: stats.processed,
        categorized: stats.categorized,
        uncategorized: stats.uncategorized,
        processed: stats.processed,
        errors: 0
      },
      categories
    };
    
    const indexPath = path.join(versionDir, 'index.json');
    await fs.writeJson(indexPath, index, { spaces: 2 });
  }
} 