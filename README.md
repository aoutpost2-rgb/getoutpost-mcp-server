# GetOutpost MCP Server

[![MCP](https://img.shields.io/badge/MCP-Compatible-blue)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D24.0.0-brightgreen)](https://nodejs.org)

A Model Context Protocol (MCP) server that brings real-time Indian options market data and volatility analytics to Claude Desktop. Access comprehensive financial data from [GetOutpost.in](https://getoutpost.in) directly within your AI conversations.

## What is this?

This MCP server enables Claude to analyze options market data including:
- **Implied Volatility (IV)** - Options pricing and market expectations
- **Realized Volatility (RV)** - Historical price movement metrics (Close-to-Close, Parkinson, Garman-Klass, Rogers-Satchell, Yang-Zhang)
- **Volatility Risk Premium (VRP)** -  IV divided by RV
- **Skew Analysis** - Volatility smile/smirk patterns across strike prices

Perfect for quantitative analysis, options trading research, and data-driven trading insights on Indian markets (NSE, BSE).

## Features

**8 Specialized Tools** - Filter symbols by percentile criteria and fetch detailed volatility metrics

**4 Pre-built Prompts** - Quick-start templates for common trading strategies

**Cross-Platform** - Works on Windows, macOS, and Linux

**Comprehensive Data** - Multiple volatility calculation methods and moneyness levels

**One-Click Install** - Available in Claude Desktop's extension marketplace

## Installation

### Option 1: Claude Desktop Extension Marketplace (Recommended)

1. Open **Claude Desktop**
2. Go to **Settings** → **Extensions**
3. Search for **"GetOutpost Financial Data"**
4. Click **Install**
5. Configure your credentials file path when prompted

### Option 2: Manual Installation

Install globally:

```bash
npm install -g getoutpost-mcp-server
```

Then configure:

```json
{
  "mcpServers": {
    "getoutpost": {
      "command": "getoutpost-mcp-stdio",
      "env": {
        "CREDENTIALS_FILE_PATH": "/absolute/path/to/.getoutpost_credentials.json"
      }
    }
  }
}
```

## Getting GetOutpost Credentials

1. **Sign up** at [GetOutpost.in](https://getoutpost.in)
2. **Log in** and obtain your access token and refresh token from your account settings
3. **Create a credentials file** at `~/.getoutpost_credentials.json`:

```json
{
  "ACCESS_TOKEN": "your_access_token_here",
  "REFRESH_TOKEN": "your_refresh_token_here",
  "API_BASE_URL": "https://getoutpost.in",
  "EMAIL": "your_email@example.com"
}
```

**Note:** The MCP server automatically refreshes your tokens and updates this file when tokens expire.

## Available Tools

The server provides 8 tools that Claude can use:

### Data Retrieval Tools

| Tool | Description |
|------|-------------|
| `get_iv` | Get implied volatility data for specific symbols |
| `get_vol` | Get realized volatility data using various calculation methods |
| `get_vrp` | Get volatility risk premium (IV minus RV) |
| `get_skew` | Get volatility skew patterns across strikes |

### Discovery/Filtering Tools

| Tool | Description |
|------|-------------|
| `filter_quick_rules_iv_percentile` | Find symbols by IV percentile range |
| `filter_quick_rules_rv_percentile` | Find symbols by RV percentile range |
| `filter_quick_rules_vrp_percentile` | Find symbols by VRP percentile range |
| `filter_quick_rules_skew_percentile` | Find symbols by skew percentile range |

## Available Prompts

Pre-built prompt templates to help you get started:

1. **Find long volatility opportunities** - Discover symbols where buying options makes sense (default: 30 DTE)
2. **Find cheap OTM puts** - Locate extremely cheap deep out-of-the-money puts for tail hedging (default: 29 DTE)
3. **Find short volatility opportunities** - Identify symbols for selling options strategies (default: 30 DTE)
4. **Find optimal short vol conditions** - Advanced filtering for moderately priced IV with healthy RV to avoid mean reversion (default: 25 DTE, ATM)

Access these via the **Prompts** menu in Claude Desktop.

## Example Usage

Once installed, you can ask Claude questions like:

```
"Find stocks with high volatility risk premium for potential short vol strategies"

"What's the volatility skew pattern for NIFTY with 30 days to expiry?"

"Show me the top 10 stocks with the cheapest deep OTM puts"

"Analyze the implied vs realized volatility for RELIANCE using yang_zhang method"
```

Or use the pre-built prompts for guided workflows.

## Recommended Claude Setup

For best results:

1. **Create a Claude Project** named "Options Insights"
2. **Project Description**: "Access real-time options market data and volatility analytics through GetOutpost's financial APIs. Analyze implied volatility, realized volatility, volatility risk premium, and skew across multiple instruments to generate data-driven trading insights."
3. **Add Custom Instructions**: Copy the content from [`system_prompt.md`](https://github.com/aoutpost2-rgb/mcp-server/blob/main/system_prompt.md) and paste it into your project's custom instructions. This provides Claude with optimal guidance on how to use the tools effectively.
4. **Use Claude Sonnet 4** for optimal analysis
5. **Start fresh chats** when switching between different symbols or analysis types to avoid context length issues

## Understanding Key Parameters

- **Moneyness**: `log(Forward/Strike)` - Positive values = OTM puts, 0 = ATM, Negative = OTM calls
- **Days to Expiry (DTE)**: Calendar days until option expiration
- **Volatility Types**:
  - `c2c` - Close-to-Close
  - `parkinson` - Parkinson's range-based estimator
  - `garman_klass` - Garman-Klass estimator
  - `rogers_satchell` - Rogers-Satchell estimator
  - `yang_zhang` - Yang-Zhang estimator
  - `mean` - Average of all methods
- **Lookback Period**: Days of historical data (20, 40, 60, or 80)

## Token Management

The server handles authentication automatically:
1. Detects when your access token expires (401 error)
2. Uses your refresh token to obtain new credentials
3. Updates your credentials file with the new tokens
4. Retries the failed request seamlessly

You never need to manually refresh tokens.

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/aoutpost2-rgb/mcp-server.git
cd mcp-server

# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev:stdio
```

### Running Tests

```bash
npm test
```

### Project Structure

```
├── api/              # API client implementation
├── auth/             # Authentication and token management
├── dist/             # Compiled JavaScript (generated)
├── extension/        # MCP extension bundle
├── mcp_server.ts     # HTTP server implementation
├── mcp_server_stdio.ts  # Stdio server implementation
├── mcp_spec.ts       # MCP protocol handlers and tool definitions
└── tests/            # Test files
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/aoutpost2-rgb/mcp-server/issues)
- **GetOutpost Support**: [GetOutpost.in](https://getoutpost.in)
- **MCP Documentation**: [Model Context Protocol](https://modelcontextprotocol.io)

## Acknowledgments

Built with the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk) by Anthropic.

---

**Disclaimer**: This tool is for informational and educational purposes only. Always conduct your own research and consult with financial advisors before making trading decisions.
