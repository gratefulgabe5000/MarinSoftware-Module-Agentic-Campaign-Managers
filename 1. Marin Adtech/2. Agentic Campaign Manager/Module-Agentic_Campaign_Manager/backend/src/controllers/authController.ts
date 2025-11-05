import { Request, Response } from 'express';
import { oauthService } from '../services/oauthService';
import config from '../config/env';

/**
 * Auth Controller
 * Handles OAuth authentication endpoints
 */
export class AuthController {
  /**
   * Get authorization URL for Google Ads
   * GET /api/auth/google/authorize
   */
  authorizeGoogle = async (req: Request, res: Response): Promise<void> => {
    try {
      const redirectUri = req.query.redirect_uri as string || `${config.corsOrigin}/auth/callback/google`;
      
      const authUrl = oauthService.generateGoogleAuthUrl(redirectUri);
      
      res.json({
        authUrl,
        platform: 'google',
      });
    } catch (error) {
      console.error('Error in authorizeGoogle:', error);
      res.status(500).json({
        error: 'Failed to generate authorization URL',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Handle Google OAuth callback
   * GET /api/auth/google/callback
   */
  callbackGoogle = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, state, error } = req.query;

      if (error) {
        res.redirect(`${config.corsOrigin}/auth/error?error=${encodeURIComponent(error as string)}`);
        return;
      }

      if (!code || !state) {
        res.redirect(`${config.corsOrigin}/auth/error?error=${encodeURIComponent('Missing code or state')}`);
        return;
      }

      // Validate state
      const oauthState = oauthService.validateState(state as string);
      if (!oauthState) {
        res.redirect(`${config.corsOrigin}/auth/error?error=${encodeURIComponent('Invalid or expired state')}`);
        return;
      }

      // Exchange code for token
      const token = await oauthService.exchangeGoogleCode(code as string, oauthState.redirectUri);
      
      // Store token
      oauthService.storeToken('google', token);

      // Redirect to success page
      res.redirect(`${config.corsOrigin}/auth/success?platform=google`);
    } catch (error) {
      console.error('Error in callbackGoogle:', error);
      res.redirect(
        `${config.corsOrigin}/auth/error?error=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`
      );
    }
  };

  /**
   * Get authorization URL for Meta Ads
   * GET /api/auth/meta/authorize
   */
  authorizeMeta = async (req: Request, res: Response): Promise<void> => {
    try {
      const redirectUri = req.query.redirect_uri as string || `${config.corsOrigin}/auth/callback/meta`;
      
      const authUrl = oauthService.generateMetaAuthUrl(redirectUri);
      
      res.json({
        authUrl,
        platform: 'meta',
      });
    } catch (error) {
      console.error('Error in authorizeMeta:', error);
      res.status(500).json({
        error: 'Failed to generate authorization URL',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Handle Meta OAuth callback
   * GET /api/auth/meta/callback
   */
  callbackMeta = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, state, error } = req.query;

      if (error) {
        res.redirect(`${config.corsOrigin}/auth/error?error=${encodeURIComponent(error as string)}`);
        return;
      }

      if (!code || !state) {
        res.redirect(`${config.corsOrigin}/auth/error?error=${encodeURIComponent('Missing code or state')}`);
        return;
      }

      // Validate state
      const oauthState = oauthService.validateState(state as string);
      if (!oauthState) {
        res.redirect(`${config.corsOrigin}/auth/error?error=${encodeURIComponent('Invalid or expired state')}`);
        return;
      }

      // Exchange code for token
      const token = await oauthService.exchangeMetaCode(code as string, oauthState.redirectUri);
      
      // Store token
      oauthService.storeToken('meta', token);

      // Redirect to success page
      res.redirect(`${config.corsOrigin}/auth/success?platform=meta`);
    } catch (error) {
      console.error('Error in callbackMeta:', error);
      res.redirect(
        `${config.corsOrigin}/auth/error?error=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`
      );
    }
  };

  /**
   * Get authorization URL for Microsoft Ads
   * GET /api/auth/microsoft/authorize
   */
  authorizeMicrosoft = async (req: Request, res: Response): Promise<void> => {
    try {
      const redirectUri = req.query.redirect_uri as string || `${config.corsOrigin}/auth/callback/microsoft`;
      
      const authUrl = oauthService.generateMicrosoftAuthUrl(redirectUri);
      
      res.json({
        authUrl,
        platform: 'microsoft',
      });
    } catch (error) {
      console.error('Error in authorizeMicrosoft:', error);
      res.status(500).json({
        error: 'Failed to generate authorization URL',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Handle Microsoft OAuth callback
   * GET /api/auth/microsoft/callback
   */
  callbackMicrosoft = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, state, error } = req.query;

      if (error) {
        res.redirect(`${config.corsOrigin}/auth/error?error=${encodeURIComponent(error as string)}`);
        return;
      }

      if (!code || !state) {
        res.redirect(`${config.corsOrigin}/auth/error?error=${encodeURIComponent('Missing code or state')}`);
        return;
      }

      // Validate state
      const oauthState = oauthService.validateState(state as string);
      if (!oauthState) {
        res.redirect(`${config.corsOrigin}/auth/error?error=${encodeURIComponent('Invalid or expired state')}`);
        return;
      }

      // Exchange code for token
      const token = await oauthService.exchangeMicrosoftCode(code as string, oauthState.redirectUri);
      
      // Store token
      oauthService.storeToken('microsoft', token);

      // Redirect to success page
      res.redirect(`${config.corsOrigin}/auth/success?platform=microsoft`);
    } catch (error) {
      console.error('Error in callbackMicrosoft:', error);
      res.redirect(
        `${config.corsOrigin}/auth/error?error=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`
      );
    }
  };

  /**
   * Get connection status
   * GET /api/auth/status
   */
  getConnectionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const platform = req.query.platform as string;

      if (!platform) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'Platform is required',
        });
        return;
      }

      const token = oauthService.getToken(platform);
      const isConnected = token !== null && !oauthService.isTokenExpired(token);

      res.json({
        platform,
        connected: isConnected,
        hasToken: token !== null,
        tokenExpired: token ? oauthService.isTokenExpired(token) : false,
      });
    } catch (error) {
      console.error('Error in getConnectionStatus:', error);
      res.status(500).json({
        error: 'Failed to get connection status',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
<<<<<<< HEAD

  /**
   * Get Google Ads OAuth connection status
   * GET /api/auth/google/status
   */
  getGoogleStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = oauthService.getToken('google');
      const isConnected = token !== null && !oauthService.isTokenExpired(token);

      res.json({
        platform: 'google',
        connected: isConnected,
        hasToken: token !== null,
        tokenExpired: token ? oauthService.isTokenExpired(token) : false,
        expiresAt: token?.expiresAt || null,
      });
    } catch (error) {
      console.error('Error in getGoogleStatus:', error);
      res.status(500).json({
        error: 'Failed to get Google Ads connection status',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Disconnect Google Ads OAuth
   * POST /api/auth/google/disconnect
   */
  disconnectGoogle = async (req: Request, res: Response): Promise<void> => {
    try {
      // Remove token from storage
      oauthService.removeToken('google');

      res.json({
        platform: 'google',
        disconnected: true,
        message: 'Google Ads OAuth connection disconnected successfully',
      });
    } catch (error) {
      console.error('Error in disconnectGoogle:', error);
      res.status(500).json({
        error: 'Failed to disconnect Google Ads',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
=======
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314
}
