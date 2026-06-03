const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');
const { transactionValidation } = require('../middleware/validate');

router.post('/', auth, transactionValidation, transactionController.create);
router.get('/', auth, transactionController.getAll);
router.get('/:id', auth, transactionController.getOne);
router.put('/:id', auth, transactionValidation, transactionController.update);
router.delete('/:id', auth, transactionController.delete);

module.exports = router;
