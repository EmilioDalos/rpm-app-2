import { Router } from 'express';
import { createBlock } from '../controllers/blockController';

const router = Router();

// Create a new block
router.post('/', createBlock);

export default router;
