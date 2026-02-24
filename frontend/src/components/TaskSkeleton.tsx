export function TaskSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="w-full">
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="h-7 w-20 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
