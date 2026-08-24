import Link from 'next/link';
import Image from 'next/image';
import { Fish } from 'lucide-react';
import { getCategories } from '../../lib/products';

export async function CategoriesSection() {
  const categories = await getCategories();
  const topLevel = categories.filter((c) => !c.parentId).slice(0, 4);

  if (!topLevel.length) return null;

  return (
    <section className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-dark-400">Категорії</p>
        <h2 className="mt-3 text-2xl font-semibold text-dark sm:text-3xl">Що шукаєте сьогодні?</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {topLevel.map((category) => (
          <Link
            key={category.id}
            href={`/catalog?category=${category.slug}`}
            className="group flex flex-col items-center gap-3 rounded-xl border border-dark/10 bg-white p-5 text-center shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-dark-50 text-3xl">
              {category.image ? (
                <Image src={category.image} alt={category.name} fill sizes="64px" className="object-cover" />
              ) : category.icon ? (
                <span>{category.icon}</span>
              ) : (
                <Fish className="h-7 w-7 text-dark-400" />
              )}
            </div>
            <span className="text-sm font-medium text-dark">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
