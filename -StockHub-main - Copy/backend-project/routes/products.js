const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const { productValidation } = require('../middleware/validate');

router.post('/', auth, productValidation, productController.create);
router.get('/', auth, productController.getAll);
router.get('/low-stock', auth, productController.getLowStock);
router.get('/:id', auth, productController.getOne);
router.put('/:id', auth, productValidation, productController.update);
router.delete('/:id', auth, productController.delete);
router.patch('/:id/stock', auth, productController.updateStock);

module.exports = router;
