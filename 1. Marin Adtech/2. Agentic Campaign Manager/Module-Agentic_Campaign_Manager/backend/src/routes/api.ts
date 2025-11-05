import { Router } from 'express';
import campaignRoutes from './campaigns';
import chatRoutes from './chat';
import authRoutes from './auth';
import aiRoutes from './ai';

/**
 * API Router
 * Main router for all API endpoints
 */
const router = Router();

// API health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/campaigns', campaignRoutes);
router.use('/chat', chatRoutes);
router.use('/auth', authRoutes);
router.use('/ai', aiRoutes);

export default router;

