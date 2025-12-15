import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { config } from '../../config/config.js';
import { VersionManager } from './version-manager.js';

interface GitHubRelease {
  tag_name: string;
  published_at: string;
  name: string;
  prerelease: boolean;
  draft: boolean;
}

interface AngularVersionInfo {
  version: string;
  majorVersion: string;
  publishedAt: string;
  name: string;
}

interface CachedVersionInfo {
  majorVersion: string;
  version: string;
  generatedAt?: string;
  stats?: any;
  cached?: boolean;
  publishedAt?: string;
  name?: string;
}

interface DocumentationIndex {
  majorVersion: string;
  version: string;
  generatedAt: string;
  stats: any;
  categories: string[];
  documentsCache: string;
}

interface DocumentMetadata {
  title?: string;
  originalPath?: string;
  [key: string]: any;
}

interface DocumentFrontmatter {
  title?: string;
  description?: string;
  tags?: string[];
  [key: string]: any;
}

interface Document {
  filename: string;
  title: string;
  content: string;
  fullContent: string;
  frontmatter: DocumentFrontmatter;
  metadata: DocumentMetadata;
  path: string;
  relativePath: string;
  category: string;
  originalPath?: string;
  majorVersion?: string;
  version?: string;
}

interface CategoryData {
  category: string;
  majorVersion?: string;
  version?: string;
  documents: Document[];
  count: number;
  generatedAt?: string;
}

interface SearchOptions {
  category?: string;
  limit?: number;
  includeContent?: boolean;
}

interface SearchResult {
  title: string;
  category: string;
  filename: string;
  relativePath: string;
  relevanceScore: number;
  excerpt: string;
  frontmatter: DocumentFrontmatter;
  metadata: DocumentMetadata;
  majorVersion: string;
  version: string;
  content?: string;
  fullContent?: string;
}

interface CategoryStats {
  category: string;
  count: number;
  majorVersion?: string;
  version?: string;
  documents: Array<{
    title: string;
    filename: string;
  }>;
  error?: string;
}

export class DocumentLoader {
  private assetsPath: string;

  constructor() {
    this.assetsPath = config.storage.assetsPath;
  }

  /**
   * Load documentation for a specific major version - requires explicit version
   */
  async loadDocumentation(majorVersion: string): Promise<DocumentationIndex> {
    if (!majorVersion) {
      throw new Error('Major version is required. Please specify an Angular version (e.g., v18).');
    }

    // Resolve major version if needed
    const resolvedVersion = await this.resolveMajorVersion(majorVersion);
    const versionPath = path.join(this.assetsPath, resolvedVersion);
    
    if (!await fs.pathExists(versionPath)) {
      // change to use lastest version if no major version found
      const latestVersion = await this.getLatestAngularVersion();
      const latestVersionPath = path.join(this.assetsPath, latestVersion);
      if (await fs.pathExists(latestVersionPath)) {
        return await this.loadDocumentation(latestVersion);
      }
      throw new Error(`Major version ${resolvedVersion} not found. Run fetch command first.`);
    }

          const indexPath = path.join(versionPath, 'index.json');
      if (!await fs.pathExists(indexPath)) {
      throw new Error(`Invalid version cache: ${resolvedVersion}. Missing index.json`);
    }

    const index = await fs.readJson(indexPath);
    return {
      majorVersion: index.majorVersion,
      version: index.version,
      generatedAt: index.generatedAt,
      stats: index.stats,
      categories: index.categories,
      documentsCache: versionPath
    };
  }

  /**
   * Resolve major version to actual cached version - requires explicit version
   */
  async resolveMajorVersion(requestedVersion: string): Promise<string> {
    if (!requestedVersion) {
      throw new Error('Version is required. Please specify an Angular version (e.g., v18).');
    }

    if (requestedVersion === 'latest') {
      throw new Error('Latest version detection is not supported. Please specify an explicit Angular version (e.g., v18).');
    }

    // Check if it's already a major version format
    if (requestedVersion.startsWith('v') && /^v\d+$/.test(requestedVersion)) {
      return requestedVersion;
    }

    // Extract major version from full version
    const majorVersion = VersionManager.extractMajorVersion(requestedVersion);
    
    // Verify it exists
    const versionPath = path.join(this.assetsPath, majorVersion);
    if (await fs.pathExists(versionPath)) {
      return majorVersion;
    }

    throw new Error(`Major version ${majorVersion} not found in cache. Please fetch the documentation first.`);
  }

