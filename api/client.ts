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
  [key: string]: any;
}

export class APIManager {
  public tokenManager: TokenManager;
  private baseUrl: string;
  private email: string;

  constructor(email: string) {
    this.baseUrl = process.env.API_BASE_URL || 'https://api.getoutpost.dev';
    this.email = email;
    this.tokenManager = new TokenManager(this.email);
  }

  private async makeRequest(endpoint: string, params: APIRequest, retryCount = 0): Promise<any> {
    const token = await this.tokenManager.getToken();

    try {
      const response: AxiosResponse = await axios.post(
        `${this.baseUrl}/__api__/data${endpoint}`,
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
          return this.makeRequest(endpoint, params, retryCount + 1);
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
    return this.makeRequest('/iv', params);
  }

  async vol(params: APIRequest): Promise<any> {
    return this.makeRequest('/vol', params);
  }

  async vrp(params: APIRequest): Promise<any> {
    return this.makeRequest('/vrp', params);
  }

  async skew(params: APIRequest): Promise<any> {
    return this.makeRequest('/skew', params);
  }
}