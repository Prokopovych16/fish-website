'use client'

import { useRef, useTransition } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowUpDown, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { ProductCard } from '../products/product-card'
import type { ProductItem, Category } from '../../lib/products'
import { Reveal, Shine } from '../shared/interactive'
import { secondaryLinkClass } from '../../lib/ui-classes'

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

  const fieldClass =
    'rounded-xl border border-dark/5 bg-dark-50 py-2.5 text-sm text-dark transition-all duration-300 placeholder:text-dark-400 hover:border-dark/10 focus:border-dark/20 focus:bg-white focus:shadow-[0_8px_24px_rgba(13,27,42,0.06)] focus:outline-none'

  const categoryOptions = [{ slug: '', name: 'Всі' }, ...flat.map((c) => ({ slug: c.slug, name: c.name }))]

  return (
    <div className="space-y-6">
      {/* Категорії — горизонтальні "пігулки" */}
      <div className="-mx-6 overflow-x-auto px-6 pb-1 lg:mx-0 lg:px-0">
        <div className="inline-flex gap-1 rounded-2xl bg-dark-50 p-1">
          {categoryOptions.map((c) => {
            const active = currentCategory === c.slug
            return (
              <button
                key={c.slug || 'all'}
                type="button"
                onClick={() => navigate({ ...buildCurrent(), category: c.slug })}
                className={`relative min-h-[40px] whitespace-nowrap rounded-xl px-4 text-sm font-medium transition-colors duration-200 ${
                  active ? 'text-white' : 'text-dark-500 hover:text-dark'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="catalog-category-pill"
                    className="absolute inset-0 rounded-xl bg-dark shadow-[0_8px_20px_rgba(22,24,28,0.18)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <span className="relative">{c.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Filters panel */}
      <form ref={formRef} onSubmit={handleSubmit} className="rounded-2xl border border-dark/10 bg-white p-3 sm:p-4">
        <input type="hidden" name="category" value={currentCategory} />
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="group relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400 transition-colors group-focus-within:text-dark" />
            <input
              name="search"
              defaultValue={currentSearch}
              placeholder="Пошук товарів..."
              className={`${fieldClass} w-full pl-10 pr-3`}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark-400" />
            <select
              name="sort"
              defaultValue={currentSort}
              onChange={e => navigate({ ...buildCurrent(), sort: e.target.value })}
              className={`${fieldClass} cursor-pointer appearance-none pl-9 pr-8`}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark-400" />
          </div>

          {/* Price range */}
          <div className="flex items-center gap-1.5">
            <input
              name="minPrice"
              type="number"
              defaultValue={currentMinPrice ?? ''}
              placeholder="Від, ₴"
              min={0}
              className={`${fieldClass} w-24 px-3`}
            />
            <span className="text-xs text-dark-300">—</span>
            <input
              name="maxPrice"
              type="number"
              defaultValue={currentMaxPrice ?? ''}
              placeholder="До, ₴"
              min={0}
              className={`${fieldClass} w-24 px-3`}
            />
          </div>

          {/* In-stock — перемикач */}
          <label className="group inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-xl px-2">
            <input
              type="checkbox"
              name="inStock"
              defaultChecked={!!currentInStock}
              onChange={e => navigate({ ...buildCurrent(), inStock: e.target.checked ? 'true' : '' })}
              className="peer sr-only"
            />
            <span className="relative h-6 w-10 rounded-full bg-dark-200 transition-colors duration-300 peer-checked:bg-sage peer-focus-visible:ring-2 peer-focus-visible:ring-dark/30 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:duration-300 peer-checked:after:translate-x-4" />
            <span className="text-sm text-dark-500 transition-colors group-hover:text-dark">В наявності</span>
          </label>

          {/* Submit + clear */}
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="submit"
              className="group relative flex min-h-[44px] items-center gap-2 overflow-hidden rounded-xl bg-dark px-4 text-sm font-medium text-white transition-all duration-300 hover:bg-dark-700 hover:shadow-[0_8px_20px_rgba(22,24,28,0.2)] active:scale-[0.98]"
            >
              <Shine />
              <SlidersHorizontal className="relative h-4 w-4" />
              <span className="relative">Застосувати</span>
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={() => router.push(pathname)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-dark/10 text-dark-400 transition-all duration-300 hover:rotate-90 hover:border-dark/20 hover:text-dark"
                title="Скинути фільтри"
                aria-label="Скинути фільтри"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Active filter chips — тільки якщо є активні фільтри */}
        {hasFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-dark/5 pt-3">
            <span className="mr-1 text-xs font-medium text-dark-400">
              Знайдено: <span className="text-dark">{total}</span>
            </span>
            <AnimatePresence initial={false}>
              {currentSearch && (
                <Chip key="search" label={`«${currentSearch}»`} onRemove={() => navigate({ ...buildCurrent(), search: '' })} />
              )}
              {currentCategory && (
                <Chip key="category" label={flat.find(c => c.slug === currentCategory)?.name ?? currentCategory} onRemove={() => navigate({ ...buildCurrent(), category: '' })} />
              )}
              {currentSort && (
                <Chip key="sort" label={SORT_OPTIONS.find(o => o.value === currentSort)?.label ?? currentSort} onRemove={() => navigate({ ...buildCurrent(), sort: '' })} />
              )}
              {currentMinPrice && (
                <Chip key="min" label={`від ${currentMinPrice} грн`} onRemove={() => navigate({ ...buildCurrent(), minPrice: '' })} />
              )}
              {currentMaxPrice && (
                <Chip key="max" label={`до ${currentMaxPrice} грн`} onRemove={() => navigate({ ...buildCurrent(), maxPrice: '' })} />
              )}
              {currentInStock && (
                <Chip key="stock" label="В наявності" onRemove={() => navigate({ ...buildCurrent(), inStock: '' })} />
              )}
            </AnimatePresence>
          </div>
        )}
      </form>

      {/* Grid */}
      <div className={`transition-opacity duration-300 ${isPending ? 'pointer-events-none opacity-50' : ''}`}>
        {products.length === 0 ? (
          <div className="rounded-3xl border border-dark/5 bg-dark-50 p-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Search className="h-7 w-7 text-dark-300" />
            </div>
            <p className="text-lg font-medium text-dark">Нічого не знайдено</p>
            <p className="mt-2 text-sm text-dark-500">Спробуйте змінити параметри фільтрації</p>
            <button onClick={() => router.push(pathname)} className={`${secondaryLinkClass} mt-6`}>
              Скинути фільтри
            </button>
          </div>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {products.map((product, i) => (
              <Reveal key={product.id} index={i % 4} className="h-full">
                <ProductCard product={product} />
              </Reveal>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-1.5 rounded-full bg-dark-50 py-1 pl-3 pr-1 text-xs font-medium text-dark"
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Прибрати фільтр ${label}`}
        className="flex h-6 w-6 items-center justify-center rounded-full text-dark-400 transition-all hover:bg-dark hover:text-white"
      >
        <X className="h-3 w-3" />
      </button>
    </motion.span>
  )
}
