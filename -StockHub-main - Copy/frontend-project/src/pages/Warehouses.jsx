import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { validateRequired, validateNoSpecialChars } from '../utils/validation';

const emptyForm = {
  warehouseCode: '',
  warehouseName: '',
  warehouseLocation: '',
};

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data.data || []);
    } catch {
      toast.error('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const filteredWarehouses = warehouses.filter((w) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (w.warehouseCode || '').toLowerCase().includes(term) ||
      (w.warehouseName || '').toLowerCase().includes(term) ||
      (w.warehouseLocation || '').toLowerCase().includes(term)
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

  const openEdit = (warehouse) => {
    setEditing(warehouse);
    setForm({
      warehouseCode: warehouse.warehouseCode || '',
      warehouseName: warehouse.warehouseName || '',
      warehouseLocation: warehouse.warehouseLocation || '',
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = () => {
    const newErrors = {};
    const codeErr = validateRequired(form.warehouseCode, 'Warehouse Code');
    const nameErr = validateRequired(form.warehouseName, 'Warehouse Name');
    const locErr = validateRequired(form.warehouseLocation, 'Location');
    if (codeErr) newErrors.warehouseCode = codeErr;
    if (nameErr) newErrors.warehouseName = nameErr;
    else {
      const ns = validateNoSpecialChars(form.warehouseName, 'Warehouse Name');
      if (ns) newErrors.warehouseName = ns;
    }
    if (locErr) newErrors.warehouseLocation = locErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/warehouses/${editing._id}`, form);
        toast.success('Warehouse updated');
      } else {
        await api.post('/warehouses', form);
        toast.success('Warehouse created');
      }
      setForm(emptyForm);
      setShowForm(false);
      setEditing(null);
      fetchWarehouses();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save warehouse';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/warehouses/${deleteTarget._id}`);
      toast.success('Warehouse deleted');
      setDeleteTarget(null);
      fetchWarehouses();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete warehouse';
      toast.error(msg);
    }
  };

  const columns = [
    { key: 'warehouseCode', label: 'Code', sortable: true },
    { key: 'warehouseName', label: 'Name', sortable: true },
    { key: 'warehouseLocation', label: 'Location', sortable: true },
  ];

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent ${errors[field] ? 'border-red-400' : 'border-gray-300'}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouses</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your warehouse locations</p>
        </div>
        <button onClick={openAdd} className="px-4 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors shadow-sm">+ Add Warehouse</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search by name, code, location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent w-full" />
          </div>
          {searchTerm && <p className="text-sm text-gray-500">{filteredWarehouses.length} result{filteredWarehouses.length !== 1 ? 's' : ''}</p>}
        </div>
        <Table
          columns={columns} data={filteredWarehouses} loading={loading}
          emptyTitle={searchTerm ? 'No warehouses match your search' : 'No warehouses found'}
          emptyDescription={searchTerm ? 'Try a different search term.' : 'Add your first warehouse to get started.'}
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
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-auto z-10 mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Warehouse' : 'Add Warehouse'}</h2>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="p-1 text-gray-400 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Code *</label>
                <input type="text" name="warehouseCode" value={form.warehouseCode} onChange={handleChange} className={inputClass('warehouseCode')} placeholder="e.g. WH-001" />
                {errors.warehouseCode && <p className="mt-1 text-xs text-red-500">{errors.warehouseCode}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Name *</label>
                <input type="text" name="warehouseName" value={form.warehouseName} onChange={handleChange} className={inputClass('warehouseName')} placeholder="e.g. Main Warehouse" />
                {errors.warehouseName && <p className="mt-1 text-xs text-red-500">{errors.warehouseName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input type="text" name="warehouseLocation" value={form.warehouseLocation} onChange={handleChange} className={inputClass('warehouseLocation')} placeholder="e.g. Kigali, Rwanda" />
                {errors.warehouseLocation && <p className="mt-1 text-xs text-red-500">{errors.warehouseLocation}</p>}
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
        title="Delete Warehouse" message="Are you sure you want to delete this warehouse? This action cannot be undone."
        confirmText="Delete" variant="danger" />
    </div>
  );
}
