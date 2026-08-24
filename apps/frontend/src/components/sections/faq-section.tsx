'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'
import api from '@/lib/api'

interface Faq {
  id: string
  question: string
  answer: string
  category?: string
  sortOrder: number
  isActive: boolean
}

export function FaqSection() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await api.get('/faq?limit=6&isActive=true')
        const data: Faq[] = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
        setFaqs(data.filter((f) => f.isActive !== false))
      } catch (error) {
        console.error('Failed to fetch FAQs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFaqs()
  }, [])

  if (isLoading || faqs.length === 0) {
    return null
  }

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-dark-400">Часті питання</p>
          <h2 className="mt-4 text-3xl font-semibold text-dark sm:text-4xl">
            Відповіді на популярні питання
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base leading-7 text-dark-500">
            Знайдіть відповіді на найпоширеніші питання про наші товари, доставку та обслуговування.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              viewport={{ once: true }}
              className="rounded-xl border border-dark/10 bg-white"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-dark-50 text-dark-500">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-dark">{faq.question}</h3>
                    {faq.category && (
                      <p className="mt-1 text-sm text-dark-400">{faq.category}</p>
                    )}
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5 text-dark-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-dark/10 px-6 pb-6 pt-4">
                      <div className="pl-[3.25rem]">
                        <p className="text-dark-500 leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/faq"
            className="inline-flex items-center gap-2 rounded-lg bg-dark px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-dark-700"
          >
            Переглянути всі питання
          </a>
        </div>
      </div>
    </section>
  )
}