# Angular MCP Server Demo

This document demonstrates how to use the Enhanced Angular Documentation MCP Server with file-based caching.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Fetch Angular documentation:**
   ```bash
   # Fetch latest documentation
   npm run fetch
   
   # Or fetch specific version
   npm run fetch -- --version v17.0.0 --force
   ```

3. **Start the MCP server:**
   ```bash
   npm start
   ```

## Documentation Fetching

### Using NPM Scripts

```bash
# Fetch latest from main branch
npm run fetch

# Force refresh existing version
npm run fetch:force

# List cached versions
npm run docs:list

# Remove specific version
npm run docs:clear v16.0.0
```

### Using CLI Tool Directly

```bash
# Fetch with options
node src/tools/docFetcher.js fetch --version main --force --verbose

# List all cached versions
node src/tools/docFetcher.js list

# Remove a version
node src/tools/docFetcher.js remove latest
```

## Available Tools

### 1. search_angular_docs
Search through Angular documentation with enhanced options:

```json
{
  "name": "search_angular_docs",
  "arguments": {
    "query": "component lifecycle",
    "category": "components",
    "limit": 5,
    "includeContent": true
  }
}
```

### 2. get_angular_component
Get specific component documentation:

```json
{
  "name": "get_angular_component",
  "arguments": {
    "name": "NgFor",
    "includeExamples": true
  }
}
```

### 3. fetch_angular_docs
Fetch documentation from repository:

```json
{
  "name": "fetch_angular_docs",
  "arguments": {
    "version": "main",
    "force": false
  }
}
```

### 4. list_angular_categories
List available categories:

```json
{
  "name": "list_angular_categories",
  "arguments": {
    "version": "latest"
  }
}
```

### 5. list_angular_versions
List all cached versions:

```json
{
  "name": "list_angular_versions",
  "arguments": {}
}
```

## Enhanced Cache Structure

The new system stores actual markdown files:

```
assets/angular-docs/
├── 18.0.0/
│   ├── index.json                    # Version metadata
│   ├── components/
│   │   ├── index.json               # Category index
│   │   ├── guide_components_overview.md
│   │   ├── guide_components_overview.meta.json
│   │   └── ...
│   ├── concepts/
│   │   ├── index.json
│   │   ├── guide_architecture.md
│   │   ├── guide_architecture.meta.json
│   │   └── ...
│   ├── cli/
│   ├── api/
│   ├── tutorials/
│   └── uncategorized/
└── latest/
    └── ...
```

## GitHub Actions Integration

### Automated Daily Updates

The repository includes a workflow that:
- Runs daily at 6 AM UTC
- Fetches latest Angular documentation
- Commits changes automatically
- Creates detailed summaries

### Manual Workflow Dispatch

Trigger documentation fetching manually:
1. Go to Actions tab in GitHub
2. Select "Fetch Angular Documentation"
3. Click "Run workflow"
4. Specify version and force options

### Workflow Configuration

```yaml
name: Fetch Angular Documentation

on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC
  workflow_dispatch:
    inputs:
      version:
        description: 'Angular version/branch to fetch'
        default: 'main'
      force:
        description: 'Force fetch even if version exists'
        default: 'false'
```

## MCP Resources

Access documentation directly via resources:

- `angular-docs://18.0.0/index` - Version index and metadata
- `angular-docs://18.0.0/components` - All components documentation
- `angular-docs://18.0.0/concepts` - Concepts and guides
- `angular-docs://18.0.0/cli` - CLI documentation
- `angular-docs://18.0.0/api` - API reference
- `angular-docs://18.0.0/tutorials` - Tutorials and examples

## Benefits

### No Rate Limits
- Uses git clone instead of GitHub API
- No authentication required
- Complete repository access

### Better Performance
- File-based storage for fast access
- Metadata caching for quick searches
- Original markdown preserved

### Automation Ready
- GitHub Actions integration
- Scheduled updates
- CI/CD compatible

## Troubleshooting

### Git Clone Issues
```bash
# Check git availability
git --version

# Test clone manually
git clone --depth 1 https://github.com/angular/angular.git temp-test
rm -rf temp-test
```

### Cache Issues
```bash
# Clear all cache
npm run docs:clear

# List current versions
npm run docs:list

# Fetch fresh documentation
npm run fetch:force
```

### MCP Server Issues
```bash
# Check server startup
npm start

# Run with verbose logging
DEBUG=* npm start
``` 