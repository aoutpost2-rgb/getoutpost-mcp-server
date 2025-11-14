# GetOutpost MCP Server

MCP (Model Context Protocol) STDIO Server for GetOutpost Financial APIs.

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

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build
  ```bash
  npm run build
  ```


### Integration with Claude Desktop

#### Step 1: Create Credentials File

Create a credentials file (e.g., `~/.getoutpost_credentials.json`) with your GetOutpost credentials:

```json
{
  "ACCESS_TOKEN": "your_access_token_here",
  "REFRESH_TOKEN": "your_refresh_token_here",
  "API_BASE_URL": "https://getoutpost.in",
  "EMAIL": "your_email@example.com"
}
```

#### Step 2: Configure Claude Desktop

Add the following to your `claude_desktop_config.json` file:

```json
{
  "mcpServers" : {
    "getoutpost-mcp": {
      "command": "node",
      "args": [
        "<path-to-your-repository>/dist/mcp_server_stdio.js"
      ],
      "env": {
        "CREDENTIALS_FILE_PATH": "/absolute/path/to/.getoutpost_credentials.json"
      }
    }
  }
}
```

**Note:**
- Replace `<path-to-your-repository>` with the actual path to your cloned repository
- Replace `/absolute/path/to/.getoutpost_credentials.json` with the absolute path to your credentials file
- If `CREDENTIALS_FILE_PATH` is not specified, it defaults to `~/.getoutpost_credentials.json`

#### Step 3: Enable MCP Server

After this, make sure to enable getoutpost-mcp in your connectors section.

![alt text](image.png)


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
