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
        <div className="relative aspect-[16/6] overflow-hidden rounded-xl bg-dark-50">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <Image
              src={currentBanner.image}
              alt={currentBanner.title}
              fill
              className="object-cover"
              priority
            />
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
                        className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-medium text-dark transition-colors hover:bg-white/90"
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
                className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white transition-colors hover:bg-white/25"
                aria-label="Попередній банер"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white transition-colors hover:bg-white/25"
                aria-label="Наступний банер"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 space-x-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      index === currentIndex ? 'bg-white' : 'bg-white/50'
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