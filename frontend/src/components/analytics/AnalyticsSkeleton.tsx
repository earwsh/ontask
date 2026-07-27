export default function AnalyticsSkeleton() {
  const shimmer = 'animate-pulse rounded-xl bg-[rgba(255,255,255,0.04)]';

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`${shimmer} h-28 rounded-2xl`} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className={`${shimmer} h-80 rounded-2xl`} />
        <div className={`${shimmer} h-80 rounded-2xl`} />
      </div>
      <div className={`${shimmer} h-52 rounded-2xl`} />
    </div>
  );
}
