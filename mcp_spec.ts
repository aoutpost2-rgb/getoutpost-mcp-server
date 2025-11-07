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
          description: "List of symbols to get IV data for (minimum 1 symbol required)"
        },
        moneyness: {
          type: "number",
          enum: [0.1, 0.05, 0.02, 0.01, 0, -0.01, -0.02, -0.05, -0.1],
          description: "Moneyness level defined as log(Forward Price / Strike Price). Valid values: 0.1 (10% OTM Put), 0.05 (5% OTM Put), 0.02 (2% OTM Put), 0.01 (1% OTM Put), 0 (ATM), -0.01 (1% OTM Call), -0.02 (2% OTM Call), -0.05 (5% OTM Call), -0.1 (10% OTM Call)"
        },
        daysToExpiry: {
          type: "integer",
          description: "Number of calendar days remaining until option expiry. Calculate from today's date to the expiry date. For example, if today is November 7th and monthly expiry is November 28th, use 21 days. Must be a positive integer."
        },
        realizedVolatility: {
          type: "string",
          enum: ["c2c", "parkinson", "garman_klass", "rogers_satchell", "yang_zhang", "mean"],
          description: "Type of realized volatility calculation: c2c (Close-To-Close), parkinson (Parkinson), garman_klass (Garman-Klass), rogers_satchell (Rogers-Satchell), yang_zhang (Yang-Zhang), mean (Mean)"
        },
        lookbackPeriod: {
          type: "string",
          enum: ["20", "40", "60", "80"],
          description: "Lookback period in days for calculation. Supported values: '20', '40', '60', or '80'"
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
          description: "List of symbols to get VOL data for (minimum 1 symbol required)"
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
          description: "List of symbols to get VRP data for (minimum 1 symbol required)"
        },
        moneyness: {
          type: "number",
          enum: [0.1, 0.05, 0.02, 0.01, 0, -0.01, -0.02, -0.05, -0.1],
          description: "Moneyness level defined as log(Forward Price / Strike Price). Valid values: 0.1 (10% OTM Put), 0.05 (5% OTM Put), 0.02 (2% OTM Put), 0.01 (1% OTM Put), 0 (ATM), -0.01 (1% OTM Call), -0.02 (2% OTM Call), -0.05 (5% OTM Call), -0.1 (10% OTM Call)"
        },
        daysToExpiry: {
          type: "integer",
          description: "Number of calendar days remaining until option expiry. Calculate from today's date to the expiry date. For example, if today is November 7th and monthly expiry is November 28th, use 21 days. Must be a positive integer."
        },
        realizedVolatility: {
          type: "string",
          enum: ["c2c", "parkinson", "garman_klass", "rogers_satchell", "yang_zhang", "mean"],
          description: "Type of realized volatility calculation: c2c (Close-To-Close), parkinson (Parkinson), garman_klass (Garman-Klass), rogers_satchell (Rogers-Satchell), yang_zhang (Yang-Zhang), mean (Mean)"
        },
        lookbackPeriod: {
          type: "string",
          enum: ["20", "40", "60", "80"],
          description: "Lookback period in days for calculation. Supported values: '20', '40', '60', or '80'"
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
          description: "List of symbols to get skew data for (minimum 1 symbol required)"
        },
        moneyness: {
          type: "number",
          enum: [0.1, 0.05, 0.02, 0.01, 0, -0.01, -0.02, -0.05, -0.1],
          description: "Moneyness level defined as log(Forward Price / Strike Price). Valid values: 0.1 (10% OTM Put), 0.05 (5% OTM Put), 0.02 (2% OTM Put), 0.01 (1% OTM Put), 0 (ATM), -0.01 (1% OTM Call), -0.02 (2% OTM Call), -0.05 (5% OTM Call), -0.1 (10% OTM Call)"
        },
        daysToExpiry: {
          type: "integer",
          description: "Number of calendar days remaining until option expiry. Calculate from today's date to the expiry date. For example, if today is November 7th and monthly expiry is November 28th, use 21 days. Must be a positive integer."
        },
        realizedVolatility: {
          type: "string",
          enum: ["c2c", "parkinson", "garman_klass", "rogers_satchell", "yang_zhang", "mean"],
          description: "Type of realized volatility calculation: c2c (Close-To-Close), parkinson (Parkinson), garman_klass (Garman-Klass), rogers_satchell (Rogers-Satchell), yang_zhang (Yang-Zhang), mean (Mean)"
        },
        lookbackPeriod: {
          type: "string",
          enum: ["20", "40", "60", "80"],
          description: "Lookback period in days for calculation. Supported values: '20', '40', '60', or '80'"
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
