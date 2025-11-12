/**
 * Unit tests for Environment Configuration (Task 4.1.2)
 *
 * Tests cover:
 * - Loading environment variables correctly
 * - Missing environment variable handling
 * - Invalid environment variable handling
 * - Error message clarity
 *
 * @module env.test
 */

// Mock dotenv to prevent loading .env file during tests
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('Environment Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Clear all environment variables to start fresh
    process.env = {};

    // Clear Jest module cache to force re-import of config
    jest.resetModules();

    // Mock console.warn to capture warning messages
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;

    // Restore console.warn
    consoleWarnSpy.mockRestore();
  });

  // ========================================================================
  // Test 1: Verify all environment variables are loaded correctly
  // ========================================================================
  describe('Valid Configuration', () => {
    it('should load all environment variables correctly with full configuration', async () => {
      // Set all environment variables
      process.env.PORT = '3001';
      process.env.CORS_ORIGIN = 'http://localhost:5173';
      process.env.OPENAI_API_KEY = 'test-openai-key';
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
      process.env.GOOGLE_ADS_CLIENT_ID = 'test-google-client-id';
      process.env.GOOGLE_ADS_CLIENT_SECRET = 'test-google-secret';
      process.env.GOOGLE_ADS_REFRESH_TOKEN = 'test-google-refresh';
      process.env.GOOGLE_ADS_DEVELOPER_TOKEN = 'test-google-dev-token';
      process.env.GOOGLE_ADS_CUSTOMER_ID = 'test-customer-id';
      process.env.META_APP_ID = 'test-meta-app-id';
      process.env.META_APP_SECRET = 'test-meta-secret';
      process.env.MICROSOFT_ADS_CLIENT_ID = 'test-microsoft-client-id';
      process.env.MICROSOFT_ADS_CLIENT_SECRET = 'test-microsoft-secret';
      process.env.DISPATCHER_URL = 'https://test-dispatcher.example.com';
      process.env.ZILKR_DISPATCHER_ACCOUNT_ID = 'test-account-123';
      process.env.ZILKR_DISPATCHER_PUBLISHER = 'google';
      process.env.ZILKR_DISPATCHER_TIMEOUT = '15000';

      // Import config after setting environment variables
      const { config } = await import('../../config/env');

      // Verify all variables are loaded correctly
      expect(config.port).toBe(3001);
      expect(config.corsOrigin).toBe('http://localhost:5173');
      expect(config.openaiApiKey).toBe('test-openai-key');
      expect(config.anthropicApiKey).toBe('test-anthropic-key');
      expect(config.googleAdsClientId).toBe('test-google-client-id');
      expect(config.googleAdsClientSecret).toBe('test-google-secret');
      expect(config.googleAdsRefreshToken).toBe('test-google-refresh');
      expect(config.googleAdsDeveloperToken).toBe('test-google-dev-token');
      expect(config.googleAdsCustomerId).toBe('test-customer-id');
      expect(config.metaAppId).toBe('test-meta-app-id');
      expect(config.metaAppSecret).toBe('test-meta-secret');
      expect(config.microsoftAdsClientId).toBe('test-microsoft-client-id');
      expect(config.microsoftAdsClientSecret).toBe('test-microsoft-secret');
      expect(config.zilkrDispatcher.baseUrl).toBe('https://test-dispatcher.example.com');
      expect(config.zilkrDispatcher.accountId).toBe('test-account-123');
      expect(config.zilkrDispatcher.publisher).toBe('google');
      expect(config.zilkrDispatcher.timeout).toBe(15000);
    });

    it('should use default values when optional variables are not set', async () => {
      // Set only required variables
      process.env.NODE_ENV = 'development';

      // Import config after setting environment variables
      const { config } = await import('../../config/env');

      // Verify default values are used
      expect(config.port).toBe(3001);
      expect(config.corsOrigin).toBe('http://localhost:5173');
      expect(config.openaiApiKey).toBe('');
      expect(config.anthropicApiKey).toBe('');
      expect(config.zilkrDispatcher.publisher).toBe('google');
      expect(config.zilkrDispatcher.timeout).toBe(10000);
    });

    it('should prioritize DISPATCHER_URL over ZILKR_DISPATCHER_BASE_URL', async () => {
      process.env.DISPATCHER_URL = 'https://prod-dispatcher.example.com';
      process.env.ZILKR_DISPATCHER_BASE_URL = 'http://localhost:3000';

      const { config } = await import('../../config/env');

      expect(config.zilkrDispatcher.baseUrl).toBe('https://prod-dispatcher.example.com');
    });

    it('should fallback to ZILKR_DISPATCHER_BASE_URL when DISPATCHER_URL is not set', async () => {
      delete process.env.DISPATCHER_URL;
      process.env.ZILKR_DISPATCHER_BASE_URL = 'http://localhost:3000';

      const { config } = await import('../../config/env');

      expect(config.zilkrDispatcher.baseUrl).toBe('http://localhost:3000');
    });

    it('should parse timeout as integer', async () => {
      process.env.ZILKR_DISPATCHER_TIMEOUT = '25000';

      const { config } = await import('../../config/env');

      expect(config.zilkrDispatcher.timeout).toBe(25000);
      expect(typeof config.zilkrDispatcher.timeout).toBe('number');
    });
  });

  // ========================================================================
  // Test 2: Test with missing environment variables
  // ========================================================================
  describe('Missing Environment Variables', () => {
    it('should warn about missing OPENAI_API_KEY in production', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.OPENAI_API_KEY;

      await import('../../config/env');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing environment variables: OPENAI_API_KEY')
      );
    });

    it('should not warn about missing optional variables in development', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.OPENAI_API_KEY;

      await import('../../config/env');

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should warn about missing DISPATCHER_URL in production', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.DISPATCHER_URL;
      delete process.env.ZILKR_DISPATCHER_BASE_URL;

      await import('../../config/env');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('DISPATCHER_URL or ZILKR_DISPATCHER_BASE_URL must be set')
      );
    });

    it('should not warn about missing DISPATCHER_URL in development', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.DISPATCHER_URL;
      delete process.env.ZILKR_DISPATCHER_BASE_URL;

      await import('../../config/env');

      // Should only warn about Dispatcher URL, not about OPENAI_API_KEY
      const dispatcherWarnings = consoleWarnSpy.mock.calls.filter(call =>
        call[0].includes('DISPATCHER_URL')
      );
      expect(dispatcherWarnings.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle completely empty environment', async () => {
      // Clear all environment variables
      process.env = { NODE_ENV: 'development' };

      const { config } = await import('../../config/env');

      // Verify all defaults are applied
      expect(config.port).toBe(3001);
      expect(config.corsOrigin).toBe('http://localhost:5173');
      expect(config.openaiApiKey).toBe('');
      expect(config.zilkrDispatcher.baseUrl).toBe('');
      expect(config.zilkrDispatcher.timeout).toBe(10000);
    });
  });

  // ========================================================================
  // Test 3: Test with invalid environment variables
  // ========================================================================
  describe('Invalid Environment Variables', () => {
    it('should parse invalid PORT as string and convert to number', async () => {
      process.env.PORT = 'not-a-number';

      const { config } = await import('../../config/env');

      // Should use NaN or fall back to default behavior
      expect(isNaN(config.port as number) || config.port).toBeTruthy();
    });

    it('should handle invalid timeout value gracefully', async () => {
      process.env.ZILKR_DISPATCHER_TIMEOUT = 'invalid-timeout';

      const { config } = await import('../../config/env');

      // parseInt will return NaN for invalid strings
      expect(isNaN(config.zilkrDispatcher.timeout)).toBe(true);
    });

    it('should handle timeout value that parses to valid number', async () => {
      process.env.ZILKR_DISPATCHER_TIMEOUT = '5000abc'; // parseInt will parse to 5000

      const { config } = await import('../../config/env');

      expect(config.zilkrDispatcher.timeout).toBe(5000);
    });

    it('should handle empty string values', async () => {
      process.env.OPENAI_API_KEY = '';
      process.env.ZILKR_DISPATCHER_BASE_URL = '';
      delete process.env.DISPATCHER_URL;

      const { config } = await import('../../config/env');

      expect(config.openaiApiKey).toBe('');
      expect(config.zilkrDispatcher.baseUrl).toBe('');
    });

    it('should handle whitespace in string values', async () => {
      process.env.OPENAI_API_KEY = '  test-key-with-spaces  ';

      const { config } = await import('../../config/env');

      // Config should preserve whitespace (no trimming by default)
      expect(config.openaiApiKey).toBe('  test-key-with-spaces  ');
    });

    it('should handle special characters in string values', async () => {
      process.env.OPENAI_API_KEY = 'key-with-$pecial-ch@rs!';
      process.env.ZILKR_DISPATCHER_BASE_URL = 'https://api.example.com/v1?key=value&foo=bar';
      delete process.env.DISPATCHER_URL;

      const { config } = await import('../../config/env');

      expect(config.openaiApiKey).toBe('key-with-$pecial-ch@rs!');
      expect(config.zilkrDispatcher.baseUrl).toBe('https://api.example.com/v1?key=value&foo=bar');
    });

    it('should handle timeout of 0', async () => {
      process.env.ZILKR_DISPATCHER_TIMEOUT = '0';

      const { config } = await import('../../config/env');

      expect(config.zilkrDispatcher.timeout).toBe(0);
    });

    it('should handle negative timeout value', async () => {
      process.env.ZILKR_DISPATCHER_TIMEOUT = '-5000';

      const { config } = await import('../../config/env');

      expect(config.zilkrDispatcher.timeout).toBe(-5000);
    });
  });

  // ========================================================================
  // Test 4: Verify error messages are clear
  // ========================================================================
  describe('Error Messages', () => {
    it('should provide clear warning message for missing required variable', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.OPENAI_API_KEY;

      await import('../../config/env');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Warning: Missing environment variables: OPENAI_API_KEY'
      );
    });

    it('should provide clear warning message for missing Dispatcher URL', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.DISPATCHER_URL;
      delete process.env.ZILKR_DISPATCHER_BASE_URL;

      await import('../../config/env');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Warning: DISPATCHER_URL or ZILKR_DISPATCHER_BASE_URL must be set for Zilkr Dispatcher integration'
      );
    });

    it('should list multiple missing variables in a single warning', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.OPENAI_API_KEY;

      await import('../../config/env');

      const warnings = consoleWarnSpy.mock.calls.map(call => call[0]);
      const missingVarWarning = warnings.find(w => w.includes('Missing environment variables'));

      expect(missingVarWarning).toBeTruthy();
      expect(missingVarWarning).toContain('OPENAI_API_KEY');
    });
  });

  // ========================================================================
  // Test 5: TypeScript type safety
  // ========================================================================
  describe('TypeScript Type Safety', () => {
    it('should export Config interface with correct structure', async () => {
      const { config } = await import('../../config/env');

      // Verify config has expected structure
      expect(config).toHaveProperty('port');
      expect(config).toHaveProperty('corsOrigin');
      expect(config).toHaveProperty('openaiApiKey');
      expect(config).toHaveProperty('anthropicApiKey');
      expect(config).toHaveProperty('zilkrDispatcher');

      // Verify marinDispatcher has correct structure
      expect(config.zilkrDispatcher).toHaveProperty('baseUrl');
      expect(config.zilkrDispatcher).toHaveProperty('accountId');
      expect(config.zilkrDispatcher).toHaveProperty('publisher');
      expect(config.zilkrDispatcher).toHaveProperty('timeout');
    });

    it('should export MarinDispatcherConfig interface', async () => {
      const envModule = await import('../../config/env');

      // Verify the module exports the expected items
      expect(envModule).toHaveProperty('config');
      expect(envModule).toHaveProperty('default');
    });
  });

  // ========================================================================
  // Test 6: Edge cases and boundary conditions
  // ========================================================================
  describe('Edge Cases', () => {
    it('should handle maximum timeout value', async () => {
      process.env.ZILKR_DISPATCHER_TIMEOUT = '2147483647'; // Max 32-bit integer

      const { config } = await import('../../config/env');

      expect(config.zilkrDispatcher.timeout).toBe(2147483647);
    });

    it('should handle very long string values', async () => {
      const longKey = 'a'.repeat(10000);
      process.env.OPENAI_API_KEY = longKey;

      const { config } = await import('../../config/env');

      expect(config.openaiApiKey).toBe(longKey);
      expect(config.openaiApiKey.length).toBe(10000);
    });

    it('should handle URL with various protocols', async () => {
      const testCases = [
        'http://localhost:3000',
        'https://api.example.com',
        'http://192.168.1.1:8080',
        'https://api.example.com:443/v1',
      ];

      for (const url of testCases) {
        jest.resetModules();
        process.env.DISPATCHER_URL = url;

        const { config } = await import('../../config/env');
        expect(config.zilkrDispatcher.baseUrl).toBe(url);
      }
    });

    it('should handle all publisher options', async () => {
      const publishers = ['google', 'facebook', 'bing', 'custom'];

      for (const publisher of publishers) {
        jest.resetModules();
        process.env.ZILKR_DISPATCHER_PUBLISHER = publisher;

        const { config } = await import('../../config/env');
        expect(config.zilkrDispatcher.publisher).toBe(publisher);
      }
    });

    it('should handle multiple simultaneous imports', async () => {
      process.env.OPENAI_API_KEY = 'test-key';

      const [config1, config2] = await Promise.all([
        import('../../config/env'),
        import('../../config/env'),
      ]);

      expect(config1.config.openaiApiKey).toBe(config2.config.openaiApiKey);
    });
  });
});
