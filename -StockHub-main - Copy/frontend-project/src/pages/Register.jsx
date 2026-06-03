import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateRequired, validateMinLength, validateLettersOnly, validateNoSpecialChars } from '../utils/validation';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', username: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    const fnReq = validateRequired(form.fullName, 'Full Name');
    const fnLetters = validateLettersOnly(form.fullName, 'Full Name');
    const fnMin = validateMinLength(form.fullName, 2, 'Full Name');
    if (fnReq) newErrors.fullName = fnReq;
    else if (fnLetters) newErrors.fullName = fnLetters;
    else if (fnMin) newErrors.fullName = fnMin;

    const uReq = validateRequired(form.username, 'Username');
    const uMin = validateMinLength(form.username, 3, 'Username');
    const uSpecial = validateNoSpecialChars(form.username, 'Username');
    if (uReq) newErrors.username = uReq;
    else if (uMin) newErrors.username = uMin;
    else if (uSpecial) newErrors.username = uSpecial;

    const pReq = validateRequired(form.password, 'Password');
    const pMin = validateMinLength(form.password, 6, 'Password');
    if (pReq) newErrors.password = pReq;
    else if (pMin) newErrors.password = pMin;

    const cReq = validateRequired(form.confirmPassword, 'Confirm Password');
    if (cReq) newErrors.confirmPassword = cReq;
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.fullName, form.username, form.password);
      toast.success('Registration successful');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">📦</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">StockHub</h1>
          <p className="text-sm text-gray-500">Stock Management System</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Create your account</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" name="fullName" value={form.fullName} onChange={handleChange}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent ${errors.fullName ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Enter your full name" />
              {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" name="username" value={form.username} onChange={handleChange}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent ${errors.username ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Choose a username" />
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Minimum 6 characters" />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent ${errors.confirmPassword ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="Confirm your password" />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-gray-700 hover:text-gray-900 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
