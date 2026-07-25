'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function HRPage() {
  return (
    <ProtectedRoute allowedRoles={['HR_MANAGER']}>
      <div>
        <h1 className="text-2xl font-bold mb-4">پنل مدیریت - منابع انسانی</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm">پرسنل</h3>
            <p className="text-3xl font-bold mt-2">-</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm">درخواست‌ها</h3>
            <p className="text-3xl font-bold mt-2">-</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm">حضور و غیاب</h3>
            <p className="text-3xl font-bold mt-2">-</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
