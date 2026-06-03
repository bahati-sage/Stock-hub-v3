import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [form, setForm] = useState({ username: '', recoveryToken: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.recoveryToken || !form.newPassword) {
      toast.error('All fields are required');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', form);
      toast.success('Password reset successful');
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Password Reset Complete</h2>
            <p className="text-sm text-gray-500 mb-6">You can now sign in with your new password.</p>
            <Link to="/login" className="inline-block px-6 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">📦</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">StockHub</h1>
          <p className="text-sm text-gray-500">Reset your password</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Forgot Password</h2>
          <p className="text-xs text-gray-400 mb-6">
            Enter your username, recovery token (saved during registration), and a new password.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" name="username" value={form.username} onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                placeholder="Enter your username" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recovery Token</label>
              <input type="text" name="recoveryToken" value={form.recoveryToken} onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent font-mono tracking-wider uppercase"
                placeholder="e.g. A3F9C2E1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                placeholder="Minimum 6 characters" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            <Link to="/login" className="font-medium text-gray-700 hover:text-gray-900 hover:underline">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
