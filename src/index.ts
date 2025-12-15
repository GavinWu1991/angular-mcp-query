#!/usr/bin/env node

import { AngularDocsMCPServer } from './mcp/index.js';

async function main(): Promise<void> {
  const server = new AngularDocsMCPServer();
  await server.start();
}

// Handle process signals for graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down Angular Docs MCP Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down Angular Docs MCP Server...');
  process.exit(0);
});

main().catch((error: Error) => {
  console.error('Failed to start Angular Documentation MCP Server:', error);
  process.exit(1);
}); 