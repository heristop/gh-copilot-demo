import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app.js';

describe('Express App', () => {
  describe('GET /health', () => {
    it('should return status ok', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });

    it('should return JSON content type', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('Middleware', () => {
    it('should handle CORS', async () => {
      const response = await request(app)
        .options('/albums')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should parse JSON body', async () => {
      const testAlbum = {
        title: 'Test Album',
        artist: 'Test Artist',
        price: 9.99,
        image_url: 'https://example.com/image.jpg'
      };

      const response = await request(app)
        .post('/albums')
        .send(testAlbum)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(testAlbum);
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');
      expect(response.status).toBe(404);
    });
  });
});
