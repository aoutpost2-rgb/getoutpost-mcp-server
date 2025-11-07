/**
 * MCP (Model Context Protocol) Specification Implementation for GetOutpost
 * This follows the MCP protocol to allow Claude to interact with our financial APIs
 */

import { APIManager } from './api/client';

export interface Dict<T = any> {
  [key: string]: T;
}

export interface ToolInputSchema {
  type: string;
  properties: Dict;
  required?: string[];
  description?: string;
  items?: ToolInputSchema; // For array types
}

export interface ToolDefinitionInterface {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
}

export class ToolDefinition implements ToolDefinitionInterface {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;

  constructor(name: string, description: string, inputSchema: ToolInputSchema) {
    this.name = name;
    this.description = description;
    this.inputSchema = inputSchema;
  }

  toJSON(): any {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema  // ✅ FIXED: Changed from input_schema
    };
  }
}

// Define the tools based on your API endpoints
export const MCP_TOOLS = [
  new ToolDefinition(
    "get_iv",
    "Get implied volatility data for financial instruments",
    {
      type: "object",
      properties: {
        symbols: {
          type: "array",
          items: { type: "string" },
          description: "Ticker symbols (e.g., ['NIFTY', 'BPCL'])"
        },
        moneyness: {
          type: "number",
          enum: [0.1, 0.05, 0.02, 0.01, 0, -0.01, -0.02, -0.05, -0.1],
          description: "log(Forward/Strike): positive=OTM put, 0=ATM, negative=OTM call"
        },
        daysToExpiry: {
          type: "integer",
          description: "Calendar days until option expiry (positive integer)"
        },
        realizedVolatility: {
          type: "string",
          enum: ["c2c", "parkinson", "garman_klass", "rogers_satchell", "yang_zhang", "mean"],
          description: "Realized volatility calculation method"
        },
        lookbackPeriod: {
          type: "string",
          enum: ["20", "40", "60", "80"],
          description: "Lookback period in days"
        }
      },
      required: ["symbols", "moneyness", "daysToExpiry", "realizedVolatility", "lookbackPeriod"]
    }
  ),
  new ToolDefinition(
    "get_vol",
    "Get volatility data for financial instruments",
    {
      type: "object",
      properties: {
        symbols: {
          type: "array",
          items: { type: "string" },
          description: "Ticker symbols (e.g., ['AAPL', 'MSFT'])"
        }
      },
      required: ["symbols"]
    }
  ),
  new ToolDefinition(
    "get_vrp",
    "Get volatility risk premium data for financial instruments",
    {
      type: "object",
      properties: {
        symbols: {
          type: "array",
          items: { type: "string" },
          description: "Ticker symbols (e.g., ['AAPL', 'MSFT'])"
        },
        moneyness: {
          type: "number",
          enum: [0.1, 0.05, 0.02, 0.01, 0, -0.01, -0.02, -0.05, -0.1],
          description: "log(Forward/Strike): positive=OTM put, 0=ATM, negative=OTM call"
        },
        daysToExpiry: {
          type: "integer",
          description: "Calendar days until option expiry (positive integer)"
        },
        realizedVolatility: {
          type: "string",
          enum: ["c2c", "parkinson", "garman_klass", "rogers_satchell", "yang_zhang", "mean"],
          description: "Realized volatility calculation method"
        },
        lookbackPeriod: {
          type: "string",
          enum: ["20", "40", "60", "80"],
          description: "Lookback period in days"
        }
      },
      required: ["symbols", "moneyness", "daysToExpiry", "realizedVolatility", "lookbackPeriod"]
    }
  ),
  new ToolDefinition(
    "get_skew",
    "Get skew data for financial instruments",
    {
      type: "object",
      properties: {
        symbols: {
          type: "array",
          items: { type: "string" },
          description: "Ticker symbols (e.g., ['AAPL', 'MSFT'])"
        },
        moneyness: {
          type: "number",
          enum: [0.1, 0.05, 0.02, 0.01, 0, -0.01, -0.02, -0.05, -0.1],
          description: "log(Forward/Strike): positive=OTM put, 0=ATM, negative=OTM call"
        },
        daysToExpiry: {
          type: "integer",
          description: "Calendar days until option expiry (positive integer)"
        },
        realizedVolatility: {
          type: "string",
          enum: ["c2c", "parkinson", "garman_klass", "rogers_satchell", "yang_zhang", "mean"],
          description: "Realized volatility calculation method"
        },
        lookbackPeriod: {
          type: "string",
          enum: ["20", "40", "60", "80"],
          description: "Lookback period in days"
        }
      },
      required: ["symbols", "moneyness", "daysToExpiry", "realizedVolatility", "lookbackPeriod"]
    }
  )
];

export class MCPHandler {
  apiManager: APIManager;

  constructor(apiManager: APIManager) {
    this.apiManager = apiManager;
  }

  async handleMCPRequest(request: Dict): Promise<Dict> {
    /** Handle MCP requests */
    if (request.method === "tools/list") {
      // Return list of available tools
      return {
        result: {
          tools: MCP_TOOLS.map(tool => tool.toJSON())
        }
      };
    } else if (request.method === "tools/call") {
      // Handle tool calls
      const params = request.params || {};
      const toolName = params.name;
      const toolArguments = params.arguments || {};
      
      return await this.executeTool(toolName, toolArguments);
    } else {
      return {
        error: {
          code: -32601,  // Method not found
          message: `Method ${request.method} not supported`
        }
      };
    }
  }

  async executeTool(toolName: string, argumentsObj: Dict): Promise<Dict> {
    /** Execute a specific tool */
    try {
      let result: any;
      if (toolName === "get_iv") {
        result = await this.apiManager.iv(argumentsObj);
      } else if (toolName === "get_vol") {
        result = await this.apiManager.vol(argumentsObj);
      } else if (toolName === "get_vrp") {
        result = await this.apiManager.vrp(argumentsObj);
      } else if (toolName === "get_skew") {
        result = await this.apiManager.skew(argumentsObj);
      } else {
        return {
          error: {
            code: -32601,
            message: `Tool ${toolName} not found`
          }
        };
      }
      
      return {
        result: result
      };
    } catch (error: any) {
      return {
        error: {
          code: -32000,
          message: error.message
        }
      };
    }
  }
}
