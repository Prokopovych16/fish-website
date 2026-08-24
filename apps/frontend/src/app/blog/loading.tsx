export default function BlogLoading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="mb-12 text-center">
        <div className="mx-auto mb-4 h-14 w-14 animate-pulse rounded-lg bg-dark-100" />
        <div className="mx-auto h-9 w-72 animate-pulse rounded-lg bg-dark-100" />
        <div className="mx-auto mt-3 h-5 w-96 animate-pulse rounded-xl bg-dark-100" />
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-dark/10 bg-white">
            <div className="h-52 animate-pulse bg-dark-100" />
            <div className="space-y-3 p-6">
              <div className="h-4 w-24 animate-pulse rounded-full bg-dark-100" />
              <div className="h-5 w-full animate-pulse rounded-xl bg-dark-100" />
              <div className="h-4 w-3/4 animate-pulse rounded-xl bg-dark-100" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
