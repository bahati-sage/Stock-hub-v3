const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const User = require('../models/User');
const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const StockTransaction = require('../models/StockTransaction');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Warehouse.deleteMany({}),
      Product.deleteMany({}),
      StockTransaction.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = await User.create({
      fullName: 'Admin User',
      username: 'admin',
      password: hashedPassword,
    });
    console.log('Created admin user (admin / admin123)');

    const warehouses = await Warehouse.insertMany([
      { warehouseCode: 'WH-001', warehouseName: 'Main Warehouse', warehouseLocation: '123 Industrial Blvd, City Center' },
      { warehouseCode: 'WH-002', warehouseName: 'East Distribution', warehouseLocation: '456 Commerce Ave, East Side' },
      { warehouseCode: 'WH-003', warehouseName: 'West Storage Facility', warehouseLocation: '789 Logistics Park, West End' },
    ]);
    console.log('Created 3 warehouses');

    const products = await Product.insertMany([
      { productCode: 'PROD-001', productName: 'Laptop Pro 15', category: 'Electronics', quantityInStock: 50, unitPrice: 1200.00, supplierName: 'TechSupply Inc.', dateReceived: new Date('2024-01-15') },
      { productCode: 'PROD-002', productName: 'Wireless Mouse', category: 'Electronics', quantityInStock: 200, unitPrice: 25.50, supplierName: 'GadgetWorld Ltd.', dateReceived: new Date('2024-01-20') },
      { productCode: 'PROD-003', productName: 'Office Desk', category: 'Furniture', quantityInStock: 30, unitPrice: 450.00, supplierName: 'FurniMart Corp.', dateReceived: new Date('2024-02-01') },
      { productCode: 'PROD-004', productName: 'Ergonomic Chair', category: 'Furniture', quantityInStock: 25, unitPrice: 680.00, supplierName: 'FurniMart Corp.', dateReceived: new Date('2024-02-05') },
      { productCode: 'PROD-005', productName: 'USB-C Hub', category: 'Electronics', quantityInStock: 150, unitPrice: 45.00, supplierName: 'GadgetWorld Ltd.', dateReceived: new Date('2024-02-10') },
    ]);
    console.log('Created 5 products');

    await StockTransaction.insertMany([
      { productId: products[0]._id, warehouseId: warehouses[0]._id, transactionDate: new Date('2024-01-16'), quantityMoved: 10, transactionType: 'Stock In' },
      { productId: products[1]._id, warehouseId: warehouses[0]._id, transactionDate: new Date('2024-01-21'), quantityMoved: 50, transactionType: 'Stock In' },
      { productId: products[2]._id, warehouseId: warehouses[1]._id, transactionDate: new Date('2024-02-02'), quantityMoved: 15, transactionType: 'Stock In' },
      { productId: products[3]._id, warehouseId: warehouses[1]._id, transactionDate: new Date('2024-02-06'), quantityMoved: 10, transactionType: 'Stock In' },
      { productId: products[4]._id, warehouseId: warehouses[2]._id, transactionDate: new Date('2024-02-11'), quantityMoved: 30, transactionType: 'Stock In' },
      { productId: products[0]._id, warehouseId: warehouses[0]._id, transactionDate: new Date('2024-02-15'), quantityMoved: 5, transactionType: 'Stock Out' },
      { productId: products[1]._id, warehouseId: warehouses[0]._id, transactionDate: new Date('2024-02-16'), quantityMoved: 20, transactionType: 'Stock Out' },
      { productId: products[2]._id, warehouseId: warehouses[1]._id, transactionDate: new Date('2024-02-18'), quantityMoved: 3, transactionType: 'Stock Out' },
    ]);
    console.log('Created 8 sample transactions');

    console.log('\nSeed completed successfully!');
    console.log('Login with: admin / admin123');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
