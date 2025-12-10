import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { resetAlbums } from '../models/album.js';

describe('Albums API', () => {
  // Reset albums before each test to ensure clean state
  beforeEach(() => {
    resetAlbums();
  });

  describe('GET /albums', () => {
    it('should return all albums', async () => {
      const response = await request(app).get('/albums');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(6);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('artist');
      expect(response.body[0]).toHaveProperty('price');
      expect(response.body[0]).toHaveProperty('image_url');
    });

    it('should return albums with correct data', async () => {
      const response = await request(app).get('/albums');
      
      expect(response.body[0].title).toBe('You, Me and an App Id');
      expect(response.body[0].artist).toBe('Daprize');
      expect(response.body[0].price).toBe(10.99);
    });
  });

  describe('GET /albums/:id', () => {
    it('should return a specific album by ID', async () => {
      const response = await request(app).get('/albums/1');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.title).toBe('You, Me and an App Id');
    });

    it('should return 404 for non-existent album', async () => {
      const response = await request(app).get('/albums/999');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Album not found');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app).get('/albums/invalid');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid album ID');
    });
  });

  describe('POST /albums', () => {
    it('should create a new album', async () => {
      const newAlbum = {
        title: 'Test Album',
        artist: 'Test Artist',
        price: 9.99,
        image_url: 'https://example.com/image.jpg'
      };

      const response = await request(app)
        .post('/albums')
        .send(newAlbum);
      
      expect(response.status).toBe(201);
      expect(response.body.id).toBe(7);
      expect(response.body.title).toBe('Test Album');
      expect(response.body.artist).toBe('Test Artist');
      expect(response.body.price).toBe(9.99);
      expect(response.body.image_url).toBe('https://example.com/image.jpg');
    });

    it('should return 400 when missing required fields', async () => {
      const incompleteAlbum = {
        title: 'Test Album'
      };

      const response = await request(app)
        .post('/albums')
        .send(incompleteAlbum);
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 400 for negative price', async () => {
      const albumWithNegativePrice = {
        title: 'Test Album',
        artist: 'Test Artist',
        price: -5,
        image_url: 'https://example.com/image.jpg'
      };

      const response = await request(app)
        .post('/albums')
        .send(albumWithNegativePrice);
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Price must be a positive number');
    });
  });

  describe('PUT /albums/:id', () => {
    it('should update an existing album', async () => {
      const updateData = {
        title: 'Updated Title',
        price: 19.99
      };

      const response = await request(app)
        .put('/albums/1')
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(1);
      expect(response.body.title).toBe('Updated Title');
      expect(response.body.price).toBe(19.99);
      expect(response.body.artist).toBe('Daprize'); // Unchanged
    });

    it('should return 404 for non-existent album', async () => {
      const response = await request(app)
        .put('/albums/999')
        .send({ title: 'Updated Title' });
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Album not found');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .put('/albums/invalid')
        .send({ title: 'Updated Title' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid album ID');
    });

    it('should return 400 for negative price', async () => {
      const response = await request(app)
        .put('/albums/1')
        .send({ price: -10 });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Price must be a positive number');
    });
  });

  describe('DELETE /albums/:id', () => {
    it('should delete an existing album', async () => {
      const response = await request(app).delete('/albums/1');
      
      expect(response.status).toBe(204);

      // Verify album is deleted
      const getResponse = await request(app).get('/albums/1');
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent album', async () => {
      const response = await request(app).delete('/albums/999');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Album not found');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app).delete('/albums/invalid');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid album ID');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });
});
