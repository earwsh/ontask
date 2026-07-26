'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import StatusChart from '@/components/analytics/StatusChart';
import ProjectPieChart from '@/components/analytics/ProjectPieChart';
import ProgressCard from '@/components/analytics/ProgressCard';

export default function AnalyticsDeptPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/analytics/department/1`)
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
  const pieColors = ['#6366F1', '#06B6D4', '#F59E0B', '#EF4444', '#22C55E', '#EC4899', '#8B5CF6', '#14B8A6'];
  const pieDataWithColors = pieData.map((p: any, i: number) => ({ ...p, color: pieColors[i % pieColors.length] }));

  return (
    <ProtectedRoute allowedRoles={['DEPARTMENT_MANAGER', 'TECHNICAL_MANAGER', 'CEO', 'HR_MANAGER']}>
      <div className="h-full flex flex-col overflow-hidden animate-fade-in">
        <div className="shrink-0 mb-4">
          <h1 className="text-xl font-bold text-white mb-1">تحلیل دپارتمان</h1>
          <p className="text-text-muted text-sm">وضعیت تسک‌ها و عملکرد اعضا در دپارتمان</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0 mb-4">
          <ProgressCard label="کل تسک‌ها" value={data?.total || 0} color="#6366F1" />
          <ProgressCard label="تکمیل شده" value={data?.done || 0} suffix={` / ${data?.completionRate || 0}%`} color="#22C55E" />
          <ProgressCard label="منتظر تایید" value={data?.pendingApprovals || 0} color="#A855F7" />
          <ProgressCard label="پیشرفت" value={data?.completionRate || 0} suffix="%" color="#6366F1" />
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

          {data?.memberPerformance?.length > 0 && (
            <div className="bg-card border border-[rgba(255,255,255,0.06)] rounded-[20px] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">عملکرد اعضا</h3>
              <div className="space-y-2">
                {data.memberPerformance.map((m: any, i: number) => (
                  <div key={m.userId} className="flex items-center gap-3 bg-[rgba(22,27,38,0.6)] rounded-xl px-4 py-3">
                    <span className="text-text-muted text-xs w-6 text-center">{i + 1}</span>
                    <span className="text-sm text-white flex-1 truncate">{m.name}</span>
                    <span className="text-xs text-text-muted shrink-0">{m.total} تسک</span>
                    <div className="w-24 h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden shrink-0">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${m.completionRate}%`, backgroundColor: '#22C55E' }} />
                    </div>
                    <span className="text-xs text-green-400 shrink-0 w-12 text-left">{m.completionRate}%</span>
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