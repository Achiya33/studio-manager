import express from 'express';
import { syncUser, updateUserProfile } from '../controllers/userController.js';

const router = express.Router();

// Route to sync user from Firebase to MongoDB
router.post('/sync', syncUser);

// Route to update user profile (setup)
router.put('/:uid', updateUserProfile);

export default router;
