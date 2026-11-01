import Link from 'next/link';
import { MapPin, Mail, Phone, Facebook, Instagram, ArrowRight, Fish } from 'lucide-react';
import { getCategories } from '@/lib/products';

export async function SiteFooter() {
  const categories = await getCategories();
  const topCategories = categories.filter((c) => !c.parentId).slice(0, 5);

  return (
    <footer className="relative overflow-hidden bg-dark text-dark-300">
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><Fish size={18} /></span>
            Валігура
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-dark-300">
            Натуральна копчена, пряна та морожена риба від HACCP-сертифікованого виробника в Хмільнику.
            Замовляйте онлайн — доставка Новою Поштою по всій Україні.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-dark-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:text-white" title="Facebook (незабаром)">
              <Facebook size={16} />
            </span>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 text-dark-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:text-white" title="Instagram (незабаром)">
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
                  <Link href={`/catalog?category=${c.slug}`} className="group inline-flex items-center gap-1.5 text-dark-300 transition-colors hover:text-white"><ArrowRight size={12} className="-ml-4 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100" />{c.name}</Link>
                </li>
              ))
            ) : (
              <li><Link href="/catalog" className="group inline-flex items-center gap-1.5 text-dark-300 transition-colors hover:text-white"><ArrowRight size={12} className="-ml-4 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100" />Каталог товарів</Link></li>
            )}
            <li><Link href="/blog" className="group inline-flex items-center gap-1.5 text-dark-300 transition-colors hover:text-white"><ArrowRight size={12} className="-ml-4 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100" />Блог та рецепти</Link></li>
            <li><Link href="/faq" className="group inline-flex items-center gap-1.5 text-dark-300 transition-colors hover:text-white"><ArrowRight size={12} className="-ml-4 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100" />FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-dark-400">Контакти</h3>
          <div className="mt-5 space-y-1 text-sm text-dark-300">
            {[
              { icon: MapPin, text: "вул. Чорновола В'ячеслава 82а, м. Хмільник", href: undefined },
              { icon: Phone, text: '+38 (063) 776-07-07', href: 'tel:+380637760707' },
              { icon: Mail, text: 'valigura.fish@gmail.com', href: 'mailto:valigura.fish@gmail.com' },
            ].map(({ icon: Icon, text, href }) => {
              const content = (
                <>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 transition-all duration-300 group-hover:bg-white group-hover:text-dark">
                    <Icon size={15} />
                  </span>
                  {text}
                </>
              );
              return href ? (
                <a key={text} href={href} className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:text-white">
                  {content}
                </a>
              ) : (
                <p key={text} className="group -mx-2 flex items-center gap-3 px-2 py-1.5">{content}</p>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 px-6 py-6 text-center text-xs text-dark-400">
        © {new Date().getFullYear()} Валігура — усі права захищені.{' '}
        <Link href="/policy" className="underline hover:text-dark-200 transition-colors">Політика компанії</Link>
      </div>
    </footer>
  );
}
