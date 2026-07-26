'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import StatusChart from '@/components/analytics/StatusChart';
import ProjectPieChart from '@/components/analytics/ProjectPieChart';
import ProgressCard from '@/components/analytics/ProgressCard';

export default function AnalyticsEmployeePage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/me').then(({ data: d }) => {
      setData(d);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const statusData = data ? [
    { status: 'انجام نشده', label: 'انجام نشده', count: data.todo, color: '#F59E0B' },
    { status: 'در حال انجام', label: 'در حال انجام', count: data.inProgress, color: '#3B82F6' },
    { status: 'منتظر تایید', label: 'منتظر تایید', count: data.pendingApproval, color: '#A855F7' },
    { status: 'تکمیل شده', label: 'تکمیل شده', count: data.done, color: '#22C55E' },
  ] : [];

  const pieData = data?.projectBreakdown?.map((p: any) => ({ projectName: p.projectName, total: p.total })) || [];
  const pieColors = ['#6366F1', '#06B6D4', '#F59E0B', '#EF4444', '#22C55E', '#EC4899', '#8B5CF6', '#14B8A6'];
  const pieDataWithColors = pieData.map((p: any, i: number) => ({ ...p, color: pieColors[i % pieColors.length] }));

  return (
    <ProtectedRoute allowedRoles={['EMPLOYEE']}>
      <div className="h-full flex flex-col overflow-hidden animate-fade-in">
        <div className="shrink-0 mb-4">
          <h1 className="text-xl font-bold text-white mb-1">تحلیل تسک‌های من</h1>
          <p className="text-text-muted text-sm">روند عملکرد و وضعیتس تسک‌های شما</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0 mb-4">
          <ProgressCard label="کل تسک‌ها" value={data?.total || 0} color="#6366F1" icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          } />
          <ProgressCard label="در حال انجام" value={data?.inProgress || 0} color="#3B82F6" />
          <ProgressCard label="منتظر تایید" value={data?.pendingApproval || 0} color="#A855F7" />
          <ProgressCard label="تکمیل شده" value={data?.done || 0} suffix={` / ${data?.completionRate || 0}%`} color="#22C55E" />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
          <div className="bg-card border border-[rgba(255,255,255,0.06)] rounded-[20px] p-5">
            <h3 className="text-sm font-semibold text-white mb-3">توزیع وضعیت</h3>
            <StatusChart data={statusData} />
          </div>

          {pieDataWithColors.length > 0 && (
            <div className="bg-card border border-[rgba(255,255,255,0.06)] rounded-[20px] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">توزیع بر اساس پروژه</h3>
              <ProjectPieChart data={pieDataWithColors} />
            </div>
          )}

          {data?.projectBreakdown?.length > 0 && (
            <div className="bg-card border border-[rgba(255,255,255,0.06)] rounded-[20px] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">پیشرفند بر اساس پروژه</h3>
              <div className="space-y-2">
                {data.projectBreakdown.map((p: any) => (
                  <div key={p.projectId} className="flex items-center gap-3 bg-[rgba(22,27,38,0.6)] rounded-xl px-4 py-3">
                    <span className="text-sm text-white flex-1 truncate">{p.projectName}</span>
                    <div className="w-32 h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden shrink-0">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${p.completionRate}%` }} />
                    </div>
                    <span className="text-xs text-text-muted shrink-0 w-12 text-left">{p.completionRate}%</span>
                    <span className="text-xs text-text-muted shrink-0">({p.done}/{p.total})</span>
                  </div>
                ))}
                {data.projectBreakdown.length === 0 && (
                  <p className="text-text-muted text-sm text-center py-4">تسکی اختصاص داده نشده</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}