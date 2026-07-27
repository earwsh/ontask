'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function CustomerPage() {
  const [stats] = useState({ orders: 0, tickets: 0 });

  return (
    <ProtectedRoute allowedRoles={['CUSTOMER']}>
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">پنل مشتری</h1>
          <p className="text-text-muted text-sm mt-1">سفارشات و تیکت‌های پشتیبانی</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>سفارشات</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.orders}</div>
            <div className="mt-1 text-xs text-text-muted">سفارش فعال</div>
          </div>

          <div
            className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.05) 100%)', border: '1px solid rgba(6,182,212,0.2)' }}>
            <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-2">
              <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>تیکت‌ها</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.tickets}</div>
            <div className="mt-1 text-xs text-text-muted">تیکت باز</div>
          </div>

          <div
            className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-2">
              <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>پیشنهادات</span>
            </div>
            <div className="text-3xl font-bold text-white">-</div>
            <div className="mt-1 text-xs text-text-muted">در حال توسعه</div>
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(22,27,38,0.6)] p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <svg className="w-16 h-16 text-text-muted opacity-20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-base font-semibold text-white mb-1">در حال توسعه</h3>
            <p className="text-sm text-text-muted max-w-md">
              بخش مشتریان به زودی با قابلیت‌های مدیریت سفارشات، پیگیری تیکت‌ها و ارتباط با تیم پشتیبانی فعال خواهد شد.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
