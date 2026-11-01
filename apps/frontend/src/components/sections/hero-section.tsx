'use client'

import Link from 'next/link';
import { ArrowRight, Flame, Truck, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import { CountUp } from '../shared/interactive';
import { iconChipDarkClass } from '../../lib/ui-classes';

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
    <section className="relative overflow-hidden bg-dark text-white">
      {/* М'які декоративні кола */}
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-primary-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-sage/15 blur-3xl" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-16 px-6 py-24 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-32">
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
              className="group relative flex min-h-[48px] items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-6 text-sm font-semibold text-dark shadow-[0_10px_30px_rgba(255,255,255,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(255,255,255,0.2)] active:scale-[0.98]"
            >
              <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-dark/10 transition-all duration-700 group-hover:left-[120%]" />
              <span className="relative flex items-center gap-2">
                В каталог
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="/about"
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-white/20 px-6 text-sm font-medium text-white transition-all duration-300 hover:border-white/40 hover:bg-white/10 active:scale-[0.98]"
            >
              Наша історія
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
            {[
              { number: <CountUp to={20} suffix="+" />, text: 'років на ринку' },
              { number: <CountUp to={100} suffix="%" />, text: 'натуральний продукт' },
              { number: '🇺🇦', text: 'доставка по Україні' },
            ].map((stat) => (
              <div key={stat.text}>
                <p className="text-2xl font-semibold tabular-nums">{stat.number}</p>
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
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <p className="px-4 pt-4 text-xs font-medium uppercase tracking-wide text-white/50">Чим ми відрізняємось</p>
            <div className="mt-3 space-y-1">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="group flex items-start gap-4 rounded-2xl p-4 transition-colors duration-300 hover:bg-white/5">
                    <div className={iconChipDarkClass}>
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
