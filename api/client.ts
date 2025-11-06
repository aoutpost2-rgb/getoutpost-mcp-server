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

  private async makeRequest(endpoint: string, params: APIRequest): Promise<any> {
    const token = await this.tokenManager.getToken();
    
    const response: AxiosResponse = await axios.post(
      `${this.baseUrl}${endpoint}`,
      params,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-User-Email': this.email
        }
      }
    );
    
    return response.data;
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