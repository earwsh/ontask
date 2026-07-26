'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ProjectPieChartProps {
  data: { projectName: string; total: number; color?: string }[];
}

const DEFAULT_COLORS = ['#6366F1', '#06B6D4', '#F59E0B', '#EF4444', '#22C55E', '#EC4899', '#8B5CF6', '#14B8A6'];

export default function ProjectPieChart({ data }: ProjectPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted">
        <p>داده‌ای برای نمایش وجود ندارد</p>
      </div>
    );
  }

  const dataWithColors = data.map((d, i) => ({ ...d, color: d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={dataWithColors}
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={50}
          dataKey="total"
          nameKey="projectName"
          label={(props: any) => `${props.name}: ${props.value}`}
          labelLine={false}
        >
          {dataWithColors.map((entry, index) => (
            <Cell key={index} fill={entry.color} opacity={0.85} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#161B26', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', color: '#CBD5E1' }} />
        <Legend wrapperStyle={{ fontSize: '12px', color: '#CBD5E1' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}