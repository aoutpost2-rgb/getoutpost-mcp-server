#!/bin/bash
# Startup script for GetOutpost MCP Server (TypeScript)

# Set default values
EMAIL="${EMAIL:-ashwinbhskr@gmail.com}"
PORT="${PORT:-8000}"

echo "Starting GetOutpost MCP Server (TypeScript)..."
echo "Email: $EMAIL"
echo "Port: $PORT"

# Set environment variables
export EMAIL="$EMAIL"
export PORT="$PORT"

# Build the TypeScript code first
npm run build

# Start the server
node dist/mcp_server.js