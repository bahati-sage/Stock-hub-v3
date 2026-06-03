import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import {
  validateRequired,
  validatePositiveInteger,
  validatePositiveNumber,
  validateNoSpecialChars,
} from '../utils/validation';

const emptyForm = {
  productCode: '',
  productName: '',
  category: '',
  quantityInStock: '',
  unitPrice: '',
  supplierName: '',
  dateReceived: '',
  warehouseId: '',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.data || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
  }, [fetchProducts, fetchWarehouses]);

  const filteredProducts = products.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.productCode || '').toLowerCase().includes(term) ||
      (p.productName || '').toLowerCase().includes(term) ||
      (p.category || '').toLowerCase().includes(term) ||
      (p.supplierName || '').toLowerCase().includes(term)
    );
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      productCode: product.productCode || '',
      productName: product.productName || '',
      category: product.category || '',
      quantityInStock: product.quantityInStock || '',
      unitPrice: product.unitPrice || '',
      supplierName: product.supplierName || '',
      dateReceived: product.dateReceived ? new Date(product.dateReceived).toISOString().split('T')[0] : '',
      warehouseId: '',
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const newErrors = {};
    const fields = [
      { name: 'productCode', label: 'Product Code', rules: [validateRequired] },
      { name: 'productName', label: 'Product Name', rules: [validateRequired] },
      { name: 'category', label: 'Category', rules: [validateRequired] },
      { name: 'quantityInStock', label: 'Quantity', rules: [validateRequired, (v) => validatePositiveInteger(v, 'Quantity')] },
      { name: 'unitPrice', label: 'Unit Price', rules: [validateRequired, (v) => validatePositiveNumber(v, 'Unit Price')] },
      { name: 'supplierName', label: 'Supplier Name', rules: [validateRequired, (v) => validateNoSpecialChars(v, 'Supplier Name')] },
      { name: 'dateReceived', label: 'Date Received', rules: [validateRequired] },
    { name: 'warehouseId', label: 'Warehouse', rules: [validateRequired] },
    ];
    for (const field of fields) {
      for (const rule of field.rules) {
        const err = rule(form[field.name], field.label);
        if (err) {
          newErrors[field.name] = err;
          break;
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { ...form, quantityInStock: Number(form.quantityInStock), unitPrice: Number(form.unitPrice) };
      if (editing) {
        await api.put(`/products/${editing._id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      setForm(emptyForm);
      setShowForm(false);
      setEditing(null);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save product';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/products/${deleteTarget._id}`);
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete product';
      toast.error(msg);
    }
  };

  const columns = [
    { key: 'productCode', label: 'Code', sortable: true },
    { key: 'productName', label: 'Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'quantityInStock', label: 'Qty', sortable: true },
    { key: 'unitPrice', label: 'Price', sortable: true, render: (val) => val != null ? `RWF ${Number(val).toLocaleString()}` : '-' },
    { key: 'totalPrice', label: 'Total Price', sortable: true, render: (_, row) => {
      const total = (Number(row.quantityInStock) || 0) * (Number(row.unitPrice) || 0);
      return `RWF ${total.toLocaleString()}`;
    } },
    { key: 'supplierName', label: 'Supplier' },
    { key: 'dateReceived', label: 'Date Received', render: (val) => val ? new Date(val).toLocaleDateString('en-CA') : '-' },
  ];

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product inventory</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors shadow-sm">+ Add Product</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search by name, code, category, supplier..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent w-full" />
          </div>
          {searchTerm && <p className="text-sm text-gray-500">{filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}</p>}
        </div>
        <Table
          columns={columns} data={filteredProducts} loading={loading}
          emptyTitle={searchTerm ? 'No products match your search' : 'No products found'}
          emptyDescription={searchTerm ? 'Try a different search term.' : 'Add your first product to get started.'}
          renderActions={(row) => (
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => openEdit(row)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button onClick={() => setDeleteTarget(row)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => { setShowForm(false); setEditing(null); }} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-auto z-10 mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="p-1 text-gray-400 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Code *</label>
                  <input type="text" name="productCode" value={form.productCode} onChange={handleChange} className={inputClass('productCode')} placeholder="e.g. PRD-001" />
                  {errors.productCode && <p className="mt-1 text-xs text-red-500">{errors.productCode}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input type="text" name="productName" value={form.productName} onChange={handleChange} className={inputClass('productName')} placeholder="e.g. Laptop" />
                  {errors.productName && <p className="mt-1 text-xs text-red-500">{errors.productName}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <input type="text" name="category" value={form.category} onChange={handleChange} className={inputClass('category')} placeholder="e.g. Electronics" />
                  {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input type="number" name="quantityInStock" value={form.quantityInStock} onChange={handleChange} className={inputClass('quantityInStock')} placeholder="e.g. 100" min="1" />
                  {errors.quantityInStock && <p className="mt-1 text-xs text-red-500">{errors.quantityInStock}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (RWF) *</label>
                  <input type="number" name="unitPrice" value={form.unitPrice} onChange={handleChange} className={inputClass('unitPrice')} placeholder="e.g. 99.99" min="0.01" step="0.01" />
                  {errors.unitPrice && <p className="mt-1 text-xs text-red-500">{errors.unitPrice}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                  <input type="text" name="supplierName" value={form.supplierName} onChange={handleChange} className={inputClass('supplierName')} placeholder="e.g. TechSupplier Inc" />
                  {errors.supplierName && <p className="mt-1 text-xs text-red-500">{errors.supplierName}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Received *</label>
                  <input type="date" name="dateReceived" value={form.dateReceived} onChange={handleChange} className={inputClass('dateReceived')} />
                  {errors.dateReceived && <p className="mt-1 text-xs text-red-500">{errors.dateReceived}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse *</label>
                  <select name="warehouseId" value={form.warehouseId} onChange={handleChange} className={inputClass('warehouseId')}>
                    <option value="">Select warehouse</option>
                    {warehouses.map((w) => (<option key={w._id} value={w._id}>{w.warehouseName}</option>))}
                  </select>
                  {errors.warehouseId && <p className="mt-1 text-xs text-red-500">{errors.warehouseId}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {submitting ? 'Saving...' : editing ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Product" message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete" variant="danger" />
    </div>
  );
}
