'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  TODO: { label: 'انجام نشده', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  IN_PROGRESS: { label: 'در حال انجام', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  PENDING_APPROVAL: { label: 'منتظر تایید', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  DONE: { label: 'تکمیل شده', color: 'text-green-400', bg: 'bg-green-500/10' },
};

export default function EmployeePage() {
  const [stats, setStats] = useState({ total: 0, inProgress: 0, pendingApproval: 0, done: 0, completionRate: 0 });
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [analyticsRes, tasksRes] = await Promise.all([
          api.get('/analytics/me'),
          api.get('/tasks'),
        ]);
        setStats({
          total: analyticsRes.data.total || 0,
          inProgress: analyticsRes.data.inProgress || 0,
          pendingApproval: analyticsRes.data.pendingApproval || 0,
          done: analyticsRes.data.done || 0,
          completionRate: analyticsRes.data.completionRate || 0,
        });
        setTasks(tasksRes.data.filter((t: any) => t.status !== 'DONE').slice(0, 5));
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleQuickSubmit = async (taskId: number) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: 'PENDING_APPROVAL' });
      window.location.reload();
    } catch {}
  };

  return (
    <ProtectedRoute allowedRoles={['EMPLOYEE']}>
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">داشبورد من</h1>
          <p className="text-text-muted text-sm mt-1">وظایف و عملکرد شما</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/projects"
            className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] block"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 100%)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>کل تسک‌ها</span>
            </div>
            <div className="text-3xl font-bold text-white">{loading ? '-' : stats.total}</div>
            <div className="mt-1 text-xs text-text-muted">تسک به شما</div>
          </Link>

          <div className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 100%)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>در حال انجام</span>
            </div>
            <div className="text-3xl font-bold text-white">{loading ? '-' : stats.inProgress}</div>
            <div className="mt-1 text-xs text-text-muted">تسک فعال</div>
          </div>

          <div className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(168,85,247,0.05) 100%)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>منتظر تایید</span>
            </div>
            <div className="text-3xl font-bold text-white">{loading ? '-' : stats.pendingApproval}</div>
            <div className="mt-1 text-xs text-text-muted">در انتظار بررسی</div>
          </div>

          <div className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300"
            style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-2">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>تکمیل شده</span>
            </div>
            <div className="text-3xl font-bold text-white">{loading ? '-' : stats.completionRate}<span className="text-lg text-text-muted">%</span></div>
            <div className="mt-1 text-xs text-text-muted">{stats.done} از {stats.total}</div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl p-5 border border-[rgba(255,255,255,0.06)] bg-[rgba(22,27,38,0.6)]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-text-muted">پیشرفت کلی</span>
            <span className="text-xs font-medium text-white">{stats.completionRate}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
            <div className="h-full rounded-full bg-gradient-to-l from-primary via-primary/80 to-primary/40 transition-all duration-700" style={{ width: `${stats.completionRate}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-[11px] text-text-muted">
            <span>انجام نشده: {stats.total - stats.inProgress - stats.pendingApproval - stats.done}</span>
            <span>در حال انجام: {stats.inProgress}</span>
            <span>تکمیل شده: {stats.done}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(22,27,38,0.6)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                تسک‌های فعال من
              </h3>
              <Link href="/dashboard/projects" className="text-xs text-primary hover:text-primary-hover transition-colors">مشاهده همه</Link>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-14 animate-pulse rounded-xl bg-[rgba(255,255,255,0.04)]" />)}
              </div>
            ) : tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((task: any) => (
                  <div key={task.id} className="rounded-xl bg-[rgba(22,27,38,0.6)] px-4 py-3 transition-all duration-200 hover:bg-[rgba(30,37,52,0.6)]">
                    <div className="flex items-center justify-between">
                      <Link href={`/dashboard/tasks/${task.id}`} className="text-sm text-white hover:text-primary transition-colors truncate flex-1 min-w-0">
                        {task.title}
                      </Link>
                      <div className="flex items-center gap-2 shrink-0 mr-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${statusConfig[task.status]?.bg || ''} ${statusConfig[task.status]?.color || ''}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${statusConfig[task.status]?.color.replace('text', 'bg') || ''}`} />
                          {statusConfig[task.status]?.label || task.status}
                        </span>
                        {['TODO', 'IN_PROGRESS'].includes(task.status) && (
                          <button onClick={() => handleQuickSubmit(task.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all cursor-pointer active:scale-[0.97]">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            ارسال
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-text-muted">
                      <span>{task.project?.name}</span>
                      {task.deadline && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-text-muted/30" />
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(task.deadline).toLocaleDateString('fa-IR')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-text-muted">
                <svg className="w-10 h-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-xs">تسکی به شما اختصاص داده نشده</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(22,27,38,0.6)] p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              دسترسی سریع
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/projects"
                className="flex items-center gap-3 rounded-xl bg-[rgba(99,102,241,0.08)] border border-[rgba(99,102,241,0.15)] px-4 py-3.5 text-sm font-medium text-primary hover:bg-[rgba(99,102,241,0.15)] transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                تسک‌های من
              </Link>
              <Link href="/dashboard/analytics/employee"
                className="flex items-center gap-3 rounded-xl bg-[rgba(6,182,212,0.08)] border border-[rgba(6,182,212,0.15)] px-4 py-3.5 text-sm font-medium text-secondary hover:bg-[rgba(6,182,212,0.15)] transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                تحلیل من
              </Link>
              <Link href="/dashboard"
                className="flex items-center gap-3 rounded-xl bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.15)] px-4 py-3.5 text-sm font-medium text-warning hover:bg-[rgba(245,158,11,0.15)] transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                پروژه‌ها
              </Link>
              <Link href="/dashboard"
                className="flex items-center gap-3 rounded-xl bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.15)] px-4 py-3.5 text-sm font-medium text-success hover:bg-[rgba(34,197,94,0.15)] transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                پروفایل من
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
