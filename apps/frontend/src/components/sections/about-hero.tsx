'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-surface py-20">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl"
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-dark-400">Про компанію</p>
            <h1 className="mt-4 text-4xl font-semibold text-dark sm:text-5xl lg:text-6xl">
              Понад двадцять років — одна справа, один стандарт
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-dark-500">
              З 2004 року ми у Хмільнику виробляємо рибу так само, як і на початку: без рідкого диму,
              без хімії, без зайвого. Сьогодні замовити нашу рибу можна онлайн — і отримати Новою
              Поштою в будь-яке місто України.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative"
          >
            <div className="aspect-square overflow-hidden rounded-xl bg-dark-50">
              <Image
                src="/images/image-about-us.jpeg"
                alt="Наше виробництво"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-lg border border-dark/10 bg-white p-6 shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-dark text-white">
                  <span className="text-lg font-bold">20+</span>
                </div>
                <div>
                  <p className="font-semibold text-dark">Років на ринку</p>
                  <p className="text-sm text-dark-500">з 2004 року</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}