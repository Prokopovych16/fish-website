import Link from 'next/link';
import { MapPin, Mail, Phone, Facebook, Instagram } from 'lucide-react';
import { getCategories } from '@/lib/products';

export async function SiteFooter() {
  const categories = await getCategories();
  const topCategories = categories.filter((c) => !c.parentId).slice(0, 5);

  return (
    <footer className="border-t border-white/10 bg-dark text-dark-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <h2 className="text-lg font-semibold text-white">Валігура</h2>
          <p className="mt-4 text-sm leading-relaxed text-dark-300">
            Натуральна копчена, пряна та морожена риба від HACCP-сертифікованого виробника в Хмільнику.
            Замовляйте онлайн — доставка Новою Поштою по всій Україні.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-dark-400" title="Facebook (незабаром)">
              <Facebook size={16} />
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-dark-400" title="Instagram (незабаром)">
              <Instagram size={16} />
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-dark-400">Категорії</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {topCategories.length > 0 ? (
              topCategories.map((c) => (
                <li key={c.id}>
                  <Link href={`/catalog?category=${c.slug}`} className="text-dark-300 transition-colors hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))
            ) : (
              <li><Link href="/catalog" className="text-dark-300 transition-colors hover:text-white">Каталог товарів</Link></li>
            )}
            <li><Link href="/blog" className="text-dark-300 transition-colors hover:text-white">Блог та рецепти</Link></li>
            <li><Link href="/faq" className="text-dark-300 transition-colors hover:text-white">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-dark-400">Контакти</h3>
          <div className="mt-5 space-y-3 text-sm text-dark-300">
            <p className="flex items-center gap-2"><MapPin size={15} /> вул. Чорновола В'ячеслава 82а, м. Хмільник</p>
            <p className="flex items-center gap-2"><Phone size={15} /> +38 (063) 776-07-07</p>
            <p className="flex items-center gap-2"><Mail size={15} /> valigura.fish@gmail.com</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-6 text-center text-xs text-dark-400">
        © {new Date().getFullYear()} Валігура — усі права захищені.{' '}
        <Link href="/policy" className="underline hover:text-dark-200 transition-colors">Політика компанії</Link>
      </div>
    </footer>
  );
}
