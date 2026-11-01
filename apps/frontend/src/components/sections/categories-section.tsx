import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Fish } from 'lucide-react';
import { Reveal } from '../shared/interactive';
import { tileClass } from '../../lib/ui-classes';
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
        {topLevel.map((category, i) => (
          <Reveal key={category.id} index={i}>
          <Link
            href={`/catalog?category=${category.slug}`}
            className={`${tileClass} relative flex flex-col items-center gap-3 p-5 text-center`}
          >
            <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-dark-300 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-dark group-hover:opacity-100" />
            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white text-3xl shadow-sm transition-transform duration-300 group-hover:scale-110">
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
          </Reveal>
        ))}
      </div>
    </section>
  );
}
