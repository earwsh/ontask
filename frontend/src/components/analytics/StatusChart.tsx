'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface StatusChartProps {
  data: { status: string; label: string; count: number; color: string }[];
}

export default function StatusChart({ data }: StatusChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="status" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
        <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#161B26', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', color: '#CBD5E1' }}
          labelStyle={{ color: '#CBD5E1' }}
        />
        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <rect key={index} fill={entry.color} opacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
