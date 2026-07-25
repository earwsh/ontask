'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function TechPage() {
  return (
    <ProtectedRoute allowedRoles={['TECHNICAL_MANAGER']}>
      <div>
        <h1 className="text-2xl font-bold mb-4">پنل مدیریت - مدیر فنی</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm">پروژه‌ها</h3>
            <p className="text-3xl font-bold mt-2">-</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm">تیم‌ها</h3>
            <p className="text-3xl font-bold mt-2">-</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm">تسک‌ها</h3>
            <p className="text-3xl font-bold mt-2">-</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
