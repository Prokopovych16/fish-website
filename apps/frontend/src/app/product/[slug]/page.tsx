import Link from 'next/link'
import { ProductGallery } from '../../../components/products/product-gallery'
import { ProductFacts } from '../../../components/products/product-facts'
import { ProductPurchase } from '../../../components/products/add-to-cart-button'
import { WishlistButton } from '../../../components/products/wishlist-button'
import { ProductReviews } from '../../../components/products/product-reviews'
import { ProductViewTracker } from '../../../components/products/product-view-tracker'
import { ProductJsonLd, BreadcrumbJsonLd } from '../../../components/json-ld'
import { getProductBySlug } from '../../../lib/products'
import { LiveDot } from '../../../components/shared/interactive'
import { iconChipClass, tileClass } from '../../../lib/ui-classes'
import { CreditCard, Snowflake, Star, Truck } from 'lucide-react'

export const revalidate = 60

interface ProductPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)
  if (!product) return { title: 'Товар не знайдено' }

  const description = product.shortDescription ?? product.description?.slice(0, 160) ?? ''
  const imageUrl = product.image ?? undefined

  return {
    title: product.seoTitle ?? `${product.name} — купити в Україні | Валігура`,
    description: product.seoDescription ?? description,
    openGraph: {
      title: product.name,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'website',
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="rounded-xl border border-dark/10 bg-white p-10 text-center">
          <h1 className="text-3xl font-semibold text-dark">Товар не знайдено</h1>
          <p className="mt-4 text-dark-500">Спробуйте повернутися до каталогу або вибрати інший товар.</p>
          <Link href="/catalog" className="mt-8 inline-flex rounded-lg bg-dark px-6 py-3 text-sm font-medium text-white hover:bg-dark-700">
            Повернутись до каталогу
          </Link>
        </div>
      </main>
    )
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const cartProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    oldPrice: product.oldPrice,
    image: product.image,
    stock: product.stock,
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <ProductJsonLd product={{
        name: product.name,
        description: product.description,
        image: product.image,
        price: product.price,
        oldPrice: product.oldPrice,
        stock: product.stock,
        rating: product.rating,
        reviewsCount: product.reviewsCount,
        slug: product.slug,
      }} />
      <BreadcrumbJsonLd items={[
        { name: 'Головна', url: siteUrl },
        { name: 'Каталог', url: `${siteUrl}/catalog` },
        { name: product.name, url: `${siteUrl}/product/${product.slug}` },
      ]} />
      <ProductViewTracker id={product.id} name={product.name} price={product.price} />
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <div className="rounded-3xl border border-dark/10 bg-white p-4 sm:p-6">
            <ProductGallery images={product.images} alt={product.name} />
          </div>

          <div className="rounded-3xl border border-dark/10 bg-white p-6">
            <h2 className="text-xl font-semibold text-dark">Опис товару</h2>
            <p className="mt-3 text-base leading-relaxed text-dark-500">{product.description}</p>
            <div className="mt-6">
              <ProductFacts
                category={product.category}
                stock={product.stock}
                unit={product.unit}
                weight={product.weight}
                origin={product.origin}
                catchMethod={product.catchMethod}
                storageConditions={product.storageConditions}
                expiryDays={product.expiryDays}
                calories={product.calories}
                proteins={product.proteins}
                fats={product.fats}
                carbs={product.carbs}
              />
            </div>

            {product.composition && (
              <div className="mt-8">
                <h3 className="text-base font-semibold text-dark">Склад</h3>
                <p className="mt-2 text-sm leading-relaxed text-dark-500">{product.composition}</p>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-dark/10 bg-white p-6 shadow-[0_18px_40px_rgba(13,27,42,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-dark-50 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-dark-500">
                {product.badge ?? 'Рекомендовано'}
              </span>
              <span className="flex items-center gap-2 text-xs font-medium text-dark-500">
                {product.stock > 0 && <LiveDot tone={product.stock <= 5 ? 'orange' : 'sage'} />}
                {product.stock === 0 ? 'Немає в наявності' : product.stock <= 5 ? `Залишилось ${product.stock} ${product.unit}` : 'В наявності'}
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-semibold leading-tight text-dark">{product.name}</h1>

            <a href="#reviews" className="group mt-3 inline-flex items-center gap-2 text-sm text-dark-500 transition-colors hover:text-dark">
              <span className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} className={i <= Math.round(product.rating ?? 0) ? 'fill-[#B8924A] text-[#B8924A]' : 'text-dark-200'} />
                ))}
              </span>
              {product.rating != null && <span className="font-semibold text-dark">{product.rating.toFixed(1)}</span>}
              <span className="underline-offset-4 group-hover:underline">
                {product.reviewsCount} відгук{product.reviewsCount === 1 ? '' : product.reviewsCount > 1 && product.reviewsCount < 5 ? 'и' : 'ів'}
              </span>
            </a>

            <div className="mt-5 rounded-2xl bg-dark-50 p-4">
              <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                <p className="text-3xl font-semibold tabular-nums text-dark">
                  {product.price.toLocaleString('uk-UA')} грн
                  <span className="ml-1 text-base font-medium text-dark-400">/ {product.unit}</span>
                </p>
                {product.oldPrice ? (
                  <p className="pb-1 text-sm text-dark-400 line-through">{product.oldPrice.toLocaleString('uk-UA')} грн</p>
                ) : null}
              </div>
              {product.oldPrice && product.oldPrice > product.price ? (
                <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-orange-400 px-2.5 py-1 text-xs font-semibold text-white">
                  −{Math.round((1 - product.price / product.oldPrice) * 100)}% · економія {(product.oldPrice - product.price).toLocaleString('uk-UA')} грн
                </p>
              ) : null}
            </div>
            <div className="mt-6 space-y-3">
              <ProductPurchase product={cartProduct} unit={product.unit} />
              <WishlistButton productId={product.id} />
            </div>
          </div>

          <div className="rounded-3xl border border-dark/10 bg-white p-6">
            <h2 className="text-base font-semibold text-dark">Доставка та оплата</h2>
            <ul className="mt-4 space-y-2">
              {[
                { icon: Truck, text: 'Доставка Новою Поштою', sub: '1–2 дні по Україні' },
                { icon: CreditCard, text: 'Оплата онлайн або при отриманні', sub: 'Visa / MasterCard' },
                { icon: Snowflake, text: 'Пакування з охолоджувачами', sub: 'Свіжість у дорозі' },
              ].map(({ icon: Icon, text, sub }) => (
                <li key={text} className={`${tileClass} flex items-center gap-3 p-3`}>
                  <span className={iconChipClass}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-dark">{text}</span>
                    <span className="block text-xs text-dark-400">{sub}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div id="reviews" className="mt-12 scroll-mt-24">
        <ProductReviews productId={product.id} />
      </div>
    </main>
  )
}
