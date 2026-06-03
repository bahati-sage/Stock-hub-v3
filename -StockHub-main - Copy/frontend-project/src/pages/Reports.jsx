import React, { useState } from 'react';
import api from '../api/axios';
import Loading from '../components/common/Loading';
import Table from '../components/common/Table';
import toast from 'react-hot-toast';

function formatNumber(num) {
  if (num == null) return '0';
  return Number(num).toLocaleString();
}

function getToday() { return new Date().toISOString().split('T')[0]; }
function getWeekAgo() { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0]; }

function SummaryCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">{icon}</span>
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{formatNumber(value)}</p>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dailyDate, setDailyDate] = useState(getToday());
  const [weekStart, setWeekStart] = useState(getWeekAgo());
  const [weekEnd, setWeekEnd] = useState(getToday());
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const tabs = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
  ];

  const fetchReport = async () => {
    setLoading(true);
    setReportData(null);
    try {
      let res;
      if (activeTab === 'daily') res = await api.get(`/reports/daily?date=${dailyDate}`);
      else if (activeTab === 'weekly') res = await api.get(`/reports/weekly?startDate=${weekStart}&endDate=${weekEnd}`);
      else res = await api.get(`/reports/monthly?month=${month}&year=${year}`);
      setReportData(res.data.data || {});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const getTransactions = () => {
    if (!reportData) return [];
    const tx = reportData.transactions || [];
    if (!searchTerm) return tx;
    const term = searchTerm.toLowerCase();
    return tx.filter((t) => {
      const name = (t.productId?.productName || t.productName || '').toLowerCase();
      const type = (t.transactionType || '').toLowerCase();
      return name.includes(term) || type.includes(term);
    });
  };

  const handleExport = () => {
    if (!reportData) return;
    const tx = reportData.transactions || [];
    const rows = [['Product', 'Type', 'Quantity', 'Total Price (RWF)', 'Date']];
    tx.forEach((t) => {
      const price = t.productId?.unitPrice || 0;
      const total = (Number(t.quantityMoved) || 0) * Number(price);
      rows.push([
        t.productId?.productName || t.productName || '-',
        t.transactionType || '-',
        t.quantityMoved || '0',
        total.toLocaleString(),
        t.transactionDate ? new Date(t.transactionDate).toLocaleDateString('en-CA') : '-',
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-report-${getToday()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  const renderContent = () => {
    if (loading) return <Loading message="Loading report..." />;

    if (!reportData) {
      return (
        <div className="text-center py-16">
          <svg className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm text-gray-400">Select a period and click Search to view the report</p>
        </div>
      );
    }

    const s = reportData.summary || {};
    const summaryCards = [
      { label: 'Stock In', value: s.totalStockIn || 0, icon: '📥' },
      { label: 'Stock Out', value: s.totalStockOut || 0, icon: '📤' },
      { label: activeTab === 'daily' ? 'Available Stock' : activeTab === 'weekly' ? 'Net Movement' : 'Total Transactions', value: activeTab === 'daily' ? (s.availableStock || 0) : activeTab === 'weekly' ? ((s.totalStockIn || 0) - (s.totalStockOut || 0)) : (s.totalTransactions || 0), icon: '📊' },
    ];

    const filteredTransactions = getTransactions();
    const txColumns = [
      { key: 'productId', label: 'Product', render: (_, row) => row.productId?.productName || row.productName || '-' },
      { key: 'transactionType', label: 'Type', render: (val) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${val === 'Stock In' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{val || '-'}</span>
      )},
      { key: 'quantityMoved', label: 'Qty' },
      { key: 'totalPrice', label: 'Total Price', render: (_, row) => {
        const price = row.productId?.unitPrice || 0;
        const total = (Number(row.quantityMoved) || 0) * Number(price);
        return `RWF ${total.toLocaleString()}`;
      } },
      { key: 'transactionDate', label: 'Date', render: (val) => val ? new Date(val).toLocaleDateString('en-CA') : '-' },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summaryCards.map((card) => (<SummaryCard key={card.label} {...card} />))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              {activeTab === 'daily' ? 'Items Moved Today' : activeTab === 'weekly' ? 'Weekly Transactions' : 'Monthly Transactions'}
            </h3>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search transactions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent w-full sm:w-64" />
            </div>
          </div>
          <Table columns={txColumns} data={filteredTransactions}
            emptyTitle="No transactions found" emptyDescription={searchTerm ? 'Try a different search term.' : 'No stock movements recorded for this period.'} />
        </div>
      </div>
    );
  };

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  }

  const reportTitle = reportData ? (() => {
    if (activeTab === 'daily') return `Daily Report — ${formatDate(reportData.date || dailyDate)}`;
    if (activeTab === 'weekly') return `Weekly Report — ${formatDate(reportData.startDate || weekStart)} — ${formatDate(reportData.endDate || weekEnd)}`;
    return `Monthly Report — ${(reportData.month || `${year}-${month}`).replace('-', ' ')}`;
  })() : null;

  const renderControls = () => {
    if (activeTab === 'daily') return (
      <>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
          <input type="date" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 w-40" />
        </div>
        <button onClick={fetchReport} className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors self-end">Search</button>
      </>
    );
    if (activeTab === 'weekly') return (
      <>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 w-36" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input type="date" value={weekEnd} onChange={(e) => setWeekEnd(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 w-36" />
        </div>
        <button onClick={fetchReport} className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors self-end">Search</button>
      </>
    );
    return (
      <>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 w-32">
            {Array.from({ length: 12 }, (_, i) => (<option key={i + 1} value={String(i + 1).padStart(2, '0')}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 w-28">
            {Array.from({ length: 10 }, (_, i) => (<option key={i} value={String(new Date().getFullYear() - 5 + i)}>{String(new Date().getFullYear() - 5 + i)}</option>))}
          </select>
        </div>
        <button onClick={fetchReport} className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors self-end">Search</button>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">View stock movement reports and analytics</p>
        </div>
        {reportData && (
          <button onClick={handleExport} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200 px-6">
          <div className="flex items-center justify-between">
            <nav className="flex -mb-px" role="tablist">
              {tabs.map((tab) => (
                <button key={tab.key} onClick={() => { setActiveTab(tab.key); setReportData(null); setSearchTerm(''); }}
                  className={`px-0 py-3 mr-6 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  {tab.label}
                </button>
              ))}
            </nav>
            <div className="flex items-end gap-3 py-3">
              {renderControls()}
            </div>
          </div>
        </div>
        <div className="p-6">
          {reportTitle && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">{reportTitle}</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {activeTab === 'daily' ? 'Detailed stock movements for this day' : activeTab === 'weekly' ? 'Summary of stock activity for this week' : 'Monthly stock movement overview'}
              </p>
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
