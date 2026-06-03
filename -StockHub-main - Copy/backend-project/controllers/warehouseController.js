const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');

const warehouseController = {
  create: async (req, res, next) => {
    try {
      const { warehouseCode, warehouseName, warehouseLocation } = req.body;

      const existingCode = await Warehouse.findOne({ warehouseCode });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: 'Warehouse code already exists.',
        });
      }

      const existingName = await Warehouse.findOne({ warehouseName });
      if (existingName) {
        return res.status(400).json({
          success: false,
          message: 'Warehouse name already exists.',
        });
      }

      const warehouse = await Warehouse.create({ warehouseCode, warehouseName, warehouseLocation });

      res.status(201).json({
        success: true,
        message: 'Warehouse created successfully.',
        data: warehouse,
      });
    } catch (error) {
      next(error);
    }
  },

  getAll: async (req, res, next) => {
    try {
      const warehouses = await Warehouse.find().sort({ createdAt: -1 });

      const warehousesWithCount = await Promise.all(
        warehouses.map(async (warehouse) => {
          const productCount = await Product.countDocuments({ warehouseId: warehouse._id });
          return { ...warehouse.toObject(), productCount };
        })
      );

      res.status(200).json({
        success: true,
        data: warehousesWithCount,
      });
    } catch (error) {
      next(error);
    }
  },

  getOne: async (req, res, next) => {
    try {
      const warehouse = await Warehouse.findById(req.params.id);

      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: 'Warehouse not found.',
        });
      }

      res.status(200).json({
        success: true,
        data: warehouse,
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { warehouseCode, warehouseName, warehouseLocation } = req.body;

      const warehouse = await Warehouse.findById(id);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: 'Warehouse not found.',
        });
      }

      if (warehouseCode && warehouseCode !== warehouse.warehouseCode) {
        const dupCode = await Warehouse.findOne({ warehouseCode });
        if (dupCode) {
          return res.status(400).json({
            success: false,
            message: 'Warehouse code already exists.',
          });
        }
      }

      if (warehouseName && warehouseName.toLowerCase() !== warehouse.warehouseName.toLowerCase()) {
        const dupName = await Warehouse.findOne({ warehouseName });
        if (dupName) {
          return res.status(400).json({
            success: false,
            message: 'Warehouse name already exists.',
          });
        }
      }

      const updated = await Warehouse.findByIdAndUpdate(id, {
        ...(warehouseCode && { warehouseCode }),
        ...(warehouseName && { warehouseName }),
        ...(warehouseLocation && { warehouseLocation }),
      }, { new: true, runValidators: true });

      res.status(200).json({
        success: true,
        message: 'Warehouse updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;

      const warehouse = await Warehouse.findById(id);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: 'Warehouse not found.',
        });
      }

      const productCount = await Product.countDocuments({ warehouseId: id });
      if (productCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete warehouse with existing products. Move or remove products first.',
        });
      }

      await Warehouse.deleteOne({ _id: id });

      res.status(200).json({
        success: true,
        message: 'Warehouse deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = warehouseController;
