import express from 'express';
import {
  getRPMBlocks,
  getRPMBlockById,
  createRPMBlock,
  updateRPMBlock,
  deleteRPMBlock
} from '../controllers/rpmBlockController';

const router = express.Router();

// GET all RPM blocks
router.get('/', getRPMBlocks);

// GET RPM block by ID
router.get('/:id', getRPMBlockById);

// POST create new RPM block
router.post('/', createRPMBlock);

// PUT update RPM block
router.put('/:id', updateRPMBlock);

// DELETE RPM block
router.delete('/:id', deleteRPMBlock);

export default router; 