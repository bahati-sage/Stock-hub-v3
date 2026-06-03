import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl">📦</span>
              <span className="text-lg font-semibold text-gray-800">StockHub</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">Sign In</Link>
              <Link to="/register" className="px-4 py-2 text-sm text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
          Stock Management, Simplified.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
          Track products across warehouses, record stock movements, and generate reports — all in one place.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-2xl mx-auto">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-lg mb-1">📦</p>
            <h3 className="text-sm font-semibold text-gray-900">Products</h3>
            <p className="text-xs text-gray-500 mt-1">Add and organize your inventory with categories, prices, and supplier info.</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-lg mb-1">🏭</p>
            <h3 className="text-sm font-semibold text-gray-900">Warehouses</h3>
            <p className="text-xs text-gray-500 mt-1">Manage multiple storage locations and track stock across all sites.</p>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-lg mb-1">🔄</p>
            <h3 className="text-sm font-semibold text-gray-900">Transactions</h3>
            <p className="text-xs text-gray-500 mt-1">Record stock in and out moves with full history and reports.</p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/register" className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg text-sm transition-colors">Get Started</Link>
          <Link to="/login" className="px-6 py-2.5 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg text-sm transition-colors">Sign In</Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} StockHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