  /**
   * Load documents from a specific category
   */
  async loadCategory(majorVersion: string, category: string): Promise<CategoryData> {
    const resolvedVersion = await this.resolveMajorVersion(majorVersion);
    const versionPath = path.join(this.assetsPath, resolvedVersion);
    const categoryPath = path.join(versionPath, category);
    
    if (!await fs.pathExists(categoryPath)) {
      return { category, documents: [], count: 0 };
    }

    const categoryIndexPath = path.join(categoryPath, 'index.json');
    if (!await fs.pathExists(categoryIndexPath)) {
      // Fallback: scan directory for markdown files
      return await this.scanCategoryDirectory(categoryPath, category);
    }

    const categoryIndex = await fs.readJson(categoryIndexPath);
    
    // Load full document content for each file
    const documents: Document[] = [];
    for (const docInfo of categoryIndex.documents) {
      try {
        const docPath = path.join(categoryPath, docInfo.filename);
        const content = await fs.readFile(docPath, 'utf-8');
        
        // Parse frontmatter
        const parsed = matter(content);
        
        documents.push({
          ...docInfo,
          content: parsed.content,
          fullContent: content,
          frontmatter: parsed.data,
          path: docPath,
          relativePath: path.relative(this.assetsPath, docPath)
        });
      } catch (error) {
        console.warn(`Could not load document ${docInfo.filename}: ${(error as Error).message}`);
      }
    }

    return {
      category,
      majorVersion: categoryIndex.majorVersion,
      version: categoryIndex.version,
      documents,
      count: documents.length,
      generatedAt: categoryIndex.generatedAt
    };
  }

