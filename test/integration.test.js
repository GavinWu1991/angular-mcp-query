#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const serverPath = path.join(projectRoot, 'dist', 'src', 'index.js');

class MCPTestClient {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async runServer(workingDir = projectRoot) {
    return new Promise((resolve, reject) => {
      const server = spawn('node', [serverPath], {
        cwd: workingDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let serverOutput = '';
      let isReady = false;

      server.stdout.on('data', (data) => {
        const output = data.toString();
        serverOutput += output;
        
        // Wait for server to be ready
        if (output.includes('Angular Documentation MCP Server started')) {
          isReady = true;
        }
      });

      server.stderr.on('data', (data) => {
        console.error('Server stderr:', data.toString());
      });

      server.on('close', (code) => {
        if (!isReady) {
          reject(new Error(`Server exited with code ${code}. Output: ${serverOutput}`));
        }
      });

      // Give server a moment to start
      setTimeout(() => {
        if (isReady) {
          resolve(server);
        } else {
          reject(new Error('Server did not start within timeout period'));
        }
      }, 2000);
    });
  }

  async sendRequest(server, request) {
    return new Promise((resolve, reject) => {
      let responseData = '';
      let hasStarted = false;

      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 10000);

      const onData = (data) => {
        const output = data.toString();
        
        // Skip server startup messages
        if (!hasStarted && output.includes('Angular Documentation MCP Server started')) {
          hasStarted = true;
          return;
        }
        
        if (hasStarted || output.trim().startsWith('{')) {
          responseData += output;
          
          // Check if we have a complete JSON response
          try {
            const response = JSON.parse(responseData.trim());
            clearTimeout(timeout);
            server.stdout.removeListener('data', onData);
            resolve(response);
          } catch (e) {
            // Not complete JSON yet, continue collecting
          }
        }
      };

      server.stdout.on('data', onData);
      
      // Send the request
      server.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async runTest(testName, testFn) {
    this.totalTests++;
    console.log(`\n🧪 Running: ${testName}`);
    
    try {
      await testFn();
      this.passedTests++;
      console.log(`✅ PASSED: ${testName}`);
      this.testResults.push({ name: testName, status: 'PASSED' });
    } catch (error) {
      this.failedTests++;
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${error.message}`);
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
    }
  }

  async testBasicConnectivity() {
    const server = await this.runServer();
    
    try {
      const response = await this.sendRequest(server, {
        jsonrpc: "2.0",
        id: 1,
        method: "ping"
      });

      if (response.jsonrpc === "2.0" && response.id === 1) {
        // Success
      } else {
        throw new Error(`Unexpected ping response: ${JSON.stringify(response)}`);
      }
    } finally {
      server.kill();
    }
  }

  async testListTools() {
    const server = await this.runServer();
    
    try {
      const response = await this.sendRequest(server, {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list"
      });

      if (!response.result || !response.result.tools || !Array.isArray(response.result.tools)) {
        throw new Error('Invalid tools list response structure');
      }

      const expectedTools = [
        'search_angular_docs',
        'get_angular_component', 
        'fetch_angular_docs',
        'list_angular_categories'
      ];

      const actualTools = response.result.tools.map(tool => tool.name);
      
      for (const expectedTool of expectedTools) {
        if (!actualTools.includes(expectedTool)) {
          throw new Error(`Missing expected tool: ${expectedTool}`);
        }
      }

      console.log(`   Found ${actualTools.length} tools: ${actualTools.join(', ')}`);
    } finally {
      server.kill();
    }
  }

  async testSearchAngularDocs() {
    const server = await this.runServer();
    
    try {
      const response = await this.sendRequest(server, {
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "search_angular_docs",
          arguments: {
            term: "component",
            version: "v18",
            limit: 3
          }
        }
      });

      if (response.error) {
        throw new Error(`Search error: ${response.error.message}`);
      }

      if (!response.result || !response.result.content || !response.result.content[0]) {
        throw new Error('Invalid search response structure');
      }

      const resultText = response.result.content[0].text;
      const searchResult = JSON.parse(resultText);

      if (!searchResult.results || !Array.isArray(searchResult.results)) {
        throw new Error('Invalid search results structure');
      }

      if (searchResult.results.length === 0) {
        throw new Error('No search results returned');
      }

      console.log(`   Found ${searchResult.results.length} results for term "component" in v18`);
    } finally {
      server.kill();
    }
  }

  async testGetAngularComponent() {
    const server = await this.runServer();
    
    try {
      const response = await this.sendRequest(server, {
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: {
          name: "get_angular_component",
          arguments: {
            name: "component",
            version: "v18"
          }
        }
      });

      if (response.error) {
        throw new Error(`Component lookup error: ${response.error.message}`);
      }

      if (!response.result || !response.result.content) {
        throw new Error('Invalid component response structure');
      }

      console.log(`   Successfully retrieved component documentation`);
    } finally {
      server.kill();
    }
  }

  async testListCategories() {
    const server = await this.runServer();
    
    try {
      const response = await this.sendRequest(server, {
        jsonrpc: "2.0",
        id: 5,
        method: "tools/call",
        params: {
          name: "list_angular_categories",
          arguments: {
            version: "v18"
          }
        }
      });

      if (response.error) {
        throw new Error(`Categories error: ${response.error.message}`);
      }

      if (!response.result || !response.result.content) {
        throw new Error('Invalid categories response structure');
      }

      const resultText = response.result.content[0].text;
      const categoriesResult = JSON.parse(resultText);

      if (!categoriesResult.categories || !Array.isArray(categoriesResult.categories)) {
        throw new Error('Invalid categories structure');
      }

      console.log(`   Found ${categoriesResult.categories.length} categories`);
    } finally {
      server.kill();
    }
  }

  async testErrorHandling() {
    const server = await this.runServer();
    
    try {
      // Test proper error handling with invalid version - should reject with helpful message
      const response = await this.sendRequest(server, {
        jsonrpc: "2.0",
        id: 6,
        method: "tools/call",
        params: {
          name: "search_angular_docs",
          arguments: {
            term: "test",
            version: "v999", // Invalid version, should be rejected
            limit: 1
          }
        }
      });

      if (!response.error) {
        throw new Error('Expected error for unsupported version, but got success');
      }

      // Should get helpful error message mentioning supported versions
      if (!response.error.message.includes('Supported major versions')) {
        throw new Error(`Expected helpful error message but got: ${response.error.message}`);
      }

      console.log(`   Correctly rejected unsupported version with helpful error message`);
    } finally {
      server.kill();
    }
  }

  async testPathResolutionFromDifferentDirectory() {
    const tempDir = os.tmpdir();
    const server = await this.runServer(tempDir);
    
    try {
      const response = await this.sendRequest(server, {
        jsonrpc: "2.0",
        id: 7,
        method: "tools/call",
        params: {
          name: "search_angular_docs",
          arguments: {
            term: "component",
            version: "v18",
            limit: 1
          }
        }
      });

      if (response.error) {
        throw new Error(`Path resolution error from ${tempDir}: ${response.error.message}`);
      }

      if (!response.result || !response.result.content) {
        throw new Error('Invalid response when running from different directory');
      }

      console.log(`   Path resolution works correctly from ${tempDir}`);
    } finally {
      server.kill();
    }
  }

  async testMultipleVersions() {
    const server = await this.runServer();
    
    try {
      // Test v18
      const response18 = await this.sendRequest(server, {
        jsonrpc: "2.0",
        id: 8,
        method: "tools/call",
        params: {
          name: "search_angular_docs",
          arguments: {
            term: "component",
            version: "v18",
            limit: 1
          }
        }
      });

      if (response18.error) {
        throw new Error(`v18 search failed: ${response18.error.message}`);
      }

      // Test v20
      const response20 = await this.sendRequest(server, {
        jsonrpc: "2.0",
        id: 9,
        method: "tools/call",
        params: {
          name: "search_angular_docs",
          arguments: {
            term: "component",
            version: "v20",
            limit: 1
          }
        }
      });

      if (response20.error) {
        throw new Error(`v20 search failed: ${response20.error.message}`);
      }

      console.log(`   Both v18 and v20 documentation accessible`);
    } finally {
      server.kill();
    }
  }

  async testInvalidTool() {
    const server = await this.runServer();
    
    try {
      const response = await this.sendRequest(server, {
        jsonrpc: "2.0",
        id: 10,
        method: "tools/call",
        params: {
          name: "invalid_tool_name",
          arguments: {}
        }
      });

      if (!response.error) {
        throw new Error('Expected error for invalid tool name, but got success');
      }

      console.log(`   Correctly rejected invalid tool name`);
    } finally {
      server.kill();
    }
  }

  async testMissingRequiredParameters() {
    const server = await this.runServer();
    
    try {
      const response = await this.sendRequest(server, {
        jsonrpc: "2.0",
        id: 11,
        method: "tools/call",
        params: {
          name: "search_angular_docs",
          arguments: {
            // Missing required 'term' and 'version' parameters
            limit: 1
          }
        }
      });

      if (!response.error) {
        throw new Error('Expected error for missing parameters, but got success');
      }

      console.log(`   Correctly validated required parameters`);
    } finally {
      server.kill();
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🏁 INTEGRATION TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    
    if (this.failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.testResults
        .filter(result => result.status === 'FAILED')
        .forEach(result => {
          console.log(`   • ${result.name}: ${result.error}`);
        });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (this.failedTests === 0) {
      console.log('🎉 All tests passed! The MCP server is working correctly.');
      process.exit(0);
    } else {
      console.log('💥 Some tests failed. Please check the errors above.');
      process.exit(1);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Angular MCP Server Integration Tests');
    console.log(`📂 Server path: ${serverPath}`);
    console.log(`📁 Project root: ${projectRoot}`);
    
    // Check if server file exists
    try {
      await import(serverPath);
    } catch (error) {
      throw new Error(`Server file not found or invalid: ${serverPath}. Run 'npm run build' first.`);
    }

    await this.runTest('Basic Connectivity (Ping)', () => this.testBasicConnectivity());
    await this.runTest('List Available Tools', () => this.testListTools());
    await this.runTest('Search Angular Documentation', () => this.testSearchAngularDocs());
    await this.runTest('Get Angular Component', () => this.testGetAngularComponent());
    await this.runTest('List Categories', () => this.testListCategories());
    await this.runTest('Version Validation and Error Handling', () => this.testErrorHandling());
    await this.runTest('Path Resolution from Different Directory', () => this.testPathResolutionFromDifferentDirectory());
    await this.runTest('Multiple Angular Versions', () => this.testMultipleVersions());
    await this.runTest('Invalid Tool Name', () => this.testInvalidTool());
    await this.runTest('Missing Required Parameters', () => this.testMissingRequiredParameters());

    this.printSummary();
  }
}

// Run the tests
const testClient = new MCPTestClient();
testClient.runAllTests().catch(error => {
  console.error('❌ Test runner failed:', error.message);
  process.exit(1);
}); 