import Image from 'next/image'
import { ProductItem } from '../../lib/products'

interface ProductGalleryProps {
  images: string[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
      <div className="relative overflow-hidden rounded-lg bg-dark-50 aspect-square md:aspect-[4/3]">
        <Image
          src={images[0]}
          alt="product main"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover"
        />
      </div>
      <div className="grid gap-4">
        {images.slice(1, 3).map((src, index) => (
          <div key={index} className="relative overflow-hidden rounded-lg bg-dark-50 aspect-[4/3]">
            <Image
              src={src}
              alt={`product ${index + 2}`}
              fill
              sizes="(max-width: 768px) 50vw, 30vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
