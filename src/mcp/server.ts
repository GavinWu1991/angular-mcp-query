import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema, 
  ReadResourceRequestSchema,
  CallToolRequest,
  ListToolsRequest,
  ReadResourceRequest,
  CallToolResult,
  ListToolsResult,
  ReadResourceResult,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { AngularDocumentationFetcher } from '../tools/doc-fetcher/index.js';
import { DocumentLoader } from '../core/index.js';
import { config } from '../../config/config.js';
import { VersionManager } from '../utils/version-manager.js';

interface SearchDocsArgs {
  term: string;
  category?: string;
  version: string;
  limit?: number;
  includeContent?: boolean;
}

interface GetComponentArgs {
  name: string;
  version: string;
  includeExamples?: boolean;
}

interface FetchDocsArgs {
  version?: string;
  force?: boolean;
}

interface ListCategoriesArgs {
  version: string;
}

interface ListVersionsArgs {
  // No arguments needed
}

interface FetchAllSupportedVersionsArgs {
  force?: boolean;
  verbose?: boolean;
}

type ToolArgs = SearchDocsArgs | GetComponentArgs | FetchDocsArgs | ListCategoriesArgs | ListVersionsArgs | FetchAllSupportedVersionsArgs;

export class AngularDocsMCPServer {
  private server: Server;
  private fetcher: AngularDocumentationFetcher;
  private documentLoader: DocumentLoader;

