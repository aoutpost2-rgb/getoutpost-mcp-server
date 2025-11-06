"""
Tests for the GetOutpost MCP Server
"""
import pytest
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from mcp_server import app
import json


client = TestClient(app)

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


@pytest.mark.asyncio
async def test_iv_endpoint():
    """Test the IV endpoint"""
    test_data = {
        "symbols": ["NIFTY"],
        "daysToExpiry": 30,
        "moneyness": 0,
        "realizedVolatility": "Parkinson",
        "lookbackPeriod": "20"
    }
    
    with patch('api.client.APIManager.iv') as mock_iv:
        mock_iv.return_value = {"test": "data"}
        response = client.post("/iv", json=test_data)
        assert response.status_code == 200
        assert response.json() == {"test": "data"}


@pytest.mark.asyncio
async def test_vol_endpoint():
    """Test the VOL endpoint"""
    test_data = {
        "symbols": ["NIFTY", "GOOGL", "MSFT"]
    }
    
    with patch('api.client.APIManager.vol') as mock_vol:
        mock_vol.return_value = {"test": "data"}
        response = client.post("/vol", json=test_data)
        assert response.status_code == 200
        assert response.json() == {"test": "data"}


@pytest.mark.asyncio
async def test_vrp_endpoint():
    """Test the VRP endpoint"""
    test_data = {
        "symbols": ["NIFTY"],
        "moneyness": 0,
        "daysToExpiry": 30,
        "realizedVolatility": "c2c",
        "lookbackPeriod": "20"
    }
    
    with patch('api.client.APIManager.vrp') as mock_vrp:
        mock_vrp.return_value = {"test": "data"}
        response = client.post("/vrp", json=test_data)
        assert response.status_code == 200
        assert response.json() == {"test": "data"}


@pytest.mark.asyncio
async def test_skew_endpoint():
    """Test the SKEW endpoint"""
    test_data = {
        "symbols": ["NIFTY"],
        "moneyness": 0,
        "daysToExpiry": 30,
        "realizedVolatility": "c2c",
        "lookbackPeriod": "20"
    }
    
    with patch('api.client.APIManager.skew') as mock_skew:
        mock_skew.return_value = {"test": "data"}
        response = client.post("/skew", json=test_data)
        assert response.status_code == 200
        assert response.json() == {"test": "data"}


def test_api_error_handling():
    """Test error handling in API endpoints"""
    test_data = {
        "symbols": ["NIFTY"]
    }
    
    with patch('api.client.APIManager.iv') as mock_iv:
        mock_iv.side_effect = Exception("API Error")
        response = client.post("/iv", json=test_data)
        assert response.status_code == 500
        assert "API Error" in response.json()["detail"]