import express from 'express';
import { getShoots, createShoot, updateShoot, deleteShoot } from '../controllers/shootController.js';

const router = express.Router();

router.get('/studio/:studioId', getShoots);
router.post('/', createShoot);
router.put('/:id', updateShoot);
router.delete('/:id', deleteShoot);

export default router;
