import type { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CatalogExplorer } from '../../components/catalog/catalog-explorer'
import { getProductsPaginated, getCategories, type FilterOptions } from '../../lib/products'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Каталог копченої, пряної та мороженої риби | Валігура',
  description: 'Купуйте натуральну копчену, пряну та морожену рибу онлайн. Виробник Валігура — доставка Новою Поштою по всій Україні.',
  openGraph: {
    title: 'Каталог риби — Валігура',
    description: 'Копчена, пряна та морожена риба від виробника. Доставка Новою Поштою.',
    type: 'website',
  },
}

interface CatalogPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    category?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
    inStock?: string
  }>
}

const LIMIT = 20

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const sp = await searchParams
  const page = Number(sp.page ?? 1)
  const search = sp.search ?? ''
  const categorySlug = sp.category ?? ''
  const sort = sp.sort ?? ''
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined
  const inStock = sp.inStock === 'true'

  const [{ products, pagination }, categories] = await Promise.all([
    getProductsPaginated({ page, search, category: categorySlug, sort: (sort || undefined) as FilterOptions['sort'], minPrice, maxPrice, inStock: inStock || undefined, limit: LIMIT }),
    getCategories(),
  ])

  return (
    <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-dark-400">Каталог</p>
          <h1 className="mt-3 text-3xl font-semibold text-dark sm:text-4xl">Товарний асортимент</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-dark-500">
            Свіжа риба, морепродукти та делікатеси з HACCP-сертифікованого виробництва. Доставка по всій Україні.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-dark/10 bg-white px-4 py-3 text-sm text-dark-500">
          <span className="font-semibold text-dark">{pagination.total}</span>
          товарів у каталозі
        </div>
      </div>

      <CatalogExplorer
        products={products}
        categories={categories}
        currentSearch={search}
        currentCategory={categorySlug}
        currentSort={sort}
        currentMinPrice={minPrice}
        currentMaxPrice={maxPrice}
        currentInStock={inStock}
        total={pagination.total}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/catalog?${new URLSearchParams({ ...sp, page: String(page - 1) })}`}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-dark/10 text-dark-500 transition-colors hover:border-dark/20 hover:text-dark"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          )}
          {Array.from({ length: pagination.pages }, (_, i) => i + 1)
            .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === pagination.pages)
            .map((p, idx, arr) => (
              <React.Fragment key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="px-1 text-dark-400">…</span>
                )}
                <Link
                  href={`/catalog?${new URLSearchParams({ ...sp, page: String(p) })}`}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-dark text-white'
                      : 'border border-dark/10 bg-white text-dark-500 hover:bg-dark/5'
                  }`}
                >
                  {p}
                </Link>
              </React.Fragment>
            ))}
          {page < pagination.pages && (
            <Link
              href={`/catalog?${new URLSearchParams({ ...sp, page: String(page + 1) })}`}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-dark/10 text-dark-500 transition-colors hover:border-dark/20 hover:text-dark"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </main>
  )
}
