/**
 * Token Manager for GetOutpost API Authentication
 */
import fs from 'fs/promises';
import path from 'path';

export class TokenManager {
  private email: string;
  private tokenFilePath: string;

  constructor(email: string) {
    this.email = email;
    this.tokenFilePath = path.join(process.cwd(), '.tokens', `${email.replace('@', '_').replace('.', '_')}_token.txt`);
  }

  async getToken(): Promise<string> {
    // Check for token in environment first
    if (process.env.API_TOKEN) {
      return process.env.API_TOKEN;
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