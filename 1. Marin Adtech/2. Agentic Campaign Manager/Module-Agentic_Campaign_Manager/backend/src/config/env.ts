import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  openaiApiKey: process.env.OPENAI_API_KEY !== undefined ? process.env.OPENAI_API_KEY : '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY !== undefined ? process.env.ANTHROPIC_API_KEY : '',
  googleAdsClientId: process.env.GOOGLE_ADS_CLIENT_ID !== undefined ? process.env.GOOGLE_ADS_CLIENT_ID : '',
  googleAdsClientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET !== undefined ? process.env.GOOGLE_ADS_CLIENT_SECRET : '',
  googleAdsRefreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN !== undefined ? process.env.GOOGLE_ADS_REFRESH_TOKEN : '',
  googleAdsDeveloperToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN !== undefined ? process.env.GOOGLE_ADS_DEVELOPER_TOKEN : '',
  googleAdsCustomerId: process.env.GOOGLE_ADS_CUSTOMER_ID !== undefined ? process.env.GOOGLE_ADS_CUSTOMER_ID : '',
  metaAppId: process.env.META_APP_ID !== undefined ? process.env.META_APP_ID : '',
  metaAppSecret: process.env.META_APP_SECRET !== undefined ? process.env.META_APP_SECRET : '',
  microsoftAdsClientId: process.env.MICROSOFT_ADS_CLIENT_ID !== undefined ? process.env.MICROSOFT_ADS_CLIENT_ID : '',
  microsoftAdsClientSecret: process.env.MICROSOFT_ADS_CLIENT_SECRET !== undefined ? process.env.MICROSOFT_ADS_CLIENT_SECRET : '',
  marinDispatcher: {
    // Use DISPATCHER_URL from environment (InfraDocs pattern - set by CloudFormation in Lambda)
    // Fallback to MARIN_DISPATCHER_BASE_URL for local development
    baseUrl: process.env.DISPATCHER_URL !== undefined ? process.env.DISPATCHER_URL : (process.env.MARIN_DISPATCHER_BASE_URL !== undefined ? process.env.MARIN_DISPATCHER_BASE_URL : ''),
    accountId: process.env.MARIN_DISPATCHER_ACCOUNT_ID !== undefined ? process.env.MARIN_DISPATCHER_ACCOUNT_ID : '',
    publisher: process.env.MARIN_DISPATCHER_PUBLISHER !== undefined ? process.env.MARIN_DISPATCHER_PUBLISHER : 'google',
    timeout: parseInt(process.env.MARIN_DISPATCHER_TIMEOUT || '10000', 10),
  },
};

// Validate required environment variables (for production)
if (process.env.NODE_ENV === 'production') {
  const requiredVars = ['OPENAI_API_KEY'];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missingVars.join(', ')}`);
  }
}

// Validate Marin Dispatcher configuration
if (!config.marinDispatcher.baseUrl && process.env.NODE_ENV === 'production') {
  console.warn('Warning: DISPATCHER_URL or MARIN_DISPATCHER_BASE_URL must be set for Marin Dispatcher integration');
}

// TypeScript types for config structure
export interface MarinDispatcherConfig {
  baseUrl: string;
  accountId: string;
  publisher: string;
  timeout: number;
}

export interface Config {
  port: number;
  corsOrigin: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  googleAdsClientId: string;
  googleAdsClientSecret: string;
  googleAdsRefreshToken: string;
  googleAdsDeveloperToken: string;
  googleAdsCustomerId: string;
  metaAppId: string;
  metaAppSecret: string;
  microsoftAdsClientId: string;
  microsoftAdsClientSecret: string;
  marinDispatcher: MarinDispatcherConfig;
}

export default config;

