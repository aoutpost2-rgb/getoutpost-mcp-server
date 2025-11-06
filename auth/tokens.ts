/**
 * Token Manager for GetOutpost API Authentication
 */
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

export class TokenManager {
  private email: string;
  private tokenFilePath: string;
  private baseUrl: string;

  constructor(email: string) {
    this.email = email;
    this.tokenFilePath = path.join(process.cwd(), '.tokens', `${email.replace('@', '_').replace('.', '_')}_token.txt`);
    this.baseUrl = process.env.API_BASE_URL || 'https://api.getoutpost.dev';
  }

  async getToken(): Promise<string> {
    // Check for token in environment first
    if (process.env.ACCESS_TOKEN) {
      return process.env.ACCESS_TOKEN;
    }

    // Try to load from file system
    try {
      await fs.access(this.tokenFilePath);
      const token = await fs.readFile(this.tokenFilePath, 'utf-8');
      return token.trim();
    } catch (error) {
      console.error(`Could not load token from ${this.tokenFilePath}`);
      throw new Error('No API token available. Please set API_TOKEN environment variable or ensure token file exists.');
    }
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = process.env.REFRESH_TOKEN;
    const email = process.env.EMAIL || this.email;

    if (!refreshToken) {
      throw new Error('REFRESH_TOKEN environment variable is not set');
    }

    if (!email) {
      throw new Error('EMAIL environment variable is not set');
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

      // Update environment variables
      process.env.ACCESS_TOKEN = newAccessToken;
      process.env.REFRESH_TOKEN = newRefreshToken;

      console.error('Successfully refreshed tokens');

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