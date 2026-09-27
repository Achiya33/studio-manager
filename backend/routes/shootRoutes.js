import express from 'express';
import { verifyToken, verifyStudioMember } from '../middleware/auth.js';
import { getShoots, createShoot, updateShoot, deleteShoot } from '../controllers/shootController.js';

const router = express.Router();

// All shoot routes require authentication
router.get('/studio/:studioId', verifyToken, verifyStudioMember(), getShoots);
router.post('/', verifyToken, verifyStudioMember(), createShoot);
router.put('/:id', verifyToken, updateShoot);
router.delete('/:id', verifyToken, deleteShoot);

export default router;
