import express from 'express';
import { getPackages, createPackage, updatePackage, deletePackage } from '../controllers/packageController.js';

const router = express.Router();

router.get('/studio/:studioId', getPackages);
router.post('/', createPackage);
router.put('/:id', updatePackage);
router.delete('/:id', deletePackage);

export default router;
