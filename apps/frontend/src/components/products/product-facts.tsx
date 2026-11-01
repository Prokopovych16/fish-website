'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { tileClass } from '@/lib/ui-classes'
import {
  Anchor,
  CalendarClock,
  Globe2,
  LayoutGrid,
  PackageCheck,
  Scale,
  Thermometer,
  type LucideIcon,
} from 'lucide-react'

interface ProductFactsProps {
  category: string
  stock: number
  unit: string
  weight?: number
  origin?: string
  catchMethod?: string
  storageConditions?: string
  expiryDays?: number
  calories?: number
  proteins?: number
  fats?: number
  carbs?: number
}

interface Spec {
  icon: LucideIcon
  label: string
  value: string
  live?: boolean
}

// Добові норми споживання (Регламент ЄС 1169/2011) — для шкал у блоці харчової цінності
const DAILY = { calories: 2000, proteins: 50, fats: 70, carbs: 260 }

// Енергетична цінність макронутрієнтів, ккал на 1 г
const KCAL_PER_G = { proteins: 4, fats: 9, carbs: 4 }

type MacroKey = 'proteins' | 'fats' | 'carbs'

const MACROS: { key: MacroKey; label: string; bar: string; dot: string; text: string }[] = [
  { key: 'proteins', label: 'Білки', bar: 'bg-primary-500', dot: 'bg-primary-500', text: 'text-primary-500' },
  { key: 'fats', label: 'Жири', bar: 'bg-orange-400', dot: 'bg-orange-400', text: 'text-orange-500' },
  { key: 'carbs', label: 'Вуглеводи', bar: 'bg-sage', dot: 'bg-sage', text: 'text-sage-600' },
]

const fmt = (n: number) => n.toLocaleString('uk-UA', { maximumFractionDigits: 1 })

/**
 * Характеристики товару + інтерактивний блок харчової цінності.
 * Показує тільки ті поля, які заповнені в адмінці.
 */
export function ProductFacts(props: ProductFactsProps) {
  const specs: Spec[] = [
    { icon: LayoutGrid, label: 'Категорія', value: props.category },
    {
      icon: PackageCheck,
      label: 'Наявність',
      value: props.stock > 0 ? 'В наявності' : 'Немає в наявності',
      live: props.stock > 0,
    },
    ...(props.weight ? [{ icon: Scale, label: 'Вага нетто', value: `${fmt(props.weight)} кг` }] : []),
    ...(props.origin ? [{ icon: Globe2, label: 'Походження', value: props.origin }] : []),
    ...(props.catchMethod ? [{ icon: Anchor, label: 'Метод вилову', value: props.catchMethod }] : []),
    ...(props.storageConditions
      ? [{ icon: Thermometer, label: 'Умови зберігання', value: props.storageConditions }]
      : []),
    ...(props.expiryDays ? [{ icon: CalendarClock, label: 'Термін зберігання', value: `${props.expiryDays} діб` }] : []),
  ]

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2">
        {specs.map((spec, i) => (
          <motion.div
            key={spec.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
          >
            <div className={`${tileClass} flex h-full items-center gap-4 p-4`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary-500 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
              <spec.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-dark-400">{spec.label}</p>
              <p className="mt-0.5 flex items-center gap-2 font-medium text-dark">
                {spec.live && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-sage" />
                  </span>
                )}
                <span className="truncate">{spec.value}</span>
              </p>
            </div>
            </div>
          </motion.div>
        ))}
      </div>

      <NutritionFacts {...props} />
    </div>
  )
}

