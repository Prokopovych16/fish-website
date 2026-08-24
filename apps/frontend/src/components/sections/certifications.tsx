'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

const certifications = [
  {
    title: 'HACCP Сертифікат',
    issuer: 'Державна служба України з питань безпеки харчових продуктів',
    year: '2018',
    description: 'Міжнародний стандарт безпеки харчових продуктів — гарантія якості кожної партії.',
    icon: Shield,
    image: '/images/haccp.png',
  },
]

export function Certifications() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-dark-400">Сертифікація</p>
          <h2 className="mt-4 text-3xl font-semibold text-dark sm:text-4xl">
            Гарантія якості та безпеки
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-base leading-7 text-dark-500">
            Наше виробництво в Хмільнику сертифіковане за стандартом HACCP — це міжнародно визнана
            система контролю безпеки харчових продуктів. Кожна партія проходить обов'язковий контроль.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-1 max-w-sm mx-auto">
          {certifications.map((cert, index) => {
            const Icon = cert.icon
            return (
              <motion.div
                key={cert.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="rounded-lg border border-dark/10 bg-white p-8 transition-shadow hover:shadow-md"
              >
                <div className="mb-6 flex items-center justify-center">
                  <div className="relative h-24 w-24">
                    <Image
                      src={cert.image}
                      alt={cert.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-dark-50 text-dark-500">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-dark mb-2">
                    {cert.title}
                  </h3>
                  <p className="text-sm text-dark-500 font-medium mb-1">
                    {cert.issuer}
                  </p>
                  <p className="text-sm text-dark-400 mb-3">
                    Видано: {cert.year}
                  </p>
                  <p className="text-sm text-dark-500 leading-relaxed">
                    {cert.description}
                  </p>
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
          className="mt-16 rounded-xl bg-dark p-12 text-center text-white"
        >
          <Shield className="mx-auto mb-6 h-12 w-12 text-white/70" />
          <h3 className="text-2xl font-semibold mb-4">
            Ваш спокій — наша відповідальність
          </h3>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed opacity-90">
            Ми гарантуємо, що кожен продукт, який ви отримуєте, пройшов усі необхідні
            перевірки якості та безпеки. Ваше здоров'я та задоволення — наш головний пріоритет.
          </p>
        </motion.div>
      </div>
    </section>
  )
}