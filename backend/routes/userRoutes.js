import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { syncUser, updateUserProfile } from '../controllers/userController.js';

const router = express.Router();

// Route to sync user from Firebase to MongoDB
// This must be authenticated — only the logged-in user can sync their own data
router.post('/sync', verifyToken, syncUser);

// Route to update user profile
// Authenticated — users can only update their own profile
router.put('/:uid', verifyToken, updateUserProfile);

export default router;