  constructor() {
    this.server = new Server(
      {
        name: config.mcp.name,
        version: config.mcp.version,
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.fetcher = new AngularDocumentationFetcher();
    this.documentLoader = new DocumentLoader();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async (): Promise<ListToolsResult> => {
      const tools: Tool[] = [
        {
          name: 'search_angular_docs',
          description: 'Search Angular documentation by specific terms like component names, directives, or CLI commands.',
          inputSchema: {
            type: 'object',
            properties: {
              term: {
                type: 'string',
                description: 'Specific term to search for (e.g., "Signal", "Directive", "Component", "Router")',
              },
              category: {
                type: 'string',
                enum: ['components', 'cli', 'uncategorized'],
                description: 'Filter by documentation category',
              },
              version: {
                type: 'string',
                description: 'Angular major version (e.g., v18)',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return (default: 10)',
                default: 10,
              },
              includeContent: {
                type: 'boolean',
                description: 'Include full document content in results',
                default: false,
              },
            },
            required: ['term', 'version'],
          },
        },
        {
          name: 'get_angular_component',
          description: 'Get detailed documentation for a specific Angular component or concept.',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the component, directive, or concept',
              },
              version: {
                type: 'string',
                description: 'Angular major version (e.g., v18)',
              },
              includeExamples: {
                type: 'boolean',
                description: 'Include code examples in the response',
                default: true,
              },
            },
            required: ['name', 'version'],
          },
        },
        {
          name: 'fetch_angular_docs',
          description: 'Fetch and cache Angular documentation from the repository. Groups by major version and updates minor versions.',
          inputSchema: {
            type: 'object',
            properties: {
              version: {
                type: 'string',
                description: 'Angular version/branch to fetch (defaults to main)',
                default: 'main',
              },
              force: {
                type: 'boolean',
                description: 'Force fetch even if major version already exists',
                default: false,
              },
            },
          },
        },
        {
          name: 'list_angular_categories',
          description: 'List available Angular documentation categories and their content counts for a specific major version.',
          inputSchema: {
            type: 'object',
            properties: {
              version: {
                type: 'string',
                description: 'Angular major version (e.g., v18)',
              },
            },
            required: ['version'],
          },
        },
        {
          name: 'fetch_all_supported_versions',
          description: 'Automatically fetch documentation for all supported Angular versions.',
          inputSchema: {
            type: 'object',
            properties: {
              force: {
                type: 'boolean',
                description: 'Force fetch even if versions already exist',
                default: false,
              },
              verbose: {
                type: 'boolean',
                description: 'Enable verbose logging',
                default: false,
              },
            },
          },
        },
      ];

      return { tools };
    });

    // Resources are not supported - removed getAvailableVersions dependency

    // Read resource content
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request: ReadResourceRequest): Promise<ReadResourceResult> => {
      const uri = request.params.uri;
      const match = uri.match(/^angular-docs:\/\/([^\/]+)\/(.+)$/);

      if (!match) {
        throw new Error(`Invalid resource URI: ${uri}`);
      }

      const [, majorVersion, resourceType] = match;

      try {
        let content: any;
        
        if (resourceType === 'index') {
          const documentation = await this.documentLoader.loadDocumentation(majorVersion);
          const categoryStats = await this.documentLoader.getCategoryStats(majorVersion);
          content = {
            ...documentation,
            categoryStats
          };
        } else if (['components', 'cli', 'uncategorized'].includes(resourceType)) {
          content = await this.documentLoader.loadCategory(majorVersion, resourceType);
        } else {
          throw new Error(`Unknown resource type: ${resourceType}`);
        }

        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(content, null, 2),
            },
          ],
        };
      } catch (error) {
        throw new Error(`Could not read resource: ${(error as Error).message}`);
      }
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest): Promise<CallToolResult> => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'search_angular_docs':
          return await this.searchAngularDocs(args as unknown as SearchDocsArgs);
        case 'get_angular_component':
          return await this.getAngularComponent(args as unknown as GetComponentArgs);
        case 'fetch_angular_docs':
          return await this.fetchAngularDocs(args as unknown as FetchDocsArgs);
        case 'list_angular_categories':
          return await this.listAngularCategories(args as unknown as ListCategoriesArgs);
        case 'fetch_all_supported_versions':
          return await this.fetchAllSupportedVersions(args as unknown as FetchAllSupportedVersionsArgs);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  /**
   * Search Angular documentation
   */
  private async searchAngularDocs(args: SearchDocsArgs): Promise<CallToolResult> {
    const { term, category, version, limit = 10, includeContent = false } = args;
    
    try {
      // Get the target version
      const targetVersion = await this.getTargetVersion(version);
      
      // Search documents
      const results = await this.documentLoader.searchDocuments(targetVersion, term, {
        category,
        limit,
        includeContent
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              term,
              targetVersion,
              category: category || 'all',
              totalResults: results.length,
              includeContent,
              results
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Search failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get specific Angular component documentation
   */
  private async getAngularComponent(args: GetComponentArgs): Promise<CallToolResult> {
    const { name, version, includeExamples = true } = args;

    try {
      const targetVersion = await this.getTargetVersion(version);
      
      // Find the document
      const document = await this.documentLoader.findDocument(targetVersion, name);

      const response = {
        title: document.title,
        category: document.category,
        filename: document.filename,
        content: document.content,
        frontmatter: document.frontmatter,
        metadata: document.metadata,
        majorVersion: document.majorVersion || targetVersion,
        version: document.version
      };

      if (!includeExamples) {
        // Remove code blocks if examples not requested
        response.content = response.content.replace(/```[\s\S]*?```/g, '[Code example omitted]');
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get component: ${(error as Error).message}`);
    }
  }

  /**
   * Fetch Angular documentation with major version grouping
   */
  private async fetchAngularDocs(args: FetchDocsArgs): Promise<CallToolResult> {
    const { version = 'main', force = false } = args;

    try {
      console.log(`Fetching Angular documentation for ${version}...`);
      
      const result = await this.fetcher.fetch(version, { force });

      if (result.skipped) {
        return {
          content: [
            {
              type: 'text',
              text: `Documentation for Angular major version ${result.majorVersion} is already up to date (${result.version}). Use force: true to refresh.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Successfully fetched Angular documentation.\n\nDetails:\n- Major Version: ${result.majorVersion}\n- Full Version: ${result.version}\n- Files processed: ${result.processed}\n- Duration: ${result.duration}\n- Categories: ${Object.entries(result.categorized).map(([cat, count]) => `${cat}: ${count}`).join(', ')}\n- Uncategorized: ${result.uncategorized}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Fetch failed: ${(error as Error).message}`);
    }
  }

  /**
   * List Angular documentation categories
   */
  private async listAngularCategories(args: ListCategoriesArgs): Promise<CallToolResult> {
    const { version } = args;

    try {
      const targetVersion = await this.getTargetVersion(version);
      const categoryStats = await this.documentLoader.getCategoryStats(targetVersion);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              majorVersion: targetVersion,
              totalCategories: categoryStats.length,
              totalDocuments: categoryStats.reduce((sum, cat) => sum + cat.count, 0),
              categories: categoryStats.map(cat => ({
                name: cat.category,
                count: cat.count,
                majorVersion: cat.majorVersion,
                version: cat.version,
                description: this.getCategoryDescription(cat.category),
                sampleDocuments: cat.documents.slice(0, 3)
              }))
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list categories: ${(error as Error).message}`);
    }
  }

  /**
   * Get target version - validates against supported versions
   */
  private async getTargetVersion(requestedVersion: string): Promise<string> {
    if (!requestedVersion) {
      throw new Error('Angular version is required. Please specify a version (e.g., v18).');
    }

    try {
      // Validate and normalize the version using VersionManager
      const normalizedVersion = await VersionManager.validateAndNormalizeVersion(requestedVersion);
      
      // Use document loader to resolve to actual version if needed
      return await this.documentLoader.resolveMajorVersion(normalizedVersion);
    } catch (error) {
      // If version is not supported, provide helpful error with supported versions
      const supportedVersions = await VersionManager.getSupportedVersions();
      throw new Error(`${(error as Error).message}. Available versions: ${supportedVersions.join(', ')}`);
    }
  }

  /**
   * Fetch all supported Angular versions
   */
  private async fetchAllSupportedVersions(args: FetchAllSupportedVersionsArgs): Promise<CallToolResult> {
    const { force = false, verbose = false } = args;

    try {
      console.log('🚀 Fetching documentation for all supported Angular versions...');
      
      const results = await this.fetcher.fetchSupportedVersions({ force, verbose });
      
      const summary = {
        totalVersions: results.length,
        successful: results.filter(r => !r.skipped).length,
        skipped: results.filter(r => r.skipped).length,
        results: results.map(result => ({
          majorVersion: result.majorVersion,
          version: result.version,
          status: result.skipped ? 'skipped' : 'fetched',
          processed: result.processed,
          duration: result.duration,
          reason: result.reason
        }))
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(summary, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to fetch all supported versions: ${(error as Error).message}`);
    }
  }

  /**
   * Get category description
   */
  private getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      components: 'Angular components, directives, pipes, and API reference documentation',
      cli: 'Angular CLI commands, configuration, and tooling',
      uncategorized: 'Other Angular documentation files',
    };

    return descriptions[category] || 'Angular documentation';
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('Angular Documentation MCP Server started.');
    console.log(`Using documentation asset path: ${config.storage.assetsPath}`);
    // Advise on fetching if the directory is empty or doesn't exist?
    // Could be done by checking `this.documentLoader.listVersions()` or similar.
    // For now, just logging the path is a good first step.
  }
} 