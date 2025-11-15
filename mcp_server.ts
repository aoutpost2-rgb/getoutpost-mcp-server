#!/usr/bin/env node
/**
 * MCP HTTP Server for GetOutpost Financial APIs
 * This uses StreamableHTTP transport in stateless mode
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { APIManager } from './api/client.js';
import { MCPHandler, MCP_TOOLS } from './mcp_spec.js';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors({
  origin: '*',
  exposedHeaders: ['Mcp-Session-Id']
}));
app.use(express.json({ limit: '10mb' }));

// Initialize API manager (reads configuration from credentials file)
const apiManager = new APIManager();
const mcpHandler = new MCPHandler(apiManager);

// Create the MCP server instance (shared across all requests in stateless mode)
const server = new Server(
  {
    name: "getoutpost-mcp",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('[MCP] Listing tools...');
  return {
    tools: MCP_TOOLS.map(tool => tool.toJSON())
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error(`[MCP] Calling tool: ${request.params.name}`);

  try {
    // Call the tool through your existing handler
    const result = await mcpHandler.handleMCPRequest({
      method: 'tools/call',
      params: {
        name: request.params.name,
        arguments: request.params.arguments || {}
      }
    });

    console.error(`[MCP] Tool ${request.params.name} completed successfully`);

    // Return result in MCP format
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error: any) {
    console.error(`[MCP] Tool ${request.params.name} failed:`, error.message);

    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Create a single transport instance that will be reused for all requests
let transport: StreamableHTTPServerTransport | null = null;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', server: 'getoutpost-mcp' });
});

// MCP endpoint - handles all GET, POST, DELETE requests
// Using stateless mode - no session management required
const handleMCPRequest = async (req: express.Request, res: express.Response) => {
  try {
    if (!transport) {
      throw new Error('Transport not initialized. Server may still be starting up.');
    }

    // Handle the request using the persistent transport
    await transport.handleRequest(req, res, req.body);
  } catch (error: any) {
    console.error('[MCP] Error handling request:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

app.post('/mcp', handleMCPRequest);

// Main function to start the server
async function main() {
  try {
    console.error('[MCP] Initializing GetOutpost MCP HTTP Server...');

    // Load tokens before starting
    try {
      await apiManager.tokenManager.loadTokens();
      console.error('[MCP] API tokens loaded successfully');
    } catch (error: any) {
      console.error('[MCP] Warning: Failed to load tokens:', error.message);
      console.error('[MCP] Make sure credentials file exists at:',
        process.env.CREDENTIALS_FILE_PATH || '~/.getoutpost_credentials.json');
    }

    // Create and initialize the transport ONCE
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Stateless mode
      enableJsonResponse: true // Use JSON responses instead of SSE for simplicity
    });

    // Connect the server to the transport ONCE
    await server.connect(transport);
    console.error('[MCP] Server connected to HTTP transport');

    const port = parseInt(process.env.PORT || '8019');

    app.listen(port, '0.0.0.0', () => {
      console.error(`[MCP] GetOutpost MCP Server running on http://localhost:${port}`);
      console.error(`[MCP] MCP endpoint: http://localhost:${port}/mcp`);
      console.error('[MCP] Available tools:', MCP_TOOLS.length);
      console.error('[MCP] Running in STATELESS mode');
    });

  } catch (error: any) {
    console.error('[MCP] Fatal error starting server:', error);
    process.exit(1);
  }
}

// Start the server if run directly
if (require.main === module) {
  main().catch((error) => {
    console.error('[MCP] Unhandled error:', error);
    process.exit(1);
  });
}

// Export app for testing
export default app;
