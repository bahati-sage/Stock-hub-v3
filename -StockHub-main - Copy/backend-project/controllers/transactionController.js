const StockTransaction = require('../models/StockTransaction');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');

const transactionController = {
  create: async (req, res, next) => {
    try {
      const { productId, warehouseId, transactionDate, quantityMoved, transactionType } = req.body;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }

      const warehouse = await Warehouse.findById(warehouseId);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: 'Warehouse not found.',
        });
      }

      if (new Date(transactionDate) < new Date(product.dateReceived)) {
        return res.status(400).json({
          success: false,
          message: 'Transaction date cannot be before the product received date.',
        });
      }

      if (transactionType === 'Stock Out') {
        if (product.quantityInStock < quantityMoved) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock. Available: ${product.quantityInStock}, requested: ${quantityMoved}.`,
          });
        }
      }

      const transaction = await StockTransaction.create({
        productId, warehouseId, transactionDate, quantityMoved, transactionType,
      });

      const newQuantity = transactionType === 'Stock In'
        ? product.quantityInStock + quantityMoved
        : product.quantityInStock - quantityMoved;

      product.quantityInStock = newQuantity;
      await product.save();

      const populated = await StockTransaction.findById(transaction._id)
        .populate('productId', 'productName productCode unitPrice')
        .populate('warehouseId', 'warehouseName warehouseCode');

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully.',
        data: populated,
      });
    } catch (error) {
      next(error);
    }
  },

  getAll: async (req, res, next) => {
    try {
      const transactions = await StockTransaction.find()
        .populate('productId', 'productName productCode unitPrice')
        .populate('warehouseId', 'warehouseName warehouseCode')
        .sort({ createdAt: -1 });
      const count = await StockTransaction.countDocuments();

      res.status(200).json({
        success: true,
        data: transactions,
        count,
      });
    } catch (error) {
      next(error);
    }
  },

  getOne: async (req, res, next) => {
    try {
      const transaction = await StockTransaction.findById(req.params.id)
        .populate('productId', 'productName productCode unitPrice')
        .populate('warehouseId', 'warehouseName warehouseCode');

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found.',
        });
      }

      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { productId, warehouseId, transactionDate, quantityMoved, transactionType } = req.body;

      const existingTransaction = await StockTransaction.findById(id);
      if (!existingTransaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found.',
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }

      const warehouse = await Warehouse.findById(warehouseId);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: 'Warehouse not found.',
        });
      }

      if (new Date(transactionDate) < new Date(product.dateReceived)) {
        return res.status(400).json({
          success: false,
          message: 'Transaction date cannot be before the product received date.',
        });
      }

      let adjustedQuantity = product.quantityInStock;

      if (existingTransaction.transactionType === 'Stock In') {
        adjustedQuantity -= existingTransaction.quantityMoved;
      } else {
        adjustedQuantity += existingTransaction.quantityMoved;
      }

      if (adjustedQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock adjustment would result in negative inventory.',
        });
      }

      if (transactionType === 'Stock Out' && adjustedQuantity < quantityMoved) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${adjustedQuantity}, requested: ${quantityMoved}.`,
        });
      }

      existingTransaction.productId = productId;
      existingTransaction.warehouseId = warehouseId;
      existingTransaction.transactionDate = transactionDate;
      existingTransaction.quantityMoved = quantityMoved;
      existingTransaction.transactionType = transactionType;
      await existingTransaction.save();

      let newQuantity = adjustedQuantity;
      if (transactionType === 'Stock In') {
        newQuantity += quantityMoved;
      } else {
        newQuantity -= quantityMoved;
      }

      product.quantityInStock = newQuantity;
      await product.save();

      const updated = await StockTransaction.findById(id)
        .populate('productId', 'productName productCode unitPrice')
        .populate('warehouseId', 'warehouseName warehouseCode');

      res.status(200).json({
        success: true,
        message: 'Transaction updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;

      const transaction = await StockTransaction.findById(id);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found.',
        });
      }

      const product = await Product.findById(transaction.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Associated product not found.',
        });
      }

      let newQuantity = product.quantityInStock;
      if (transaction.transactionType === 'Stock In') {
        newQuantity -= transaction.quantityMoved;
      } else {
        newQuantity += transaction.quantityMoved;
      }

      if (newQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete transaction. It would result in negative stock.',
        });
      }

      await StockTransaction.deleteOne({ _id: id });

      product.quantityInStock = newQuantity;
      await product.save();

      res.status(200).json({
        success: true,
        message: 'Transaction deleted successfully and stock reversed.',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = transactionController;
