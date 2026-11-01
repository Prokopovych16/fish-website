'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Fish } from 'lucide-react'
import { FitImage } from './fit-image'

interface ProductGalleryProps {
  images: string[]
  alt?: string
}

/**
 * Слайдер фото товару (Embla Carousel) + синхронізована стрічка мініатюр.
 * Фото показується повністю (object-contain), а поля заповнює розмита копія того ж фото,
 * тому кожен слайд виглядає цільним незалежно від пропорцій зображення.
 */
export function ProductGallery({ images, alt = 'Фото товару' }: ProductGalleryProps) {
  const hasMany = images.length > 1
  const [selected, setSelected] = useState(0)
  const [mainRef, mainApi] = useEmblaCarousel({ loop: hasMany, skipSnaps: false })
  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  })

  const onSelect = useCallback(() => {
    if (!mainApi) return
    const index = mainApi.selectedScrollSnap()
    setSelected(index)
    thumbsApi?.scrollTo(index)
  }, [mainApi, thumbsApi])

  useEffect(() => {
    if (!mainApi) return
    onSelect()
    mainApi.on('select', onSelect)
    mainApi.on('reInit', onSelect)
    return () => {
      mainApi.off('select', onSelect)
      mainApi.off('reInit', onSelect)
    }
  }, [mainApi, onSelect])

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-dark-50 sm:aspect-[4/3]">
        <Fish className="h-16 w-16 text-dark-200" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="group relative overflow-hidden rounded-lg bg-dark-50">
        <div ref={mainRef} className="overflow-hidden">
          <div className="flex touch-pan-y">
            {images.map((src, index) => (
              <div
                key={src + index}
                className="relative aspect-square min-w-0 flex-[0_0_100%] overflow-hidden sm:aspect-[4/3]"
              >
                <FitImage
                  src={src}
                  alt={`${alt}${hasMany ? ` — фото ${index + 1}` : ''}`}
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
            ))}
          </div>
        </div>

        {hasMany && (
          <>
            <button
              type="button"
              onClick={() => mainApi?.scrollPrev()}
              aria-label="Попереднє фото"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-dark shadow-md backdrop-blur transition-all duration-200 hover:scale-105 hover:bg-white active:scale-95 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => mainApi?.scrollNext()}
              aria-label="Наступне фото"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-dark shadow-md backdrop-blur transition-all duration-200 hover:scale-105 hover:bg-white active:scale-95 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Індикатори слайдів */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-dark/40 px-2.5 py-1.5 backdrop-blur">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => mainApi?.scrollTo(index)}
                  aria-label={`Перейти до фото ${index + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === selected ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {hasMany && (
        <div ref={thumbsRef} className="overflow-hidden">
          <div className="flex gap-3 p-1">
            {images.map((src, index) => (
              <button
                key={src + index}
                type="button"
                onClick={() => mainApi?.scrollTo(index)}
                aria-label={`Показати фото ${index + 1}`}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-dark-50 transition-all duration-300 sm:h-20 sm:w-20 ${
                  index === selected
                    ? 'ring-2 ring-dark ring-offset-2'
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
