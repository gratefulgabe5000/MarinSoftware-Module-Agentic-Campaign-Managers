import { Router } from 'express';
import { AIController } from '../controllers/aiController';

/**
 * AI Routes
 * Handles AI-related API endpoints
 */
const router = Router();
const aiController = new AIController();

// AI endpoints
router.post('/understand-goal', aiController.understandGoal);
router.post('/clarifying-questions', aiController.generateClarifyingQuestions);

export default router;

