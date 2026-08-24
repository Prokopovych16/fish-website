'use client'

import { motion } from 'framer-motion'
import { Fish, MapPin, Award, Globe } from 'lucide-react'

const milestones = [
  {
    year: '2004',
    title: 'Початок',
    description: 'Валігура починає виробляти рибу в Хмільнику. Серйозне виробництво з першого дня — стабільні поставки і стандарт, від якого ніколи не відступали.',
    icon: Fish,
  },
  {
    year: '2010',
    title: 'За межі регіону',
    description: 'Продукція впевнено виходить на загальноукраїнський рівень. Клієнти з різних областей країни стають постійними — якість говорить сама за себе.',
    icon: MapPin,
  },
  {
    year: '2018',
    title: 'HACCP сертифікація',
    description: 'Отримання сертифікату підтвердило те, що ми і так знали: наше виробництво відповідає найвищим стандартам безпеки.',
    icon: Award,
  },
  {
    year: '2022',
    title: 'Онлайн і за кордон',
    description: 'Запуск онлайн-продажів по всій Україні та вихід на міжнародний ринок. Валігура — вже не лише для України.',
    icon: Globe,
  },
]

export function OurStory() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-dark-400">Наша історія</p>
          <h2 className="mt-4 text-3xl font-semibold text-dark sm:text-4xl">
            Понад двадцять років робимо одне й те саме добре
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-base leading-7 text-dark-500">
            З 2004 року ми у Хмільнику займаємось однією справою — готуємо рибу так, як це робили завжди:
            чесно, без хитрощів і без хімії. Рецепти не змінились. Принципи — теж.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {milestones.map((milestone, index) => {
            const Icon = milestone.icon
            return (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.4 }}
                viewport={{ once: true }}
                className="relative rounded-lg border border-dark/10 bg-white p-8 text-center transition-shadow hover:shadow-md"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dark text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-2xl font-semibold text-dark">{milestone.year}</p>
                  <h3 className="mt-3 font-semibold text-dark">{milestone.title}</h3>
                  <p className="mt-3 text-sm text-dark-500 leading-relaxed">
                    {milestone.description}
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
          className="mt-16 rounded-xl bg-dark-50 p-12 text-center"
        >
          <h3 className="text-2xl font-semibold text-dark mb-4">
            Чому ми це робимо
          </h3>
          <p className="max-w-4xl mx-auto text-lg text-dark-500 leading-relaxed">
            Ми прагнемо, щоб кожен українець скуштував рибу такою, якою вона має бути — приготовану
            з повагою до продукту і до людини. Без рідкого диму, без підсилювачів, без консервантів.
            Тільки риба, сіль, натуральна тирса і час. Ми вважаємо, що саме так і повинна смакувати
            справжня риба — і хочемо, щоб це стало нормою, а не рідкістю.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
