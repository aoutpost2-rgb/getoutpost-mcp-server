"""
Tests for the API client functionality
"""
import pytest
import asyncio
from unittest.mock import AsyncMock, patch
from api.client import APIManager


@pytest.mark.asyncio
async def test_iv_method():
    """Test the IV method"""
    test_data = {
        "symbols": ["NIFTY"],
        "daysToExpiry": 30,
        "moneyness": 0,
        "realizedVolatility": "Parkinson",
        "lookbackPeriod": "20"
    }
    
    expected_response = {"data": "iv_result"}
    
    with patch('auth.tokens.TokenManager.load_tokens', return_value=True), \
         patch('auth.tokens.TokenManager.get_access_token', return_value="test_token"), \
         patch('httpx.AsyncClient.post') as mock_post:
        
        mock_response = AsyncMock()
        mock_response.json.return_value = expected_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        api_manager = APIManager()
        result = await api_manager.iv(test_data)
        
        assert result == expected_response
        mock_post.assert_called_once()
        # Verify the call was made with correct parameters
        args, kwargs = mock_post.call_args
        assert kwargs['json'] == test_data
        assert 'iv' in args[0]  # URL contains 'iv'


@pytest.mark.asyncio
async def test_vol_method():
    """Test the VOL method"""
    test_data = {"symbols": ["NIFTY", "GOOGL", "MSFT"]}
    expected_response = {"data": "vol_result"}
    
    with patch('auth.tokens.TokenManager.load_tokens', return_value=True), \
         patch('auth.tokens.TokenManager.get_access_token', return_value="test_token"), \
         patch('httpx.AsyncClient.post') as mock_post:
        
        mock_response = AsyncMock()
        mock_response.json.return_value = expected_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        api_manager = APIManager()
        result = await api_manager.vol(test_data)
        
        assert result == expected_response


@pytest.mark.asyncio
async def test_vrp_method():
    """Test the VRP method"""
    test_data = {
        "symbols": ["NIFTY"],
        "moneyness": 0,
        "daysToExpiry": 30,
        "realizedVolatility": "c2c",
        "lookbackPeriod": "20"
    }
    expected_response = {"data": "vrp_result"}
    
    with patch('auth.tokens.TokenManager.load_tokens', return_value=True), \
         patch('auth.tokens.TokenManager.get_access_token', return_value="test_token"), \
         patch('httpx.AsyncClient.post') as mock_post:
        
        mock_response = AsyncMock()
        mock_response.json.return_value = expected_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        api_manager = APIManager()
        result = await api_manager.vrp(test_data)
        
        assert result == expected_response


@pytest.mark.asyncio
async def test_skew_method():
    """Test the SKEW method"""
    test_data = {
        "symbols": ["NIFTY"],
        "moneyness": 0,
        "daysToExpiry": 30,
        "realizedVolatility": "c2c",
        "lookbackPeriod": "20"
    }
    expected_response = {"data": "skew_result"}
    
    with patch('auth.tokens.TokenManager.load_tokens', return_value=True), \
         patch('auth.tokens.TokenManager.get_access_token', return_value="test_token"), \
         patch('httpx.AsyncClient.post') as mock_post:
        
        mock_response = AsyncMock()
        mock_response.json.return_value = expected_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        api_manager = APIManager()
        result = await api_manager.skew(test_data)
        
        assert result == expected_response


@pytest.mark.asyncio
async def test_make_request_with_auth_retry():
    """Test that the API client retries after authentication failure"""
    test_data = {"symbols": ["NIFTY"]}
    expected_response = {"data": "success_after_retry"}
    
    # Simulate first call returning 401, second call returning success
    with patch('auth.tokens.TokenManager.load_tokens', return_value=True), \
         patch('auth.tokens.TokenManager.get_access_token', side_effect=["old_token", "new_token"]), \
         patch('auth.tokens.TokenManager.refresh_tokens', return_value=True), \
         patch('httpx.AsyncClient.post') as mock_post:
        
        # Mock the first call to return 401, second to return success
        first_response = AsyncMock()
        first_response.status_code = 401
        first_response.text = "Unauthorized"
        
        second_response = AsyncMock()
        second_response.json.return_value = expected_response
        second_response.raise_for_status.return_value = None
        second_response.status_code = 200
        
        mock_post.side_effect = [first_response, second_response]
        
        api_manager = APIManager()
        result = await api_manager._make_request("iv", test_data)
        
        assert result == expected_response
        assert mock_post.call_count == 2  # Should have been called twice (retry)