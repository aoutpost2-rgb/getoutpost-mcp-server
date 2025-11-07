/**
 * MCP stdio Server for Claude Desktop Integration
 * This uses stdio transport, not HTTP
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  Tool 
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { APIManager } from './api/client.js';
import { MCPHandler, MCP_TOOLS } from './mcp_spec.js';

// Load environment variables
dotenv.config();

// Initialize API manager (reads configuration from credentials file)
const apiManager = new APIManager();
const mcpHandler = new MCPHandler(apiManager);

// Create MCP server
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

// Main function to start the server
async function main() {
  try {
    console.error('[MCP] Initializing GetOutpost MCP Server...');
    
    // Load tokens before connecting
    try {
      await apiManager.tokenManager.loadTokens();
      console.error('[MCP] API tokens loaded successfully');
    } catch (error: any) {
      console.error('[MCP] Warning: Failed to load tokens:', error.message);
      console.error('[MCP] Make sure API_TOKEN is set in environment or token file exists');
    }
    
    // Connect via stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('[MCP] GetOutpost MCP Server running on stdio');
    console.error('[MCP] Available tools:', MCP_TOOLS.length);
    
  } catch (error: any) {
    console.error('[MCP] Fatal error starting server:', error);
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  console.error('[MCP] Unhandled error:', error);
  process.exit(1);
});