function NutritionFacts({ calories, proteins, fats, carbs, weight, unit }: ProductFactsProps) {
  const [portion, setPortion] = useState<'100' | 'pack'>('100')
  const [hovered, setHovered] = useState<MacroKey | null>(null)

  const values: Record<MacroKey, number | undefined> = { proteins, fats, carbs }
  const hasMacros = MACROS.some((m) => values[m.key] != null)
  if (calories == null && !hasMacros) return null

  // Перемикач "уся упаковка" має сенс лише для фасованого товару з вагою (не для вагового "кг")
  const packGrams = weight && unit !== 'кг' ? Math.round(weight * 1000) : undefined
  const factor = portion === 'pack' && packGrams ? packGrams / 100 : 1

  // Частка енергії від кожного макронутрієнта — для стекової смуги
  const energy = MACROS.map((m) => ({ ...m, kcal: (values[m.key] ?? 0) * KCAL_PER_G[m.key] }))
  const energyTotal = energy.reduce((sum, m) => sum + m.kcal, 0)

  const kcal = calories != null ? calories * factor : undefined
  const ringPct = kcal != null ? Math.min(kcal / DAILY.calories, 1) : 0
  const R = 52
  const C = 2 * Math.PI * R

  return (
    <div className="rounded-3xl border border-dark/5 bg-gradient-to-br from-dark-50 via-white to-sage-50 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-dark">Харчова цінність</h3>
          <p className="mt-0.5 text-sm text-dark-400">
            {portion === 'pack' && packGrams ? `на упаковку ${packGrams} г` : 'на 100 г продукту'}
          </p>
        </div>
        {packGrams && (
          <div className="flex rounded-full bg-dark-100 p-1 text-xs font-medium">
            {(['100', 'pack'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPortion(p)}
                className="relative min-h-[36px] rounded-full px-3.5 transition-colors duration-200"
              >
                {portion === p && (
                  <motion.span
                    layoutId="portion-pill"
                    className="absolute inset-0 rounded-full bg-white shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={`relative ${portion === p ? 'text-dark' : 'text-dark-500 hover:text-dark'}`}>
                  {p === '100' ? '100 г' : `Упаковка ${packGrams} г`}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid items-center gap-6 sm:grid-cols-[auto_1fr]">
        {kcal != null && (
          <div className="relative mx-auto h-36 w-36">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r={R} fill="none" strokeWidth="10" className="stroke-dark-100" />
              <motion.circle
                cx="60"
                cy="60"
                r={R}
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                className="stroke-primary"
                strokeDasharray={C}
                initial={{ strokeDashoffset: C }}
                whileInView={{ strokeDashoffset: C * (1 - ringPct) }}
                animate={{ strokeDashoffset: C * (1 - ringPct) }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <motion.span
                key={kcal}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-3xl font-semibold leading-none text-dark"
              >
                {fmt(kcal)}
              </motion.span>
              <span className="mt-1 text-xs font-medium uppercase tracking-wide text-dark-400">ккал</span>
              <span className="mt-1 text-[11px] text-dark-400">{Math.round(ringPct * 100)}% добової норми</span>
            </div>
          </div>
        )}

        {hasMacros && (
          <div className="space-y-4">
            {MACROS.filter((m) => values[m.key] != null).map((m, i) => {
              const grams = (values[m.key] as number) * factor
              const pct = Math.min(grams / DAILY[m.key], 1)
              const dimmed = hovered !== null && hovered !== m.key
              return (
                <div
                  key={m.key}
                  onMouseEnter={() => setHovered(m.key)}
                  onMouseLeave={() => setHovered(null)}
                  className={`cursor-default transition-opacity duration-200 ${dimmed ? 'opacity-40' : 'opacity-100'}`}
                >
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-dark">
                      <span className={`h-2.5 w-2.5 rounded-full ${m.dot}`} />
                      {m.label}
                    </span>
                    <span>
                      <span className={`text-lg font-semibold ${m.text}`}>{fmt(grams)}</span>
                      <span className="ml-1 text-dark-400">г</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-dark-100">
                    <motion.div
                      className={`h-full rounded-full ${m.bar}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct * 100}%` }}
                      animate={{ width: `${pct * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.15 + i * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-dark-400">{Math.round(pct * 100)}% добової норми</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {energyTotal > 0 && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wide text-dark-400">Звідки енергія</p>
          <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-dark-100">
            {energy
              .filter((m) => m.kcal > 0)
              .map((m) => (
                <motion.div
                  key={m.key}
                  onMouseEnter={() => setHovered(m.key)}
                  onMouseLeave={() => setHovered(null)}
                  className={`h-full ${m.bar} transition-opacity duration-200 ${
                    hovered !== null && hovered !== m.key ? 'opacity-30' : ''
                  }`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(m.kcal / energyTotal) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                />
              ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-dark-500">
            {energy
              .filter((m) => m.kcal > 0)
              .map((m) => (
                <span
                  key={m.key}
                  onMouseEnter={() => setHovered(m.key)}
                  onMouseLeave={() => setHovered(null)}
                  className={`flex cursor-default items-center gap-1.5 transition-opacity duration-200 ${
                    hovered !== null && hovered !== m.key ? 'opacity-40' : ''
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${m.dot}`} />
                  {m.label} {Math.round((m.kcal / energyTotal) * 100)}%
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
