'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import StatusChart from '@/components/analytics/StatusChart';
import ProjectPieChart from '@/components/analytics/ProjectPieChart';
import ProgressCard from '@/components/analytics/ProgressCard';

const COLORS = ['#6366F1', '#06B6D4', '#F59E0B', '#EF4444', '#22C55E', '#EC4899', '#8B5CF6', '#14B8A6'];

export default function AnalyticsOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview')
      .then(({ data: d }) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  const statusData = data ? [
    { status: 'انجام نشده', label: 'انجام نشده', count: data.todo, color: '#F59E0B' },
    { status: 'در حال انجام', label: 'در حال انجام', count: data.inProgress, color: '#3B82F6' },
    { status: 'منتظر تایید', label: 'منتظر تایید', count: data.pendingApproval, color: '#A855F7' },
    { status: 'تکمیل شده', label: 'تکمیل شده', count: data.done, color: '#22C55E' },
  ] : [];

  const pieData = data?.projectBreakdown?.map((p: any) => ({ projectName: p.projectName, total: p.total })) || [];
  const pieDataWithColors = pieData.map((p: any, i: number) => ({ ...p, color: COLORS[i % COLORS.length] }));
  const deptBarData = data?.deptBreakdown?.map((d: any) => ({ status: d.deptName, count: d.projectCount })) || [];

  return (
    <ProtectedRoute allowedRoles={['CEO', 'HR_MANAGER']}>
      <div className="h-full flex flex-col overflow-hidden animate-fade-in">
        <div className="shrink-0 mb-4">
          <h1 className="text-xl font-bold text-white mb-1">تحلیل جامع</h1>
          <p className="text-text-muted text-sm">نمای کامل عملکرد همه پروژه‌ها و دپارتمان‌ها</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0 mb-4">
          <ProgressCard label="کل تسک‌ها" value={data?.total || 0} color="#6366F1" />
          <ProgressCard label="تکمیل شده" value={data?.done || 0} suffix={` / ${data?.completionRate || 0}%`} color="#22C55E" />
          <ProgressCard label="منتظر تایید" value={data?.pendingApprovals || 0} color="#A855F7" />
          <ProgressCard label="دپارتمان‌ها" value={data?.deptBreakdown?.length || 0} suffix="تیم" color="#06B6D4" />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-[rgba(255,255,255,0.06)] rounded-[20px] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">توزیع وضعیت</h3>
              <StatusChart data={statusData} />
            </div>

            {pieDataWithColors.length > 0 && (
              <div className="bg-card border border-[rgba(255,255,255,0.06)] rounded-[20px] p-5">
                <h3 className="text-sm font-semibold text-white mb-3">پروژه‌ها</h3>
                <ProjectPieChart data={pieDataWithColors} />
              </div>
            )}
          </div>

          {deptBarData.length > 0 && (
            <div className="bg-card border border-[rgba(255,255,255,0.06)] rounded-[20px] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">پروژه‌ها بر اساس دپارتمان</h3>
              <StatusChart data={deptBarData} />
            </div>
          )}

          {data?.memberPerformance?.length > 0 && (
            <div className="bg-card border border-[rgba(255,255,255,0.06)] rounded-[20px] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">عملکرد اعضا</h3>
              <div className="space-y-2">
                {data.memberPerformance.map((m: any) => (
                  <div key={m.userId} className="flex items-center gap-3 bg-[rgba(22,27,38,0.6)] rounded-xl px-4 py-3">
                    <span className="text-sm text-white flex-1 truncate">{m.name}</span>
                    <span className="text-xs text-text-muted shrink-0">{m.total} تسک</span>
                    <div className="w-24 h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden shrink-0">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${m.completionRate}%`, backgroundColor: '#22C55E' }} />
                    </div>
                    <span className="text-xs text-green-400 shrink-0 w-10 text-right">{m.completionRate}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data?.projectBreakdown?.length > 0 && (
            <div className="bg-card border border-[rgba(255,255,255,0.06)] rounded-[20px] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">پیشرفند پروژه‌ها</h3>
              <div className="space-y-2">
                {data.projectBreakdown.map((p: any) => (
                  <div key={p.projectId} className="flex items-center gap-3 bg-[rgba(22,27,38,0.6)] rounded-xl px-4 py-3">
                    <span className="text-sm text-white flex-1 truncate">{p.projectName}</span>
                    <span className="text-xs text-text-muted shrink-0">{p.total} تسک</span>
                    <div className="w-24 h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden shrink-0">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${p.completionRate}%` }} />
                    </div>
                    <span className="text-xs text-text-muted shrink-0 w-10 text-right">{p.completionRate}%</span>
                    <span className="text-xs text-green-400 shrink-0">{p.done} تکمیل</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}