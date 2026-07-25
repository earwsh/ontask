'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function DeptPage() {
  return (
    <ProtectedRoute allowedRoles={['DEPARTMENT_MANAGER']}>
      <div>
        <h1 className="text-2xl font-bold mb-4">پنل مدیریت - مدیر دپارتمان</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm">وظایف</h3>
            <p className="text-3xl font-bold mt-2">-</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm">اعضای تیم</h3>
            <p className="text-3xl font-bold mt-2">-</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm">گزارشات</h3>
            <p className="text-3xl font-bold mt-2">-</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
