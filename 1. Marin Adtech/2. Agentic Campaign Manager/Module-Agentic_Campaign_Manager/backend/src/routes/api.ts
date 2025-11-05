import { Router } from 'express';
import campaignRoutes from './campaigns';
import chatRoutes from './chat';
import authRoutes from './auth';
import aiRoutes from './ai';
<<<<<<< HEAD
import productsRoutes from './products';
=======
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314

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
<<<<<<< HEAD
      products: '/api/products',
=======
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314
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
<<<<<<< HEAD
router.use('/products', productsRoutes);
=======
>>>>>>> c75a29246aa4d3b02efa0ae3553d6040d682d314

export default router;

