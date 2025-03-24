const express = require('express');
const router = express.Router();
const rpmBlockController = require('../controllers/rpmBlockController');

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

module.exports = router;
