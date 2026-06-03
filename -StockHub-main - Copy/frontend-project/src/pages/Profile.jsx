import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your account details and recovery token</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
          <div className="h-14 w-14 rounded-full bg-gray-700 flex items-center justify-center text-white text-xl font-bold">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{user.fullName || 'User'}</p>
            <p className="text-sm text-gray-500">@{user.username || ''}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
          <p className="text-sm text-gray-900">{user.fullName || '-'}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Username</label>
          <p className="text-sm text-gray-900">{user.username || '-'}</p>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Recovery Token</label>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm font-mono tracking-widest text-gray-800">
              {user.recoveryToken || 'Not available'}
            </span>
            {user.recoveryToken && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(user.recoveryToken);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                title="Copy token"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Save this token. It is required to reset your password if you forget it.
          </p>
        </div>
      </div>
    </div>
  );
}
