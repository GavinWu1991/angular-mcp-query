# Integration Tests

This directory contains comprehensive integration tests for the Angular MCP Server.

## Running Tests

```bash
# Run all integration tests
npm test

# Or run integration tests specifically
npm run test:integration

# Or run directly
node test/integration.test.js
```

## What the Tests Cover

### 🔧 **Core Functionality Tests**
- **Basic Connectivity**: Validates the server starts and responds to ping requests
- **List Available Tools**: Ensures all expected MCP tools are available
- **Search Angular Documentation**: Tests the search functionality with real queries
- **Get Angular Component**: Tests component lookup functionality
- **List Categories**: Validates category listing for documentation versions

### 🛡️ **Reliability Tests**
- **Version Fallback and Error Handling**: Tests graceful fallback when invalid versions are requested
- **Path Resolution from Different Directory**: Ensures the server works regardless of working directory
- **Multiple Angular Versions**: Validates that multiple Angular versions (v18, v20) are accessible
- **Invalid Tool Name**: Tests error handling for non-existent tools
- **Missing Required Parameters**: Validates parameter validation

### 📊 **Test Output**

The test suite provides detailed output showing:
- ✅ **Passed tests** with confirmation of expected behavior
- ❌ **Failed tests** with detailed error messages
- 📊 **Summary statistics** including success rate
- 🔍 **Debug information** showing actual vs expected behavior

### 🏗️ **Architecture**

The test suite uses a custom `MCPTestClient` class that:
- Spawns the MCP server as a child process
- Sends JSON-RPC requests via stdin
- Parses and validates responses
- Tests from different working directories
- Cleans up resources properly

### 🎯 **Test Scenarios**

Each test validates a specific aspect of MCP client-server interaction:

1. **JSON-RPC Protocol Compliance**: All requests/responses follow MCP specification
2. **Error Handling**: Graceful handling of invalid inputs and edge cases
3. **Resource Management**: Proper cleanup of server processes
4. **Multi-Version Support**: Access to different Angular documentation versions
5. **Path Independence**: Server works regardless of execution directory

## Prerequisites

Before running tests:
1. Build the project: `npm run build`
2. Ensure Angular documentation is cached: `npm run fetch`
3. Verify the server binary exists at `dist/src/index.js`

## Debugging Test Failures

If tests fail:
1. Check that the MCP server builds successfully
2. Verify Angular documentation is properly cached
3. Check server logs for detailed error messages
4. Ensure proper file permissions on test scripts 