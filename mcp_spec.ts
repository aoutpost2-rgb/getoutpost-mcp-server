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
  readOnlyHint?: boolean;
  destructiveHint?: boolean;

  constructor(name: string, description: string, inputSchema: ToolInputSchema, readOnlyHint?: boolean, destructiveHint?: boolean) {
    this.name = name;
    this.description = description;
    this.inputSchema = inputSchema;
    this.readOnlyHint = readOnlyHint;
    this.destructiveHint = destructiveHint;
  }

  toJSON(): any {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
      ...(this.readOnlyHint !== undefined && { readOnlyHint: this.readOnlyHint }),
      ...(this.destructiveHint !== undefined && { destructiveHint: this.destructiveHint })
    };
  }
}

// Define the tools based on your API endpoints
export const MCP_TOOLS = [
  new ToolDefinition(
    "get_iv",
    "Get detailed implied volatility (IV) data for specific symbols. Requires known symbol names - use filter_quick_rules_* tools first to discover symbols matching your criteria.",
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
          type: "number",
          enum: [20, 40, 60, 80],
          description: "Lookback period in days"
        }
      },
      required: ["symbols", "moneyness", "daysToExpiry", "realizedVolatility", "lookbackPeriod"]
    },
    true
  ),
  new ToolDefinition(
    "get_vol",
    "Get detailed volatility data for specific symbols. Requires known symbol names - use filter_quick_rules_* tools first to discover symbols matching your criteria.",
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
    },
    true
  ),
  new ToolDefinition(
    "get_vrp",
    "Get detailed volatility risk premium (VRP) data for specific symbols. Requires known symbol names - use filter_quick_rules_* tools first to discover symbols matching your criteria.",
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
          type: "number",
          enum: [20, 40, 60, 80],
          description: "Lookback period in days"
        }
      },
      required: ["symbols", "moneyness", "daysToExpiry", "realizedVolatility", "lookbackPeriod"]
    },
    true
  ),
  new ToolDefinition(
    "get_skew",
    "Get detailed skew data for specific symbols. Requires known symbol names - use filter_quick_rules_* tools first to discover symbols matching your criteria.",
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
          type: "number",
          enum: [20, 40, 60, 80],
          description: "Lookback period in days"
        }
      },
      required: ["symbols", "moneyness", "daysToExpiry", "realizedVolatility", "lookbackPeriod"]
    },
    true
  ),
  new ToolDefinition(
    "filter_quick_rules_skew_percentile",
    "Filter and discover symbols by skew percentile criteria. Returns a list of symbol names matching the percentile range. Use the returned symbols with get_iv, get_vol, get_vrp, or get_skew tools for detailed analysis.",
    {
      type: "object",
      properties: {
        moneyness: {
          type: "number",
          enum: [0.1, 0.05, 0.02, 0.01, 0, -0.01, -0.02, -0.05, -0.1],
          description: "log(Forward/Strike): positive=OTM put, 0=ATM, negative=OTM call"
        },
        daysToExpiry: {
          type: "integer",
          description: "Calendar days until option expiry (positive integer)"
        },
        percentile: {
          type: "array",
          items: { type: "number" },
          description: "Percentile range as an array of two numbers [min, max] (e.g., [25, 75])"
        }
      },
      required: ["moneyness", "daysToExpiry", "percentile"]
    },
    true
  ),
  new ToolDefinition(
    "filter_quick_rules_vrp_percentile",
    "Filter and discover symbols by volatility risk premium (VRP) percentile criteria. Returns a list of symbol names matching the percentile range. Use the returned symbols with get_iv, get_vol, get_vrp, or get_skew tools for detailed analysis.",
    {
      type: "object",
      properties: {
        moneyness: {
          type: "number",
          enum: [0.1, 0.05, 0.02, 0.01, 0, -0.01, -0.02, -0.05, -0.1],
          description: "log(Forward/Strike): positive=OTM put, 0=ATM, negative=OTM call"
        },
        daysToExpiry: {
          type: "integer",
          description: "Calendar days until option expiry (positive integer)"
        },
        volatilityType: {
          type: "string",
          enum: ["c2c", "parkinson", "garman_klass", "rogers_satchell", "yang_zhang", "mean"],
          description: "Realized volatility calculation method"
        },
        lookbackPeriod: {
          type: "number",
          enum: [20, 40, 60, 80],
          description: "Lookback period in days"
        },
        percentile: {
          type: "array",
          items: { type: "number" },
          description: "Percentile range as an array of two numbers [min, max] (e.g., [20, 75])"
        }
      },
      required: ["moneyness", "daysToExpiry", "volatilityType", "lookbackPeriod", "percentile"]
    },
    true
  ),
  new ToolDefinition(
    "filter_quick_rules_rv_percentile",
    "Filter and discover symbols by realized volatility (RV) percentile criteria. Returns a list of symbol names matching the percentile range. Use the returned symbols with get_iv, get_vol, get_vrp, or get_skew tools for detailed analysis.",
    {
      type: "object",
      properties: {
        volatilityType: {
          type: "string",
          enum: ["c2c", "parkinson", "garman_klass", "rogers_satchell", "yang_zhang", "mean"],
          description: "Realized volatility calculation method"
        },
        lookbackPeriod: {
          type: "number",
          enum: [20, 40, 60, 80],
          description: "Lookback period in days"
        },
        percentile: {
          type: "array",
          items: { type: "number" },
          description: "Percentile range as an array of two numbers [min, max] (e.g., [25, 75])"
        }
      },
      required: ["volatilityType", "lookbackPeriod", "percentile"]
    },
    true
  ),
  new ToolDefinition(
    "filter_quick_rules_iv_percentile",
    "Filter and discover symbols by implied volatility (IV) percentile criteria. Returns a list of symbol names matching the percentile range. Use the returned symbols with get_iv, get_vol, get_vrp, or get_skew tools for detailed analysis.",
    {
      type: "object",
      properties: {
        moneyness: {
          type: "number",
          enum: [0.1, 0.05, 0.02, 0.01, 0, -0.01, -0.02, -0.05, -0.1],
          description: "log(Forward/Strike): positive=OTM put, 0=ATM, negative=OTM call"
        },
        daysToExpiry: {
          type: "integer",
          description: "Calendar days until option expiry (positive integer)"
        },
        percentile: {
          type: "array",
          items: { type: "number" },
          description: "Percentile range as an array of two numbers [min, max] (e.g., [25, 75])"
        }
      },
      required: ["moneyness", "daysToExpiry", "percentile"]
    },
    true
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
      } else if (toolName === "filter_quick_rules_skew_percentile") {
        result = await this.apiManager.skewPercentile(argumentsObj);
      } else if (toolName === "filter_quick_rules_vrp_percentile") {
        result = await this.apiManager.vrpPercentile(argumentsObj);
      } else if (toolName === "filter_quick_rules_rv_percentile") {
        result = await this.apiManager.rvPercentile(argumentsObj);
      } else if (toolName === "filter_quick_rules_iv_percentile") {
        result = await this.apiManager.ivPercentile(argumentsObj);
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
