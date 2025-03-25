const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

// GET all roles or roles for a specific category
router.get('/', roleController.getAllRoles);

// GET role by ID
router.get('/:id', roleController.getRoleById);

// POST create new role
router.post('/', roleController.createRole);

// PUT update role
router.put('/:id', roleController.updateRole);

// DELETE role
router.delete('/:id', roleController.deleteRole);

module.exports = router; 