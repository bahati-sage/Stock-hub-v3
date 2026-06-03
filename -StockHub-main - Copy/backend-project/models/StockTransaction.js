const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
  },
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Warehouse is required'],
  },
  transactionDate: {
    type: Date,
    required: [true, 'Transaction date is required'],
  },
  quantityMoved: {
    type: Number,
    required: [true, 'Quantity moved is required'],
    min: [1, 'Quantity must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be an integer',
    },
  },
  transactionType: {
    type: String,
    required: true,
    enum: {
      values: ['Stock In', 'Stock Out'],
      message: 'Transaction type must be Stock In or Stock Out',
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);
