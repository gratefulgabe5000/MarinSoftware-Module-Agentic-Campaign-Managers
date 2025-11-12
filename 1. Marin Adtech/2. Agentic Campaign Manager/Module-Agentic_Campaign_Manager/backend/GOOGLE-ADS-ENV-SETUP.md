# Google Ads API Environment Variables Setup

## Required Environment Variables

Add the following variables to your `.env` file in the `backend` directory:

```env
# Google Ads API Credentials
GOOGLE_ADS_CLIENT_ID=your-client-id-here
GOOGLE_ADS_CLIENT_SECRET=your-client-secret-here
GOOGLE_ADS_REFRESH_TOKEN=your-refresh-token-here
GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token-here
GOOGLE_ADS_CUSTOMER_ID=your-customer-id-here
```

## Variable Descriptions

### GOOGLE_ADS_CLIENT_ID
- **Description**: OAuth 2.0 Client ID from Google Cloud Console
- **Where to get it**: Google Cloud Console → APIs & Services → Credentials
- **Format**: Usually a long string like `123456789-abcdefghijklmnop.apps.googleusercontent.com`

### GOOGLE_ADS_CLIENT_SECRET
- **Description**: OAuth 2.0 Client Secret from Google Cloud Console
- **Where to get it**: Google Cloud Console → APIs & Services → Credentials (same page as Client ID)
- **Format**: Usually a string like `GOCSPX-abcdefghijklmnopqrstuvwxyz`

### GOOGLE_ADS_REFRESH_TOKEN
- **Description**: OAuth 2.0 Refresh Token (obtained through OAuth flow)
- **How to get it**: 
  1. Complete OAuth 2.0 authorization flow
  2. Exchange authorization code for refresh token
  3. Use Google OAuth Playground or implement OAuth flow
- **Format**: A long string token

### GOOGLE_ADS_DEVELOPER_TOKEN
- **Description**: Google Ads API Developer Token
- **Where to get it**: Google Ads → Tools & Settings → API Center
- **Note**: Must be approved by Google (can take several days)
- **Format**: Usually a string like `abcdefghijklmnop`

### GOOGLE_ADS_CUSTOMER_ID
- **Description**: Google Ads Customer ID (also called Account ID)
- **Where to get it**: Google Ads → Account Settings
- **Format**: Usually 10 digits like `1234567890` (no dashes)
- **Note**: Use the account ID without dashes (e.g., `1234567890` not `123-456-7890`)

## How to Obtain These Credentials

### Step 1: Create OAuth 2.0 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application** as the application type
6. Add authorized redirect URIs (e.g., `http://localhost:3001/oauth/callback`)
7. Copy the **Client ID** and **Client Secret**

### Step 2: Enable Google Ads API
1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google Ads API"
3. Click **Enable**

### Step 3: Get Developer Token
1. Go to [Google Ads](https://ads.google.com/)
2. Navigate to **Tools & Settings** → **API Center**
3. Apply for a Developer Token (if not already approved)
4. Copy the Developer Token once approved

### Step 4: Get Refresh Token
1. Use [Google OAuth Playground](https://developers.google.com/oauthplayground/)
2. Select **Google Ads API** scope: `https://www.googleapis.com/auth/adwords`
3. Authorize and get the refresh token
4. Or implement OAuth flow in your application

### Step 5: Get Customer ID
1. Go to [Google Ads](https://ads.google.com/)
2. Navigate to **Account Settings**
3. Copy the **Customer ID** (10-digit number, no dashes)

## Example .env File

```env
# Google Ads API Credentials
GOOGLE_ADS_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_ADS_REFRESH_TOKEN=1//0abcdefghijklmnopqrstuvwxyz-abcdefghijklmnopqrstuvwxyz
GOOGLE_ADS_DEVELOPER_TOKEN=abcdefghijklmnop
GOOGLE_ADS_CUSTOMER_ID=1234567890
```

## Important Notes

1. **Developer Token Approval**: Developer tokens must be approved by Google, which can take several days. Until approved, you can only use test accounts.

2. **Test vs Production**: 
   - Test accounts: Can use without approved developer token
   - Production accounts: Require approved developer token

3. **Security**: 
   - Never commit `.env` file to version control
   - Keep credentials secure
   - Rotate credentials if compromised

4. **Mock Mode**: If credentials are not configured, the service will automatically fall back to mock mode (for testing purposes).

## Verification

After adding the credentials:
1. Restart the backend server
2. Check backend logs for initialization messages
3. Try syncing campaigns - should use real Google Ads API instead of mock data
4. Campaigns should NOT have MOCK badges (if using real API)

## Troubleshooting

### "Client not initialized" warning
- Check that all 5 environment variables are set
- Verify values are correct (no extra spaces, quotes, etc.)
- Restart backend server after adding variables

### "Invalid credentials" error
- Verify Client ID and Secret are correct
- Check that Refresh Token is valid and not expired
- Ensure Developer Token is approved (if using production account)

### "Customer ID not found" error
- Verify Customer ID is correct (10 digits, no dashes)
- Ensure the account has access to the Google Ads API

