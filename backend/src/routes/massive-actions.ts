import { Router } from 'express';
import {
  getRpmBlockMassiveActions,
  getRpmBlockMassiveActionById,
  //updateRpmBlockMassiveAction,
  deleteRpmBlockMassiveAction,
  deleteRpmBlockMassiveActionByDate
} from '../controllers/massiveActionController';

const router = Router();

// Get all massive actions
router.get('/', getRpmBlockMassiveActions);

// Get a single massive action by ID
router.get('/:id', getRpmBlockMassiveActionById);

// Update a massive action
//router.put('/:id', updateRpmBlockMassiveAction);

// Delete a massive action by id and date
router.delete('/:id/:date', deleteRpmBlockMassiveActionByDate);

// Delete a massive action
router.delete('/:id', deleteRpmBlockMassiveAction);

export default router; 