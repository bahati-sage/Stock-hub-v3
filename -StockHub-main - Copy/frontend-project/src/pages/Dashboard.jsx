import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

function formatCurrency(num) {
  if (num == null) return 'RWF 0';
  return `RWF ${Number(num).toLocaleString()}`;
}

function formatNumber(num) {
  if (num == null) return '0';
  return Number(num).toLocaleString();
}

function SummaryCard({ icon, label, value, color }) {
  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-4 hover:shadow-md transition-all">
      <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: color + '15' }}>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{formatNumber(value)}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProducts: 0, totalWarehouses: 0, totalTransactions: 0 });
  const [stockInAmount, setStockInAmount] = useState(0);
  const [stockOutAmount, setStockOutAmount] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, warehousesRes, transactionsRes] = await Promise.all([
        api.get('/products'), api.get('/warehouses'), api.get('/transactions'),
      ]);
      const products = productsRes.data.data || [];
      const warehouses = warehousesRes.data.data || [];
      const transactions = transactionsRes.data.data || [];

      setStats({ totalProducts: products.length, totalWarehouses: warehouses.length, totalTransactions: transactions.length });

      let sIn = 0, sOut = 0;
      for (const t of transactions) {
        const price = t.productId?.unitPrice || 0;
        if (t.transactionType === 'Stock In') sIn += (t.quantityMoved || 0) * price;
        else if (t.transactionType === 'Stock Out') sOut += (t.quantityMoved || 0) * price;
      }
      setStockInAmount(sIn);
      setStockOutAmount(sOut);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <Loading message="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your stock management system</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon="📦" label="Total Products" value={stats.totalProducts} color="#6b7280" />
        <SummaryCard icon="🏭" label="Total Warehouses" value={stats.totalWarehouses} color="#6b7280" />
        <SummaryCard icon="🔄" label="Total Transactions" value={stats.totalTransactions} color="#6b7280" />
        <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-4 hover:shadow-md transition-all">
          <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#16a34a15' }}>
            <span className="text-xl">📥</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500">Total Stock In (RWF)</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{formatCurrency(stockInAmount)}</p>
          </div>
        </div>
        <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-4 hover:shadow-md transition-all">
          <div className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#dc262615' }}>
            <span className="text-xl">📤</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500">Total Stock Out (RWF)</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{formatCurrency(stockOutAmount)}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Stock In Amount</h2>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Total Stock In Amount</p>
                <p className="text-xs text-gray-500">Total value of items received</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-green-700">{formatCurrency(stockInAmount)}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Stock Out Amount</h2>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 8l-4-4m0 0l-4 4m4-4v12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Total Stock Out Amount</p>
                <p className="text-xs text-gray-500">Total value of items dispatched</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-red-700">{formatCurrency(stockOutAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
