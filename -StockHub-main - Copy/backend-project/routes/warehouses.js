const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const auth = require('../middleware/auth');
const { warehouseValidation } = require('../middleware/validate');

router.post('/', auth, warehouseValidation, warehouseController.create);
router.get('/', auth, warehouseController.getAll);
router.get('/:id', auth, warehouseController.getOne);
router.put('/:id', auth, warehouseValidation, warehouseController.update);
router.delete('/:id', auth, warehouseController.delete);

module.exports = router;
