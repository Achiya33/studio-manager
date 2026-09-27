import express from 'express';
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

router.post('/', createStudio);
router.get('/my-studios/:uid', getUserStudios);
router.get('/:id', getStudioById);
router.put('/:id', updateStudio);
router.post('/:id/members', addStudioMember);
router.delete('/:id/members/:uid', removeStudioMember);
router.get('/:id/members', getStudioMembers);

export default router;
