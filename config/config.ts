import path from 'path';
import os from 'os';
import fs from 'fs-extra'; // Used for ensureDirSync, if needed for config bootstrapping
import { fileURLToPath } from 'url';

// Helper function to determine user-specific data directory
const getDefaultAssetsPath = (): string => {
  const appName = 'angular-mcp-query';
  let baseDir: string;

  switch (os.platform()) {
    case 'win32': // Windows
      baseDir = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
      break;
    case 'darwin': // macOS
      baseDir = path.join(os.homedir(), 'Library', 'Application Support');
      break;
    default: // Linux and other POSIX
      baseDir = process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
      break;
  }
  const assetsPath = path.join(baseDir, appName, 'assets', 'angular-docs');
  // fs.ensureDirSync(assetsPath); // Ensure directory exists when config is loaded
  // Decided against ensureDirSync here to avoid side-effects on import.
  // The application logic (e.g., DocumentLoader or Fetcher) should call ensureDir.
  return assetsPath;
};

const userDefinedAssetsPath = process.env.ANGULAR_MCP_ASSETS_PATH;

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
    assetsPath: userDefinedAssetsPath || getDefaultAssetsPath(),
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