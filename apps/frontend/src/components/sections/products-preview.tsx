import Link from 'next/link';
import { getFeaturedProducts } from '../../lib/products';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../products/product-card';
import { Reveal } from '../shared/interactive';
import { secondaryLinkClass } from '../../lib/ui-classes';

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
          className={secondaryLinkClass}
        >
          Весь каталог
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {products.map((product, i) => (
          <Reveal key={product.id} index={i} className="h-full">
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
