import express from 'express';
import { getAlbums, createAlbum, updateAlbum, deleteAlbum } from '../controllers/albumController.js';

const router = express.Router();

router.get('/studio/:studioId', getAlbums);
router.post('/', createAlbum);
router.put('/:id', updateAlbum);
router.delete('/:id', deleteAlbum);

export default router;
