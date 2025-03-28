import { Router } from 'express';
import * as rpmBlockController from '../controllers/rpmBlockController';

const router = Router();

// GET all RPM blocks
router.get('/', rpmBlockController.getAllRPMBlocks);

// GET RPM block by ID
router.get('/:id', rpmBlockController.getRPMBlockById);

// POST create new RPM block
router.post('/', rpmBlockController.createRPMBlock);

// PUT update RPM block
router.put('/:id', rpmBlockController.updateRPMBlock);

// DELETE RPM block
router.delete('/:id', rpmBlockController.deleteRPMBlock);

export default router; 