import path from 'path';
import { fileURLToPath } from 'url';

interface CategoryConfig {
  patterns: string[];
  subfolders: string[];
}

interface GitHubConfig {
  owner: string;
  repo: string;
  contentPath: string;
  apiUrl: string;
}

interface StorageConfig {
  assetsPath: string;
  cacheValidityHours: number;
}

interface OrganizationConfig {
  categories: {
    components: CategoryConfig;
    cli: CategoryConfig;
  };
}

interface MCPConfig {
  name: string;
  version: string;
  description: string;
}

interface AppConfig {
  github: GitHubConfig;
  storage: StorageConfig;
  organization: OrganizationConfig;
  mcp: MCPConfig;
}

export const config: AppConfig = {
  // GitHub repository configuration
  github: {
    owner: 'angular',
    repo: 'angular',
    contentPath: 'adev/src/content',
    apiUrl: 'https://api.github.com',
  },
  
  // Local storage configuration
  storage: {
    assetsPath: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../assets/angular-docs'),
    cacheValidityHours: 24, // Cache validity in hours
  },
  
  // Documentation organization structure
  organization: {
    categories: {
            components: {
        patterns: [
          '/components/',
          '/component-',
          'component.md',
          'components.md',
          '/api/',
          'api.md',
          'reference'
        ],
        subfolders: ['material', 'cdk', 'core', 'common', 'forms', 'router', 'http']
      },
 
      cli: {
        patterns: [
          '/cli/',
          'cli.md',
          'ng-',
          'angular-cli'
        ],
        subfolders: ['commands', 'configuration', 'workspaces']
      },

    }
  },
  
  // MCP Server configuration
  mcp: {
    name: 'angular-docs-server',
    version: '0.1.0',
    description: 'Angular Documentation MCP Server'
  }
}; 