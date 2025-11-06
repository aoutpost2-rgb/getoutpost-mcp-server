/**
 * Tests for the API client functionality
 */
import { APIManager } from '../api/client';
import { TokenManager } from '../auth/tokens';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Create a mock adapter for axios
const mockAxios = new MockAdapter(axios);

// Mock TokenManager to avoid file system operations
jest.mock('../auth/tokens');
const MockTokenManager = jest.mocked(TokenManager);

describe('API Client', () => {
  let apiManager: APIManager;
  let mockTokenManager: jest.Mocked<TokenManager>;

  beforeEach(() => {
    mockTokenManager = new TokenManager() as jest.Mocked<TokenManager>;
    apiManager = new APIManager('test@example.com');
    apiManager.tokenManager = mockTokenManager;
    
    // Reset the mock adapter
    mockAxios.reset();
  });

  test('IV method', async () => {
    const testData = {
      symbols: ['NIFTY'],
      daysToExpiry: 30,
      moneyness: 0,
      realizedVolatility: 'Parkinson',
      lookbackPeriod: '20'
    };
    
    const expectedResponse = { data: 'iv_result' };
    
    // Mock token manager methods
    mockTokenManager.loadTokens.mockResolvedValue(true);
    mockTokenManager.getAccessToken.mockReturnValue('test_token');
    
    // Mock axios response
    mockAxios.onPost('https://getoutpost.in/__api__/data/iv').reply(200, expectedResponse);
    
    const result = await apiManager.iv(testData);
    
    expect(result).toEqual(expectedResponse);
    expect(mockTokenManager.loadTokens).toHaveBeenCalled();
    expect(mockTokenManager.getAccessToken).toHaveBeenCalled();
    expect(mockAxios.history.post.length).toBe(1);
    expect(mockAxios.history.post[0].data).toBe(JSON.stringify(testData));
  });

  test('VOL method', async () => {
    const testData = { symbols: ['NIFTY', 'GOOGL', 'MSFT'] };
    const expectedResponse = { data: 'vol_result' };
    
    // Mock token manager methods
    mockTokenManager.loadTokens.mockResolvedValue(true);
    mockTokenManager.getAccessToken.mockReturnValue('test_token');
    
    // Mock axios response
    mockAxios.onPost('https://getoutpost.in/__api__/data/vol').reply(200, expectedResponse);
    
    const result = await apiManager.vol(testData);
    
    expect(result).toEqual(expectedResponse);
  });

  test('VRP method', async () => {
    const testData = {
      symbols: ['NIFTY'],
      moneyness: 0,
      daysToExpiry: 30,
      realizedVolatility: 'c2c',
      lookbackPeriod: '20'
    };
    const expectedResponse = { data: 'vrp_result' };
    
    // Mock token manager methods
    mockTokenManager.loadTokens.mockResolvedValue(true);
    mockTokenManager.getAccessToken.mockReturnValue('test_token');
    
    // Mock axios response
    mockAxios.onPost('https://getoutpost.in/__api__/data/vrp').reply(200, expectedResponse);
    
    const result = await apiManager.vrp(testData);
    
    expect(result).toEqual(expectedResponse);
  });

  test('SKEW method', async () => {
    const testData = {
      symbols: ['NIFTY'],
      moneyness: 0,
      daysToExpiry: 30,
      realizedVolatility: 'c2c',
      lookbackPeriod: '20'
    };
    const expectedResponse = { data: 'skew_result' };
    
    // Mock token manager methods
    mockTokenManager.loadTokens.mockResolvedValue(true);
    mockTokenManager.getAccessToken.mockReturnValue('test_token');
    
    // Mock axios response
    mockAxios.onPost('https://getoutpost.in/__api__/data/skew').reply(200, expectedResponse);
    
    const result = await apiManager.skew(testData);
    
    expect(result).toEqual(expectedResponse);
  });

  test('Make request with auth retry', async () => {
    const testData = { symbols: ['NIFTY'] };
    const expectedResponse = { data: 'success_after_retry' };
    
    // Mock token manager methods
    mockTokenManager.loadTokens.mockResolvedValue(true);
    mockTokenManager.getAccessToken.mockReturnValue('old_token');
    mockTokenManager.refreshTokens.mockResolvedValue(true);
    
    // After refresh, the token manager should return a new token
    mockTokenManager.getAccessToken.mockImplementation(() => 'new_token');
    
    // Mock first call to return 401, second to return success
    mockAxios
      .onPost('https://getoutpost.in/__api__/data/iv')
      .replyOnce(401, { error: 'Unauthorized' }) // First call
      .onPost('https://getoutpost.in/__api__/data/iv')
      .replyOnce(200, expectedResponse); // Second call with new token
    
    // Since _makeRequest is private, we'll call iv which uses it
    // The retry mechanism should handle the 401 and succeed on retry
    const result = await apiManager.iv(testData);
    expect(result).toEqual(expectedResponse);
    expect(mockTokenManager.refreshTokens).toHaveBeenCalled();
  });
});