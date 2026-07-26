'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function DeptPage() {
  return (
    <ProtectedRoute allowedRoles={['DEPARTMENT_MANAGER']}>
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">پنل مدیریت</h1>
          <p className="text-text-muted text-sm mt-1">مدیر دپارتمان</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-card border border-[rgba(255,255,255,0.06)] rounded-[20px] p-6 hover:bg-card-hover transition-all duration-300">
            <p className="text-text-muted text-sm">وظایف</p>
            <p className="text-4xl font-bold text-white mt-2">-</p>
          </div>
          <div className="bg-card border border-[rgba(255,255,255,0.06)] rounded-[20px] p-6 hover:bg-card-hover transition-all duration-300">
            <p className="text-text-muted text-sm">اعضای تیم</p>
            <p className="text-4xl font-bold text-white mt-2">-</p>
          </div>
          <div className="bg-card border border-[rgba(255,255,255,0.06)] rounded-[20px] p-6 hover:bg-card-hover transition-all duration-300">
            <p className="text-text-muted text-sm">گزارشات</p>
            <p className="text-4xl font-bold text-white mt-2">-</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
