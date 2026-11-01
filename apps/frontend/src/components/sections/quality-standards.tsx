'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Shield, Thermometer, Eye, CheckCircle } from 'lucide-react'

const standards = [
  {
    title: 'HACCP сертифікація',
    description: 'Міжнародний стандарт безпеки харчових продуктів. Гарантує контроль кожного етапу виробництва.',
    icon: Shield,
  },
  {
    title: 'Контроль температури',
    description: 'Постійний моніторинг температурного режиму зберігання та транспортування продукції.',
    icon: Thermometer,
  },
  {
    title: 'Візуальний контроль якості',
    description: 'Кожен продукт проходить ретельну перевірку зовнішнього вигляду та свіжості.',
    icon: Eye,
  },
  {
    title: 'Лабораторні дослідження',
    description: 'Регулярні аналізи продукції в акредитованих лабораторіях для підтвердження якості.',
    icon: CheckCircle,
  },
]

export function QualityStandards() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-dark-400">Стандарти якості</p>
          <h2 className="mt-4 text-3xl font-semibold text-dark sm:text-4xl">
            Гарантія якості на кожному етапі
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-base leading-7 text-dark-500">
            Ми дотримуємося найвищих стандартів якості та безпеки продукції.
            Кожен етап виробництва ретельно контролюється для забезпечення
            максимальної свіжості та безпечності наших продуктів.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {standards.map((standard, index) => {
            const Icon = standard.icon
            return (
              <motion.div
                key={standard.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="group rounded-3xl border border-dark/10 bg-white p-8 transition-[border-color,box-shadow] duration-300 hover:border-dark/15 hover:shadow-[0_18px_40px_rgba(13,27,42,0.10)]"
              >
                <div className="flex items-start gap-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-dark-50 text-primary-500 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-dark mb-3">
                      {standard.title}
                    </h3>
                    <p className="text-dark-500 leading-relaxed">
                      {standard.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 rounded-3xl border border-dark/10 bg-white p-8 shadow-[0_30px_90px_rgba(13,27,42,0.08)] sm:p-12"
        >
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h3 className="text-2xl font-semibold text-dark mb-4">
                Від виробника — напряму до вас
              </h3>
              <p className="text-dark-500 leading-relaxed mb-6">
                Ми контролюємо весь процес: від прийому сировини та підготовки
                до копчення, пакування й відправки. Жодного проміжного складу,
                жодного зайвого посередника — ви отримуєте продукт прямо з виробництва.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-sage-600 flex-shrink-0" />
                  <span className="text-dark-500">Відбір якісної сировини</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-sage-600 flex-shrink-0" />
                  <span className="text-dark-500">Виробництво та контроль на кожному кроці</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-sage-600 flex-shrink-0" />
                  <span className="text-dark-500">Пакування і відправка напряму від нас</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-sage-600 flex-shrink-0" />
                  <span className="text-dark-500">Ціна без торгових націнок</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-lg bg-dark-50">
                <Image
                  src="/images/image-inside.jpeg"
                  alt="Наше виробництво"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}