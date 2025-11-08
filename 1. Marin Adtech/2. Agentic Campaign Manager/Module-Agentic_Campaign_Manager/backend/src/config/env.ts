import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  googleAdsClientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
  googleAdsClientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
  googleAdsRefreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
  googleAdsDeveloperToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
  googleAdsCustomerId: process.env.GOOGLE_ADS_CUSTOMER_ID || '',
};

// Validate required environment variables (for production)
if (process.env.NODE_ENV === 'production') {
  const requiredVars = ['OPENAI_API_KEY'];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missingVars.join(', ')}`);
  }
}

export default config;

