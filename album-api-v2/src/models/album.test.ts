import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllAlbums,
  getAlbumById,
  addAlbum,
  updateAlbum,
  deleteAlbum,
  resetAlbums,
  Album
} from './album.js';

describe('Album Model', () => {
  beforeEach(() => {
    resetAlbums();
  });

  describe('getAllAlbums', () => {
    it('should return all albums', () => {
      const albums = getAllAlbums();
      expect(albums).toHaveLength(6);
    });

    it('should return a copy of albums array (immutability)', () => {
      const albums1 = getAllAlbums();
      const albums2 = getAllAlbums();
      expect(albums1).not.toBe(albums2);
      expect(albums1).toEqual(albums2);
    });

    it('should not allow modification of original data through returned array', () => {
      const albums = getAllAlbums();
      albums[0].title = 'Modified Title';
      
      const freshAlbums = getAllAlbums();
      expect(freshAlbums[0].title).toBe('You, Me and an App Id');
    });
  });

  describe('getAlbumById', () => {
    it('should return the correct album by ID', () => {
      const album = getAlbumById(1);
      expect(album).toBeDefined();
      expect(album?.id).toBe(1);
      expect(album?.title).toBe('You, Me and an App Id');
    });

    it('should return undefined for non-existent ID', () => {
      const album = getAlbumById(999);
      expect(album).toBeUndefined();
    });

    it('should return undefined for ID 0', () => {
      const album = getAlbumById(0);
      expect(album).toBeUndefined();
    });

    it('should return undefined for negative ID', () => {
      const album = getAlbumById(-1);
      expect(album).toBeUndefined();
    });
  });

  describe('addAlbum', () => {
    it('should add a new album with auto-generated ID', () => {
      const newAlbum = {
        title: 'New Album',
        artist: 'New Artist',
        price: 9.99,
        image_url: 'https://example.com/image.jpg'
      };

      const added = addAlbum(newAlbum);
      
      expect(added.id).toBe(7);
      expect(added.title).toBe('New Album');
      expect(added.artist).toBe('New Artist');
      expect(added.price).toBe(9.99);
    });

    it('should increment ID based on highest existing ID', () => {
      addAlbum({
        title: 'Album 7',
        artist: 'Artist',
        price: 10,
        image_url: 'https://example.com/1.jpg'
      });

      const second = addAlbum({
        title: 'Album 8',
        artist: 'Artist',
        price: 10,
        image_url: 'https://example.com/2.jpg'
      });

      expect(second.id).toBe(8);
    });

    it('should persist the added album', () => {
      const newAlbum = {
        title: 'Persistent Album',
        artist: 'Artist',
        price: 15.99,
        image_url: 'https://example.com/image.jpg'
      };

      addAlbum(newAlbum);
      const allAlbums = getAllAlbums();
      
      expect(allAlbums).toHaveLength(7);
      expect(allAlbums[6].title).toBe('Persistent Album');
    });
  });

  describe('updateAlbum', () => {
    it('should update an existing album', () => {
      const updated = updateAlbum(1, { title: 'Updated Title' });
      
      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.artist).toBe('Daprize'); // Unchanged
    });

    it('should update multiple fields at once', () => {
      const updated = updateAlbum(1, {
        title: 'New Title',
        artist: 'New Artist',
        price: 99.99
      });

      expect(updated?.title).toBe('New Title');
      expect(updated?.artist).toBe('New Artist');
      expect(updated?.price).toBe(99.99);
      expect(updated?.image_url).toBe('https://aka.ms/albums-daprlogo'); // Unchanged
    });

    it('should return undefined for non-existent ID', () => {
      const updated = updateAlbum(999, { title: 'Updated' });
      expect(updated).toBeUndefined();
    });

    it('should persist updates', () => {
      updateAlbum(1, { title: 'Persisted Update' });
      
      const album = getAlbumById(1);
      expect(album?.title).toBe('Persisted Update');
    });

    it('should not change ID even if provided in update data', () => {
      const updated = updateAlbum(1, { title: 'Test' });
      expect(updated?.id).toBe(1);
    });
  });

  describe('deleteAlbum', () => {
    it('should delete an existing album', () => {
      const result = deleteAlbum(1);
      
      expect(result).toBe(true);
      expect(getAllAlbums()).toHaveLength(5);
    });

    it('should return false for non-existent ID', () => {
      const result = deleteAlbum(999);
      expect(result).toBe(false);
    });

    it('should actually remove the album', () => {
      deleteAlbum(1);
      
      const album = getAlbumById(1);
      expect(album).toBeUndefined();
    });

    it('should not affect other albums', () => {
      deleteAlbum(1);
      
      const album2 = getAlbumById(2);
      expect(album2).toBeDefined();
      expect(album2?.title).toBe('Seven Revision Army');
    });
  });

  describe('resetAlbums', () => {
    it('should reset albums to initial state after modifications', () => {
      addAlbum({
        title: 'Extra Album',
        artist: 'Artist',
        price: 10,
        image_url: 'https://example.com/image.jpg'
      });
      deleteAlbum(1);
      updateAlbum(2, { title: 'Modified' });

      resetAlbums();

      const albums = getAllAlbums();
      expect(albums).toHaveLength(6);
      expect(albums[0].title).toBe('You, Me and an App Id');
      expect(albums[1].title).toBe('Seven Revision Army');
    });
  });

  describe('Edge Cases', () => {
    it('should handle adding album after deleting all albums', () => {
      // Delete all albums
      for (let i = 1; i <= 6; i++) {
        deleteAlbum(i);
      }
      
      expect(getAllAlbums()).toHaveLength(0);

      const newAlbum = addAlbum({
        title: 'First After Delete',
        artist: 'Artist',
        price: 10,
        image_url: 'https://example.com/image.jpg'
      });

      // ID should be 1 since array is empty
      expect(newAlbum.id).toBe(1);
    });

    it('should handle special characters in album data', () => {
      const albumWithSpecialChars = addAlbum({
        title: "Rock 'n' Roll & Blues",
        artist: "Artist <script>alert('xss')</script>",
        price: 10.99,
        image_url: 'https://example.com/image.jpg?param=value&other=123'
      });

      const retrieved = getAlbumById(albumWithSpecialChars.id);
      expect(retrieved?.title).toBe("Rock 'n' Roll & Blues");
      expect(retrieved?.artist).toBe("Artist <script>alert('xss')</script>");
    });

    it('should handle price with many decimal places', () => {
      const album = addAlbum({
        title: 'Precise Price',
        artist: 'Artist',
        price: 10.999999999,
        image_url: 'https://example.com/image.jpg'
      });

      expect(album.price).toBe(10.999999999);
    });

    it('should handle empty string fields', () => {
      const album = addAlbum({
        title: '',
        artist: '',
        price: 0,
        image_url: ''
      });

      expect(album.title).toBe('');
      expect(album.artist).toBe('');
      expect(album.price).toBe(0);
    });
  });
});
