export default function ProductLoading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <div className="overflow-hidden rounded-xl border border-dark/10 bg-white p-6">
            <div className="space-y-3">
              <div className="aspect-square animate-pulse rounded-lg bg-dark-100 sm:aspect-[4/3]" />
              <div className="flex gap-3 p-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 w-16 shrink-0 animate-pulse rounded-lg bg-dark-100 sm:h-20 sm:w-20" />
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-dark/10 bg-white p-6 space-y-4">
            <div className="h-6 w-40 animate-pulse rounded-md bg-dark-100" />
            <div className="h-4 w-full animate-pulse rounded-md bg-dark-100" />
            <div className="h-4 w-5/6 animate-pulse rounded-md bg-dark-100" />
            <div className="h-4 w-4/6 animate-pulse rounded-md bg-dark-100" />
          </div>
        </div>
        <aside className="space-y-6">
          <div className="rounded-xl border border-dark/10 bg-white p-6 space-y-5">
            <div className="h-4 w-24 animate-pulse rounded-full bg-dark-100" />
            <div className="h-10 w-3/4 animate-pulse rounded-md bg-dark-100" />
            <div className="h-12 w-1/2 animate-pulse rounded-md bg-dark-100" />
            <div className="h-14 w-full animate-pulse rounded-lg bg-dark-100" />
            <div className="h-14 w-full animate-pulse rounded-lg bg-dark-100" />
          </div>
        </aside>
      </div>
    </main>
  )
}
