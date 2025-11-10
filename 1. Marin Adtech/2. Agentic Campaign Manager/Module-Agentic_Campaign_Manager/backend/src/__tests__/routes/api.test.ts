import request from 'supertest';
import express from 'express';
import apiRoutes from '../../routes/api';

const app = express();
app.use(express.json());
app.use('/api', apiRoutes);

describe('API Routes', () => {
  describe('GET /api/health', () => {
    it('should return API health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('message', 'API is running');
    });
  });

  describe('Campaign routes', () => {
    it('should handle GET /api/campaigns', async () => {
      const response = await request(app).get('/api/campaigns');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('campaigns');
    });

    it('should handle GET /api/campaigns/:id', async () => {
      const response = await request(app).get('/api/campaigns/test-id');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'test-id');
    });

    it('should handle POST /api/campaigns', async () => {
      const response = await request(app).post('/api/campaigns');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('Chat routes', () => {
    it('should handle POST /api/chat/message', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .send({ message: 'Test message' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Test message');
    });

    it('should handle GET /api/chat/history', async () => {
      const response = await request(app).get('/api/chat/history');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('history');
    });
  });

  describe('Auth routes', () => {
    it('should handle GET /api/auth/google/authorize', async () => {
      const response = await request(app).get('/api/auth/google/authorize');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('authUrl');
    });

    it('should handle GET /api/auth/status', async () => {
      const response = await request(app).get('/api/auth/status?platform=google');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('platform')
      expect(response.body).toHaveProperty('connected');
    });
  });
});


