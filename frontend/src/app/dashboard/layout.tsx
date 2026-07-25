'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ role: string; name: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (!stored || !token) {
        window.location.href = '/login';
        return;
      }
      setUser(JSON.parse(stored));
    } catch {
      window.location.href = '/login';
    }
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen bg-gray-100" dir="rtl">
      <Sidebar role={user.role} onLogout={handleLogout} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
