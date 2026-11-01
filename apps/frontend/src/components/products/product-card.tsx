'use client'

import { useRouter } from 'next/navigation'
import { ProductItem } from '../../lib/products'
import { Heart, Star, ShoppingCart, Check, Minus, Plus, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCartStore } from '../../lib/cart'
import { useWishlistStore } from '../../lib/wishlist'
import { FitImage } from './fit-image'
import { LiveDot, Shine } from '../shared/interactive'
import { cardClass } from '../../lib/ui-classes'

interface ProductCardProps {
  product: ProductItem
  showHaccp?: boolean
}

export function ProductCard({ product, showHaccp = true }: ProductCardProps) {
  const router = useRouter()
  const [added, setAdded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [qty, setQty] = useState(1)
  const { addItem, isLoading } = useCartStore()
  const { has, toggle: toggleWishlist } = useWishlistStore()
  const isWishlisted = has(product.id)
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : null
  const outOfStock = product.stock === 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (added || isLoading || outOfStock) return
    try {
      await addItem(
        { id: product.id, name: product.name, slug: product.slug, price: product.price, oldPrice: product.oldPrice, image: product.image, stock: product.stock },
        qty,
      )
      setAdded(true)
      setTimeout(() => setAdded(false), 1800)
    } catch {
      // Найчастіше — бракує залишку на складі
      setFailed(true)
      setTimeout(() => setFailed(false), 1800)
    }
  }

  const changeQty = (e: React.MouseEvent, delta: number) => {
    e.preventDefault()
    e.stopPropagation()
    setQty((q) => Math.max(1, Math.min(product.stock || 1, 99, q + delta)))
  }

  return (
    <article
      className={`${cardClass} flex cursor-pointer flex-col overflow-hidden`}
      onClick={() => router.push(`/product/${product.slug}`)}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-dark-50">
        <FitImage
          src={product.image}
          alt={product.name}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />

        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-dark/85 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white shadow-sm backdrop-blur">
            {product.badge}
          </span>
        )}

        {discount && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-dark shadow-sm backdrop-blur">
            −{discount}%
          </span>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id) }}
          aria-label="Додати в обране"
          className={`absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-all duration-300 hover:scale-110 active:scale-95 ${
            isWishlisted ? 'text-red-500' : 'text-dark-500 hover:text-dark sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100'
          }`}
        >
          <motion.span
            key={String(isWishlisted)}
            initial={{ scale: 0.6 }}
            animate={{ scale: [0.6, 1.25, 1] }}
            transition={{ duration: 0.35 }}
            className="flex"
          >
            <Heart size={17} fill={isWishlisted ? 'currentColor' : 'none'} />
          </motion.span>
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-dark-400">{product.category}</p>
          <h3 className="mt-1 text-sm font-semibold text-dark line-clamp-2">{product.name}</h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-dark-400">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11} className={i < Math.round(product.rating ?? 0) ? 'fill-[#B8924A] text-[#B8924A]' : 'text-dark-200'} />
            ))}
          </div>
          <span>{product.rating != null ? product.rating.toFixed(1) : '—'} ({product.reviewsCount})</span>
          {showHaccp && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-sage-50 px-2 py-0.5 text-[10px] font-semibold text-sage-600">
              <ShieldCheck size={11} /> HACCP
            </span>
          )}
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-dark">
              {product.price.toLocaleString('uk-UA')} ₴
              <span className="ml-0.5 text-xs font-medium text-dark-400">/{product.unit}</span>
            </span>
            {product.oldPrice && (
              <span className="text-sm text-dark-400 line-through">{product.oldPrice.toLocaleString('uk-UA')} ₴</span>
            )}
          </div>

          <p className="flex items-center gap-2 text-xs font-medium text-dark-400">
            {!outOfStock && <LiveDot tone={product.stock <= 5 ? 'orange' : 'sage'} />}
            {outOfStock ? 'Немає в наявності' : product.stock <= 5 ? `Залишилось: ${product.stock} ${product.unit}` : 'В наявності'}
          </p>

          {!outOfStock && (
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl bg-dark-50 p-0.5">
                <button onClick={(e) => changeQty(e, -1)} aria-label="Менше" className="flex h-10 w-9 items-center justify-center rounded-lg text-dark-500 transition-all hover:bg-white hover:text-dark hover:shadow-sm active:scale-90">
                  <Minus size={13} />
                </button>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={qty}
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="w-6 text-center text-sm font-semibold text-dark"
                  >
                    {qty}
                  </motion.span>
                </AnimatePresence>
                <button onClick={(e) => changeQty(e, 1)} aria-label="Більше" className="flex h-10 w-9 items-center justify-center rounded-lg text-dark-500 transition-all hover:bg-white hover:text-dark hover:shadow-sm active:scale-90">
                  <Plus size={13} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className={`group/btn relative flex min-h-[42px] flex-1 items-center justify-center overflow-hidden rounded-xl px-3 text-sm font-medium text-white transition-all duration-300 active:scale-[0.97] disabled:opacity-60 ${
                  added ? 'bg-sage-600' : failed ? 'bg-red-600' : 'bg-dark hover:bg-dark-700 hover:shadow-[0_8px_20px_rgba(22,24,28,0.2)]'
                }`}
              >
                {!added && <Shine scope="btn" />}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={added ? 'added' : failed ? 'failed' : 'idle'}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="relative flex items-center gap-1.5"
                  >
                    {added ? <Check size={15} /> : <ShoppingCart size={15} />}
                    {added ? 'Додано' : failed ? 'Немає стільки' : 'В кошик'}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
