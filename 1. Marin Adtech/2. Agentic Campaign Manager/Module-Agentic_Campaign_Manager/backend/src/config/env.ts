import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
<<<<<<< HEAD
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  googleAdsClientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
  googleAdsClientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
  googleAdsRefreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
  googleAdsDeveloperToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
  googleAdsCustomerId: process.env.GOOGLE_ADS_CUSTOMER_ID || '',
=======
  googleAdsClientId: process.env.GOOGLE_ADS_CLIENT_ID || '',
  googleAdsClientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314
  metaAppId: process.env.META_APP_ID || '',
  metaAppSecret: process.env.META_APP_SECRET || '',
  microsoftAdsClientId: process.env.MICROSOFT_ADS_CLIENT_ID || '',
  microsoftAdsClientSecret: process.env.MICROSOFT_ADS_CLIENT_SECRET || '',
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

