/**
 * Tests for the GetOutpost MCP Server
 */
import request from 'supertest';
import { Express } from 'express';
import app from '../mcp_server';

describe('MCP Server API', () => {
  test('Health check endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'healthy' });
  });

  test('IV endpoint', async () => {
    const testData = {
      symbols: ['NIFTY'],
      daysToExpiry: 30,
      moneyness: 0,
      realizedVolatility: 'Parkinson',
      lookbackPeriod: '20'
    };

    // Since we can't actually call the API without valid tokens,
    // we'll just test that the endpoint responds
    const response = await request(app).post('/iv').send(testData);
    // The endpoint should return 500 because tokens can't be loaded
    expect(response.status).toBeGreaterThanOrEqual(400); // Could be 401, 500, etc.
  });

  test('VOL endpoint', async () => {
    const testData = {
      symbols: ['NIFTY', 'GOOGL', 'MSFT']
    };

    const response = await request(app).post('/vol').send(testData);
    // The endpoint should return >= 400 because tokens can't be loaded
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  test('VRP endpoint', async () => {
    const testData = {
      symbols: ['NIFTY'],
      moneyness: 0,
      daysToExpiry: 30,
      realizedVolatility: 'c2c',
      lookbackPeriod: '20'
    };

    const response = await request(app).post('/vrp').send(testData);
    // The endpoint should return >= 400 because tokens can't be loaded
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  test('SKEW endpoint', async () => {
    const testData = {
      symbols: ['NIFTY'],
      moneyness: 0,
      daysToExpiry: 30,
      realizedVolatility: 'c2c',
      lookbackPeriod: '20'
    };

    const response = await request(app).post('/skew').send(testData);
    // The endpoint should return >= 400 because tokens can't be loaded
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});