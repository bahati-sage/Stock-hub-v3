const StockTransaction = require('../models/StockTransaction');
const Product = require('../models/Product');

const reportController = {
  dailyReport: async (req, res, next) => {
    try {
      const date = req.query.date || new Date().toISOString().split('T')[0];

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD.',
        });
      }

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const [stockInResult, stockOutResult, transactions] = await Promise.all([
        StockTransaction.aggregate([
          { $match: { transactionDate: { $gte: startOfDay, $lte: endOfDay }, transactionType: 'Stock In' } },
          { $group: { _id: null, total: { $sum: '$quantityMoved' } } },
        ]),
        StockTransaction.aggregate([
          { $match: { transactionDate: { $gte: startOfDay, $lte: endOfDay }, transactionType: 'Stock Out' } },
          { $group: { _id: null, total: { $sum: '$quantityMoved' } } },
        ]),
        StockTransaction.find({ transactionDate: { $gte: startOfDay, $lte: endOfDay } })
          .populate('productId', 'productName productCode unitPrice')
          .populate('warehouseId', 'warehouseName warehouseCode')
          .sort({ createdAt: -1 }),
      ]);

      const totalStockIn = stockInResult.length > 0 ? stockInResult[0].total : 0;
      const totalStockOut = stockOutResult.length > 0 ? stockOutResult[0].total : 0;

      const allProducts = await Product.find();
      const totalAvailable = allProducts.reduce((sum, p) => sum + p.quantityInStock, 0);

      res.status(200).json({
        success: true,
        data: {
          date,
          summary: {
            totalStockIn,
            totalStockOut,
            netMovement: totalStockIn - totalStockOut,
            availableStock: totalAvailable,
          },
          transactions,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  weeklyReport: async (req, res, next) => {
    try {
      const endDate = req.query.endDate || new Date().toISOString().split('T')[0];
      const startDate = req.query.startDate || (() => {
        const d = new Date(endDate);
        d.setDate(d.getDate() - 6);
        return d.toISOString().split('T')[0];
      })();

      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD.',
        });
      }

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const [stockInResult, stockOutResult, transactions, totalProducts] = await Promise.all([
        StockTransaction.aggregate([
          { $match: { transactionDate: { $gte: start, $lte: end }, transactionType: 'Stock In' } },
          { $group: { _id: null, total: { $sum: '$quantityMoved' } } },
        ]),
        StockTransaction.aggregate([
          { $match: { transactionDate: { $gte: start, $lte: end }, transactionType: 'Stock Out' } },
          { $group: { _id: null, total: { $sum: '$quantityMoved' } } },
        ]),
        StockTransaction.find({ transactionDate: { $gte: start, $lte: end } })
          .populate('productId', 'productName productCode unitPrice')
          .populate('warehouseId', 'warehouseName warehouseCode')
          .sort({ transactionDate: -1 }),
        Product.countDocuments(),
      ]);

      const totalStockIn = stockInResult.length > 0 ? stockInResult[0].total : 0;
      const totalStockOut = stockOutResult.length > 0 ? stockOutResult[0].total : 0;

      const dailyBreakdown = {};
      transactions.forEach((t) => {
        const d = t.transactionDate.toISOString().split('T')[0];
        if (!dailyBreakdown[d]) {
          dailyBreakdown[d] = { stockIn: 0, stockOut: 0, transactions: [] };
        }
        if (t.transactionType === 'Stock In') {
          dailyBreakdown[d].stockIn += t.quantityMoved;
        } else {
          dailyBreakdown[d].stockOut += t.quantityMoved;
        }
        dailyBreakdown[d].transactions.push(t);
      });

      res.status(200).json({
        success: true,
        data: {
          startDate,
          endDate,
          summary: {
            totalStockIn,
            totalStockOut,
            netMovement: totalStockIn - totalStockOut,
            totalTransactions: transactions.length,
            totalProducts,
          },
          dailyBreakdown,
          transactions,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  monthlyReport: async (req, res, next) => {
    try {
      const now = new Date();
      const month = req.query.month || String(now.getMonth() + 1).padStart(2, '0');
      const year = req.query.year || String(now.getFullYear());

      if (!/^\d{2}$/.test(month) || parseInt(month) < 1 || parseInt(month) > 12) {
        return res.status(400).json({
          success: false,
          message: 'Invalid month. Use MM format (01-12).',
        });
      }

      if (!/^\d{4}$/.test(year)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid year. Use YYYY format.',
        });
      }

      const startDate = new Date(`${year}-${month}-01`);
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endDate = new Date(`${year}-${month}-${String(lastDay).padStart(2, '0')}`);
      endDate.setHours(23, 59, 59, 999);

      const [stockInResult, stockOutResult, transactions, productMovements, warehousePerformance] = await Promise.all([
        StockTransaction.aggregate([
          { $match: { transactionDate: { $gte: startDate, $lte: endDate }, transactionType: 'Stock In' } },
          { $group: { _id: null, total: { $sum: '$quantityMoved' } } },
        ]),
        StockTransaction.aggregate([
          { $match: { transactionDate: { $gte: startDate, $lte: endDate }, transactionType: 'Stock Out' } },
          { $group: { _id: null, total: { $sum: '$quantityMoved' } } },
        ]),
        StockTransaction.find({ transactionDate: { $gte: startDate, $lte: endDate } })
          .populate('productId', 'productName productCode unitPrice')
          .populate('warehouseId', 'warehouseName warehouseCode')
          .sort({ transactionDate: -1 }),
        StockTransaction.aggregate([
          { $match: { transactionDate: { $gte: startDate, $lte: endDate } } },
          {
            $group: {
              _id: '$productId',
              totalStockIn: { $sum: { $cond: [{ $eq: ['$transactionType', 'Stock In'] }, '$quantityMoved', 0] } },
              totalStockOut: { $sum: { $cond: [{ $eq: ['$transactionType', 'Stock Out'] }, '$quantityMoved', 0] } },
            },
          },
          {
            $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' },
          },
          { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              productName: '$product.productName',
              productCode: '$product.productCode',
              category: '$product.category',
              totalStockIn: 1,
              totalStockOut: 1,
            },
          },
          { $sort: { totalStockOut: -1 } },
        ]),
        StockTransaction.aggregate([
          { $match: { transactionDate: { $gte: startDate, $lte: endDate } } },
          {
            $group: {
              _id: '$warehouseId',
              totalStockIn: { $sum: { $cond: [{ $eq: ['$transactionType', 'Stock In'] }, '$quantityMoved', 0] } },
              totalStockOut: { $sum: { $cond: [{ $eq: ['$transactionType', 'Stock Out'] }, '$quantityMoved', 0] } },
              totalTransactions: { $sum: 1 },
            },
          },
          {
            $lookup: { from: 'warehouses', localField: '_id', foreignField: '_id', as: 'warehouse' },
          },
          { $unwind: { path: '$warehouse', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              warehouseName: '$warehouse.warehouseName',
              warehouseCode: '$warehouse.warehouseCode',
              totalStockIn: 1,
              totalStockOut: 1,
              totalTransactions: 1,
            },
          },
          { $sort: { totalTransactions: -1 } },
        ]),
      ]);

      const totalStockIn = stockInResult.length > 0 ? stockInResult[0].total : 0;
      const totalStockOut = stockOutResult.length > 0 ? stockOutResult[0].total : 0;

      res.status(200).json({
        success: true,
        data: {
          month: `${year}-${month}`,
          summary: {
            totalStockIn,
            totalStockOut,
            netMovement: totalStockIn - totalStockOut,
            totalTransactions: transactions.length,
          },
          productMovements,
          warehousePerformance,
          transactions,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = reportController;
