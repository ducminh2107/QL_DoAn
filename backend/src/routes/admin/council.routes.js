const express = require('express');
const router = express.Router();
const councilController = require('../../controllers/council.controller');
const { protect, authorize } = require('../../middleware/auth');

router.use(protect);

router.get('/', councilController.getAllCouncils);
router.get('/:id', councilController.getCouncilById);

// Admin only routes
router.use(authorize('admin'));
router.post('/', councilController.createCouncil);
router.put('/:id', councilController.updateCouncil);
router.delete('/:id', councilController.deleteCouncil);

module.exports = router;
