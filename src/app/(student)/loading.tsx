export default function StudentLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-8 pb-12">
      <div className="h-10 w-40 bg-[var(--color-line)] rounded animate-pulse mb-4" />
      <div className="h-6 w-64 bg-[var(--color-line)] rounded animate-pulse mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[var(--color-line)] overflow-hidden">
            <div className="aspect-[4/3] bg-[var(--color-line)] animate-pulse" />
            <div className="p-3.5 flex flex-col gap-2">
              <div className="h-4 w-3/4 bg-[var(--color-line)] rounded animate-pulse" />
              <div className="h-3 w-full bg-[var(--color-line)] rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-[var(--color-line)] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
