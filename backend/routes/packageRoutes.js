import express from 'express';
import { verifyToken, verifyStudioMember } from '../middleware/auth.js';
import { getPackages, createPackage, updatePackage, deletePackage } from '../controllers/packageController.js';

const router = express.Router();

// All package routes require authentication
router.get('/studio/:studioId', verifyToken, verifyStudioMember(), getPackages);
router.post('/', verifyToken, verifyStudioMember(), createPackage);
router.put('/:id', verifyToken, updatePackage);
router.delete('/:id', verifyToken, deletePackage);

export default router;
