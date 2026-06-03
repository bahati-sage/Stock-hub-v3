const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array().map((e) => e.msg).join(', '),
    });
  }
  next();
};

const registerValidation = [
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const productValidation = [
  body('productCode').trim().notEmpty().withMessage('Product code is required'),
  body('productName').trim().notEmpty().withMessage('Product name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('quantityInStock').isInt({ min: 0 }).withMessage('Quantity in stock must be a non-negative integer'),
  body('unitPrice').isFloat({ min: 0.01 }).withMessage('Unit price must be a positive decimal number'),
  body('supplierName').trim().notEmpty().withMessage('Supplier name is required'),
  body('dateReceived').isISO8601().withMessage('Date received must be a valid date (YYYY-MM-DD)'),
  body('warehouseId').isMongoId().withMessage('Warehouse ID must be a valid MongoDB ObjectId'),
  handleValidationErrors,
];

const warehouseValidation = [
  body('warehouseCode').trim().notEmpty().withMessage('Warehouse code is required'),
  body('warehouseName').trim().notEmpty().withMessage('Warehouse name is required'),
  body('warehouseLocation').trim().notEmpty().withMessage('Warehouse location is required'),
  handleValidationErrors,
];

const transactionValidation = [
  body('productId').isMongoId().withMessage('Product ID must be a valid MongoDB ObjectId'),
  body('warehouseId').isMongoId().withMessage('Warehouse ID must be a valid MongoDB ObjectId'),
  body('transactionDate').isISO8601().withMessage('Transaction date must be a valid date (YYYY-MM-DD)'),
  body('quantityMoved').isInt({ min: 1 }).withMessage('Quantity moved must be a positive integer'),
  body('transactionType').isIn(['Stock In', 'Stock Out']).withMessage('Transaction type must be either "Stock In" or "Stock Out"'),
  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  productValidation,
  warehouseValidation,
  transactionValidation,
};
