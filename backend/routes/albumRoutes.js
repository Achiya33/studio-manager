import express from 'express';
import { verifyToken, verifyStudioMember } from '../middleware/auth.js';
import { getAlbums, createAlbum, updateAlbum, deleteAlbum } from '../controllers/albumController.js';

const router = express.Router();

// All album routes require authentication
router.get('/studio/:studioId', verifyToken, verifyStudioMember(), getAlbums);
router.post('/', verifyToken, verifyStudioMember(), createAlbum);
router.put('/:id', verifyToken, updateAlbum);
router.delete('/:id', verifyToken, deleteAlbum);

export default router;
