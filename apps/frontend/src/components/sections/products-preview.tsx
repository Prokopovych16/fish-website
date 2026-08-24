import Link from 'next/link';
import { getFeaturedProducts } from '../../lib/products';
import { ProductCard } from '../products/product-card';

export async function ProductsPreview() {
  const products = await getFeaturedProducts(3);

  if (!products.length) return null;

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-dark-400">Популярні товари</p>
          <h2 className="mt-3 text-2xl font-semibold text-dark sm:text-3xl">Оберіть щось смачне вже зараз</h2>
        </div>

        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 rounded-lg border border-dark/15 bg-white px-5 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-dark/5"
        >
          Весь каталог →
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
