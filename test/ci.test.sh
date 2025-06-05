#!/bin/bash
set -e

echo "🔨 Building project..."
npm run build

echo "📚 Checking if documentation is available..."
if [ ! -d "assets/angular-docs" ] || [ -z "$(ls -A assets/angular-docs)" ]; then
    echo "⚠️  No documentation found. Fetching Angular v18..."
    npm run fetch -- --angular-version 18.2.10
fi

echo "🧪 Running integration tests..."
npm test

echo "✅ All tests completed successfully!" 