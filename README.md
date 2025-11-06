# GetOutpost MCP Server (TypeScript)

MCP (Model Context Protocol) Server for GetOutpost Financial APIs, ported from Python to TypeScript.

## Overview

This server provides access to financial data from GetOutpost through the Model Context Protocol (MCP), allowing AI assistants like Claude to interact with financial APIs.

## Features

- MCP-compliant API for financial data access
- Support for implied volatility (IV), volatility (VOL), volatility risk premium (VRP), and skew data
- Token-based authentication with automatic refresh
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

## Configuration

Create a `.env` file based on `.env.example`:
```bash
EMAIL=your-email@example.com
PORT=8000
```

You'll also need a `tokens.json` file with your access and refresh tokens:
```json
{
  "access_token": "your-access-token",
  "refresh_token": "your-refresh-token"
}
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

Or use the startup script:
```bash
./start_server.sh
```

## API Endpoints

- `GET /health` - Health check
- `POST /iv` - Get implied volatility data
- `POST /vol` - Get volatility data
- `POST /vrp` - Get volatility risk premium data
- `POST /skew` - Get skew data
- `POST /mcp/tools/list` - List available MCP tools
- `POST /mcp/tools/call` - Call MCP tools
- `POST /mcp` - Main MCP endpoint

## Testing

Run tests:
```bash
npm test
```

## Project Structure

```
├── mcp_server.ts          # Main server application
├── mcp_spec.ts           # MCP specification implementation
├── api/
│   └── client.ts         # API client for GetOutpost endpoints
├── auth/
│   └── tokens.ts         # Token management
├── tests/
│   ├── test_api.ts       # API endpoint tests
│   └── test_client.ts    # API client tests
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT