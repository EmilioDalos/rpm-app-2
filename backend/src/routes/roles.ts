import { Router } from 'express';
import * as roleController from '../controllers/roleController';

const router = Router();

// GET all roles
router.get('/', roleController.getRoles);

// GET role by ID
router.get('/:id', roleController.getRoleById);

// POST create new role
router.post('/', roleController.createRole);

// PUT update role
router.put('/:id', roleController.updateRole);

// DELETE role
router.delete('/:id', roleController.deleteRole);

export default router; 