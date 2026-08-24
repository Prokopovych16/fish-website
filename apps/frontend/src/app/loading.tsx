export default function GlobalLoading() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-dark/15 border-t-dark" />
        <p className="text-sm text-dark-400">Завантаження...</p>
      </div>
    </main>
  )
}
