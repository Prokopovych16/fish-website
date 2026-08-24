export default function BlogPostLoading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-8 flex items-center gap-2">
        <div className="h-4 w-16 animate-pulse rounded-full bg-dark-100" />
        <div className="h-4 w-4 animate-pulse rounded-full bg-dark-100" />
        <div className="h-4 w-12 animate-pulse rounded-full bg-dark-100" />
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        <article>
          <div className="aspect-[16/9] animate-pulse rounded-xl bg-dark-100" />
          <div className="mt-8 h-9 w-3/4 animate-pulse rounded-lg bg-dark-100" />
          <div className="mt-4 h-5 w-full animate-pulse rounded-xl bg-dark-100" />
          <div className="mt-5 h-4 w-48 animate-pulse rounded-full bg-dark-100" />
          <div className="mt-8 space-y-3">
            <div className="h-4 w-full animate-pulse rounded-xl bg-dark-100" />
            <div className="h-4 w-full animate-pulse rounded-xl bg-dark-100" />
            <div className="h-4 w-5/6 animate-pulse rounded-xl bg-dark-100" />
            <div className="h-4 w-full animate-pulse rounded-xl bg-dark-100" />
            <div className="h-4 w-4/6 animate-pulse rounded-xl bg-dark-100" />
          </div>
        </article>
        <aside className="space-y-4">
          <div className="h-40 animate-pulse rounded-xl bg-dark-100" />
          <div className="h-40 animate-pulse rounded-xl bg-dark-100" />
        </aside>
      </div>
    </main>
  )
}
