'use client';

interface ProgressCardProps {
  label: string;
  value: number;
  suffix?: string;
  color?: string;
  icon?: React.ReactNode;
}

export default function ProgressCard({ label, value, suffix = '', color = '#6366F1', icon }: ProgressCardProps) {
  return (
    <div className="bg-[rgba(22,27,38,0.6)] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
      <div className="flex items-center gap-2 text-text-muted text-xs mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}{suffix}</div>
      <div className="mt-2 h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}