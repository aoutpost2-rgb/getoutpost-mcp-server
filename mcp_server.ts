/**
 * Main MCP Server for GetOutpost Financial APIs
 */
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { APIManager } from './api/client';
import { MCPHandler, MCP_TOOLS } from './mcp_spec';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize API manager with email
const email = process.env.EMAIL || 'ashwinbhskr@gmail.com';
const apiManager = new APIManager(email);
const mcpHandler = new MCPHandler(apiManager);

// Initialize API manager on startup
// Note: In a real implementation, this would be awaited properly
apiManager.tokenManager.loadTokens().catch((error: any) => {
  console.error('Failed to load tokens on startup:', error);
});

app.get('/health', async (req: Request, res: Response) => {
  /** Health check endpoint */
  res.json({ status: 'healthy' });
});

// Legacy endpoints (for direct API access)
app.post('/iv', async (req: Request, res: Response) => {
  /** Get implied volatility data */
  try {
    const result = await apiManager.iv(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ detail: error.message });
  }
});

app.post('/vol', async (req: Request, res: Response) => {
  /** Get volatility data */
  try {
    const result = await apiManager.vol(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ detail: error.message });
  }
});

app.post('/vrp', async (req: Request, res: Response) => {
  /** Get volatility risk premium data */
  try {
    const result = await apiManager.vrp(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ detail: error.message });
  }
});

app.post('/skew', async (req: Request, res: Response) => {
  /** Get skew data */
  try {
    const result = await apiManager.skew(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ detail: error.message });
  }
});

// MCP-specific endpoints
app.post('/mcp/tools/list', async (req: Request, res: Response) => {
  /** MCP endpoint to list available tools */
  try {
    res.json({
      result: {
        tools: MCP_TOOLS.map(tool => tool.toJSON())
      }
    });
  } catch (error: any) {
    res.status(500).json({ detail: error.message });
  }
});

app.post('/mcp/tools/call', async (req: Request, res: Response) => {
  /** MCP endpoint to call a tool */
  try {
    const result = await mcpHandler.handleMCPRequest(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ detail: error.message });
  }
});

app.post('/mcp', async (req: Request, res: Response) => {
  /** Main MCP endpoint that handles all MCP requests */
  try {
    const result = await mcpHandler.handleMCPRequest(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ detail: error.message });
  }
});

export const startServer = () => {
  const port = parseInt(process.env.PORT || '8019');
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`GetOutpost MCP Server running on port ${port}`);
  });
  
  return server;
};

// If this file is run directly, start the server
if (require.main === module) {
  startServer();
}

export default app;