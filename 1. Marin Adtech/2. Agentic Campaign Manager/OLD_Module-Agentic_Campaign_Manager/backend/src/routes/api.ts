import { Router } from 'express';
import campaignRoutes from './campaigns';
import chatRoutes from './chat';
import authRoutes from './auth';
import aiRoutes from './ai';
import productsRoutes from './products';

/**
 * API Router
 * Main router for all API endpoints
 */
const router = Router();

// API root endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Agentic Campaign Manager API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      campaigns: '/api/campaigns',
      chat: '/api/chat',
      auth: '/api/auth',
      ai: '/api/ai',
      products: '/api/products',
    },
  });
});

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
router.use('/products', productsRoutes);

export default router;

