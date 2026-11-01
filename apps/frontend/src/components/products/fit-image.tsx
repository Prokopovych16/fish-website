import Image from 'next/image'

interface FitImageProps {
  src: string
  alt: string
  sizes: string
  priority?: boolean
  /** Додаткові класи для основного фото (напр. hover-zoom) */
  className?: string
}

/**
 * Фото, що вписується в батьківський блок повністю, без обрізання (object-contain).
 * Поля навколо заповнює розмита копія того ж фото, тому блок виглядає цільним
 * і для вертикальних, і для горизонтальних зображень.
 * Батьківський елемент має бути `relative` з заданими розмірами/пропорціями та `overflow-hidden`.
 */
export function FitImage({ src, alt, sizes, priority, className = '' }: FitImageProps) {
  return (
    <>
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        sizes="10vw"
        className="scale-110 object-cover opacity-60 blur-2xl"
      />
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        draggable={false}
        className={`select-none object-contain ${className}`}
      />
    </>
  )
}
