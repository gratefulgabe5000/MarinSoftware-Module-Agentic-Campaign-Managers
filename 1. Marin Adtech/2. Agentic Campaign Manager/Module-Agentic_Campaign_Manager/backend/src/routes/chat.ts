import { Router } from 'express';
import { ChatController } from '../controllers/chatController';

/**
 * Chat Routes
 * Handles conversational interface API endpoints
 */
const router = Router();
const chatController = new ChatController();

// Chat endpoints
router.post('/message', chatController.sendMessage);
router.get('/history', chatController.getChatHistory);
router.delete('/history', chatController.clearChatHistory);

export default router;

