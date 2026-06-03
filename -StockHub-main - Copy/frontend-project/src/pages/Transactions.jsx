import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { validateRequired, validatePositiveInteger } from '../utils/validation';

const emptyForm = { productId: '', warehouseId: '', transactionDate: '', quantityMoved: '', transactionType: 'Stock In' };

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
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

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data.data || []);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOptions = useCallback(async () => {
    try {
      const [pRes, wRes] = await Promise.all([api.get('/products'), api.get('/warehouses')]);
      setProducts(pRes.data.data || []);
      setWarehouses(wRes.data.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchOptions();
  }, [fetchTransactions, fetchOptions]);

  const filteredTransactions = transactions.filter((t) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (t.productId?.productName || t.productName || '').toLowerCase().includes(term) ||
      (t.warehouseId?.warehouseName || t.warehouseName || '').toLowerCase().includes(term) ||
      (t.transactionType || '').toLowerCase().includes(term) ||
      String(t.quantityMoved || '').includes(term) ||
      (t.transactionDate ? new Date(t.transactionDate).toLocaleDateString('en-CA') : '').includes(term)
    );
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setErrors({}); setShowForm(true); };

  const openEdit = (tx) => {
    setEditing(tx);
    setForm({
      productId: tx.productId?._id || tx.productId || '',
      warehouseId: tx.warehouseId?._id || tx.warehouseId || '',
      transactionDate: tx.transactionDate ? new Date(tx.transactionDate).toISOString().split('T')[0] : '',
      quantityMoved: tx.quantityMoved || '',
      transactionType: tx.transactionType || 'Stock In',
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const newErrors = {};
    const pErr = validateRequired(form.productId, 'Product');
    const wErr = validateRequired(form.warehouseId, 'Warehouse');
    const dErr = validateRequired(form.transactionDate, 'Transaction Date');
    const qErr = validateRequired(form.quantityMoved, 'Quantity Moved');
    if (pErr) newErrors.productId = pErr;
    if (wErr) newErrors.warehouseId = wErr;
    if (dErr) newErrors.transactionDate = dErr;
    if (qErr) newErrors.quantityMoved = qErr;
    else { const qi = validatePositiveInteger(form.quantityMoved, 'Quantity Moved'); if (qi) newErrors.quantityMoved = qi; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { ...form, quantityMoved: Number(form.quantityMoved) };
      if (editing) {
        await api.put(`/transactions/${editing._id}`, payload);
        toast.success('Transaction updated');
      } else {
        await api.post('/transactions', payload);
        toast.success('Transaction recorded');
      }
      setForm(emptyForm); setShowForm(false); setEditing(null);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/transactions/${deleteTarget._id}`);
      toast.success('Transaction deleted');
      setDeleteTarget(null);
      fetchTransactions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete transaction');
    }
  };

  const columns = [
    { key: 'productId', label: 'Product', sortable: true, render: (_, row) => row.productId?.productName || row.productName || '-' },
    { key: 'warehouseId', label: 'Warehouse', sortable: true, render: (_, row) => row.warehouseId?.warehouseName || row.warehouseName || '-' },
    { key: 'transactionDate', label: 'Date', sortable: true, render: (val) => val ? new Date(val).toLocaleDateString('en-CA') : '-' },
    { key: 'quantityMoved', label: 'Qty', sortable: true },
    { key: 'totalPrice', label: 'Total Price', sortable: true, render: (_, row) => {
      const price = row.productId?.unitPrice || 0;
      const total = (Number(row.quantityMoved) || 0) * Number(price);
      return `RWF ${total.toLocaleString()}`;
    } },
    { key: 'transactionType', label: 'Type', sortable: true, render: (val) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${val === 'Stock In' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{val || '-'}</span>
    )},
  ];

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">Record and manage stock movements</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors shadow-sm">+ Record Transaction</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search by product, warehouse, type..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent w-full" />
          </div>
          {searchTerm && <p className="text-sm text-gray-500">{filteredTransactions.length} result{filteredTransactions.length !== 1 ? 's' : ''}</p>}
        </div>
        <Table columns={columns} data={filteredTransactions} loading={loading}
          emptyTitle={searchTerm ? 'No transactions match your search' : 'No transactions found'}
          emptyDescription={searchTerm ? 'Try a different search term.' : 'Record your first transaction to get started.'}
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
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Transaction' : 'Record Transaction'}</h2>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="p-1 text-gray-400 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                  <select name="productId" value={form.productId} onChange={handleChange} className={inputClass('productId')}>
                    <option value="">Select product</option>
                    {products.map((p) => (<option key={p._id} value={p._id}>{p.productName}</option>))}
                  </select>
                  {errors.productId && <p className="mt-1 text-xs text-red-500">{errors.productId}</p>}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" name="transactionDate" value={form.transactionDate} onChange={handleChange} className={inputClass('transactionDate')} />
                  {errors.transactionDate && <p className="mt-1 text-xs text-red-500">{errors.transactionDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input type="number" name="quantityMoved" value={form.quantityMoved} onChange={handleChange} className={inputClass('quantityMoved')} placeholder="e.g. 10" min="1" />
                  {errors.quantityMoved && <p className="mt-1 text-xs text-red-500">{errors.quantityMoved}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type *</label>
                <div className="flex gap-3">
                  {['Stock In', 'Stock Out'].map((type) => (
                    <label key={type} className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg cursor-pointer text-sm transition-colors ${form.transactionType === type ? 'border-gray-800 bg-gray-100 text-gray-800' : 'border-gray-300 hover:border-gray-400'}`}>
                      <input type="radio" name="transactionType" value={type} checked={form.transactionType === type} onChange={handleChange} className="sr-only" />
                      <span className={`h-3 w-3 rounded-full border-2 ${form.transactionType === type ? 'border-gray-800 bg-gray-800' : 'border-gray-300'}`} />
                      {type}
                    </label>
                  ))}
                </div>
                {errors.transactionType && <p className="mt-1 text-xs text-red-500">{errors.transactionType}</p>}
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
        title="Delete Transaction" message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete" variant="danger" />
    </div>
  );
}
