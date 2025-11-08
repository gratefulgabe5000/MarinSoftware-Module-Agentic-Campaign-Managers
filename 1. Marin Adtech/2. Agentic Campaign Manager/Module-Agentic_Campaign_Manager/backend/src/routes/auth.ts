import { Router } from 'express';
import { AuthController } from '../controllers/authController';

/**
 * Auth Routes
 * Handles OAuth authentication endpoints
 */
const router = Router();
const authController = new AuthController();

// OAuth endpoints
router.get('/google/authorize', authController.authorizeGoogle);
router.get('/google/callback', authController.callbackGoogle);
router.get('/meta/authorize', authController.authorizeMeta);
router.get('/meta/callback', authController.callbackMeta);
router.get('/microsoft/authorize', authController.authorizeMicrosoft);
router.get('/microsoft/callback', authController.callbackMicrosoft);

// Connection status
router.get('/status', authController.getConnectionStatus);

// Google Ads specific endpoints
router.get('/google/status', authController.getGoogleStatus);
router.post('/google/disconnect', authController.disconnectGoogle);

export default router;

