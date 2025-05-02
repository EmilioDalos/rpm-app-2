import { Router } from 'express';
import {
  getRpmBlockMassiveActions,
  getRpmBlockMassiveActionById,
  createMassiveAction,
  deleteRpmBlockMassiveAction,
  deleteRpmBlockMassiveActionByDate
} from '../controllers/massiveActionController';

const router = Router();

// Get all massive actions
router.get('/', getRpmBlockMassiveActions);

// Get a single massive action by ID
router.get('/:id', getRpmBlockMassiveActionById);

// Create a new massive action
router.post('/', createMassiveAction);

// Delete a massive action by id and date
router.delete('/:id/:date', deleteRpmBlockMassiveActionByDate);

// Delete a massive action
router.delete('/:id', deleteRpmBlockMassiveAction);

export default router; 