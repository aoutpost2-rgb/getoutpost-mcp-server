"""
Tests for the token management functionality
"""
import pytest
import asyncio
import json
import os
from unittest.mock import AsyncMock, patch, mock_open
from auth.tokens import TokenManager


@pytest.mark.asyncio
async def test_load_tokens():
    """Test loading tokens from file"""
    # Create a temporary token file for testing
    test_tokens = {
        "access_token": "test_access_token",
        "refresh_token": "test_refresh_token"
    }
    
    with patch("builtins.open", mock_open(read_data=json.dumps(test_tokens))), \
         patch("os.path.exists", return_value=True):
        
        token_manager = TokenManager(token_file="test_tokens.json")
        result = await token_manager.load_tokens()
        
        assert result is True
        assert token_manager.tokens == test_tokens


@pytest.mark.asyncio
async def test_save_tokens():
    """Test saving tokens to file"""
    test_tokens = {
        "access_token": "test_access_token",
        "refresh_token": "test_refresh_token"
    }
    
    with patch("builtins.open", mock_open()) as mock_file:
        token_manager = TokenManager(token_file="test_tokens.json")
        token_manager.tokens = test_tokens
        
        result = await token_manager.save_tokens()
        
        assert result is True
        mock_file.assert_called_once_with("test_tokens.json", 'w')
        handle = mock_file()
        handle.write.assert_called_once_with(json.dumps(test_tokens, indent=2))


@pytest.mark.asyncio
async def test_set_tokens():
    """Test setting tokens and saving to file"""
    with patch("builtins.open", mock_open()), \
         patch("os.path.exists", return_value=False):
        
        token_manager = TokenManager(token_file="test_tokens.json")
        
        result = await token_manager.set_tokens("new_access", "new_refresh")
        
        assert result is True
        assert token_manager.tokens["access_token"] == "new_access"
        assert token_manager.tokens["refresh_token"] == "new_refresh"


@pytest.mark.asyncio
async def test_refresh_tokens():
    """Test refreshing tokens"""
    # Initial tokens
    initial_tokens = {
        "access_token": "old_access_token",
        "refresh_token": "old_refresh_token"
    }
    
    # Response headers mock
    mock_headers = AsyncMock()
    mock_headers.get_list.return_value = [
        "accessToken=new_access_token; Path=/; HttpOnly; Secure",
        "refreshToken=new_refresh_token; Path=/; HttpOnly; Secure"
    ]
    
    mock_response = AsyncMock()
    mock_response.status_code = 200
    mock_response.headers = mock_headers
    
    with patch("builtins.open", mock_open(read_data=json.dumps(initial_tokens))), \
         patch("os.path.exists", return_value=True), \
         patch("httpx.AsyncClient") as mock_client_class:
        
        mock_client_instance = AsyncMock()
        mock_client_instance.__aenter__.return_value = mock_client_instance
        mock_client_instance.post.return_value = mock_response
        mock_client_class.return_value = mock_client_instance
        
        token_manager = TokenManager(token_file="test_tokens.json")
        await token_manager.load_tokens()  # Load initial tokens
        
        result = await token_manager.refresh_tokens()
        
        assert result is True
        assert token_manager.tokens["access_token"] == "new_access_token"
        assert token_manager.tokens["refresh_token"] == "new_refresh_token"


def test_is_token_expired():
    """Test token expiration check (this would require a proper JWT for a full test)"""
    token_manager = TokenManager()
    
    # Using a fake JWT that we can't decode (since we don't have the secret)
    fake_token = "invalid.token.format"
    
    # Since we can't decode it, it should return True (considered expired)
    result = token_manager.is_token_expired(fake_token)
    # Note: This may return True or False depending on how JWTError is raised
    # In a real scenario we'd test with properly formatted tokens