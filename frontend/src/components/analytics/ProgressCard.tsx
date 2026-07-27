'use client';

import { ReactNode } from 'react';

interface ProgressCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  color?: string;
  icon?: ReactNode;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function ProgressCard({
  label,
  value,
  suffix = '',
  color = '#6366F1',
  icon,
  subtitle,
  trend = 'neutral',
}: ProgressCardProps) {
  const trendColor = trend === 'up' ? '#22C55E' : trend === 'down' ? '#EF4444' : '#94A3B8';
  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '';

  return (
    <div
      className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: 'linear-gradient(135deg, rgba(22,27,38,0.6) 0%, rgba(30,37,52,0.6) 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-text-muted text-xs font-medium mb-2">
            {icon}
            <span>{label}</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {value}
            {suffix}
          </div>
          {subtitle && <div className="text-xs text-text-muted">{subtitle}</div>}
        </div>

        {trend !== 'neutral' && (
          <div
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: trendColor }}
          >
            <span>{trendIcon}</span>
            <span>{trend === 'up' ? 'رشد' : trend === 'down' ? 'کاهش' : ''}</span>
          </div>
        )}
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${typeof value === 'number' ? Math.min((value / 100) * 100, 100) : 0}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
