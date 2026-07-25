'use client';

import { useEffect } from 'react';

const roleRoutes: Record<string, string> = {
  CEO: '/dashboard/ceo',
  HR_MANAGER: '/dashboard/hr',
  TECHNICAL_MANAGER: '/dashboard/tech',
  DEPARTMENT_MANAGER: '/dashboard/dept',
  EMPLOYEE: '/dashboard/employee',
  CUSTOMER: '/dashboard/customer',
};

export default function DashboardPage() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored) {
        window.location.href = '/login';
        return;
      }
      const user = JSON.parse(stored);
      const route = roleRoutes[user.role] || '/dashboard/employee';
      window.location.href = route;
    } catch {
      window.location.href = '/login';
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-500">در حال هدایت...</p>
    </div>
  );
}
