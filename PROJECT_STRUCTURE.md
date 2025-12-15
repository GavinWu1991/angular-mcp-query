# Angular MCP Query - Project Structure

This document outlines the organized project structure that separates concerns between MCP server functionality and standalone tools.

## 📁 Project Structure

```
angular-mcp-query/
├── src/
│   ├── core/                           # Core utilities and shared functionality
│   │   ├── index.js                    # Core exports
│   │   ├── version-manager.js          # Version management utilities
│   │   └── document-loader.js          # Document loading and search
│   │
│   ├── mcp/                            # MCP Server implementation
│   │   ├── index.js                    # MCP exports
│   │   └── server.js                   # Main MCP server class
│   │
│   ├── tools/                          # Standalone tools
│   │   ├── index.js                    # Tools exports
│   │   └── doc-fetcher/                # Documentation fetcher tool
│   │       ├── index.js                # Doc fetcher exports
│   │       ├── fetcher.js              # Core fetcher functionality
│   │       └── cli.js                  # CLI interface (executable)
│   │
│   └── index.js                        # Main entry point for MCP server
│
├── scripts/                            # Utility scripts
│   └── detect-version.js               # Angular version detection
│
├── config/                             # Configuration files
│   └── config.js                       # Main configuration
│
├── assets/                             # Generated documentation cache
│   └── angular-docs/                   # Cached docs by major version
│       └── v20/                        # Angular v20 docs
│
├── .github/workflows/                  # GitHub Actions
│   └── fetch-docs.yml                  # Automated doc fetching
│
├── package.json                        # Project configuration
├── PROJECT_STRUCTURE.md               # This file
└── README.md                          # Project documentation
```

## 🎯 Design Principles

### 1. **Separation of Concerns**
- **Core utilities** (`src/core/`): Shared business logic used by both tools and MCP server
- **MCP server** (`src/mcp/`): MCP protocol implementation and handlers
- **Tools** (`src/tools/`): Standalone CLI tools that can be used independently

### 2. **Clear Dependencies**
- **MCP server** depends on **core utilities** and **tools**
- **Tools** depend on **core utilities**
- **Core utilities** are self-contained (only external dependencies)

### 3. **Reusable Components**
- Core functionality can be imported and used by multiple consumers
- Tools can be used standalone or integrated into the MCP server
- Clear interfaces between components

## 🔧 Core Components

### `src/core/`
Contains the business logic and shared utilities:

- **`version-manager.js`**: Handles Angular version detection, major version extraction, and version comparison logic
- **`document-loader.js`**: Manages document loading, searching, and caching operations
- **`index.js`**: Provides clean exports for core functionality

### `src/mcp/`
MCP server implementation:

- **`server.js`**: Main MCP server class with tool handlers and resource management
- **`index.js`**: Clean export for MCP server

### `src/tools/`
Standalone tools that can be used independently:

- **`doc-fetcher/`**: Tool for fetching and organizing Angular documentation
  - **`fetcher.js`**: Core fetching logic (can be imported programmatically)
  - **`cli.js`**: Command-line interface (executable)
  - **`index.js`**: Clean exports

## 🚀 Usage Patterns

### As MCP Server
```bash
npm start                    # Start MCP server
```

### As Standalone CLI Tools
```bash
npm run fetch               # Fetch latest Angular docs
npm run docs:list           # List cached versions
npm run docs:detect         # Detect project Angular version
```

### Programmatic Usage
```javascript
// Use core utilities
import { VersionManager, DocumentLoader } from './src/core/index.js';

// Use tools programmatically
import { AngularDocumentationFetcher } from './src/tools/index.js';

// Use MCP server
import { AngularDocsMCPServer } from './src/mcp/index.js';
```

## 📦 Build & Deployment

### Development
```bash
npm run dev                 # Start MCP server with auto-reload
```

### Scripts
- `npm run fetch` - Fetch documentation using CLI
- `npm run docs:list` - List cached versions
- `npm run docs:detect` - Detect Angular version from current project
- `npm run fetch:force` - Force fetch documentation

### CI/CD
GitHub Actions automatically fetch documentation daily and can be triggered manually with specific versions.

## 🔄 Migration from Previous Structure

### Old Structure Issues:
- Mixed concerns (MCP + tools in same files)
- Unclear dependencies
- Hard to test individual components
- Difficult to use tools standalone

### New Structure Benefits:
- ✅ Clear separation between MCP server and tools
- ✅ Reusable core utilities
- ✅ Independent tool usage
- ✅ Better testability
- ✅ Cleaner imports and dependencies
- ✅ Easier to extend with new tools

## 🧪 Testing Structure

Each component can be tested independently:
- Core utilities can be unit tested
- Tools can be integration tested
- MCP server can be tested end-to-end

This structure enables better development practices and makes the codebase more maintainable and extensible. 