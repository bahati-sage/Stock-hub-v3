const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: [true, 'Product code is required'],
    unique: true,
    trim: true,
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  quantityInStock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Quantity cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be an integer',
    },
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0.01, 'Unit price must be greater than zero'],
  },
  supplierName: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
  },
  dateReceived: {
    type: Date,
    required: [true, 'Date received is required'],
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
