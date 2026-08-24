'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ProductItem } from '../../lib/products'
import { Heart, Star, ShoppingCart, Check, Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '../../lib/cart'
import { useWishlistStore } from '../../lib/wishlist'

interface ProductCardProps {
  product: ProductItem
  showHaccp?: boolean
}

export function ProductCard({ product, showHaccp = true }: ProductCardProps) {
  const router = useRouter()
  const [added, setAdded] = useState(false)
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
        { id: product.id, name: product.name, slug: product.slug, price: product.price, oldPrice: product.oldPrice, image: product.image },
        qty,
      )
      setAdded(true)
      setTimeout(() => setAdded(false), 1800)
    } catch {
      // silently ignore
    }
  }

  const changeQty = (e: React.MouseEvent, delta: number) => {
    e.preventDefault()
    e.stopPropagation()
    setQty((q) => Math.max(1, Math.min(99, q + delta)))
  }

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-xl border border-dark/10 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md cursor-pointer"
      onClick={() => router.push(`/product/${product.slug}`)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-dark-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {product.badge && (
          <span className="absolute left-3 top-3 rounded-md bg-dark px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white">
            {product.badge}
          </span>
        )}

        {discount && (
          <span className="absolute right-3 top-3 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-dark shadow-sm">
            −{discount}%
          </span>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id) }}
          aria-label="Додати в обране"
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-dark-500 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:text-dark"
        >
          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} className={isWishlisted ? 'text-dark' : ''} />
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
          {showHaccp && <span className="ml-auto text-sage-600">HACCP</span>}
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-dark">{product.price.toLocaleString('uk-UA')} ₴</span>
            {product.oldPrice && (
              <span className="text-sm text-dark-400 line-through">{product.oldPrice.toLocaleString('uk-UA')} ₴</span>
            )}
          </div>

          <p className="text-xs font-medium text-dark-400">
            {outOfStock ? 'Немає в наявності' : product.stock <= 5 ? `В наявності: ${product.stock} шт.` : 'В наявності'}
          </p>

          {!outOfStock && (
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-dark/10">
                <button onClick={(e) => changeQty(e, -1)} className="flex h-9 w-8 items-center justify-center text-dark-500 hover:text-dark">
                  <Minus size={13} />
                </button>
                <span className="w-6 text-center text-sm font-medium text-dark">{qty}</span>
                <button onClick={(e) => changeQty(e, 1)} className="flex h-9 w-8 items-center justify-center text-dark-500 hover:text-dark">
                  <Plus size={13} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60 ${
                  added ? 'bg-sage-600' : 'bg-dark hover:bg-dark-700'
                }`}
              >
                {added ? <Check size={15} /> : <ShoppingCart size={15} />}
                {added ? 'Додано' : 'В кошик'}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
