# GetOutpost MCP Server - Examples

## Setting up the server

### 1. Initialize tokens

First, you need to set up your tokens file with valid access and refresh tokens:

```bash
python utils/init_tokens.py
```

Then edit the `tokens.json` file with your actual tokens:

```json
{
  "access_token": "your_actual_access_token_here",
  "refresh_token": "your_actual_refresh_token_here"
}
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Start the server

```bash
python mcp_server.py
```

Or with uvicorn:

```bash
uvicorn mcp_server:app --host 0.0.0.0 --port 8000
```

## API Usage Examples

Once the server is running, you can make requests to the following endpoints:

### 1. Implied Volatility (IV) Endpoint

```bash
curl -X POST "http://localhost:8000/iv" \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["NIFTY"],
    "daysToExpiry": 30,
    "moneyness": 0,
    "realizedVolatility": "Parkinson",
    "lookbackPeriod": "20"
  }'
```

### 2. Volatility (VOL) Endpoint

```bash
curl -X POST "http://localhost:8000/vol" \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["NIFTY", "GOOGL", "MSFT"]
  }'
```

### 3. Volatility Risk Premium (VRP) Endpoint

```bash
curl -X POST "http://localhost:8000/vrp" \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["NIFTY"],
    "moneyness": 0,
    "daysToExpiry": 30,
    "realizedVolatility": "c2c",
    "lookbackPeriod": "20"
  }'
```

### 4. Skew Endpoint

```bash
curl -X POST "http://localhost:8000/skew" \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["NIFTY"],
    "moneyness": 0,
    "daysToExpiry": 30,
    "realizedVolatility": "c2c",
    "lookbackPeriod": "20"
  }'
```

## Python Client Example

You can also create a Python client to interact with the API:

```python
import requests
import json

# Base URL for your MCP server
BASE_URL = "http://localhost:8000"

def get_iv_data():
    url = f"{BASE_URL}/iv"
    payload = {
        "symbols": ["NIFTY"],
        "daysToExpiry": 30,
        "moneyness": 0,
        "realizedVolatility": "Parkinson",
        "lookbackPeriod": "20"
    }
    response = requests.post(url, json=payload)
    return response.json()

def get_vol_data():
    url = f"{BASE_URL}/vol"
    payload = {
        "symbols": ["NIFTY", "GOOGL", "MSFT"]
    }
    response = requests.post(url, json=payload)
    return response.json()

def get_vrp_data():
    url = f"{BASE_URL}/vrp"
    payload = {
        "symbols": ["NIFTY"],
        "moneyness": 0,
        "daysToExpiry": 30,
        "realizedVolatility": "c2c",
        "lookbackPeriod": "20"
    }
    response = requests.post(url, json=payload)
    return response.json()

def get_skew_data():
    url = f"{BASE_URL}/skew"
    payload = {
        "symbols": ["NIFTY"],
        "moneyness": 0,
        "daysToExpiry": 30,
        "realizedVolatility": "c2c",
        "lookbackPeriod": "20"
    }
    response = requests.post(url, json=payload)
    return response.json()

if __name__ == "__main__":
    # Example: Get IV data
    iv_data = get_iv_data()
    print("IV Data:", json.dumps(iv_data, indent=2))
```

## Environment Variables

You can customize the server behavior using environment variables:

- `EMAIL`: Your email address (default: ashwinbhskr@gmail.com)
- `PORT`: Port to run the server on (default: 8000)

Example:

```bash
export EMAIL=your_email@domain.com
export PORT=9000
python mcp_server.py
```

## Token Management

The server automatically handles token refresh when an API returns a 401 or 403 status code. The tokens are stored in `tokens.json` and will be refreshed using the refresh endpoint when needed. Make sure your refresh token is valid for this to work properly.

## Error Handling

The server handles various error conditions:

- Network errors during API requests
- Authentication errors (with automatic retry after token refresh)
- JSON parsing errors
- General exceptions

All errors are returned with appropriate HTTP status codes (typically 500 for server errors).