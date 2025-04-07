import express from 'express';
import {
  getRpmBlocks,
  getRpmBlockById,
  createRpmBlock,
  updateRpmBlock,
  deleteRpmBlock
} from '../controllers/rpmBlockController';

const router = express.Router();

// GET all RPM blocks
router.get('/', getRpmBlocks);

// GET RPM block by ID
router.get('/:id', getRpmBlockById);

// POST create new RPM block
router.post('/', createRpmBlock);

// PUT update RPM block
router.put('/:id', updateRpmBlock);

// DELETE RPM block
router.delete('/:id', deleteRpmBlock);

export default router; 