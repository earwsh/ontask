'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

const roles = [
  { value: 'CUSTOMER', label: 'مشتری' },
  { value: 'EMPLOYEE', label: 'کارمند' },
  { value: 'DEPARTMENT_MANAGER', label: 'مدیر دپارتمان' },
  { value: 'HR_MANAGER', label: 'مدیر منابع انسانی' },
  { value: 'TECHNICAL_MANAGER', label: 'مدیر فنی' },
  { value: 'CEO', label: 'مدیر عامل' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'EMPLOYEE', department: '', phone: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.error || 'خطا در ثبت نام');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">ثبت نام</h1>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">نام</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ایمیل</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رمز عبور</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">نقش</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">دپارتمان</label>
            <input
              type="text"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">تلفن</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              dir="ltr"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            ثبت نام
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          حساب کاربری دارید؟ <Link href="/login" className="text-blue-600">ورود</Link>
        </p>
      </div>
    </div>
  );
}
