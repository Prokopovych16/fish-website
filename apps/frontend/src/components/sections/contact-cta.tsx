'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'

export function ContactCTA() {
  return (
    <section className="bg-dark py-20 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-semibold sm:text-4xl mb-4">
            Замовляйте напряму від виробника
          </h2>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-white/80 mb-12">
            Ніяких посередників — ціна з першого джерела. Питання, оптові поставки
            або просто хочете дізнатись більше про продукт — ми на зв'язку.
          </p>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white/80">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Телефон</h3>
              <a
                href="tel:+380637760707"
                className="text-white/80 hover:text-white transition-colors"
              >
                +38 (063) 776-07-07
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white/80">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Email</h3>
              <a
                href="mailto:valigura.fish@gmail.com"
                className="text-white/80 hover:text-white transition-colors"
              >
                valigura.fish@gmail.com
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white/80">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Адреса</h3>
              <p className="text-white/80">
                м. Хмільник,<br />
                Вінницька область
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white/80">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className="font-semibold mb-2">Контакти</h3>
              <Link
                href="/contact"
                className="text-white/80 hover:text-white transition-colors"
              >
                Написати нам
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <Link href="/contact" className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-medium text-dark transition-colors hover:bg-white/90">
              Зв'язатися з нами
            </Link>
            <Link href="/catalog" className="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10">
              Переглянути каталог
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}