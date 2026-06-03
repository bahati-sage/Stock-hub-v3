const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');

const productController = {
  create: async (req, res, next) => {
    try {
      const { productCode, productName, category, quantityInStock, unitPrice, supplierName, dateReceived, warehouseId } = req.body;

      const existingCode = await Product.findOne({ productCode });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: 'Product code already exists.',
        });
      }

      const existingName = await Product.findOne({ productName });
      if (existingName) {
        return res.status(400).json({
          success: false,
          message: 'Product name already exists.',
        });
      }

      if (quantityInStock > 0 && !warehouseId) {
        return res.status(400).json({
          success: false,
          message: 'Warehouse is required when stocking in products.',
        });
      }

      const product = await Product.create({
        productCode, productName, category, quantityInStock, unitPrice, supplierName, dateReceived,
      });

      if (quantityInStock > 0) {
        await StockTransaction.create({
          productId: product._id,
          warehouseId,
          transactionDate: dateReceived || new Date(),
          quantityMoved: quantityInStock,
          transactionType: 'Stock In',
        });
      }

      res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  getAll: async (req, res, next) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      const count = await Product.countDocuments();

      res.status(200).json({
        success: true,
        data: products,
        count,
      });
    } catch (error) {
      next(error);
    }
  },

  getOne: async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { productCode, productName, category, quantityInStock, unitPrice, supplierName, dateReceived } = req.body;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }

      if (productCode && productCode !== product.productCode) {
        const dupCode = await Product.findOne({ productCode });
        if (dupCode) {
          return res.status(400).json({
            success: false,
            message: 'Product code already exists.',
          });
        }
      }

      if (productName && productName.toLowerCase() !== product.productName.toLowerCase()) {
        const dupName = await Product.findOne({ productName });
        if (dupName) {
          return res.status(400).json({
            success: false,
            message: 'Product name already exists.',
          });
        }
      }

      const updated = await Product.findByIdAndUpdate(id, {
        ...(productCode && { productCode }),
        ...(productName && { productName }),
        ...(category && { category }),
        ...(quantityInStock != null && { quantityInStock }),
        ...(unitPrice != null && { unitPrice }),
        ...(supplierName && { supplierName }),
        ...(dateReceived && { dateReceived }),
      }, { new: true, runValidators: true });

      res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }

      const txCount = await StockTransaction.countDocuments({ productId: id });
      if (txCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete product with existing transactions. Remove transactions first.',
        });
      }

      await Product.deleteOne({ _id: id });

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  },

  updateStock: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { quantityInStock } = req.body;

      if (quantityInStock === undefined || quantityInStock === null || !Number.isInteger(quantityInStock) || quantityInStock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity in stock must be a non-negative integer.',
        });
      }

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }

      product.quantityInStock = quantityInStock;
      await product.save();

      res.status(200).json({
        success: true,
        message: 'Stock updated successfully.',
        data: { id, quantityInStock },
      });
    } catch (error) {
      next(error);
    }
  },

  getLowStock: async (req, res, next) => {
    try {
      const threshold = parseInt(req.query.threshold) || 10;
      const products = await Product.find({ quantityInStock: { $lt: threshold } })
        .sort({ quantityInStock: 1 });

      res.status(200).json({
        success: true,
        data: products,
        count: products.length,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = productController;
