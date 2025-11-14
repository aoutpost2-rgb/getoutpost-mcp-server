/**
 * API Client for GetOutpost Financial APIs
 */
import axios, { AxiosResponse } from 'axios';
import { TokenManager } from '../auth/tokens';

export interface APIRequest {
  symbols?: string[];
  daysToExpiry?: number;
  moneyness?: number;
  realizedVolatility?: string;
  lookbackPeriod?: string;
  percentile?: number[];
  volatilityType?: string;
  [key: string]: any;
}

export class APIManager {
  public tokenManager: TokenManager;

  constructor() {
    this.tokenManager = new TokenManager();
  }

  private async makeRequest(fullPath: string, params: APIRequest, retryCount = 0): Promise<any> {
    const token = await this.tokenManager.getToken();
    const baseUrl = await this.tokenManager.getBaseUrl();

    try {
      const response: AxiosResponse = await axios.post(
        `${baseUrl}${fullPath}`,
        params,
        {
          headers: {
            'Cookie': `accessToken=${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      // Check if it's an authentication error (401 Unauthorized)
      if (error.response && error.response.status === 401 && retryCount === 0) {
        console.error('Authentication error detected, attempting to refresh token...');

        try {
          // Refresh the token
          await this.tokenManager.refreshToken();

          // Retry the request with the new token
          console.error('Token refreshed, retrying request...');
          return this.makeRequest(fullPath, params, retryCount + 1);
        } catch (refreshError: any) {
          console.error('Failed to refresh token:', refreshError.message);
          throw new Error(`Authentication failed and token refresh failed: ${refreshError.message}`);
        }
      }

      // If it's not an auth error or we've already retried, throw the original error
      throw error;
    }
  }

  async iv(params: APIRequest): Promise<any> {
    return this.makeRequest('/__api__/data/iv', params);
  }

  async vol(params: APIRequest): Promise<any> {
    return this.makeRequest('/__api__/data/vol', params);
  }

  async vrp(params: APIRequest): Promise<any> {
    return this.makeRequest('/__api__/data/vrp', params);
  }

  async skew(params: APIRequest): Promise<any> {
    return this.makeRequest('/__api__/data/skew', params);
  }

  async skewPercentile(params: APIRequest): Promise<any> {
    return this.makeRequest('/__api__/filters/quick-rules/skew-percentile', params);
  }

  async vrpPercentile(params: APIRequest): Promise<any> {
    return this.makeRequest('/__api__/filters/quick-rules/vrp-percentile', params);
  }

  async rvPercentile(params: APIRequest): Promise<any> {
    return this.makeRequest('/__api__/filters/quick-rules/rv-percentile', params);
  }

  async ivPercentile(params: APIRequest): Promise<any> {
    return this.makeRequest('/__api__/filters/quick-rules/iv-percentile', params);
  }
}