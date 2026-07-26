'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyticsRedirectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    const u = JSON.parse(stored);
    setLoading(false);
    if (u.role === 'EMPLOYEE') {
      router.push('/dashboard/analytics/employee');
    } else if (u.role === 'DEPARTMENT_MANAGER') {
      router.push('/dashboard/analytics/department');
    } else if (u.role === 'TECHNICAL_MANAGER') {
      router.push('/dashboard/analytics/technical');
    } else {
      router.push('/dashboard/analytics/overview');
    }
  }, [router]);

  if (loading) return null;

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-text-muted">در حال هدایت...</div>
    </div>
  );
}