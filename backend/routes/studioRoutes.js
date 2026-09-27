import express from 'express';
import { verifyToken, verifyStudioMember } from '../middleware/auth.js';
import {
  createStudio,
  getUserStudios,
  getStudioById,
  updateStudio,
  addStudioMember,
  removeStudioMember,
  getStudioMembers
} from '../controllers/studioController.js';

const router = express.Router();

// All studio routes require authentication
router.post('/', verifyToken, createStudio);
router.get('/my-studios/:uid', verifyToken, getUserStudios);
router.get('/:id', verifyToken, verifyStudioMember(), getStudioById);
router.put('/:id', verifyToken, verifyStudioMember('admin'), updateStudio);

// Member management — admin only
router.post('/:id/members', verifyToken, verifyStudioMember('admin'), addStudioMember);
router.delete('/:id/members/:uid', verifyToken, verifyStudioMember('admin'), removeStudioMember);
router.get('/:id/members', verifyToken, verifyStudioMember(), getStudioMembers);

export default router;
