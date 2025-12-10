import { Router, Request, Response, Router as IRouter } from 'express';
import {
  getAllAlbums,
  getAlbumById,
  addAlbum,
  updateAlbum,
  deleteAlbum,
  Album
} from '../models/album.js';

const router: IRouter = Router();

// GET /albums - List all albums
router.get('/', (_req: Request, res: Response) => {
  const albums = getAllAlbums();
  res.json(albums);
});

// GET /albums/:id - Get album by ID
router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid album ID' });
    return;
  }
  
  const album = getAlbumById(id);
  
  if (!album) {
    res.status(404).json({ error: 'Album not found' });
    return;
  }
  
  res.json(album);
});

// POST /albums - Add a new album
router.post('/', (req: Request, res: Response) => {
  const { title, artist, price, image_url } = req.body;
  
  // Validation
  if (!title || !artist || price === undefined || !image_url) {
    res.status(400).json({ 
      error: 'Missing required fields: title, artist, price, and image_url are required' 
    });
    return;
  }
  
  if (typeof price !== 'number' || price < 0) {
    res.status(400).json({ error: 'Price must be a positive number' });
    return;
  }
  
  const newAlbum = addAlbum({ title, artist, price, image_url });
  res.status(201).json(newAlbum);
});

// PUT /albums/:id - Update an existing album
router.put('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid album ID' });
    return;
  }
  
  const { title, artist, price, image_url } = req.body;
  
  // Validate price if provided
  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    res.status(400).json({ error: 'Price must be a positive number' });
    return;
  }
  
  const updateData: Partial<Omit<Album, 'id'>> = {};
  if (title !== undefined) updateData.title = title;
  if (artist !== undefined) updateData.artist = artist;
  if (price !== undefined) updateData.price = price;
  if (image_url !== undefined) updateData.image_url = image_url;
  
  const updatedAlbum = updateAlbum(id, updateData);
  
  if (!updatedAlbum) {
    res.status(404).json({ error: 'Album not found' });
    return;
  }
  
  res.json(updatedAlbum);
});

// DELETE /albums/:id - Delete an album
router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid album ID' });
    return;
  }
  
  const deleted = deleteAlbum(id);
  
  if (!deleted) {
    res.status(404).json({ error: 'Album not found' });
    return;
  }
  
  res.status(204).send();
});

export default router;
