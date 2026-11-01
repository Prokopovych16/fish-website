import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

export function ContactHero() {
  return (
    <section className="bg-dark py-20 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl"
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">Контакти</p>
            <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Зв'яжіться з нами
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/70">
              Питання про продукт, оптове замовлення або просто хочете поговорити — пишіть.
              Ми живі люди і відповімо особисто.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Телефон</p>
                  <p className="text-sm text-white/60">+38 (063) 776-07-07</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-white/60">valigura.fish@gmail.com</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Адреса</p>
                  <p className="text-sm text-white/60">вул. Чорновола В'ячеслава 82а, м. Хмільник</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Графік роботи</p>
                  <p className="text-sm text-white/60">Пн-Пт: 9:00-17:00</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
