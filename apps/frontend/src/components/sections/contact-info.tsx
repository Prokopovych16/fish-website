import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, Truck, Award, Leaf } from 'lucide-react'

const contactDetails = [
  {
    icon: Phone,
    title: 'Телефон',
    value: '+38 (063) 776-07-07',
    description: 'Телефонуйте нам з 9:00 до 17:00',
  },
  {
    icon: Mail,
    title: 'Email',
    value: 'valigura.fish@gmail.com',
    description: 'Відповідаємо протягом 24 годин',
  },
  {
    icon: MapPin,
    title: 'Адреса виробництва',
    value: 'вул. Чорновола В\'ячеслава 82а, м. Хмільник, Вінницька область',
    description: 'Звідси наша риба їде до клієнтів по всій Україні',
  },
  {
    icon: Clock,
    title: 'Графік роботи',
    value: 'Понеділок - П\'ятниця',
    description: '9:00 - 17:00 (замовлення через сайт — цілодобово)',
  },
]

const features = [
  {
    icon: Leaf,
    title: 'Без хімії',
    description: 'Жодних консервантів, барвників чи підсилювачів смаку — лише натуральний продукт',
  },
  {
    icon: Truck,
    title: 'Доставка по Україні',
    description: 'Новою Поштою в будь-яке місто — зручно і швидко',
  },
  {
    icon: Award,
    title: '20 років на ринку',
    description: 'З 2004 року — і кожного разу однаково якісно',
  },
]

export function ContactInfo() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Details */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-semibold text-dark mb-8">
              Як з нами зв'язатися
            </h2>

            <div className="space-y-6">
              {contactDetails.map((detail, index) => {
                const Icon = detail.icon
                return (
                  <motion.div
                    key={detail.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4 }}
                className="group flex gap-6 rounded-3xl border border-dark/10 bg-white p-6 transition-[border-color,box-shadow] duration-300 hover:border-dark/15 hover:shadow-[0_18px_40px_rgba(13,27,42,0.10)]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dark-50 text-primary-500 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark mb-1">{detail.title}</h3>
                      <p className="text-dark font-medium mb-1">{detail.value}</p>
                      <p className="text-sm text-dark-500">{detail.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-semibold text-dark mb-8">
              Чому обирають нас
            </h2>

            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4 }}
                className="group flex gap-6 rounded-3xl border border-dark/10 bg-white p-6 transition-[border-color,box-shadow] duration-300 hover:border-dark/15 hover:shadow-[0_18px_40px_rgba(13,27,42,0.10)]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dark-50 text-primary-500 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark mb-1">{feature.title}</h3>
                      <p className="text-sm text-dark-500">{feature.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
              className="mt-8 relative overflow-hidden rounded-3xl bg-dark p-8 text-white"
            >
              <h3 className="text-xl font-semibold mb-2">Оптові замовлення</h3>
              <p className="text-sm opacity-90 mb-4">
                Працюємо з партнерами, мережами та оптовими клієнтами по всій Україні.
                Ціна на продукцію формується індивідуально — залежно від обсягу, регулярності
                поставок та умов співпраці. Чим більший обсяг — тим вигідніші умови.
              </p>
              <p className="text-xs opacity-60 mb-5">
                Роздрібні ціни на сайті є базовими. Для корпоративних клієнтів, ресторанів,
                супермаркетів та мереж — умови обговорюються окремо.
              </p>
              <a
                href="mailto:valigura.fish@gmail.com?subject=Оптове співробітництво"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-white/15 px-6 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25 active:scale-[0.98]"
              >
                Обговорити умови
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}