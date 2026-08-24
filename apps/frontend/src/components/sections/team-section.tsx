'use client'

import { motion } from 'framer-motion'

const values = [
  {
    title: 'Тирса, а не рідкий дим',
    description: 'Копчення виключно на натуральній тирсі. Саме звідси той смак, який не переплутаєш ні з чим.',
  },
  {
    title: 'Без зайвого',
    description: 'Ми не додаємо нічого, без чого можна обійтись. Риба, сіль і рецепт, якому вже понад 20 років.',
  },
  {
    title: 'Прямо до вас',
    description: 'Замовляйте онлайн — отримуйте Новою Поштою. Без зайвих посередників між виробником і вашим столом.',
  },
]

export function TeamSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-dark-400">Наші принципи</p>
          <h2 className="mt-4 text-3xl font-semibold text-dark sm:text-4xl">
            Чому клієнти обирають Валігура
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-base leading-7 text-dark-500">
            Ми не просто продаємо рибу — ми забезпечуємо якість від виробництва до вашого столу.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-lg border border-dark/10 bg-white p-8 transition-shadow hover:shadow-md"
            >
              <h3 className="text-base font-semibold text-dark mb-3">
                {value.title}
              </h3>
              <p className="text-sm text-dark-500 leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 rounded-lg border border-dark/10 bg-white px-8 py-6 shadow-sm">
            <div className="text-center">
              <p className="text-2xl font-semibold text-dark">2004</p>
              <p className="text-sm text-dark-500">Рік заснування</p>
            </div>
            <div className="h-12 w-px bg-dark-100" />
            <div className="text-center">
              <p className="text-2xl font-semibold text-dark">100%</p>
              <p className="text-sm text-dark-500">Натуральний продукт</p>
            </div>
            <div className="h-12 w-px bg-dark-100" />
            <div className="text-center">
              <p className="text-2xl font-semibold text-dark">🇺🇦</p>
              <p className="text-sm text-dark-500">Доставка по Україні</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
