export default function CatalogLoading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <section className="mb-12">
        <div className="h-4 w-24 animate-pulse rounded-full bg-dark-100" />
        <div className="mt-4 h-12 w-80 animate-pulse rounded-lg bg-dark-100" />
        <div className="mt-4 h-5 w-96 animate-pulse rounded-xl bg-dark-100" />
      </section>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-dark/10 bg-white">
            <div className="h-52 animate-pulse bg-dark-100" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded-xl bg-dark-100" />
              <div className="h-4 w-1/2 animate-pulse rounded-xl bg-dark-100" />
              <div className="h-8 w-full animate-pulse rounded-lg bg-dark-100" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
