/**
 * Test file for client API
 */
import { APIManager } from '../api/client';

describe('APIManager', () => {
  let apiManager: APIManager;

  beforeEach(() => {
    apiManager = new APIManager('test@example.com');
  });

  it('should initialize correctly', () => {
    expect(apiManager).toBeDefined();
  });

  // Add more tests as needed
});