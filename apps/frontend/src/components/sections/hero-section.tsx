'use client'

import Link from 'next/link';
import { ArrowRight, Flame, Truck, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { title: 'Тільки тирса', description: 'Копчення виключно на дровах і тирсі — ніякого рідкого диму чи ароматизаторів.', icon: Flame },
  { title: 'Без добавок', description: 'Жодних консервантів, підсилювачів смаку чи барвників. Риба, сіль і час.', icon: Leaf },
  { title: 'Доставка по Україні', description: 'Замовте онлайн — отримайте Новою Поштою в будь-якому місті.', icon: Truck },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export function HeroSection() {
  return (
    <section className="bg-dark text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-6 py-24 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-32">
        <motion.div className="max-w-xl" variants={container} initial="hidden" animate="visible">
          <motion.p variants={fadeUp} className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
            Валігура · з 2004 року · Хмільник
          </motion.p>

          <motion.h1 variants={fadeUp} className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Риба такою, якою вона й має бути
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
            Ми хочемо, щоб кожен українець скуштував справжню натуральну рибу — без рідкого диму,
            без консервантів, без хімії. Просто риба, сіль і тирса. Від виробника, напряму до вас — без посередників і зайвих націнок.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/catalog"
              className="flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-dark transition-colors hover:bg-white/90"
            >
              В каталог
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/about"
              className="flex items-center justify-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Наша історія
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
            {[
              { number: '20+', text: 'років на ринку' },
              { number: '100%', text: 'натуральний продукт' },
              { number: '🇺🇦', text: 'доставка по Україні' },
            ].map((stat) => (
              <div key={stat.text}>
                <p className="text-2xl font-semibold">{stat.number}</p>
                <p className="mt-1 text-xs text-white/50">{stat.text}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Features card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="hidden max-w-sm lg:block"
        >
          <div className="rounded-xl border border-white/10 bg-white/5 p-8">
            <p className="text-xs font-medium uppercase tracking-wide text-white/50">Чим ми відрізняємось</p>
            <div className="mt-6 space-y-5">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/80">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{feature.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-white/50">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
