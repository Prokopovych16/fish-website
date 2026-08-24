import Link from 'next/link'
import { ProductGallery } from '../../../components/products/product-gallery'
import { AddToCartButton } from '../../../components/products/add-to-cart-button'
import { WishlistButton } from '../../../components/products/wishlist-button'
import { ProductReviews } from '../../../components/products/product-reviews'
import { ProductViewTracker } from '../../../components/products/product-view-tracker'
import { ProductJsonLd, BreadcrumbJsonLd } from '../../../components/json-ld'
import { getProductBySlug } from '../../../lib/products'

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

  const specs = [
    { label: 'Категорія', value: product.category },
    { label: 'Наявність', value: product.stock > 0 ? 'В наявності' : 'Немає в наявності' },
    ...(product.weight ? [{ label: 'Вага', value: `${product.weight} кг` }] : []),
    ...(product.origin ? [{ label: 'Походження', value: product.origin }] : []),
  ]

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
          <div className="rounded-xl border border-dark/10 bg-white p-6">
            <ProductGallery images={product.images} />
          </div>

          <div className="rounded-xl border border-dark/10 bg-white p-6">
            <h2 className="text-xl font-semibold text-dark">Опис товару</h2>
            <p className="mt-3 text-base leading-relaxed text-dark-500">{product.description}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {specs.map((spec) => (
                <div key={spec.label} className="rounded-lg bg-dark-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-dark-400">{spec.label}</p>
                  <p className="mt-1.5 font-medium text-dark">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-dark/10 bg-white p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-dark-400">{product.badge ?? 'Рекомендовано'}</p>
            <h1 className="mt-3 text-2xl font-semibold text-dark">{product.name}</h1>
            <div className="mt-4 flex items-end gap-3">
              <p className="text-3xl font-semibold text-dark">{product.price.toLocaleString('uk-UA')} грн</p>
              {product.oldPrice ? (
                <p className="text-sm text-dark-400 line-through">{product.oldPrice.toLocaleString('uk-UA')} грн</p>
              ) : null}
            </div>
            <div className="mt-5 rounded-lg bg-dark-50 p-4 text-sm text-dark-500">
              {product.rating != null && <p>Рейтинг: {product.rating.toFixed(1)} / 5</p>}
              <p className="mt-1">Відгуки: {product.reviewsCount}</p>
            </div>
            <div className="mt-6 space-y-3">
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  oldPrice: product.oldPrice,
                  image: product.image,
                  stock: product.stock,
                }}
              />
              <WishlistButton productId={product.id} />
            </div>
          </div>

          <div className="rounded-xl border border-dark/10 bg-white p-6">
            <h2 className="text-base font-semibold text-dark">Доставка та оплата</h2>
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-dark-500">
              <li>Доставка Новою Поштою</li>
              <li>Оплата онлайн або при отриманні</li>
              <li>Пакування з охолоджувачами</li>
            </ul>
          </div>
        </aside>
      </div>

      <div className="mt-12">
        <ProductReviews productId={product.id} />
      </div>
    </main>
  )
}
