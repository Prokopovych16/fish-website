import { Suspense } from 'react'
import { HeroSection } from '../components/sections/hero-section'
import { FeatureGrid } from '../components/sections/feature-grid'
import { CategoriesSection } from '../components/sections/categories-section'
import { ProductsPreview } from '../components/sections/products-preview'
import { BannersSection } from '../components/sections/banners-section'
import { TestimonialsSection } from '../components/sections/testimonials-section'
import { FaqSection } from '../components/sections/faq-section'
import { FlashSaleSection } from '../components/sections/flash-sale-section'
import { OrganizationJsonLd } from '../components/json-ld'
import { Reveal } from '../components/shared/interactive'

export const revalidate = 60

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-3 rounded-2xl border border-dark/5 bg-dark-50 p-5">
          <div className="h-16 w-16 animate-pulse rounded-lg bg-dark-100" />
          <div className="h-4 w-16 animate-pulse rounded-md bg-dark-100" />
        </div>
      ))}
    </div>
  )
}

function ProductsPreviewSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-dark/10 bg-white">
          <div className="aspect-[4/5] animate-pulse bg-dark-100" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded-md bg-dark-100" />
            <div className="h-4 w-1/2 animate-pulse rounded-md bg-dark-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <main className="overflow-hidden">
      <OrganizationJsonLd />
      <HeroSection />

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 space-y-16">
        <Suspense fallback={<ProductsPreviewSkeleton />}>
          <ProductsPreview />
        </Suspense>

        <Suspense fallback={<CategoriesSkeleton />}>
          <CategoriesSection />
        </Suspense>
      </div>

      <BannersSection />
      <FlashSaleSection />
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="space-y-20">
          <section>
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-dark-400">Переваги магазину</p>
              <h2 className="mt-4 text-3xl font-semibold text-dark sm:text-4xl">
                Розумний вибір для кожної кухні
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-dark-500">
                Високоякісна рибна продукція, домашні набори та свіжі морепродукти з України. Легке замовлення, швидка обробка та безпечна доставка.
              </p>
            </div>
            <FeatureGrid />
          </section>

          <TestimonialsSection />

          <FaqSection />

          <section className="relative overflow-hidden rounded-3xl bg-dark px-6 py-14 text-white sm:px-12">
            {/* М'які декоративні кола */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-sage/20 blur-3xl" /> 
            <div className="relative grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">Спецпропозиція</p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight">Отримайте доставку безкоштовно від 1500 грн</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">
                  Обирайте свіжі набори, виріб на замовлення або щоденну продукцію та отримуйте доставку по Україні без додаткових оплат.
                </p>
              </div>
              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur sm:p-4">
                {[
                  { n: '01', title: 'Повний асортимент', desc: 'Риба, ікра, морепродукти, делікатеси.' },
                  { n: '02', title: 'Екологічна упаковка', desc: 'Свіжість та безпека кожного замовлення.' },
                  { n: '03', title: 'Підтримка 24/7', desc: 'Готові відповісти на будь-яке питання.' },
                ].map((item, i) => (
                  <Reveal key={item.n} index={i} className="group flex items-start gap-4 rounded-xl p-4 transition-colors duration-300 hover:bg-white/5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm font-medium text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-dark">
                      {item.n}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{item.title}</h3>
                      <p className="mt-1 text-sm text-white/60">{item.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
