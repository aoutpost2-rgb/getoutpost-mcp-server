/**
 * Credentials File Handler
 * Manages reading and writing configuration and credentials to a separate file
 */
import fs from 'fs/promises';
import path from 'path';

export interface Config {
  ACCESS_TOKEN: string;
  REFRESH_TOKEN: string;
  API_BASE_URL: string;
  EMAIL: string;
}

export class CredentialsManager {
  private static instance: CredentialsManager;
  private credentialsFilePath: string;
  private cachedConfig: Config | null = null;

  private constructor() {
    // Get credentials file path from environment variable
    // Default to .getoutpost_credentials.json in user's home directory
    const defaultPath = path.join(
      process.env.HOME || process.env.USERPROFILE || process.cwd(),
      '.getoutpost_credentials.json'
    );
    this.credentialsFilePath = process.env.CREDENTIALS_FILE_PATH || defaultPath;
    console.error("credentialsFilePath = ", this.credentialsFilePath)
  }

  /**
   * Get singleton instance
   */
  static getInstance(): CredentialsManager {
    if (!CredentialsManager.instance) {
      CredentialsManager.instance = new CredentialsManager();
    }
    return CredentialsManager.instance;
  }

  /**
   * Load configuration from the file
   */
  async loadConfig(): Promise<Config> {
    try {
      await fs.access(this.credentialsFilePath);
      const content = await fs.readFile(this.credentialsFilePath, 'utf-8');
      const config = JSON.parse(content);

      // Validate required fields
      if (!config.ACCESS_TOKEN || !config.REFRESH_TOKEN || !config.EMAIL || !config.API_BASE_URL) {
        throw new Error('Invalid credentials file: missing required fields (ACCESS_TOKEN, REFRESH_TOKEN, EMAIL, API_BASE_URL)');
      }

      this.cachedConfig = config;
      return config;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error(`Credentials file not found at ${this.credentialsFilePath}. Please create it with required fields.`);
      }
      throw new Error(`Failed to load configuration: ${error.message}`);
    }
  }

  /**
   * Get cached config or load if not cached
   */
  async getConfig(): Promise<Config> {
    if (this.cachedConfig) {
      return this.cachedConfig;
    }
    return await this.loadConfig();
  }

  /**
   * Save configuration to the file
   */
  async saveConfig(config: Config): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.credentialsFilePath);
      await fs.mkdir(dir, { recursive: true });

      // Write configuration with nice formatting
      await fs.writeFile(
        this.credentialsFilePath,
        JSON.stringify(config, null, 2),
        'utf-8'
      );

      this.cachedConfig = config;
      console.error(`[Credentials] Successfully saved configuration to ${this.credentialsFilePath}`);
    } catch (error: any) {
      throw new Error(`Failed to save configuration: ${error.message}`);
    }
  }

  /**
   * Update tokens in the credentials file
   */
  async updateTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      // Load existing configuration
      const config = await this.getConfig();

      // Update tokens
      config.ACCESS_TOKEN = accessToken;
      config.REFRESH_TOKEN = refreshToken;

      // Save back to file
      await this.saveConfig(config);

      console.error('[Credentials] Successfully updated tokens');
    } catch (error: any) {
      throw new Error(`Failed to update tokens: ${error.message}`);
    }
  }

  /**
   * Get the credentials file path
   */
  getCredentialsFilePath(): string {
    return this.credentialsFilePath;
  }
}
