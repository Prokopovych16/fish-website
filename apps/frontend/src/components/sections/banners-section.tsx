'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import api from '@/lib/api'

interface Banner {
  id: string
  title: string
  subtitle?: string
  buttonText?: string
  buttonLink?: string
  image: string
  imageMobile?: string
  sortOrder: number
  isActive: boolean
}

export function BannersSection() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get('/banners')
        const data: Banner[] = Array.isArray(res.data) ? res.data : []
        setBanners(data.filter((b) => b.isActive))
      } catch (error) {
        console.error('Failed to fetch banners:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBanners()
  }, [])

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [banners.length])

  if (isLoading || banners.length === 0) {
    return null
  }

  const currentBanner = banners[currentIndex]

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length)
  }

  return (
    <section className="relative overflow-hidden bg-surface py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-dark-50 sm:aspect-[16/6]">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            {/* Повільний "Ken Burns" зум для живості */}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6, ease: 'easeOut' }}
            >
              <Image
                src={currentBanner.image}
                alt={currentBanner.title}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-dark/70 via-dark/40 to-transparent" />

            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="max-w-2xl">
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl"
                  >
                    {currentBanner.title}
                  </motion.h2>
                  {currentBanner.subtitle && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                      className="mt-4 text-lg text-white/80"
                    >
                      {currentBanner.subtitle}
                    </motion.p>
                  )}
                  {currentBanner.buttonText && currentBanner.buttonLink && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="mt-7"
                    >
                      <a
                        href={currentBanner.buttonLink}
                        className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-dark shadow-[0_10px_30px_rgba(255,255,255,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(255,255,255,0.2)] active:scale-[0.98]"
                      >
                        {currentBanner.buttonText}
                      </a>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {banners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-white hover:text-dark active:scale-95 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Попередній банер"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-white hover:text-dark active:scale-95 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Наступний банер"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-dark/30 px-2.5 py-1.5 backdrop-blur">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Перейти до банера ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}