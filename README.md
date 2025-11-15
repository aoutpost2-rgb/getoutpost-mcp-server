# GetOutpost MCP Server

MCP (Model Context Protocol) Server for GetOutpost Financial APIs. Available in both HTTP and stdio transport modes.

## Overview

This server provides access to financial data from GetOutpost through the Model Context Protocol (MCP), allowing AI assistants like Claude to interact with financial APIs.

## Features

- MCP-compliant API for financial data access
- Support for implied volatility (IV), volatility (VOL), volatility risk premium (VRP), and skew data
- Token-based (Cookie) authentication with automatic refresh
- Health check endpoint

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

### From npm

```bash
npm install -g getoutpost-mcp-server
```

### From source

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build:
   ```bash
   npm run build
   ```

## Setup with MCP HTTP Server

The HTTP server allows you to run the MCP server as a standalone service that Claude Desktop can connect to via HTTP.

### Step 1: Create Credentials File

Create a credentials file (e.g., `~/.getoutpost_credentials.json`) with your GetOutpost credentials:

```json
{
  "ACCESS_TOKEN": "your_access_token_here",
  "REFRESH_TOKEN": "your_refresh_token_here",
  "API_BASE_URL": "https://getoutpost.in",
  "EMAIL": "your_email@example.com"
}
```

### Step 2: Configure Environment Variables

Create a `.env` file in your project directory (if running from source) or in the directory where you'll run the server:

```env
CREDENTIALS_FILE_PATH=/absolute/path/to/.getoutpost_credentials.json
PORT=8019
```

### Step 3: Start the HTTP Server

```bash
# If installed globally
export CREDENTIALS_FILE_PATH=<absolute-path-to-your-credentials-json-file> && getoutpost-mcp-http

# Or if running from source
node dist/mcp_server.js
```

The server will start on `http://localhost:8019`.

### Step 4: Configure Claude Desktop

Add the following to your `claude_desktop_config.json` file:

```json
{
  "mcpServers": {
    "getoutpost-mcp": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:8019/mcp"]
    }
  }
}
```

**Note:** The HTTP server must be running before starting Claude Desktop.

### Step 5: Enable MCP Server

Restart Claude Desktop and enable getoutpost-mcp in your connectors section.

## Setup with MCP stdio Server

The stdio server allows Claude Desktop to communicate directly with the MCP server via standard input/output.

### Step 1: Create Credentials File

Create a credentials file (e.g., `~/.getoutpost_credentials.json`) with your GetOutpost credentials:

```json
{
  "ACCESS_TOKEN": "your_access_token_here",
  "REFRESH_TOKEN": "your_refresh_token_here",
  "API_BASE_URL": "https://getoutpost.in",
  "EMAIL": "your_email@example.com"
}
```

### Step 2: Configure Claude Desktop

Add the following to your `claude_desktop_config.json` file:

```json
{
  "mcpServers": {
    "getoutpost-mcp": {
      "command": "node",
      "args": ["<path-to-your-repository>/dist/mcp_server_stdio.js"],
      "env": {
        "CREDENTIALS_FILE_PATH": "/absolute/path/to/.getoutpost_credentials.json"
      }
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "getoutpost-mcp": {
      "command": "getoutpost-mcp-stdio",
      "env": {
        "CREDENTIALS_FILE_PATH": "/absolute/path/to/.getoutpost_credentials.json"
      }
    }
  }
}
```

**Note:**
- Replace `/absolute/path/to/.getoutpost_credentials.json` with the absolute path to your credentials file
- If `CREDENTIALS_FILE_PATH` is not specified, it defaults to `~/.getoutpost_credentials.json`

### Step 3: Enable MCP Server

Restart Claude Desktop and enable getoutpost-mcp in your connectors section.


## Token Management

The MCP server automatically manages token refresh. When your access token expires:
1. The server detects the 401 authentication error
2. It uses the refresh token from your credentials file to get new tokens
3. The new tokens are automatically saved back to your credentials file
4. Your credentials file is always kept up-to-date with the latest tokens

## Recommended Approach to Usage (Claude)

1. Create a project called `Options Insights`.
2. Give it's description as `Access real-time options market data and volatility analytics through GetOutpost's financial APIs. Analyze implied volatility, realized volatility, volatility risk premium, and skew across multiple instruments to generate data-driven trading insights.`
3. Click "+" (next to instructions) to add system prompt. Paste the content of the file `system_prompt.md`. Click Save.
4. Please use model `Claude Sonnet 4.5`.
5. Avoid long conversations in a single chat because you run the risk of reaching the context length and might cause the LLM to give faulty answers.
6. Use new chats (in project `Options Trading`) when you want to start a conversation about a new symbol or a an entirely different topic.
7. You are good to go, just type out your prompts.

## Packaging and Publishing

This section is for developers who want to package and publish the MCP server to npm.

### Building the Package

1. Make sure all changes are committed to git
2. Update the version in `package.json` if needed
3. Build the TypeScript code:
   ```bash
   npm run build
   ```

### Testing the Package Locally

Before publishing, test what will be included in the package:

```bash
npm pack --dry-run
```

This shows all files that will be included in the npm package.

### Publishing to npm

1. Ensure you're logged in to npm:
   ```bash
   npm whoami
   ```

2. Publish the package:
   ```bash
   npm publish
   ```

   This will automatically:
   - Run `npm run build` (via the `prepublishOnly` script)
   - Package all files specified in the `files` field of `package.json`
   - Upload to the npm registry

3. Verify the publication:
   ```bash
   npm view getoutpost-mcp-server
   ```

### Package Configuration

The package includes both HTTP and stdio server binaries:
- `getoutpost-mcp-http`: Starts the HTTP server
- `getoutpost-mcp-stdio`: Starts the stdio server

Files included in the package are controlled by:
- `files` field in `package.json` (specifies what to include)
- `.npmignore` file (specifies what to exclude)
