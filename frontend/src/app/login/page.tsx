'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.error || 'خطا در ورود');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-surface">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(6,182,212,0.05),transparent_50%)]" />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="bg-card border border-[rgba(255,255,255,0.06)] rounded-[20px] p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">OnTask</h1>
            <p className="text-text-muted text-sm mt-1">مدیریت کارمندان</p>
          </div>

          <h2 className="text-lg font-semibold text-white mb-6 text-center">ورود به سیستم</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">ایمیل</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-[rgba(22,27,38,0.6)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                dir="ltr"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">رمز عبور</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-[rgba(22,27,38,0.6)] border border-[rgba(255,255,255,0.08)] rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
                dir="ltr"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'در حال ورود...' : 'ورود'}
            </button>
          </form>

          <p className="text-sm text-text-muted text-center mt-6">
            حساب کاربری ندارید؟{' '}
            <Link href="/register" className="text-primary hover:text-primary-hover transition-colors">
              ثبت نام
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
