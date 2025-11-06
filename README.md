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
1. Add the following to your `claude_desktop_config.json` file

```
"getoutpost-mcp": {
  "command": "node",
  "args": [
    "<path-to-your-repository>/dist/mcp_server_stdio.js"
  ],
  "env": {
    "ACCESS_TOKEN": "<Getoutpost Access Token>",
    "REFRESH_TOKEN": "<Getoupost Refresh Token>",
    "API_BASE_URL" : "https://getoutpost.in",
    "EMAIL" : "<Email used to login to Getoutpost>"
  }
}
```

2. After this make sure to enable getoutpost-mcp in your connectors section.

![alt text](image.png)

3. You are good to go, just type out your prompts. Recommended to use Sonnet 4.5 model.

## License

MIT