/**
 * Token Manager for GetOutpost API Authentication
 */
import axios from 'axios';
import { CredentialsManager } from './credentials';

export class TokenManager {
  private baseUrl: string = 'https://app.getoutpost.in';
  private credentialsManager: CredentialsManager;

  constructor() {
    this.credentialsManager = CredentialsManager.getInstance();
  }

  async getToken(): Promise<string> {
    try {
      const config = await this.credentialsManager.getConfig();
      return config.ACCESS_TOKEN;
    } catch (error: any) {
      console.error(`Could not load token from credentials file: ${error.message}`);
      throw new Error(`No API token available. Please ensure credentials file exists at ${this.credentialsManager.getCredentialsFilePath()}`);
    }
  }

  async getBaseUrl(): Promise<string> {
    return this.baseUrl;
  }

  async getEmail(): Promise<string> {
    try {
      const config = await this.credentialsManager.getConfig();
      return config.EMAIL;
    } catch (error: any) {
      console.error(`Could not load email from credentials file: ${error.message}`);
      throw new Error(`No email available. Please ensure credentials file exists at ${this.credentialsManager.getCredentialsFilePath()}`);
    }
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    // Load configuration from file
    let config;
    try {
      config = await this.credentialsManager.getConfig();
    } catch (error: any) {
      throw new Error(`Cannot refresh token: ${error.message}`);
    }

    const refreshToken = config.REFRESH_TOKEN;
    const email = config.EMAIL;

    if (!refreshToken) {
      throw new Error('REFRESH_TOKEN not found in credentials file');
    }

    if (!email) {
      throw new Error('EMAIL not found in credentials file');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/__api__/auth/refresh`,
        { email },
        {
          headers: {
            'Cookie': `refreshToken=${refreshToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Extract tokens from Set-Cookie headers
      const setCookieHeaders = response.headers['set-cookie'];
      if (!setCookieHeaders) {
        throw new Error('No Set-Cookie headers in refresh response');
      }

      let newAccessToken = '';
      let newRefreshToken = '';

      setCookieHeaders.forEach((cookie: string) => {
        if (cookie.startsWith('accessToken=')) {
          newAccessToken = cookie.split(';')[0].split('=')[1];
        } else if (cookie.startsWith('refreshToken=')) {
          newRefreshToken = cookie.split(';')[0].split('=')[1];
        }
      });

      if (!newAccessToken || !newRefreshToken) {
        throw new Error('Could not extract tokens from Set-Cookie headers');
      }

      // Update tokens in credentials file
      await this.credentialsManager.updateTokens(newAccessToken, newRefreshToken);

      console.error('Successfully refreshed tokens and saved to credentials file');

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error: any) {
      console.error('Failed to refresh token:', error.message);
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  async loadTokens(): Promise<void> {
    // This method is just to satisfy the import requirement
    // Implementation would load tokens into memory if needed
    try {
      await this.getToken();
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  }
}