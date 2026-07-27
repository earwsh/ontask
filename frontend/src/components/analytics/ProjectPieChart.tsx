'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ProjectPieChartProps {
  data: { projectName: string; total: number; color?: string }[];
  height?: number;
}

const DEFAULT_COLORS = ['#6366F1', '#06B6D4', '#D97706', '#EF4444', '#22C55E', '#EC4899', '#8B5CF6', '#14B8A6'];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-xl border border-[rgba(255,255,255,0.06)] px-3 py-2 text-xs"
      style={{ background: 'rgba(22,27,38,0.95)' }}
    >
      <div className="font-medium text-white">{d.projectName}</div>
      <div className="text-text-muted">{d.total} تسک</div>
    </div>
  );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#94A3B8" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ProjectPieChart({ data, height = 300 }: ProjectPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-text-muted">
        <p className="text-sm">داده‌ای برای نمایش وجود ندارد</p>
      </div>
    );
  }

  const dataWithColors = data.map((d, i) => ({
    ...d,
    color: d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={dataWithColors}
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={50}
          dataKey="total"
          nameKey="projectName"
          label={renderCustomLabel}
          labelLine={false}
          animationBegin={0}
          animationDuration={800}
          animationEasing="ease-out"
        >
          {dataWithColors.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.color}
              opacity={0.85}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{
            fontSize: '11px',
            color: '#CBD5E1',
            paddingTop: '12px',
          }}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
