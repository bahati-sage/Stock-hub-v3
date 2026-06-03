import React from 'react';

const sizeMap = { sm: 'h-5 w-5 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-3' };

export default function Loading({ size = 'md', message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`${sizeMap[size] || sizeMap.md} animate-spin rounded-full border-gray-200 border-t-gray-600`} />
      {message && <p className="mt-3 text-sm text-gray-500">{message}</p>}
    </div>
  );
}
