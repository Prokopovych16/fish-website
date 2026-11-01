'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Quote, Star } from 'lucide-react'
import api from '@/lib/api'
import { cardClass, primaryLinkClass } from '@/lib/ui-classes'
import { Shine } from '../shared/interactive'

interface Review {
  id: string
  authorName: string
  authorCity?: string
  rating: number
  title?: string
  text: string
  images: string[]
  isVerified: boolean
  createdAt: string
}

export function TestimonialsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/reviews/published?limit=6')
        const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
        setReviews(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

  if (isLoading || reviews.length === 0) {
    return null
  }

  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-dark-400">Відгуки клієнтів</p>
          <h2 className="mt-4 text-3xl font-semibold text-dark sm:text-4xl">
            Що кажуть наші клієнти
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base leading-7 text-dark-500">
            Тисячі задоволених клієнтів по всій Україні обирають нашу продукцію для своєї родини.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <div className={`${cardClass} relative flex h-full flex-col p-6`}>
              <Quote className="absolute right-5 top-5 h-8 w-8 text-dark-100 transition-all duration-300 group-hover:rotate-6 group-hover:text-primary-100" />

              <div className="mb-3 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.4 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.06, type: 'spring', stiffness: 400, damping: 18 }}
                  >
                    <Star className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-[#B8924A] text-[#B8924A]' : 'text-dark-200'}`} />
                  </motion.span>
                ))}
              </div>

              {review.title && (
                <h3 className="mb-2 font-semibold text-dark">{review.title}</h3>
              )}

              <p className="mb-6 text-sm leading-relaxed text-dark-500">"{review.text}"</p>

              <div className="mt-auto flex items-center justify-between gap-3 border-t border-dark/5 pt-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dark-50 text-sm font-semibold text-dark-500 transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                    {review.authorName.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-dark">{review.authorName}</p>
                    {review.authorCity && (
                      <p className="text-xs text-dark-400">{review.authorCity}</p>
                    )}
                  </div>
                </div>
                {review.isVerified && (
                  <div className="flex items-center gap-1 rounded-full bg-sage-50 px-2.5 py-1 text-[11px] font-medium text-sage-600">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Перевірена покупка
                  </div>
                )}
              </div>

              {review.images.length > 0 && (
                <div className="mt-4 flex gap-2">
                  {review.images.slice(0, 3).map((image, imgIndex) => (
                    <div
                      key={imgIndex}
                      className="relative h-14 w-14 overflow-hidden rounded-xl"
                    >
                      <Image
                        src={image}
                        alt={`Фото відгуку ${imgIndex + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {review.images.length > 3 && (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-dark-50 text-sm font-medium text-dark-500">
                      +{review.images.length - 3}
                    </div>
                  )}
                </div>
              )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a href="/reviews" className={primaryLinkClass}>
            <Shine />
            <span className="relative flex items-center gap-2">
              Переглянути всі відгуки
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}