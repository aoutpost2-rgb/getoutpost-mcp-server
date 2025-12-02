# Privacy Policy for GetOutpost MCP Server

**Last Updated:** December 2, 2025

## Overview

The GetOutpost MCP Server is a local client application that connects Claude Desktop to GetOutpost.in's financial data APIs. This privacy policy explains how the extension handles data.

## Data Collection and Storage

**We do not collect, store, or transmit any user data to our servers.**

The GetOutpost MCP Server:
- Does not operate any backend servers that collect user information
- Does not track, log, or monitor your usage
- Does not store any financial data or API responses
- Does not share any information with third parties (other than GetOutpost.in as described below)

## Local Credential Storage

User credentials (access token, refresh token, and email address) are stored **locally on your device** in a credentials file that you create and manage. The location of this file is:

- Default: `~/.getoutpost_credentials.json` in your home directory
- Or a custom path you specify via the `CREDENTIALS_FILE_PATH` configuration

**Important:**
- These credentials remain on your device only
- We never have access to your credentials
- You have full control over this file and can delete it at any time
- The extension automatically updates this file when tokens are refreshed

## Third-Party Service Connection

This extension connects directly to **GetOutpost.in** to retrieve financial market data. All API communication occurs between:

1. Your device (running the MCP server)
2. GetOutpost.in servers

**What data is sent to GetOutpost.in:**
- Your access token for authentication
- API requests for financial data (implied volatility, realized volatility, etc.)
- Symbol names and query parameters you specify

**Data handling by GetOutpost.in:**
- GetOutpost.in receives your API requests and returns financial market data in response
- GetOutpost.in may log API requests for service operation, debugging, and security purposes
- Your GetOutpost.in account credentials and data handling are governed by your agreement with GetOutpost.in
- For questions about how GetOutpost.in handles your data, please contact them at [https://getoutpost.in](https://getoutpost.in)

## Data Transmission Security

- All communication with GetOutpost.in uses HTTPS encryption
- Credentials are transmitted securely using industry-standard TLS encryption
- No man-in-the-middle services intercept your API requests

## Automatic Token Refresh

The extension automatically refreshes your access token when it expires. This process:
- Uses your refresh token to obtain a new access token from GetOutpost.in
- Updates your local credentials file with the new tokens
- Occurs entirely between your device and GetOutpost.in servers

## User Rights and Control

You have complete control over your data:
- **Access:** Your credentials file is readable by you at any time
- **Deletion:** You can delete your credentials file and uninstall the extension at any time
- **Portability:** Your credentials are stored in standard JSON format
- **Modification:** You can manually edit your credentials file if needed

## Children's Privacy

This service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children.

## Changes to This Policy

We may update this privacy policy from time to time. The "Last Updated" date at the top of this document indicates when the policy was last revised. Continued use of the extension after changes constitutes acceptance of the updated policy.

## Open Source

This MCP server is open source. You can review the complete source code to verify these privacy practices at:
[https://github.com/aoutpost2-rgb/mcp-server](https://github.com/aoutpost2-rgb/mcp-server)

## Contact

If you have questions or concerns about this privacy policy or data handling practices, please:
- Open an issue on GitHub: [https://github.com/aoutpost2-rgb/mcp-server/issues](https://github.com/aoutpost2-rgb/mcp-server/issues)
- Contact the GetOutpost team at: developers@getoutpost.in

## Summary

In simple terms:
- ✅ Your credentials stay on your device
- ✅ We don't collect or store any user data
- ✅ The extension acts as a passthrough between Claude and GetOutpost.in
- ✅ All data handling by GetOutpost.in follows their policies
- ✅ You maintain full control over your credentials and data
