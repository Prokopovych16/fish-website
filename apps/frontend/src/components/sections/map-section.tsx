import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'

export function MapSection() {
  return (
    <section className="bg-dark py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-semibold text-white mb-4">
            Де ми знаходимось
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Виробництво в Хмільнику, Вінницька область — але наша риба їздить по всій Україні.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5">
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center text-white/50">
                  <MapPin className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-base font-medium mb-2 text-white/80">Карта місцезнаходження</p>
                  <p className="text-sm">
                    м. Хмільник, Вінницька область, Україна
                  </p>
                  <p className="text-xs mt-2 opacity-75">
                    (Google Maps буде додано після налаштування API)
                  </p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark to-transparent p-6">
                <div className="flex items-center gap-3 text-white">
                  <MapPin className="h-5 w-5 text-white/70" />
                  <div>
                    <p className="font-medium">Валігура</p>
                    <p className="text-sm text-white/60">
                      вул. Чорновола В'ячеслава 82а, м. Хмільник, Вінницька область
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Business Hours */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-white h-full">
              <h3 className="text-base font-semibold mb-6">Час роботи</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Понеділок - П'ятниця</span>
                  <span className="font-medium">9:00 - 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Субота</span>
                  <span className="font-medium">За домовленістю</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Неділя</span>
                  <span className="font-medium">Вихідний</span>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6 text-sm text-white/60 leading-relaxed">
                Замовлення приймаємо цілодобово через сайт — обробка наступного робочого дня.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
