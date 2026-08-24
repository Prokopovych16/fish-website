'use client'

import { useRef, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { ProductCard } from '../products/product-card'
import type { ProductItem, Category } from '../../lib/products'

interface CatalogExplorerProps {
  products: ProductItem[]
  categories: Category[]
  currentSearch: string
  currentCategory: string
  currentSort: string
  currentMinPrice?: number
  currentMaxPrice?: number
  currentInStock?: boolean
  total: number
}

const SORT_OPTIONS = [
  { value: '', label: 'Рекомендовані' },
  { value: 'price_asc', label: 'Ціна: від низької' },
  { value: 'price_desc', label: 'Ціна: від високої' },
  { value: 'newest', label: 'Новинки' },
  { value: 'popular', label: 'Популярні' },
]

function flattenCategories(cats: Category[]): Category[] {
  return cats.reduce<Category[]>((acc, c) => {
    acc.push(c)
    if (c.children?.length) acc.push(...flattenCategories(c.children))
    return acc
  }, [])
}

export function CatalogExplorer({
  products,
  categories,
  currentSearch,
  currentCategory,
  currentSort,
  currentMinPrice,
  currentMaxPrice,
  currentInStock,
  total,
}: CatalogExplorerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const flat = flattenCategories(categories)

  const hasFilters = !!(currentSearch || currentCategory || currentSort || currentMinPrice || currentMaxPrice || currentInStock)

  const navigate = (params: Record<string, string>) => {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v) p.set(k, v)
    }
    startTransition(() => router.push(`${pathname}?${p.toString()}`))
  }

  const buildCurrent = (): Record<string, string> => ({
    ...(currentSearch && { search: currentSearch }),
    ...(currentCategory && { category: currentCategory }),
    ...(currentSort && { sort: currentSort }),
    ...(currentMinPrice && { minPrice: String(currentMinPrice) }),
    ...(currentMaxPrice && { maxPrice: String(currentMaxPrice) }),
    ...(currentInStock && { inStock: 'true' }),
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    navigate({
      search: (fd.get('search') as string) || '',
      category: (fd.get('category') as string) || '',
      sort: (fd.get('sort') as string) || '',
      minPrice: (fd.get('minPrice') as string) || '',
      maxPrice: (fd.get('maxPrice') as string) || '',
      inStock: fd.get('inStock') ? 'true' : '',
    })
  }

  return (
    <div className={`space-y-6 transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Filters panel */}
      <form ref={formRef} onSubmit={handleSubmit} className="rounded-xl border border-dark/10 bg-white px-4 py-3">
        {/* Row 1: all controls in one line */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[160px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark-400" />
            <input
              name="search"
              defaultValue={currentSearch}
              placeholder="Пошук..."
              className="w-full rounded-md border border-dark/10 py-2 pl-8 pr-3 text-sm focus:border-dark/30 focus:outline-none"
            />
          </div>

          {/* Category */}
          <select
            name="category"
            defaultValue={currentCategory}
            onChange={e => navigate({ ...buildCurrent(), category: e.target.value })}
            className="rounded-md border border-dark/10 bg-white px-3 py-2 text-sm focus:border-dark/30 focus:outline-none"
          >
            <option value="">Всі категорії</option>
            {flat.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            name="sort"
            defaultValue={currentSort}
            onChange={e => navigate({ ...buildCurrent(), sort: e.target.value })}
            className="rounded-md border border-dark/10 bg-white px-3 py-2 text-sm focus:border-dark/30 focus:outline-none"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Price range */}
          <div className="flex items-center gap-1">
            <input
              name="minPrice"
              type="number"
              defaultValue={currentMinPrice ?? ''}
              placeholder="Від"
              min={0}
              className="w-20 rounded-md border border-dark/10 px-2 py-2 text-sm focus:border-dark/30 focus:outline-none"
            />
            <span className="text-dark-300 text-xs">—</span>
            <input
              name="maxPrice"
              type="number"
              defaultValue={currentMaxPrice ?? ''}
              placeholder="До"
              min={0}
              className="w-20 rounded-md border border-dark/10 px-2 py-2 text-sm focus:border-dark/30 focus:outline-none"
            />
          </div>

          {/* In-stock */}
          <label className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap">
            <input
              type="checkbox"
              name="inStock"
              defaultChecked={!!currentInStock}
              onChange={e => navigate({ ...buildCurrent(), inStock: e.target.checked ? 'true' : '' })}
              className="h-3.5 w-3.5 rounded accent-dark"
            />
            <span className="text-sm text-dark-500">В наявності</span>
          </label>

          {/* Submit + clear */}
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-md bg-dark px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-dark-700"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Застосувати
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={() => router.push(pathname)}
                className="flex items-center gap-1 rounded-md border border-dark/10 px-2.5 py-2 text-sm text-dark-400 transition-colors hover:text-dark"
                title="Скинути фільтри"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Active filter chips — тільки якщо є активні фільтри */}
        {hasFilters && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-dark/5 pt-2.5">
            <span className="text-xs text-dark-400">{total} товарів</span>
            {currentSearch && (
              <Chip label={`«${currentSearch}»`} onRemove={() => navigate({ ...buildCurrent(), search: '' })} />
            )}
            {currentCategory && (
              <Chip label={flat.find(c => c.slug === currentCategory)?.name ?? currentCategory} onRemove={() => navigate({ ...buildCurrent(), category: '' })} />
            )}
            {currentSort && (
              <Chip label={SORT_OPTIONS.find(o => o.value === currentSort)?.label ?? currentSort} onRemove={() => navigate({ ...buildCurrent(), sort: '' })} />
            )}
            {currentMinPrice && (
              <Chip label={`від ${currentMinPrice} грн`} onRemove={() => navigate({ ...buildCurrent(), minPrice: '' })} />
            )}
            {currentMaxPrice && (
              <Chip label={`до ${currentMaxPrice} грн`} onRemove={() => navigate({ ...buildCurrent(), maxPrice: '' })} />
            )}
            {currentInStock && (
              <Chip label="В наявності" onRemove={() => navigate({ ...buildCurrent(), inStock: '' })} />
            )}
          </div>
        )}
      </form>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="rounded-xl border border-dark/10 bg-white p-16 text-center">
          <Search className="mx-auto mb-4 h-10 w-10 text-dark-200" />
          <p className="text-lg font-medium text-dark">Нічого не знайдено</p>
          <p className="mt-2 text-sm text-dark-500">Спробуйте змінити параметри фільтрації</p>
          <button onClick={() => router.push(pathname)} className="mt-5 rounded-lg border border-dark/10 px-5 py-2.5 text-sm font-medium text-dark-500 transition-colors hover:text-dark">
            Скинути фільтри
          </button>
        </div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </div>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 rounded-md bg-dark/5 px-2.5 py-1 text-xs font-medium text-dark">
      {label}
      <button type="button" onClick={onRemove} className="text-dark-400 hover:text-dark transition-colors">
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
