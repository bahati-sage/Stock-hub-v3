const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  warehouseCode: {
    type: String,
    required: [true, 'Warehouse code is required'],
    unique: true,
    trim: true,
  },
  warehouseName: {
    type: String,
    required: [true, 'Warehouse name is required'],
    trim: true,
  },
  warehouseLocation: {
    type: String,
    required: [true, 'Warehouse location is required'],
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', warehouseSchema);