  /**
   * Scan category directory for markdown files (fallback)
   */
  async scanCategoryDirectory(categoryPath: string, category: string): Promise<CategoryData> {
    const files = await fs.readdir(categoryPath);
    const markdownFiles = files.filter(f => f.endsWith('.md'));
    
    const documents: Document[] = [];
    
    for (const file of markdownFiles) {
      try {
        const filePath = path.join(categoryPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = matter(content);
        
        // Try to load metadata file
        const metaPath = filePath.replace(/\.md$/, '.meta.json');
        let metadata: DocumentMetadata = {};
        if (await fs.pathExists(metaPath)) {
          metadata = await fs.readJson(metaPath);
        }

        documents.push({
          filename: file,
          title: parsed.data.title || metadata.title || file.replace('.md', ''),
          content: parsed.content,
          fullContent: content,
          frontmatter: parsed.data,
          metadata,
          path: filePath,
          relativePath: path.relative(this.assetsPath, filePath),
          category
        });
      } catch (error) {
        console.warn(`Could not load document ${file}: ${(error as Error).message}`);
      }
    }

    return {
      category,
      documents,
      count: documents.length
    };
  }

  /**
   * Search across all categories with version resolution
   */
  async searchDocuments(requestedVersion: string, query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { category, limit = 10, includeContent = false } = options;
    
    const majorVersion = await this.resolveMajorVersion(requestedVersion);
    const documentation = await this.loadDocumentation(majorVersion);
    const categoriesToSearch = category ? [category] : documentation.categories;
    
    const results: SearchResult[] = [];
    
    for (const cat of categoriesToSearch) {
      if (cat === 'uncategorized' || documentation.categories.includes(cat)) {
        const categoryData = await this.loadCategory(majorVersion, cat);
        
        for (const doc of categoryData.documents) {
          if (this.documentMatchesQuery(doc, query)) {
            const relevanceScore = this.calculateRelevanceScore(doc, query);
            
            results.push({
              title: doc.title,
              category: cat,
              filename: doc.filename,
              relativePath: doc.relativePath,
              relevanceScore,
              excerpt: this.extractExcerpt(doc.content, query),
              frontmatter: doc.frontmatter,
              metadata: doc.metadata,
              majorVersion: documentation.majorVersion,
              version: documentation.version,
              ...(includeContent && { content: doc.content, fullContent: doc.fullContent })
            });
          }
        }
      }
    }

    // Sort by relevance and limit results
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return results.slice(0, limit);
  }

  /**
   * Get a specific document by major version
   */
  async getDocument(requestedVersion: string, category: string, filename: string): Promise<Document> {
    const majorVersion = await this.resolveMajorVersion(requestedVersion);
    const categoryData = await this.loadCategory(majorVersion, category);
    const document = categoryData.documents.find(d => d.filename === filename);
    
    if (!document) {
      throw new Error(`Document ${filename} not found in category ${category}`);
    }

    return document;
  }

  /**
   * Find document by title or path with version resolution
   */
  async findDocument(requestedVersion: string, titleOrPath: string): Promise<Document & { category: string }> {
    const majorVersion = await this.resolveMajorVersion(requestedVersion);
    const documentation = await this.loadDocumentation(majorVersion);
    
    for (const category of documentation.categories) {
      try {
        const categoryData = await this.loadCategory(majorVersion, category);
        
        const document = categoryData.documents.find(doc => 
          doc.title.toLowerCase().includes(titleOrPath.toLowerCase()) ||
          doc.filename.toLowerCase().includes(titleOrPath.toLowerCase()) ||
          doc.originalPath?.toLowerCase().includes(titleOrPath.toLowerCase())
        );
        
        if (document) {
          return { ...document, category };
        }
      } catch (error) {
        // Continue searching other categories
      }
    }
    
    throw new Error(`Document not found: ${titleOrPath}`);
  }

  /**
   * Check if document matches search query
   */
  private documentMatchesQuery(document: Document, query: string): boolean {
    const queryLower = query.toLowerCase();
    const searchableText = [
      document.title,
      document.content,
      document.frontmatter?.description || '',
      ...(document.frontmatter?.tags || []),
      document.metadata?.originalPath || ''
    ].join(' ').toLowerCase();

    return searchableText.includes(queryLower);
  }

  /**
   * Calculate relevance score for search results
   */
  private calculateRelevanceScore(document: Document, query: string): number {
    const queryTerms = query.toLowerCase().split(/\s+/);
    let score = 0;

    const title = document.title.toLowerCase();
    const content = document.content.toLowerCase();

    for (const term of queryTerms) {
      // Title matches are more important
      if (title.includes(term)) {
        score += 10;
      }
      
      // Content matches
      const contentMatches = (content.match(new RegExp(term, 'g')) || []).length;
      score += contentMatches;

      // Frontmatter tags
      const tags = document.frontmatter?.tags || [];
      if (tags.some(tag => tag.toLowerCase().includes(term))) {
        score += 5;
      }
    }

    // Exact phrase match in title
    if (title.includes(query.toLowerCase())) {
      score += 20;
    }

    return score;
  }

  /**
   * Extract excerpt around search query
   */
  private extractExcerpt(content: string, query: string, maxLength: number = 200): string {
    const queryIndex = content.toLowerCase().indexOf(query.toLowerCase());
    
    if (queryIndex === -1) {
      return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
    }

    const start = Math.max(0, queryIndex - 100);
    const end = Math.min(content.length, queryIndex + query.length + 100);
    
    let excerpt = content.substring(start, end);
    
    if (start > 0) excerpt = '...' + excerpt;
    if (end < content.length) excerpt = excerpt + '...';
    
    return excerpt;
  }

  /**
   * Get available Angular versions from GitHub (for cache management)
   */
  async getAvailableVersions(): Promise<CachedVersionInfo[]> {
    // Get versions from GitHub API
    const githubVersions = await this.fetchAngularVersions();
    
    // Check which ones are cached locally
    const cachedVersions: CachedVersionInfo[] = [];
    
    if (await fs.pathExists(this.assetsPath)) {
      const items = await fs.readdir(this.assetsPath);
      
      for (const item of items) {
        const itemPath = path.join(this.assetsPath, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory()) {
          const indexPath = path.join(itemPath, 'index.json');
          if (await fs.pathExists(indexPath)) {
            try {
              const index = await fs.readJson(indexPath);
              cachedVersions.push({
                majorVersion: item,
                version: index.version,
                generatedAt: index.generatedAt,
                stats: index.stats,
                cached: true
              });
            } catch (error) {
              console.warn(`Could not read index for version ${item}`);
            }
          }
        }
      }
    }

    // Combine GitHub versions with cache status
    const allVersions = githubVersions.map(githubVer => {
      const cached = cachedVersions.find(c => c.majorVersion === githubVer.majorVersion);
      return {
        ...githubVer,
        cached: !!cached,
        ...(cached && { 
          generatedAt: cached.generatedAt,
          stats: cached.stats 
        })
      };
    });

    return allVersions.sort((a, b) => {
      // Sort by major version number (descending)
      const aNum = parseInt(a.majorVersion.replace('v', '')) || 0;
      const bNum = parseInt(b.majorVersion.replace('v', '')) || 0;
      return bNum - aNum;
    });
  }

  /**
   * Get category statistics for a major version
   */
  async getCategoryStats(requestedVersion: string): Promise<CategoryStats[]> {
    const majorVersion = await this.resolveMajorVersion(requestedVersion);
    const documentation = await this.loadDocumentation(majorVersion);
    const categoryStats: CategoryStats[] = [];

    for (const category of documentation.categories) {
      try {
        const categoryData = await this.loadCategory(majorVersion, category);
        categoryStats.push({
          category,
          count: categoryData.count,
          majorVersion: categoryData.majorVersion,
          version: categoryData.version,
          documents: categoryData.documents.map(doc => ({
            title: doc.title,
            filename: doc.filename
          }))
        });
      } catch (error) {
        categoryStats.push({
          category,
          count: 0,
          documents: [],
          error: (error as Error).message
        });
      }
    }

    return categoryStats;
  }

  /**
   * Check if cache is valid for a major version
   */
  async isCacheValid(requestedVersion: string, maxAgeHours: number = 24): Promise<boolean> {
    try {
      const majorVersion = await this.resolveMajorVersion(requestedVersion);
      const documentation = await this.loadDocumentation(majorVersion);
      const generatedAt = new Date(documentation.generatedAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - generatedAt.getTime()) / (1000 * 60 * 60);
      
      return hoursDiff < maxAgeHours;
    } catch (error) {
      return false;
    }
  }

  /**
   * Fetch Angular versions from GitHub API
   */
  async fetchAngularVersions(): Promise<AngularVersionInfo[]> {
    try {
      const response = await fetch('https://api.github.com/repos/angular/angular/releases');
      if (!response.ok) {
        throw new Error(`Failed to fetch versions: ${response.status}`);
      }
      
      const releases: GitHubRelease[] = await response.json();
      const versions = releases
        .filter(release => !release.prerelease && !release.draft)
        .map(release => ({
          version: release.tag_name,
          majorVersion: VersionManager.extractMajorVersion(release.tag_name),
          publishedAt: release.published_at,
          name: release.name
        }))
        .slice(0, 20); // Get latest 20 versions
      
      return versions;
    } catch (error) {
      console.warn('Could not fetch Angular versions from GitHub:', (error as Error).message);
      return [];
    }
  }

  /**
   * Get latest Angular version from GitHub
   */
  async getLatestAngularVersion(): Promise<string> {
    const versions = await this.fetchAngularVersions();
    if (versions.length === 0) {
      throw new Error('Could not fetch latest Angular version');
    }
    return versions[0].majorVersion;
  }
} 